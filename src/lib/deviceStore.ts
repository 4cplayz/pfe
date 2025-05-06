// src/lib/deviceStore.ts
export interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'on' | 'off';
  lastSeen: Date;
  relayState: boolean;
}

// In-memory storage for devices - a module-level singleton
export const deviceStore: Record<string, Device> = {};

export function isDeviceOnline(device: Device): boolean {
  const now = new Date();
  const lastSeen = new Date(device.lastSeen);
  const diffMs = now.getTime() - lastSeen.getTime();
  
  // Consider device offline if no heartbeat for 2 minutes
  // (Should be slightly more than your heartbeat interval)
  return diffMs < 120000; // 2 minutes in milliseconds
}

// Helper functions to work with the device store
export function getAllDevices(): Device[] {
  return Object.values(deviceStore)
    .map(device => ({
      ...device,
      // Update status based on last heartbeat time
      status: isDeviceOnline(device) ? 'on' : 'off'
    }))
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
}

export function getDevice(id: string): Device | null {
  return deviceStore[id] || null;
}

export function addOrUpdateDevice(device: Device): Device {
  deviceStore[device.id] = {
    ...device,
    lastSeen: new Date()
  };
  return deviceStore[device.id];
}

export function updateDeviceState(id: string, relayState: boolean): Device | null {
  if (!deviceStore[id]) return null;
  
  deviceStore[id] = {
    ...deviceStore[id],
    relayState,
    lastSeen: new Date()
  };
  
  return deviceStore[id];
}

export function deleteDevice(id: string): boolean {
  if (!deviceStore[id]) return false;
  
  delete deviceStore[id];
  return true;
}

// Add this function to check if a device is online based on last heartbeat


// Update the getAllDevices function to check online status
