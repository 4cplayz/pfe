"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Power, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Device type definition
interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'on' | 'off';
  lastSeen: Date;
  relayState: boolean;
}

export default function AdminDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch devices on component mount and set up polling
  useEffect(() => {
    fetchDevices();

    // Poll for device updates every 5 seconds
    const interval = setInterval(() => {
      fetchDevices(true);
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Function to fetch devices from the API
  const fetchDevices = async (silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const response = await fetch('/api/devices');

      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      const data = await response.json();

      // Convert lastSeen strings to Date objects
      const formattedDevices = data.map((device: any) => ({
        ...device,
        lastSeen: new Date(device.lastSeen)
      }));

      setDevices(formattedDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      if (!silent) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les appareils connectés",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh devices
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };

  // Function to toggle a device's relay state
  const toggleRelayState = async (deviceId: string, currentState: boolean, ipAddress: string) => {
    try {
      // Optimistically update the UI
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId
            ? { ...device, relayState: !currentState }
            : device
        )
      );

      // First, update the backend
      await fetch(`/api/devices/${deviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ relayState: !currentState }),
      });

      // Then, send a direct command to the ESP32
      console.log(`Sending command to ESP32 at http://${ipAddress}/relay`);

      try {
        const response = await fetch(`http://${ipAddress}/relay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `state=${!currentState ? 'on' : 'off'}`,
        });

        if (!response.ok) {
          console.error('Direct ESP32 request failed:', await response.text());
          throw new Error('Failed to update device directly');
        }
      } catch (espError) {
        console.error('Error connecting to ESP32:', espError);
        throw new Error('Could not connect to device');
      }

      // Show success toast
      toast({
        title: "Succès",
        description: `Appareil ${!currentState ? 'activé' : 'désactivé'} avec succès`,
      });

      // Refresh devices to get latest state
      fetchDevices(true);
    } catch (error) {
      console.error('Error toggling device state:', error);

      // Revert the optimistic update
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId
            ? { ...device, relayState: currentState }
            : device
        )
      );

      toast({
        title: "Erreur",
        description: "Impossible de modifier l'état de l'appareil",
        variant: "destructive",
      });
    }
  };


  // Function to format the last seen time
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) {
      return `Il y a ${diffSeconds} seconde${diffSeconds !== 1 ? 's' : ''}`;
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours !== 1 ? 's' : ''}`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} jour${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Rafraîchir
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contrôleur d'alimentation</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-10">
              <WifiOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun appareil connecté</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Aucun appareil ESP32 n'est actuellement connecté. Assurez-vous que votre ESP32 est allumé et connecté au réseau Wi-Fi.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {devices.map((device) => (
                <Card key={device.id} className="overflow-hidden">
                  <div className="flex items-center gap-4 p-4 bg-muted/30">
                    <div className={`p-2 rounded-full ${device.status === 'on' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {device.status === 'on' ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{device.name}</h3>
                      <p className="text-xs text-muted-foreground">{device.ipAddress}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatLastSeen(device.lastSeen)}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Power className={`h-5 w-5 ${device.relayState ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <Label htmlFor={`relay-${device.id}`} className="font-medium">
                        {device.relayState ? 'Alimenté' : 'Non alimenté'}
                      </Label>
                    </div>
                    <Switch
                      id={`relay-${device.id}`}
                      checked={device.relayState}
                      onCheckedChange={() => toggleRelayState(device.id, device.relayState, device.ipAddress)}
                      disabled={device.status === 'off'}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}