"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button"; // Added Button import
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react"; // Added RefreshCw icon

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
  const [pollingActive, setPollingActive] = useState(false); // New state for polling toggle
  const { toast } = useToast();

  // Fetch status once on component mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Set up or tear down polling based on pollingActive state
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    // Only set up interval if polling is active
    if (pollingActive) {
      interval = setInterval(fetchStatus, 5000);
    }
    
    // Clean up interval when component unmounts or polling is deactivated
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pollingActive]); // Only re-run this effect when pollingActive changes

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

  // Toggle polling active/inactive
  const togglePolling = () => {
    const newState = !pollingActive;
    setPollingActive(newState);
    
    toast({
      title: newState ? "Auto-refresh enabled" : "Auto-refresh disabled",
      description: newState ? "Device status will update every 5 seconds" : "Device status will not update automatically",
    });
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
        
        {/* Add polling controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant={pollingActive ? "default" : "outline"} 
            onClick={togglePolling}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${pollingActive ? "animate-spin" : ""}`} />
            {pollingActive ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={fetchStatus}
            disabled={isLoading}
            title="Refresh now"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
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