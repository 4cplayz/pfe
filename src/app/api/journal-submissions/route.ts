// src/app/api/journal-submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/journal-submissions - Create a new journal submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API: Réception de la soumission de journal:', JSON.stringify(body, null, 2));
    
    // Validate required fields with better error messages
    if (!body.userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }
    
    if (!body.journalId) {
      return NextResponse.json(
        { error: 'ID journal manquant' },
        { status: 400 }
      );
    }
    
    if (!body.responses || !Array.isArray(body.responses) || body.responses.length === 0) {
      return NextResponse.json(
        { error: 'Les réponses du journal sont vides ou mal formatées' },
        { status: 400 }
      );
    }
    
    // Verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: body.userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }
    
    // Verify that the journal exists
    const journal = await prisma.journal.findUnique({
      where: { id: body.journalId }
    });
    
    if (!journal) {
      return NextResponse.json(
        { error: 'Journal introuvable' },
        { status: 404 }
      );
    }
    
    // Calculate total time if start time is provided
    let totalTime = null;
    if (body.startTime) {
      const startTime = new Date(body.startTime);
      const endTime = body.endTime ? new Date(body.endTime) : new Date();
      totalTime = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // Time in seconds
    }
    
    // Create submission record
    const submission = await prisma.journalSubmission.create({
      data: {
        userId: body.userId,
        journalId: body.journalId,
        responses: body.responses,
        startTime: body.startTime ? new Date(body.startTime) : new Date(),
        endTime: body.endTime ? new Date(body.endTime) : new Date(),
        totalTime,
        status: body.status || 'SUBMITTED',
        feedback: body.feedback || null,
      },
    });
    
    console.log('API: Journal créé avec succès:', submission.id);
    
    // Increment the user's journalsCompleted count
    await prisma.user.update({
      where: { id: body.userId },
      data: {
        journalsCompleted: {
          increment: 1
        }
      }
    });
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('API Error - creating journal submission:', error);
    return NextResponse.json(
      { error: 'Failed to create journal submission', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/journal-submissions - Get all journal submissions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const journalId = request.nextUrl.searchParams.get('journalId');
    const status = request.nextUrl.searchParams.get('status');
    
    // Build filter object based on provided parameters
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (journalId) filter.journalId = journalId;
    if (status) filter.status = status;
    
    const submissions = await prisma.journalSubmission.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            matricule: true,
            accessLevel: true
          }
        },
        journal: {
          select: {
            id: true,
            title: true,
            description: true,
            accessLevel: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching journal submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal submissions' },
      { status: 500 }
    );
  }
}