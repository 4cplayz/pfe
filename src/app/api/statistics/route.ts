import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateMockStatistics } from './mock-data';

const prisma = new PrismaClient();

// Helper function to format dates consistently
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Generate dates for the past N days
function generateDatesForPastDays(days: number): { date: string; count: number }[] {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push({
      date: formatDate(date),
      count: 0
    });
  }
  
  return dates;
}

export async function GET(request: NextRequest) {
  try {
    // Get the number of days from query parameters (default to 30)
    const daysParam = request.nextUrl.searchParams.get('days') || '30';
    const days = daysParam === 'all' ? 365 : parseInt(daysParam, 10);
    
    if (isNaN(days) || days <= 0) {
      return NextResponse.json(
        { error: 'Invalid days parameter' },
        { status: 400 }
      );
    }
    
    // Calculate the start date for our query
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // 1. Get submissions statistics
    // Check if we have any data at all
    const totalSubmissionsCount = await prisma.journalSubmission.count();
    
    // If no real data exists, return mock data
    if (totalSubmissionsCount === 0) {
      console.log('No real data found, returning mock statistics');
      return NextResponse.json(generateMockStatistics(days));
    }
    
    const submissionsByStatus = await prisma.journalSubmission.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    // 2. Get submissions by day
    const submissionsByDay = await prisma.journalSubmission.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true
      }
    });
    
    // Process submissions by day
    const dailySubmissionCounts = generateDatesForPastDays(days);
    
    // Fill in actual counts
    submissionsByDay.forEach(submission => {
      const dateStr = formatDate(submission.createdAt);
      const dateEntry = dailySubmissionCounts.find(d => d.date === dateStr);
      if (dateEntry) {
        dateEntry.count += 1;
      }
    });
    
    // 3. Get average completion time by journal
    const journals = await prisma.journal.findMany({
      select: {
        id: true,
        title: true,
        submissions: {
          select: {
            totalTime: true
          }
        }
      }
    });
    
    const averageCompletionTimeByJournal = journals
      .map(journal => {
        const validTimes = journal.submissions
          .filter(sub => sub.totalTime !== null && sub.totalTime > 0)
          .map(sub => sub.totalTime as number);
        
        const average = validTimes.length > 0
          ? validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length
          : 0;
        
        return {
          journalTitle: journal.title,
          averageTime: Math.round(average)
        };
      })
      .filter(item => item.averageTime > 0)
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 6); // Limit to top 6 journals
    
    // 4. Get users by access level
    const usersByAccessLevel = await prisma.user.groupBy({
      by: ['accessLevel'],
      _count: {
        id: true
      }
    });
    
    // 5. Get various counts
    const totalUsers = await prisma.user.count();
    const totalSubmissions = await prisma.journalSubmission.count();
    const activeJournals = await prisma.journal.count({
      where: {
        isActive: true
      }
    });
    
    // 6. Calculate overall average completion time
    const completionTimes = await prisma.journalSubmission.findMany({
      where: {
        totalTime: {
          not: null
        }
      },
      select: {
        totalTime: true
      }
    });
    
    const validTimes = completionTimes
      .filter(sub => sub.totalTime !== null && sub.totalTime > 0)
      .map(sub => sub.totalTime as number);
    
    const averageCompletionTimeAll = validTimes.length > 0
      ? Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length)
      : 0;

    // Status colors matching those in the stats page
    const STATUS_COLORS = {
      SUBMITTED: "#fbbf24", // yellow-500
      REVIEWED: "#10b981", // green-500
      DRAFT: "#6b7280", // gray-500
    };

    // Access level colors
    const ACCESS_LEVEL_COLORS = {
      ETUDIANT: "#60a5fa", // blue-400
      PROFESSEUR: "#8b5cf6", // violet-500
      RESPONSABLE: "#ec4899", // pink-500
    };
    
    // Format data for the frontend
    const formattedData = {
      submissionsByStatus: submissionsByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
        color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || "#6b7280"
      })),
      
      submissionsByDay: dailySubmissionCounts,
      
      averageCompletionTime: averageCompletionTimeByJournal,
      
      usersByAccessLevel: usersByAccessLevel.map(item => ({
        accessLevel: item.accessLevel,
        count: item._count.id,
        color: ACCESS_LEVEL_COLORS[item.accessLevel as keyof typeof ACCESS_LEVEL_COLORS] || "#6b7280"
      })),
      
      totalUsers,
      totalSubmissions,
      activeJournals,
      averageCompletionTimeAll
    };
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error generating statistics:', error);
    return NextResponse.json(
      { error: 'Failed to generate statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}