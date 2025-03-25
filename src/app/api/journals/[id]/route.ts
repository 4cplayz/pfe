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
    
    // Log the received data for debugging
    console.log('Updating journal with ID:', id);
    console.log('Update payload:', body);
    
    // Check if journal exists
    const existingJournal = await prisma.journal.findUnique({
      where: { id },
    });
    
    if (!existingJournal) {
      console.log('Journal not found with ID:', id);
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }
    
    // Prepare updated data with better type safety
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.accessLevel !== undefined) updateData.accessLevel = body.accessLevel;
    if (body.sections !== undefined) updateData.sections = body.sections;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    console.log('Processed update data:', updateData);
    
    // Update journal
    const updatedJournal = await prisma.journal.update({
      where: { id },
      data: updateData,
    });
    
    console.log('Journal updated successfully');
    return NextResponse.json(updatedJournal);
  } catch (error) {
    console.error('Server error updating journal:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update journal', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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