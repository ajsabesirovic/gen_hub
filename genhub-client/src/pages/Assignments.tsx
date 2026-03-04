import { useEffect, useState, useCallback } from "react";
import { parseISO, addHours } from "date-fns";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarView } from "@/components/CalendarView";
import type { CalendarEvent } from "@/components/full-calendar";
import { AddTask } from "@/components/AddTask";
import { useAuth } from "@/contexts/AuthContext";
import { getParentTasks, getMyAcceptedTasks } from "@/api/tasks";
import type { Task } from "@/types/task";

function transformTasksToEvents(tasks: Task[]): CalendarEvent[] {
    if (!Array.isArray(tasks)) {
    return [];
  }
  return tasks.map((task) => {
    const startDate = parseISO(task.start);
        let endDate: Date;
    if (task.end) {
      endDate = parseISO(task.end);
    } else if (task.duration) {
      endDate = addHours(startDate, task.duration / 60);
    } else {
      endDate = addHours(startDate, 1);
    }

    return {
      id: String(task.id),
      start: startDate,
      end: endDate,
      title: task.title,
      category: task.category?.name || "",
      description: task.description || "",
      location: task.location || null,
      userId: task.user || "",
      status:
        task.status === "claimed" || task.status === "in_progress"
          ? "claimed"
          : "unclaimed",
    };
  });
}

export default function Assignments() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isParent = user?.role === "parent";

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = isParent
        ? await getParentTasks()
        : await getMyAcceptedTasks();

            setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load assignments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [isParent]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const calendarEvents = transformTasksToEvents(tasks);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              {isParent
                ? "View and manage your bookings."
                : "View your accepted assignments."}
            </p>
          </div>
          {isParent && <AddTask onTaskAdded={fetchTasks} />}
        </div>

                <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg border bg-card">
          <span className="text-sm font-medium text-muted-foreground">
            Legend:
          </span>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-red-500" />
            <span className="text-sm">Past tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-gray-500" />
            <span className="text-sm">Claimed tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-primary" />
            <span className="text-sm">Upcoming tasks</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          {isLoading ? (
            <Card>
              <CardContent className="py-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <h3 className="text-lg font-semibold">
                    Loading assignments...
                  </h3>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <h3 className="text-lg font-semibold text-destructive">
                    {error}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CalendarView events={calendarEvents} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
