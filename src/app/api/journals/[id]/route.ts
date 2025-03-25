import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/journals/[id] - Fetch a specific journal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const journal = await prisma.journal.findUnique({
      where: { id },
    });
    
    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(journal);
  } catch (error) {
    console.error('Error fetching journal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal' },
      { status: 500 }
    );
  }
}

// PATCH /api/journals/[id] - Update a journal
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Check if journal exists
    const existingJournal = await prisma.journal.findUnique({
      where: { id },
    });
    
    if (!existingJournal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }
    
    // Update journal
    const updatedJournal = await prisma.journal.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        accessLevel: body.accessLevel !== undefined ? body.accessLevel : undefined,
        sections: body.sections !== undefined ? body.sections : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    });
    
    return NextResponse.json(updatedJournal);
  } catch (error) {
    console.error('Error updating journal:', error);
    return NextResponse.json(
      { error: 'Failed to update journal' },
      { status: 500 }
    );
  }
}

// DELETE /api/journals/[id] - Delete a journal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if journal exists
    const existingJournal = await prisma.journal.findUnique({
      where: { id },
    });
    
    if (!existingJournal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }
    
    // Delete journal
    await prisma.journal.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal' },
      { status: 500 }
    );
  }
}