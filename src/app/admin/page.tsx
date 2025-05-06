"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bienvenue sur le tableau de bord administrateur.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controleur d'alimentation</CardTitle>
        </CardHeader>
        <CardContent>
          <Card>
            <CardHeader>
              Nom de l'appareill : 
            </CardHeader>
            <CardContent>
              Basculer l'allumation
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}