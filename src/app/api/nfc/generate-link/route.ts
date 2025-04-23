import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generate a secure random token
 * @returns Random token string
 */
function generateRandomToken(length = 2) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * API route handler for generating NFC links
 * GET or POST /api/nfc/generate-link
 */
export async function GET(request: NextRequest) {
  try {
    // Generate a random token
    const token = generateRandomToken();
    
    // Calculate expiration time (4 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);
    
    // Get base URL from environment or use default for dev
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://iato.ca';
    
    // Format full URL
    const url = `${baseUrl}/link/${token}`;
    
    // Return response
    return NextResponse.json({
      success: true,
      token,
      url,
      expires: expiresAt,
      expiresIn: '4 hours',
    });
  } catch (error) {
    console.error('Error generating link:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}

// Allow POST method as well
export async function POST(request: NextRequest) {
  return GET(request);
}