
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { ChartTooltip } from "@/components/ui/chart";
import {
  Calendar,
  CheckCircle,
  FileText,
  Users,
  Star,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import {
  getParentDashboardStatistics,
  type ParentDashboardStatistics,
} from "@/api/stats";
import { useAuth } from "@/contexts/AuthContext";

type RangeOption = 7 | 14 | 30;

export default function ParentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ParentDashboardStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeOption>(7);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getParentDashboardStatistics(range);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch parent dashboard statistics:", err);
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

  const firstName = user?.name?.split(" ")[0] || "there";

    const tasksPostedData =
    stats?.tasks_posted_per_day.map((item) => ({
      date: formatDate(item.date),
      count: item.count,
    })) || [];

  const busiestDaysData =
    stats?.busiest_days.map((item) => ({
      day: item.day.slice(0, 3),
      count: item.count,
    })) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[300px] lg:col-span-2" />
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
            <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
            <p className="text-muted-foreground text-left">
              Your dashboard overview
            </p>
          </div>
          <Card className="rounded-xl">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="mb-4 h-8 w-8 text-muted-foreground/50" />
                <h3 className="font-semibold text-destructive">{error}</h3>
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
            <p className="text-muted-foreground text-left">
              Your dashboard overview
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

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Posted</p>
                  <p className="text-2xl font-bold text-left">
                    {stats?.total_posted_tasks ?? 0}
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
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold text-left">
                    {stats?.accepted_tasks ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground text-left">
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
                  <Users className="h-5 w-5 text-muted-foreground" />
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
                  <p className="text-sm text-muted-foreground">Hours Booked</p>
                  <p className="text-2xl font-bold text-left">
                    {stats?.total_hours_booked ?? 0}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="rounded-xl shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Tasks Posted
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Activity in the last {range} days
                  </p>
                </div>
              </div>
              {tasksPostedData.length > 0 ? (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tasksPostedData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                        vertical={false}
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
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No tasks in this period</p>
                </div>
              )}
            </CardContent>
          </Card>

                    <div className="space-y-4">
                        <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Busiest Days
                </h3>
                {busiestDaysData.length > 0 ? (
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={busiestDaysData}>
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
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
                  <div className="h-[120px] flex flex-col items-center justify-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">No data</p>
                  </div>
                )}
              </CardContent>
            </Card>

                        <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours booked</span>
                    <span className="font-medium">
                      {stats?.total_hours_booked ?? 0}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Avg response time
                    </span>
                    <span className="font-medium">
                      {stats?.avg_time_to_first_application_hours
                        ? `${stats.avg_time_to_first_application_hours}h`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviews given</span>
                    <span className="font-medium">
                      {stats?.review_count ?? 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

                <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Babysitter Analytics
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Unique: </span>
                  <span className="font-medium">
                    {stats?.total_unique_babysitters ?? 0}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Repeat rate: </span>
                  <span className="font-medium">
                    {stats?.repeat_rate ?? 0}%
                  </span>
                </div>
              </div>
            </div>

            {stats?.top_babysitters && stats.top_babysitters.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.top_babysitters.slice(0, 6).map((bs) => (
                  <div
                    key={bs.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {bs.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{bs.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bs.task_count} task{bs.task_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {bs.task_count > 2 && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Regular
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No babysitter data yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
