// src/app/api/journal-submissions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/journal-submissions/[id] - Get a specific journal submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await the params object
    const { id } = await params;
    
    const submission = await prisma.journalSubmission.findUnique({
      where: { id },
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
      }
    });
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Journal submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error fetching journal submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal submission' },
      { status: 500 }
    );
  }
}

// PATCH /api/journal-submissions/[id] - Update a journal submission (e.g., change status, add feedback)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await the params object
    const { id } = await params;
    const body = await request.json();
    
    // Check if submission exists
    const existingSubmission = await prisma.journalSubmission.findUnique({
      where: { id }
    });
    
    if (!existingSubmission) {
      return NextResponse.json(
        { error: 'Journal submission not found' },
        { status: 404 }
      );
    }
    
    // Update allowed fields only
    const updatableFields = ['status', 'feedback', 'responses'];
    const updateData: any = {};
    
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // If nothing to update, return existing submission
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(existingSubmission);
    }
    
    // Update submission
    const updatedSubmission = await prisma.journalSubmission.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('Error updating journal submission:', error);
    return NextResponse.json(
      { error: 'Failed to update journal submission' },
      { status: 500 }
    );
  }
}

// DELETE /api/journal-submissions/[id] - Delete a journal submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await the params object
    const { id } = await params;
    
    // Check if submission exists
    const existingSubmission = await prisma.journalSubmission.findUnique({
      where: { id }
    });
    
    if (!existingSubmission) {
      return NextResponse.json(
        { error: 'Journal submission not found' },
        { status: 404 }
      );
    }
    
    // Delete submission
    await prisma.journalSubmission.delete({
      where: { id }
    });
    
    // Decrement the user's journalsCompleted count
    await prisma.user.update({
      where: { id: existingSubmission.userId },
      data: {
        journalsCompleted: {
          decrement: 1
        }
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal submission' },
      { status: 500 }
    );
  }
}