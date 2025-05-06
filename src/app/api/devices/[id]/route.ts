// src/app/api/devices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Use the same Device interface and connectedDevices object from the parent route
interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'on' | 'off';
  lastSeen: Date;
  relayState: boolean;
}

// Reference to the in-memory storage for devices
// In a production environment, you would use a database
const connectedDevices: Record<string, Device> = {};

// GET /api/devices/[id] - Get a specific device
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if device exists
    if (!connectedDevices[id]) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Update lastSeen timestamp
    connectedDevices[id].lastSeen = new Date();
    
    return NextResponse.json(connectedDevices[id]);
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device' },
      { status: 500 }
    );
  }
}

// PATCH /api/devices/[id] - Update a device status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if device exists
    if (!connectedDevices[id]) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Update device properties
    if (body.relayState !== undefined) {
      connectedDevices[id].relayState = body.relayState;
    }
    
    if (body.status) {
      connectedDevices[id].status = body.status;
    }
    
    // Update lastSeen timestamp
    connectedDevices[id].lastSeen = new Date();
    
    return NextResponse.json(connectedDevices[id]);
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 }
    );
  }
}

// DELETE /api/devices/[id] - Remove a device
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if device exists
    if (!connectedDevices[id]) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Delete device
    delete connectedDevices[id];
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { error: 'Failed to delete device' },
      { status: 500 }
    );
  }
}