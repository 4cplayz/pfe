import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/validate-user?matricule=1234567
export async function GET(request: NextRequest) {
  try {
    // Get matricule from query params
    const matricule = request.nextUrl.searchParams.get('matricule');
    
    console.log('Validating matricule:', matricule);
    
    if (!matricule) {
      console.log('No matricule provided');
      return NextResponse.json(
        { error: 'Matricule parameter is required' },
        { status: 400 }
      );
    }
    
    // Log all users in the database to debug
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        matricule: true,
      }
    });
    
    console.log('All users in database:', JSON.stringify(allUsers, null, 2));
    
    // Look up the user in database
    const user = await prisma.user.findUnique({
      where: { matricule },
      select: {
        id: true,
        name: true,
        matricule: true,
        accessLevel: true,
        isActive: true
      }
    });
    
    console.log('Found user:', user);
    
    if (!user) {
      // Try with a case-insensitive search as fallback
      const usersWithSimilarMatricule = await prisma.user.findMany({
        where: {
          matricule: {
            contains: matricule,
            mode: 'insensitive'
          }
        }
      });
      
      console.log('Similar matricule users:', usersWithSimilarMatricule);
      
      return NextResponse.json(
        { exists: false, error: 'User not found' },
        { status: 200 } // We return 200 OK even if user doesn't exist, with exists: false
      );
    }
    
    // Return user info (without exposing sensitive data)
    return NextResponse.json({
      exists: true,
      name: user.name,
      matricule: user.matricule,
      accessLevel: user.accessLevel,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Error validating user:', error);
    return NextResponse.json(
      { error: 'Failed to validate user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}