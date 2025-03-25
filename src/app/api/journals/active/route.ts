import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/journals/active - Fetch the currently active journal
 */
export async function GET(request: NextRequest) {
  try {
    // Find the journal where isActive is true
    const activeJournal = await prisma.journal.findFirst({
      where: {
        isActive: true,
      },
    });
    
    if (!activeJournal) {
      // Return 200 with null if no active journal is found
      return Response.json(null);
    }
    
    return Response.json(activeJournal);
  } catch (error) {
    console.error('Error fetching active journal:', error);
    return Response.json(
      { error: 'Failed to fetch active journal' },
      { status: 500 }
    );
  }
}