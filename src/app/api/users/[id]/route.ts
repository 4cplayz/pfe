import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users/[id] - Fetch a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await the params object
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await the params object
    const { id } = await params;
    const body = await request.json();
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // If matricule is being updated, check for duplicates
    if (body.matricule && body.matricule !== existingUser.matricule) {
      const duplicateUser = await prisma.user.findUnique({
        where: { matricule: body.matricule },
      });
      
      if (duplicateUser) {
        return NextResponse.json(
          { error: 'Matricule already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        matricule: body.matricule !== undefined ? body.matricule : undefined,
        accessLevel: body.accessLevel !== undefined ? body.accessLevel : undefined,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await the params object
    const { id } = await params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}