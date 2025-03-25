import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users - Fetch all users
export async function GET(request: NextRequest) {
  try {
    // Get search query from URL if present
    const searchParam = request.nextUrl.searchParams.get('search');
    
    let whereClause = {};
    if (searchParam) {
      whereClause = {
        OR: [
          { name: { contains: searchParam, mode: 'insensitive' } },
          { matricule: { contains: searchParam, mode: 'insensitive' } },
        ],
      };
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.matricule || !body.accessLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if matricule already exists
    const existingUser = await prisma.user.findUnique({
      where: { matricule: body.matricule },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Matricule already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        matricule: body.matricule,
        accessLevel: body.accessLevel,
        isActive: true,
      },
    });
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}