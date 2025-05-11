import { NextRequest, NextResponse } from 'next/server';

// Status object to store multiple device states with timestamps
interface DeviceStatus {
  id: string;
  isActive: boolean;
  lastHeartbeat: number; // Unix timestamp in milliseconds
}

let statusData: {
  devices: DeviceStatus[];
} = {
  devices: []
};

// Configuration
const HEARTBEAT_TIMEOUT_MS = 20000; // 1 minute
const CLEANUP_INTERVAL_MS = 30000; // 30 seconds

// Function to remove inactive devices
function cleanupInactiveDevices() {
  console.log(`Running cleanup of inactive devices at ${new Date().toISOString()}`);
  console.log(`Current devices before cleanup: ${JSON.stringify(statusData.devices)}`);
  
  const now = Date.now();
  console.log(`Current time: ${now}, Timeout threshold: ${HEARTBEAT_TIMEOUT_MS}ms`);
  
  const initialCount = statusData.devices.length;
  const devicesToRemove: string[] = [];
  
  // Identify devices to remove
  statusData.devices.forEach(device => {
    const timeSinceLastHeartbeat = now - device.lastHeartbeat;
    console.log(`Device ${device.id}: Last heartbeat ${device.lastHeartbeat}, ${timeSinceLastHeartbeat}ms ago`);
    
    if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
      console.log(`Device ${device.id} is inactive (${timeSinceLastHeartbeat}ms > ${HEARTBEAT_TIMEOUT_MS}ms)`);
      devicesToRemove.push(device.id);
    } else {
      console.log(`Device ${device.id} is still active (${timeSinceLastHeartbeat}ms < ${HEARTBEAT_TIMEOUT_MS}ms)`);
    }
  });
  
  // Remove the identified devices
  if (devicesToRemove.length > 0) {
    statusData.devices = statusData.devices.filter(device => !devicesToRemove.includes(device.id));
    console.log(`Removed devices: ${devicesToRemove.join(', ')}`);
  }
  
  const removedCount = initialCount - statusData.devices.length;
  console.log(`Cleanup complete: ${removedCount} devices removed`);
  console.log(`Current devices after cleanup: ${JSON.stringify(statusData.devices)}`);
}

// Run cleanup on each request
function performOnDemandCleanup() {
  console.log('Performing on-demand cleanup check...');
  cleanupInactiveDevices();
}

// GET /api/status - Get all devices status
export async function GET(request: NextRequest) {
  // Force cleanup check on each request
  performOnDemandCleanup();
  
  // Optionally allow filtering by id
  const id = request.nextUrl.searchParams.get('id');
  
  if (id) {
    const device = statusData.devices.find(d => d.id === id);
    if (device) {
      return NextResponse.json(device);
    }
    return NextResponse.json(
      { error: 'Device not found' },
      { status: 404 }
    );
  }
  
  // Return all devices
  return NextResponse.json(statusData);
}

// POST /api/status - Add or update a device status
export async function POST(request: NextRequest) {
  try {
    // Force cleanup check on each request
    performOnDemandCleanup();
    
    // Parse the request body
    const body = await request.json();
    console.log('Received POST with body:', body);
    
    // Check if required fields are provided
    if (!body.id) {
      return NextResponse.json(
        { error: 'id field is required' },
        { status: 400 }
      );
    }
    
    // Check if this is a heartbeat request
    const isHeartbeat = body.heartbeat === true;
    
    // For regular status updates, isActive is required unless it's a heartbeat
    let isActive;
    
    if (isHeartbeat) {
      // For heartbeats, we keep the current isActive status or default to true
      const existingDevice = statusData.devices.find(d => d.id === body.id);
      isActive = existingDevice ? existingDevice.isActive : true;
    } else if (body.isActive !== undefined) {
      // For regular updates with isActive provided
      isActive = !!body.isActive; // Convert to boolean
    } else {
      // For regular updates without isActive
      return NextResponse.json(
        { error: 'isActive field is required for status updates' },
        { status: 400 }
      );
    }
    
    // Update or create device with new heartbeat timestamp
    const now = Date.now();
    const existingDeviceIndex = statusData.devices.findIndex(d => d.id === body.id);
    
    if (existingDeviceIndex >= 0) {
      // Update existing device
      console.log(`Updating existing device ${body.id}`);
      
      // Only update isActive for regular status updates, not heartbeats
      if (!isHeartbeat) {
        statusData.devices[existingDeviceIndex].isActive = isActive;
      }
      
      // Always update the heartbeat timestamp
      statusData.devices[existingDeviceIndex].lastHeartbeat = now;
      console.log(`Updated device ${body.id}, new heartbeat: ${now}, isActive: ${statusData.devices[existingDeviceIndex].isActive}`);
    } else {
      // Add new device
      console.log(`Adding new device ${body.id}`);
      statusData.devices.push({
        id: body.id,
        isActive: isActive,
        lastHeartbeat: now
      });
    }
    
    // Get the updated device info
    const updatedDevice = statusData.devices.find(d => d.id === body.id);
    console.log(`Current devices: ${JSON.stringify(statusData.devices)}`);
    
    return NextResponse.json({
      success: true,
      device: updatedDevice,
      message: isHeartbeat ? 'Heartbeat received' : 'Status updated',
      timestamp: now
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/status - Remove a device
export async function DELETE(request: NextRequest) {
  try {
    // Force cleanup check on each request
    performOnDemandCleanup();
    
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required' },
        { status: 400 }
      );
    }

    console.log(`Manually deleting device ${id}`);
    
    // Find and remove the device
    const initialLength = statusData.devices.length;
    statusData.devices = statusData.devices.filter(d => d.id !== id);
    
    if (statusData.devices.length === initialLength) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    console.log(`Device ${id} removed, remaining devices: ${JSON.stringify(statusData.devices)}`);
    
    return NextResponse.json({ 
      success: true,
      message: `Device ${id} removed successfully`
    });
    
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { error: 'Failed to delete device' },
      { status: 500 }
    );
  }
}