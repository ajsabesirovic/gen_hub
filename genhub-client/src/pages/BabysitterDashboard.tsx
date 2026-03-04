
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Star,
  Calendar,
  MapPin,
  Tag,
  Repeat,
  FileText,
} from "lucide-react";
import {
  getBabysitterDashboardStatistics,
  type BabysitterDashboardStatistics,
} from "@/api/stats";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  accepted: "#10b981",
  rejected: "#f43f5e",
  cancelled: "#6b7280",
};

type RangeOption = 7 | 14 | 30;

export default function BabysitterDashboard() {
  const [stats, setStats] = useState<BabysitterDashboardStatistics | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeOption>(30);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getBabysitterDashboardStatistics(range);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch babysitter dashboard statistics:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [range]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartConfig: ChartConfig = {
    count: { label: "Tasks", color: "hsl(var(--chart-1))" },
    tasks: { label: "Tasks", color: "hsl(var(--chart-1))" },
  };

    const tasksPerDayData =
    stats?.tasks_per_day.map((item) => ({
      date: formatDate(item.date),
      count: item.count,
    })) || [];

  const busiestDaysData =
    stats?.busiest_days.map((item) => ({
      day: item.day.slice(0, 3),
      count: item.count,
    })) || [];

  const statusData =
    stats?.status_distribution
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: item.count,
        fill: STATUS_COLORS[item.status] || COLORS[0],
      })) || [];

  const categoryData =
    stats?.category_distribution.map((item, index) => ({
      name: item.category,
      value: item.count,
      fill: COLORS[index % COLORS.length],
    })) || [];

  const locationData =
    stats?.location_distribution.map((item, index) => ({
      name:
        item.location.length > 20
          ? item.location.slice(0, 20) + "..."
          : item.location,
      value: item.count,
      fill: COLORS[index % COLORS.length],
    })) || [];

    const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground">
                Your activity and performance
              </p>
            </div>
            <Skeleton className="h-10 w-[120px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
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
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              Your activity and performance
            </p>
          </div>
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-destructive">
                  {error}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your activity and performance
            </p>
          </div>
          <Select
            value={String(range)}
            onValueChange={(value) => setRange(Number(value) as RangeOption)}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold text-left">
                    {stats?.total_applications ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold  text-left">
                    {stats?.accepted_applications ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground  text-left">
                    {stats?.acceptance_rate ?? 0}% rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-left">
                    {stats?.completed_tasks ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hours Worked</p>
                  <p className="text-2xl font-bold text-left">
                    {stats?.total_hours_worked ?? 0}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-base font-medium ">
                Tasks Over Time
              </CardTitle>
              <CardDescription>
                Tasks assigned in the last {range} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksPerDayData.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tasksPerDayData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="text-sm font-medium">
                                  {payload[0].payload.date}: {payload[0].value}{" "}
                                  tasks
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No tasks in this period</p>
                </div>
              )}
            </CardContent>
          </Card>

                    <Card>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-base font-medium ">
                Busiest Days
              </CardTitle>
              <CardDescription>Tasks by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              {busiestDaysData.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={busiestDaysData}>
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="text-sm font-medium">
                                  {payload[0].payload.day}: {payload[0].value}{" "}
                                  tasks
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                  <Calendar className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-base font-medium">
                Application Status
              </CardTitle>
              <CardDescription>Distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[180px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {statusData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-muted-foreground">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No applications</p>
                </div>
              )}
            </CardContent>
          </Card>

                    <Card>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-base font-medium">
                Categories
              </CardTitle>
              <CardDescription>Tasks by category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[180px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {categoryData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-muted-foreground">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
                  <Tag className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No category data</p>
                </div>
              )}
            </CardContent>
          </Card>

                    <Card>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-base font-medium">Locations</CardTitle>
              <CardDescription>Top work locations</CardDescription>
            </CardHeader>
            <CardContent>
              {locationData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[180px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {locationData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span
                          className="text-muted-foreground"
                          title={item.name}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
                  <MapPin className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No location data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-base font-medium ">
                Repeat Clients
              </CardTitle>
              <CardDescription>
                Parents who hired you multiple times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 text-center xs:text-left">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Unique Parents
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats?.total_unique_parents ?? 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Repeat Clients
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats?.repeat_parents_count ?? 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Repeat Rate</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats?.repeat_rate ?? 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

                  </div>
      </div>
    </DashboardLayout>
  );
}
