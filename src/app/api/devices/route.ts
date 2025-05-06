// src/app/api/devices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { addOrUpdateDevice, getAllDevices } from '@/lib/deviceStore';

// GET /api/devices - List all connected devices
export async function GET(request: NextRequest) {
  try {
    const devicesList = getAllDevices();
    return NextResponse.json(devicesList);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST /api/devices - Register or update a device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: 'Device ID and name are required' },
        { status: 400 }
      );
    }
    
    // Get the client IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.ip || 
                      'unknown';
    
    // Create or update device
    const device = addOrUpdateDevice({
      id: body.id,
      name: body.name,
      ipAddress: ipAddress as string,
      status: 'on',
      lastSeen: new Date(),
      relayState: body.relayState !== undefined ? body.relayState : false
    });
    
    return NextResponse.json(device);
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}