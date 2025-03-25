// src/app/api/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get days parameter from query string
    const daysParam = request.nextUrl.searchParams.get('days') || '30';
    let daysFilter: number | null = parseInt(daysParam);
    
    // If 'all' is specified, set daysFilter to null to get all data
    if (daysParam === 'all') {
      daysFilter = null;
    }
    
    // Calculate date range
    const dateFilter = daysFilter ? new Date(Date.now() - daysFilter * 24 * 60 * 60 * 1000) : null;
    
    // === Basic Stats ===
    const totalUsers = await prisma.user.count();
    const totalSubmissions = await prisma.journalSubmission.count({
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined
    });
    const activeJournals = await prisma.journal.count({ where: { isActive: true } });
    
    // === Submissions by Status ===
    const submissionStatusCount = await prisma.journalSubmission.groupBy({
      by: ['status'],
      _count: { id: true },
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined
    });
    
    const statusColors = {
      SUBMITTED: "#fbbf24", 
      REVIEWED: "#10b981", 
      DRAFT: "#6b7280", 
    };
    
    const submissionsByStatus = submissionStatusCount.map(item => ({
      status: item.status,
      count: item._count.id,
      color: statusColors[item.status as keyof typeof statusColors] || "#6b7280"
    }));
    
    // === Users by Access Level ===
    const userAccessLevelCount = await prisma.user.groupBy({
      by: ['accessLevel'],
      _count: { id: true }
    });
    
    const accessLevelColors = {
      ETUDIANT: "#60a5fa",
      PROFESSEUR: "#8b5cf6", 
      RESPONSABLE: "#ec4899",
    };
    
    const usersByAccessLevel = userAccessLevelCount.map(item => ({
      accessLevel: item.accessLevel,
      count: item._count.id,
      color: accessLevelColors[item.accessLevel as keyof typeof accessLevelColors] || "#6b7280"
    }));
    
    // === Submissions by Day ===
    const submissionsByDay = [];
    
    if (daysFilter) {
      for (let i = 0; i < daysFilter; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (daysFilter - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        // Count submissions for this day
        const count = await prisma.journalSubmission.count({
          where: {
            createdAt: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        });
        
        submissionsByDay.push({ date: dateStr, count });
      }
    } else {
      // For "all" option, group by month
      const monthlyData = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt")::date as month, COUNT(*) as count
        FROM "JournalSubmission"
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `;
      
      for (const row of monthlyData as any[]) {
        submissionsByDay.push({
          date: row.month.toISOString().split('T')[0],
          count: Number(row.count)
        });
      }
    }
    
    // === Daily Status Breakdown ===
    const statusByDay = [];
    
    if (daysFilter) {
      for (let i = 0; i < Math.min(daysFilter, 30); i++) { // Limit to 30 days for performance
        const date = new Date();
        date.setDate(date.getDate() - (Math.min(daysFilter, 30) - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        const submitted = await prisma.journalSubmission.count({
          where: {
            status: 'SUBMITTED',
            createdAt: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        });
        
        const reviewed = await prisma.journalSubmission.count({
          where: {
            status: 'REVIEWED',
            createdAt: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        });
        
        const draft = await prisma.journalSubmission.count({
          where: {
            status: 'DRAFT',
            createdAt: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        });
        
        statusByDay.push({ 
          date: dateStr, 
          submitted,
          reviewed,
          draft
        });
      }
    }
    
    // === Completion Time Distribution ===
    const timeRanges = [
      { range: "< 1m", min: 0, max: 60 },
      { range: "1-2m", min: 60, max: 120 },
      { range: "2-5m", min: 120, max: 300 },
      { range: "5-10m", min: 300, max: 600 },
      { range: "10-15m", min: 600, max: 900 },
      { range: "> 15m", min: 900, max: null }
    ];
    
    const completionTimeDistribution = [];
    
    for (const range of timeRanges) {
      const count = await prisma.journalSubmission.count({
        where: {
          totalTime: {
            gte: range.min,
            ...(range.max ? { lt: range.max } : {})
          },
          ...(dateFilter ? { createdAt: { gte: dateFilter } } : {})
        }
      });
      
      completionTimeDistribution.push({ range: range.range, count });
    }
    
    // === Most Active Users ===
    const activeUsers = await prisma.journalSubmission.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 7,
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined
    });
    
    const userIds = activeUsers.map(u => u.userId);
    const userDetails = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, matricule: true }
    });
    
    const userMap = userDetails.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, any>);
    
    const mostActiveUsers = activeUsers.map(user => ({
      name: userMap[user.userId]?.name || 'Unknown',
      matricule: userMap[user.userId]?.matricule || '',
      submissions: user._count.id
    }));
    
    // === User Growth Over Time ===
    const userGrowthData = [];
    
    if (daysFilter) {
      for (let i = 0; i < daysFilter; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (daysFilter - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        // Count users registered up to this date
        const users = await prisma.user.count({
          where: {
            createdAt: {
              lte: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        });
        
        userGrowthData.push({ date: dateStr, users });
      }
    } else {
      // For "all" option, group by month
      const monthlyUsers = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', date)::date as month,
          COUNT(*) 
        FROM (
          SELECT DISTINCT ON (u.id) u.id, u."createdAt" as date
          FROM "User" u
          ORDER BY u.id, u."createdAt"
        ) as user_dates
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month ASC
      `;
      
      let runningTotal = 0;
      for (const row of monthlyUsers as any[]) {
        runningTotal += Number(row.count);
        userGrowthData.push({
          date: row.month.toISOString().split('T')[0],
          users: runningTotal
        });
      }
    }
    
    // === Average Completion Time ===
    const journalCompletionTimes = await prisma.journalSubmission.groupBy({
      by: ['journalId'],
      _avg: { totalTime: true },
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined
    });
    
    const journals = await prisma.journal.findMany({
      where: { id: { in: journalCompletionTimes.map(j => j.journalId) } },
      select: { id: true, title: true }
    });
    
    const journalMap = journals.reduce((acc, journal) => {
      acc[journal.id] = journal.title;
      return acc;
    }, {} as Record<string, string>);
    
    const averageCompletionTime = journalCompletionTimes.map(item => ({
      journalTitle: journalMap[item.journalId] || `Journal ${item.journalId.slice(0, 6)}...`,
      averageTime: Math.round(item._avg.totalTime || 0)
    })).sort((a, b) => b.averageTime - a.averageTime).slice(0, 10);
    
    // Calculate overall average completion time
    const overallAvg = await prisma.journalSubmission.aggregate({
      _avg: { totalTime: true },
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined
    });
    
    return NextResponse.json({
      submissionsByStatus,
      submissionsByDay,
      statusByDay,
      averageCompletionTime,
      usersByAccessLevel,
      completionTimeDistribution,
      mostActiveUsers,
      userGrowthData,
      totalUsers,
      totalSubmissions,
      activeJournals,
      averageCompletionTimeAll: Math.round(overallAvg._avg.totalTime || 0)
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}