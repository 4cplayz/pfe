"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Users, ClipboardList, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Types for dashboard data
interface DashboardStats {
  submissionsByStatus: {
    status: string;
    count: number;
    color: string;
  }[];
  submissionsByDay: {
    date: string;
    count: number;
  }[];
  statusByDay: {
    date: string;
    submitted: number;
    reviewed: number;
    draft: number;
  }[];
  averageCompletionTime: {
    journalTitle: string;
    averageTime: number; // in seconds
  }[];
  usersByAccessLevel: {
    accessLevel: string;
    count: number;
    color: string;
  }[];
  completionTimeDistribution: {
    range: string;
    count: number;
  }[];
  mostActiveUsers: {
    name: string;
    matricule: string;
    submissions: number;
  }[];
  userGrowthData: {
    date: string;
    users: number;
  }[];
  totalUsers: number;
  totalSubmissions: number;
  activeJournals: number;
  averageCompletionTimeAll: number; // in seconds
}

// Status colors matching those in manager.tsx
const STATUS_COLORS = {
  SUBMITTED: "#fbbf24", // yellow-500
  REVIEWED: "#10b981", // green-500
  DRAFT: "#6b7280", // gray-500
};

// Access level colors
const ACCESS_LEVEL_COLORS = {
  ETUDIANT: "#60a5fa", // blue-400
  PROFESSEUR: "#8b5cf6", // violet-500
  RESPONSABLE: "#ec4899", // pink-500
};

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<string>("30");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { toast } = useToast();

  // Fetch statistics data
  useEffect(() => {
    fetchStatistics(timeRange);
  }, [timeRange]);

  const fetchStatistics = async (days: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/statistics?days=${days}`);

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Error",
        description: "Failed to load statistics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format seconds to minutes and seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes}m ${remainingSecs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Période:</span>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
              <SelectItem value="all">Tout l'historique</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement des statistiques...</p>
          </div>
        </div>
      ) : !stats ? (
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Aucune donnée statistique disponible</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-row items-center justify-between py-6">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Total des utilisateurs</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-row items-center justify-between py-6">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Total des soumissions</p>
                  <p className="text-3xl font-bold">{stats.totalSubmissions}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-row items-center justify-between py-6">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Journaux actifs</p>
                  <p className="text-3xl font-bold">{stats.activeJournals}</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-row items-center justify-between py-6">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Temps moyen de complétion</p>
                  <p className="text-3xl font-bold">{formatDuration(stats.averageCompletionTimeAll)}</p>
                </div>
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="submissions">Soumissions</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Submissions by Status - Pie Chart */}
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Soumissions par statut</CardTitle>
                    <CardDescription>
                      Distribution des soumissions selon leur statut actuel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.submissionsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                          stroke="var(--color-background)" // Use theme background color for stroke
                          strokeWidth={2} // Adjust stroke width as needed
                        >
                          {stats.submissionsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => {
                            return [`${value} soumissions`, name === "SUBMITTED" ? "En attente" : name === "REVIEWED" ? "Revue" : "Brouillon"];
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            return value === "SUBMITTED" ? "En attente" : value === "REVIEWED" ? "Revue" : "Brouillon";
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Users by Access Level - Donut Chart */}
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Utilisateurs par niveau d'accès</CardTitle>
                    <CardDescription>
                      Distribution des utilisateurs selon leur niveau d'accès
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.usersByAccessLevel}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="accessLevel"
                          stroke="var(--color-background)" // Use theme background color for stroke
                          strokeWidth={2} // Adjust stroke width as needed
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.usersByAccessLevel.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => {
                            return [`${value} utilisateurs`, name === "ETUDIANT" ? "Étudiant" : name === "PROFESSEUR" ? "Professeur" : "Responsable"];
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            return value === "ETUDIANT" ? "Étudiant" : value === "PROFESSEUR" ? "Professeur" : "Responsable";
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Submissions By Day - Line Chart */}
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Activité quotidienne</CardTitle>
                    <CardDescription>
                      Nombre de soumissions par jour sur la période sélectionnée
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={stats.submissionsByDay}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 25,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 12 }}
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Total Soumissions"
                          stroke="#60a5fa"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Average Completion Time By Journal - Bar Chart */}
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Temps moyen par journal</CardTitle>
                    <CardDescription>
                      Temps moyen de complétion par type de journal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats.averageCompletionTime}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 25,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="journalTitle"
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 12 }}
                          height={70}
                        />
                        <YAxis
                          tickFormatter={(value) => `${Math.floor(value / 60)}m`}
                        />
                        <Tooltip
                          formatter={(value) => [`${formatDuration(Number(value))}`, "Temps moyen"]}
                          labelFormatter={(label) => `Journal: ${label}`}
                        />
                        <Legend />
                        <Bar
                          dataKey="averageTime"
                          name="Temps moyen"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Detailed Submissions Over Time Chart */}
                <Card className="min-h-[500px]">
                  <CardHeader>
                    <CardTitle>Évolution des soumissions</CardTitle>
                    <CardDescription>
                      Tendance des soumissions par statut au fil du temps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={stats.statusByDay}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 25,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 12 }}
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="submitted"
                          name="En attente"
                          stroke={STATUS_COLORS.SUBMITTED}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="reviewed"
                          name="Revue"
                          stroke={STATUS_COLORS.REVIEWED}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="draft"
                          name="Brouillon"
                          stroke={STATUS_COLORS.DRAFT}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Completion Time Distribution */}
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Distribution des temps de complétion</CardTitle>
                    <CardDescription>
                      Répartition des soumissions par durée de complétion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats.completionTimeDistribution}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} soumissions`, "Nombre"]} />
                        <Legend />
                        <Bar dataKey="count" name="Soumissions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* User Activity Heatmap */}
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Activité des utilisateurs</CardTitle>
                    <CardDescription>
                      Les utilisateurs les plus actifs par nombre de soumissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        layout="vertical"
                        data={stats.mostActiveUsers}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 80,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          width={80}
                          formatter={(value) => `${value} (${stats.mostActiveUsers.find(u => u.name === value)?.matricule || ''})`}
                        />
                        <Tooltip
                          formatter={(value) => [`${value} soumissions`, "Soumissions"]}
                          labelFormatter={(name) => {
                            const user = stats.mostActiveUsers.find(u => u.name === name);
                            return `${name} (#${user?.matricule || ''})`;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="submissions" name="Soumissions" fill="#60a5fa" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* User Growth Over Time */}
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Croissance des utilisateurs</CardTitle>
                    <CardDescription>
                      Évolution du nombre d'utilisateurs au fil du temps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={stats.userGrowthData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 25,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 12 }}
                          height={60}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} utilisateurs`, "Total"]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="users"
                          name="Utilisateurs"
                          stroke="#ec4899"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}