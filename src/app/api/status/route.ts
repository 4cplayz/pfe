import { NextRequest, NextResponse } from 'next/server';

// Status object to store state
// In a real app, you'd use a database
let statusData = {
  isActive: false
};

// GET /api/status - Get current status
export async function GET() {
  return NextResponse.json(statusData);
}

// POST /api/status - Update status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if isActive is provided
    if (body.isActive === undefined) {
      return NextResponse.json(
        { error: 'isActive field is required' },
        { status: 400 }
      );
    }

    // Update the status
    statusData.isActive = !!body.isActive; // Convert to boolean
    
    return NextResponse.json(statusData);
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}