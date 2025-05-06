// src/app/api/devices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as DeviceStore from '@/lib/deviceStore'; // Import the entire module

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
    const device = DeviceStore.getDevice(id);
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Create updated device object
    const updatedDevice = {
      ...device,
      lastSeen: new Date()
    };
    
    // Update IP address if provided
    if (body.ipAddress) {
      updatedDevice.ipAddress = body.ipAddress;
    }
    
    // Update relay state if provided
    if (body.relayState !== undefined) {
      updatedDevice.relayState = body.relayState;
    }
    
    // Update status if provided
    if (body.status) {
      updatedDevice.status = body.status;
    }
    
    // Save updated device
    DeviceStore.addOrUpdateDevice(updatedDevice);
    
    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { error: 'Failed to update device', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}