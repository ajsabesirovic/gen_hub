
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard, StatsGrid } from "@/components/stats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  Area,
  AreaChart,
  Line,
  LineChart,
} from "recharts";
import {
  Users,
  Briefcase,
  FileCheck,
  Star,
  TrendingUp,
  UserCheck,
  Baby,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
} from "lucide-react";
import { getAdminStats, type AdminStatistics } from "@/api/stats";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and statistics</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and statistics</p>
          </div>
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-destructive">{error}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) return null;

    const totalUsers = stats.user_totals.total;

  const userDistributionData = [
    { name: "Parents", value: stats.user_totals.parents, fill: COLORS[0] },
    { name: "Babysitters", value: stats.user_totals.babysitters, fill: COLORS[1] },
    { name: "Admins", value: stats.user_totals.admins, fill: COLORS[2] },
  ];

  const taskStatusData = [
    { name: "Unclaimed", value: stats.tasks_by_status.unclaimed, fill: COLORS[3] },
    { name: "Claimed", value: stats.tasks_by_status.claimed, fill: COLORS[4] },
  ];

  const applicationStatusData = [
    { name: "Pending", value: stats.applications_by_status.pending, fill: COLORS[0] },
    { name: "Accepted", value: stats.applications_by_status.accepted, fill: COLORS[1] },
    { name: "Rejected", value: stats.applications_by_status.rejected, fill: COLORS[2] },
  ];

    const monthlyBookingsData = stats.bookings_per_month
    .filter((item) => item.month)
    .map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short" }),
      bookings: item.count,
    }))
    .slice(-6);

    const newUsersData = stats.new_users_per_month
    .filter((item) => item.month)
    .map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short" }),
      users: item.count,
    }))
    .slice(-6);

    const categoryData = stats.tasks_per_category.slice(0, 6).map((item, index) => ({
    category: item.category || "Uncategorized",
    count: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig: ChartConfig = {
    bookings: { label: "Bookings", color: COLORS[0] },
    users: { label: "New Users", color: COLORS[1] },
    parents: { label: "Parents", color: COLORS[0] },
    babysitters: { label: "Babysitters", color: COLORS[1] },
    admins: { label: "Admins", color: COLORS[2] },
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and statistics</p>
        </div>

                <StatsGrid columns={4}>
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle={`${stats.user_totals.active_parents + stats.user_totals.active_babysitters} active`}
            icon={Users}
          />
          <StatCard
            title="Total Bookings"
            value={stats.total_bookings}
            subtitle={`${stats.tasks_by_status.unclaimed} available`}
            icon={Briefcase}
          />
          <StatCard
            title="Applications"
            value={stats.applications_by_status.total}
            subtitle={`${stats.applications_by_status.pending} pending`}
            icon={FileCheck}
          />
          <StatCard
            title="Avg Rating"
            value={stats.average_rating.toFixed(1)}
            subtitle={`${stats.total_reviews} reviews`}
            icon={Star}
          />
        </StatsGrid>

                <div>
          <h2 className="text-lg font-semibold mb-4">Platform Performance</h2>
          <StatsGrid columns={4}>
            <StatCard
              title="Completion Rate"
              value={`${stats.completion_rate}%`}
              subtitle="Bookings completed"
              icon={CheckCircle}
            />
            <StatCard
              title="Cancellation Rate"
              value={`${stats.cancellation_rate}%`}
              subtitle="Bookings cancelled"
              icon={XCircle}
            />
            <StatCard
              title="Avg Duration"
              value={formatDuration(stats.average_duration_minutes)}
              subtitle="Per booking"
              icon={Clock}
            />
            <StatCard
              title="Parent:Babysitter"
              value={`${stats.parent_to_babysitter_ratio}:1`}
              subtitle="Ratio"
              icon={Percent}
            />
          </StatsGrid>
        </div>

                <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parents</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.user_totals.parents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.user_totals.active_parents} active
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${
                      stats.user_totals.parents > 0
                        ? (stats.user_totals.active_parents / stats.user_totals.parents) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Babysitters</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.user_totals.babysitters}</div>
              <p className="text-xs text-muted-foreground">
                {stats.user_totals.active_babysitters} active
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${
                      stats.user_totals.babysitters > 0
                        ? (stats.user_totals.active_babysitters / stats.user_totals.babysitters) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.user_totals.admins}</div>
              <p className="text-xs text-muted-foreground">System administrators</p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {monthlyBookingsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Bookings Over Time
                </CardTitle>
                <CardDescription>Monthly booking creation trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={monthlyBookingsData}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke={COLORS[0]}
                      fillOpacity={1}
                      fill="url(#colorBookings)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

                    {newUsersData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  New Users
                </CardTitle>
                <CardDescription>Monthly user registration trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={newUsersData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke={COLORS[1]}
                      strokeWidth={2}
                      dot={{ fill: COLORS[1] }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown of users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

                    <Card>
            <CardHeader>
              <CardTitle>Task Status</CardTitle>
              <CardDescription>Distribution of tasks by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

                <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Distribution of applications by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={applicationStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

                {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Category</CardTitle>
              <CardDescription>Distribution of tasks across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="category"
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

                <Card>
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
            <CardDescription>Key platform metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Task Claim Rate</p>
                <p className="text-2xl font-bold">
                  {stats.tasks_by_status.total > 0
                    ? ((stats.tasks_by_status.claimed / stats.tasks_by_status.total) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Application Accept Rate</p>
                <p className="text-2xl font-bold">
                  {stats.applications_by_status.total > 0
                    ? (
                        (stats.applications_by_status.accepted / stats.applications_by_status.total) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Avg Bookings per User</p>
                <p className="text-2xl font-bold">
                  {totalUsers > 0 ? (stats.total_bookings / totalUsers).toFixed(1) : 0}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">User Engagement</p>
                <p className="text-2xl font-bold">
                  {stats.user_totals.parents + stats.user_totals.babysitters > 0
                    ? (
                        ((stats.user_totals.active_parents + stats.user_totals.active_babysitters) /
                          (stats.user_totals.parents + stats.user_totals.babysitters)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
