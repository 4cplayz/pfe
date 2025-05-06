// src/app/api/devices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDevice, updateDeviceState, deleteDevice } from '@/lib/deviceStore';

// GET /api/devices/[id] - Get a specific device
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const device = getDevice(id);
    
    // Check if device exists
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(device);
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log(`Updating device ${id} with:`, body);
    
    // Check if device exists
    const device = getDevice(id);
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Update the device record
    const updates: Partial<Device> = {};
    
    // Update IP address if provided
    if (body.ipAddress) {
      updates.ipAddress = body.ipAddress;
    }
    
    // Update relay state if provided
    if (body.relayState !== undefined) {
      updates.relayState = body.relayState;
    }
    
    if (body.status) {
      updates.status = body.status;
    }
    
    // Update the device with all provided fields
    const updatedDevice = {
      ...device,
      ...updates,
      lastSeen: new Date()
    };
    
    deviceStore[id] = updatedDevice;
    
    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { error: 'Failed to update device', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/devices/[id] - Remove a device
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const deleted = deleteDevice(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { error: 'Failed to delete device' },
      { status: 500 }
    );
  }
}