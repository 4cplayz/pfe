import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/journals - Fetch all journals
export async function GET(request: NextRequest) {
  try {
    // Get search query from URL if present
    const searchParam = request.nextUrl.searchParams.get('search');
    const accessLevelParam = request.nextUrl.searchParams.get('accessLevel');
    
    let whereClause: any = {};
    
    if (searchParam) {
      whereClause.OR = [
        { title: { contains: searchParam, mode: 'insensitive' } },
        { description: { contains: searchParam, mode: 'insensitive' } },
      ];
    }
    
    if (accessLevelParam) {
      whereClause.accessLevel = accessLevelParam;
    }
    
    const journals = await prisma.journal.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json(journals);
  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 }
    );
  }
}

// POST /api/journals - Create a new journal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Missing title field' },
        { status: 400 }
      );
    }
    
    // Prepare sections data - ensure it's in the correct format
    const sections = Array.isArray(body.sections) ? body.sections : [];
    
    // Create new journal without any creator reference
    const newJournal = await prisma.journal.create({
      data: {
        title: body.title,
        description: body.description || '',
        accessLevel: body.accessLevel || 'ETUDIANT',
        sections: sections, // This will be stored as JSON
        isActive: true
        // No createdById or userId field
      },
    });
    
    return NextResponse.json(newJournal, { status: 201 });
  } catch (error) {
    console.error('Error creating journal:', error);
    return NextResponse.json(
      { error: 'Failed to create journal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}