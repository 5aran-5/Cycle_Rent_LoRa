import { useEffect, useState } from "react";
import { Bike, Users, Activity, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/api";

// ================== TypeScript Interfaces ==================

interface DashboardStats {
  totalBikes: number;
  available: number;
  ongoingRentals: number;
  offline: number;
  activeUsers: number;
}

interface WeeklyRental {
  day: string;
  rentals: number;
}

interface RecentRental {
  id: number;
  userName: string;
  deviceId: string;
  status: string;
  startTime: string;
  duration: string;
}

interface DashboardResponse {
  stats: DashboardStats;
  weeklyRentals: WeeklyRental[];
  recentRentals: RecentRental[];
}

// ================== Dashboard Component ==================

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBikes: 0,
    available: 0,
    ongoingRentals: 0,
    offline: 0,
    activeUsers: 0,
  });

  const [weeklyRentals, setWeeklyRentals] = useState<WeeklyRental[]>([]);
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get<DashboardResponse>("/api/dashboard/");
        const data = response.data;

        setStats(data.stats);
        setWeeklyRentals(data.weeklyRentals || []);
        setRecentRentals(data.recentRentals || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusData = [
    { name: "Available", value: stats.available, color: "hsl(var(--success))" },
    {
      name: "Ongoing Rentals",
      value: stats.ongoingRentals,
      color: "hsl(var(--primary))",
    },
    { name: "Offline", value: stats.offline, color: "hsl(var(--muted))" },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of your bicycle rental system
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Bicycles" value={stats.totalBikes} icon={Bike} color="primary" />
        <StatCard title="Available Now" value={stats.available} icon={Activity} color="success" />
        <StatCard title="Active Rentals" value={stats.ongoingRentals} icon={Users} color="primary" />
        <StatCard title="Offline Bikes" value={stats.offline} icon={AlertCircle} color="destructive" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Rentals */}
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Rentals</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyRentals}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="rentals" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Bicycle Status Distribution */}
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Bicycle Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: { name?: string; percent?: number | string }) => {
                  const name = entry.name ?? "";
                  const pct = Number(entry.percent) || 0;
                  return `${name} ${Math.round(pct * 100)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Rentals */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentRentals.length > 0 ? (
            recentRentals.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bike className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{log.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.status === "ongoing"
                        ? `Currently using ${log.deviceId}`
                        : `Completed rental of ${log.deviceId}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.startTime).toLocaleString()}
                  </p>
                  {log.duration && (
                    <p className="text-sm font-medium text-foreground">{log.duration}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No recent rentals.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
