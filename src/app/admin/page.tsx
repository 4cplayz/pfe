"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button"; // Importation du bouton ajoutée
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react"; // Importation de l'icône RefreshCw ajoutée

// Définir l'interface pour la structure d'un appareil
interface Device {
  id: string;
  isActive: boolean;
  lastHeartbeat: number;
}

export default function AdminDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingDevices, setUpdatingDevices] = useState<Record<string, boolean>>({});
  const [pollingActive, setPollingActive] = useState(false); // Nouvel état pour activer/désactiver le polling
  const { toast } = useToast();

  // Récupérer le statut une fois au montage du composant
  useEffect(() => {
    fetchStatus();
  }, []);

  // Mettre en place ou annuler le polling en fonction de l'état pollingActive
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    // Ne mettre en place l'intervalle que si le polling est actif
    if (pollingActive) {
      interval = setInterval(fetchStatus, 5000);
    }
    
    // Nettoyer l'intervalle lorsque le composant est démonté ou que le polling est désactivé
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pollingActive]); // Ne ré-exécuter cet effet que lorsque pollingActive change

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error('Échec de la récupération du statut');
      }
      const data = await response.json();
      
      // Vérifier si l'API a retourné le tableau des appareils
      if (data && data.devices) {
        setDevices(data.devices);
      } else {
        console.warn('La réponse de l\'API ne contenait pas de tableau d\'appareils :', data);
        setDevices([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du statut :', error);
      toast({
        title: "Erreur",
        description: "Échec de la récupération des appareils",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Activer/désactiver le polling
  const togglePolling = () => {
    const newState = !pollingActive;
    setPollingActive(newState);
    
    toast({
      title: newState ? "Rafraîchissement automatique activé" : "Rafraîchissement automatique désactivé",
      description: newState ? "Le statut des appareils sera mis à jour toutes les 5 secondes" : "Le statut des appareils ne sera pas mis à jour automatiquement",
    });
  };

  // Mettre à jour le statut d'un appareil spécifique via l'API
  const updateDeviceStatus = async (deviceId: string, isActive: boolean) => {
    try {
      // Marquer cet appareil comme étant en cours de mise à jour
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
        throw new Error('Échec de la mise à jour du statut de l\'appareil');
      }

      const data = await response.json();
      
      // Mettre à jour l'état local avec le nouveau statut de l'appareil
      if (data && data.device) {
        setDevices(prev => 
          prev.map(device => 
            device.id === deviceId ? { ...device, isActive: data.device.isActive } : device
          )
        );

        toast({
          title: "Succès",
          description: `L'appareil ${deviceId} a été ${isActive ? 'activé' : 'désactivé'} avec succès`,
        });
      } else {
        // Rafraîchir tous les appareils si nous n'avons pas obtenu le format de réponse attendu
        fetchStatus();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de l\'appareil :', error);
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour de l'appareil ${deviceId}`,
        variant: "destructive",
      });
      // Rafraîchir pour obtenir l'état correct
      fetchStatus();
    } finally {
      // Marquer l'appareil comme n'étant plus en cours de mise à jour
      setUpdatingDevices(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  // Gestionnaire de bascule pour un appareil spécifique
  const handleToggle = (deviceId: string, currentState: boolean) => {
    updateDeviceStatus(deviceId, !currentState);
  };

  // Formater l'horodatage en date/heure lisible par l'homme
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  // Calculer depuis combien de temps un appareil a envoyé son dernier "heartbeat"
  const getLastHeartbeatAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Moins d'une minute
    if (diff < 60000) {
        const seconds = Math.floor(diff / 1000);
        return `il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`;
    }
    // Moins d'une heure
    else if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    // Moins d'un jour
    else if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    // Plus d'un jour
    else {
        const days = Math.floor(diff / 86400000);
        return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appareils Connectés</h1>
        
        {/* Ajouter les contrôles de polling */}
        <div className="flex items-center gap-2">
          <Button 
            variant={pollingActive ? "default" : "outline"} 
            onClick={togglePolling}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${pollingActive ? "animate-spin" : ""}`} />
            {pollingActive ? "Rafraîchissement auto ON" : "Rafraîchissement auto OFF"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={fetchStatus}
            disabled={isLoading}
            title="Rafraîchir maintenant"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isLoading && devices.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des appareils...</span>
        </div>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>Aucun appareil trouvé.</p>
              <p className="text-sm mt-2">Connectez un appareil pour le voir ici.</p>
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
                    Appareil : {device.id}
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
                    <span className="text-muted-foreground">Statut :</span>
                    <span className={device.isActive ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                      {device.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Dernier heartbeat :</span>
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