"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Define interface for device structure
interface Device {
  id: string;
  isActive: boolean;
  lastHeartbeat: number;
}

export default function AdminDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingDevices, setUpdatingDevices] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch status regularly to keep the devices list updated
  useEffect(() => {
    fetchStatus();
    
    // Set up polling to fetch status every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      const data = await response.json();
      
      // Check if the API returned the devices array
      if (data && data.devices) {
        setDevices(data.devices);
      } else {
        console.warn('API response did not contain devices array:', data);
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch devices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update a specific device's status via API
  const updateDeviceStatus = async (deviceId: string, isActive: boolean) => {
    try {
      // Mark this device as updating
      setUpdatingDevices(prev => ({ ...prev, [deviceId]: true }));
      
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: deviceId,
          isActive: isActive 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update device status');
      }

      const data = await response.json();
      
      // Update the local state with the new device status
      if (data && data.device) {
        setDevices(prev => 
          prev.map(device => 
            device.id === deviceId ? { ...device, isActive: data.device.isActive } : device
          )
        );

        toast({
          title: "Success",
          description: `Device ${deviceId} ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
      } else {
        // Refresh all devices if we didn't get the expected response format
        fetchStatus();
      }
    } catch (error) {
      console.error('Error updating device status:', error);
      toast({
        title: "Error",
        description: `Failed to update device ${deviceId}`,
        variant: "destructive",
      });
      // Refresh to get the correct state
      fetchStatus();
    } finally {
      // Mark device as no longer updating
      setUpdatingDevices(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  // Toggle handler for a specific device
  const handleToggle = (deviceId: string, currentState: boolean) => {
    updateDeviceStatus(deviceId, !currentState);
  };

  // Format timestamp to human-readable date/time
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate how long ago a device sent its last heartbeat
  const getLastHeartbeatAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60000) {
      return `${Math.floor(diff / 1000)} seconds ago`;
    }
    // Less than an hour
    else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`;
    }
    // Less than a day
    else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`;
    }
    // More than a day
    else {
      return `${Math.floor(diff / 86400000)} days ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Connected Devices</h1>
      </div>

      {isLoading && devices.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading devices...</span>
        </div>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>No devices found.</p>
              <p className="text-sm mt-2">Connect a device to see it here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <Card key={device.id} className="overflow-hidden">
              <CardHeader className="bg-muted/40 pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="truncate" title={device.id}>
                    Device: {device.id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`h-2 w-2 rounded-full ${device.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <Switch
                      checked={device.isActive}
                      onCheckedChange={() => handleToggle(device.id, device.isActive)}
                      disabled={updatingDevices[device.id]}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={device.isActive ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                      {device.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Last heartbeat:</span>
                    <span title={formatTimestamp(device.lastHeartbeat)}>
                      {getLastHeartbeatAgo(device.lastHeartbeat)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}