// src/app/api/devices/route.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for connected devices
// In a production environment, you would use a database
interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'on' | 'off';
  lastSeen: Date;
  relayState: boolean;
}

// Simple in-memory storage for devices
const connectedDevices: Record<string, Device> = {};

// GET /api/devices - List all connected devices
export async function GET(request: NextRequest) {
  try {
    // Convert devices object to array and sort by last seen
    const devicesList = Object.values(connectedDevices)
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());

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
    connectedDevices[body.id] = {
      id: body.id,
      name: body.name,
      ipAddress: ipAddress as string,
      status: 'on',
      lastSeen: new Date(),
      relayState: body.relayState !== undefined ? body.relayState : false
    };
    
    return NextResponse.json(connectedDevices[body.id]);
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}