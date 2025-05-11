"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";


export default function AdminDashboard() {

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      const data = await response.json();
      setIsActive(data.isActive);
    } catch (error) {
      console.error('Error fetching status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update status via API
  const updateStatus = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      setIsActive(data.isActive);

      toast({
        title: "Success",
        description: `Status ${data.isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle handler
  const handleToggle = () => {
    updateStatus();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div>
        <Switch
          id="status-switch"
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
}