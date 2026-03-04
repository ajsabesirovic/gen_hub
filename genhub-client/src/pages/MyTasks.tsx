import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  format,
  parseISO,
  addMinutes,
  differenceInDays,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isToday,
} from "date-fns";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  Briefcase,
  Circle,
  Check,
  XCircle,
  X,
} from "lucide-react";
import { getMyAcceptedTasks, completeTask, getCategories, cancelApplication } from "@/api/tasks";
import type { Task, Category } from "@/types/task";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

type TabValue = "upcoming" | "today" | "past" | "completed";

function getTaskEndDate(task: Task): Date | null {
  const startDate = parseISO(task.start);
  if (task.end) {
    return parseISO(task.end);
  }
  if (task.duration) {
    return addMinutes(startDate, task.duration);
  }
  return null;
}

function getDaysUntilDue(task: Task): number {
  const taskStart = parseISO(task.start);
  const today = startOfDay(new Date());
  return differenceInDays(taskStart, today);
}

function getStatusBadgeStyle(status: string): string {
  switch (status) {
    case "claimed":
      return "bg-green-500 text-white hover:bg-green-600";
    case "completed":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "unclaimed":
      return "bg-muted text-muted-foreground hover:bg-muted/80";
    case "cancelled":
      return "bg-red-500 text-white hover:bg-red-600";
    default:
      return "bg-muted text-muted-foreground hover:bg-muted/80";
  }
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "unclaimed":
      return "Pending";
    case "claimed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

const ITEMS_PER_PAGE = 5;

export default function MyTasks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("today");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDueDate, setFilterDueDate] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const [currentPage, setCurrentPage] = useState(1);

    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [taskToCancel, setTaskToCancel] = useState<Task | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

    const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
                  const segmentMap: Record<TabValue, string> = {
        upcoming: "assigned",
        today: "assigned",
        past: "assigned",
        completed: "completed",
      };
      const data = await getMyAcceptedTasks(segmentMap[activeTab] as any);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    setCurrentPage(1);
  }, [activeTab]);

    useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterStatus, filterDueDate, dateRange]);

    const filteredTasks = useMemo(() => {
    let result = [...tasks];
    const today = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

        switch (activeTab) {
      case "upcoming":
                result = result.filter((task) => {
          const taskStart = parseISO(task.start);
          return isAfter(taskStart, todayEnd);
        });
        break;
      case "today":
                result = result.filter((task) => {
          const taskStart = parseISO(task.start);
          return isToday(taskStart);
        });
        break;
      case "past":
                result = result.filter((task) => {
          const taskStart = parseISO(task.start);
          return isBefore(taskStart, today) && task.status !== "completed";
        });
        break;
      case "completed":
                break;
    }

        if (filterCategory !== "all") {
      result = result.filter(
        (task) => task.category?.id.toString() === filterCategory,
      );
    }

        if (filterStatus !== "all") {
      result = result.filter((task) => task.status === filterStatus);
    }

        if (dateRange?.from) {
      result = result.filter((task) => {
        const taskStart = parseISO(task.start);
        if (dateRange.to) {
          return isWithinInterval(taskStart, {
            start: dateRange.from!,
            end: dateRange.to,
          });
        }
        return !isBefore(taskStart, dateRange.from!);
      });
    }

        if (filterDueDate !== "all") {
      result = result.filter((task) => {
        const daysUntilDue = getDaysUntilDue(task);
        switch (filterDueDate) {
          case "today":
            return daysUntilDue === 0;
          case "week":
            return daysUntilDue >= 0 && daysUntilDue <= 7;
          case "month":
            return daysUntilDue >= 0 && daysUntilDue <= 30;
          default:
            return true;
        }
      });
    }

        result.sort((a, b) => {
      const dateA = parseISO(a.start);
      const dateB = parseISO(b.start);
            if (activeTab === "past") {
        return dateB.getTime() - dateA.getTime();
      }
      return dateA.getTime() - dateB.getTime();
    });

    return result;
  }, [
    tasks,
    activeTab,
    filterCategory,
    filterStatus,
    filterDueDate,
    dateRange,
  ]);

    const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  const handleViewTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCompleteClick = (task: Task) => {
    setTaskToComplete(task);
    setCompleteDialogOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (!taskToComplete) return;

    try {
      setIsCompleting(true);
      await completeTask(String(taskToComplete.id));
      toast.success("Task marked as completed!", {
        description: "The parent has been notified.",
      });
      setCompleteDialogOpen(false);
      setTaskToComplete(null);
      fetchTasks();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to complete task");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelClick = (task: Task) => {
    setTaskToCancel(task);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!taskToCancel) return;

    try {
      setIsCancelling(true);
      await cancelApplication(String(taskToCancel.id));
      toast.success("Booking cancelled", {
        description: "The parent has been notified.",
      });
      setCancelDialogOpen(false);
      setTaskToCancel(null);
      fetchTasks();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
                <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bookings</h1>
        </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by:</span>

                    <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[140px] bg-background">
              <SelectValue placeholder="All Tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

                    <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto sm:min-w-[200px] justify-start text-left font-normal bg-background",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} -{" "}
                        {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
              {dateRange && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                    className="w-full"
                  >
                    Clear dates
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

                    {(filterCategory !== "all" || dateRange) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterCategory("all");
                setDateRange(undefined);
              }}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>

                <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          className="space-y-6"
        >
          <TabsList className="bg-muted p-1">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Past
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-0">
                        {isLoading && (
              <div className="bg-card rounded-lg border p-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Loading tasks...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we fetch your tasks.
                  </p>
                </div>
              </div>
            )}

                        {!isLoading && error && (
              <div className="bg-card rounded-lg border p-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <Briefcase className="mb-4 h-12 w-12 text-destructive" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Error loading tasks
                  </h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="mt-4"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            )}

                        {!isLoading && !error && filteredTasks.length === 0 && (
              <div className="bg-card rounded-lg border p-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">
                    No tasks found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "today"
                      ? "You don't have any tasks scheduled for today."
                      : activeTab === "upcoming"
                        ? "You don't have any upcoming tasks. Browse available tasks and apply to get started!"
                        : activeTab === "past"
                          ? "You don't have any past incomplete tasks."
                          : "You haven't completed any tasks yet."}
                  </p>
                  {(activeTab === "upcoming" || activeTab === "today") && (
                    <Button
                      variant="link"
                      onClick={() => navigate("/tasks")}
                      className="mt-2 text-primary"
                    >
                      Browse available tasks
                    </Button>
                  )}
                </div>
              </div>
            )}

                        {!isLoading && !error && paginatedTasks.length > 0 && (
              <div className="bg-card rounded-lg border divide-y divide-border">
                {paginatedTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onViewDetails={() => handleViewTask(task.id)}
                    onComplete={handleCompleteClick}
                    onCancel={handleCancelClick}
                    showCompleteButton={
                      activeTab === "today" || activeTab === "past"
                    }
                  />
                ))}
              </div>
            )}

                        {!isLoading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-9 h-9",
                          currentPage === page &&
                            "bg-primary hover:bg-primary/90",
                        )}
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

                <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Task as Completed</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark this task as completed? The parent
                will be notified and can leave a review for your service.
              </DialogDescription>
            </DialogHeader>
            {taskToComplete && (
              <div className="rounded-lg bg-muted p-4 my-4">
                <h4 className="font-medium text-foreground">
                  {taskToComplete.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {taskToComplete.location || "No location specified"}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCompleteDialogOpen(false)}
                disabled={isCompleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmComplete}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Complete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? The parent will be
                notified that you are no longer available for this task.
              </DialogDescription>
            </DialogHeader>
            {taskToCancel && (
              <div className="rounded-lg bg-muted p-4 my-4">
                <h4 className="font-medium text-foreground">
                  {taskToCancel.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {taskToCancel.location || "No location specified"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(parseISO(taskToCancel.start), "EEE, MMM d 'at' h:mm a")}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

interface TaskListItemProps {
  task: Task;
  onViewDetails: () => void;
  onComplete?: (task: Task) => void;
  onCancel?: (task: Task) => void;
  showCompleteButton?: boolean;
}

function TaskListItem({
  task,
  onViewDetails,
  onComplete,
  onCancel,
  showCompleteButton,
}: TaskListItemProps) {
  const taskStart = parseISO(task.start);
  const taskEnd = getTaskEndDate(task);
  const formattedDate = format(taskStart, "EEE, MMM d");
  const formattedStartTime = format(taskStart, "h:mm a");
  const formattedEndTime = taskEnd ? format(taskEnd, "h:mm a") : null;
  const daysUntilDue = getDaysUntilDue(task);

    const canCancel = task.status === "claimed" && daysUntilDue >= 2;

    const getTimeDisplay = () => {
    if (task.end && formattedEndTime) {
      return `${formattedStartTime} - ${formattedEndTime}`;
    }
    if (task.duration) {
      return `${formattedStartTime} (~${(task.duration / 60).toFixed(1)}h)`;
    }
    return formattedStartTime;
  };

  const isCompleted = task.status === "completed";
  const isConfirmed = task.status === "claimed";

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
            <div className="shrink-0">
        {isCompleted || isConfirmed ? (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        ) : (
          <Circle className="w-6 h-6 text-muted-foreground/50" />
        )}
      </div>

            <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-foreground truncate text-left">
          {task.title}
        </h3>
        <p className="text-sm text-muted-foreground text-left">
          {formattedDate}, {getTimeDisplay()}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={getStatusBadgeStyle(task.status)}>
            {formatStatusLabel(task.status)}
          </Badge>

                    {task.category && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {task.category.name}
            </span>
          )}
        </div>
      </div>

            <div className="shrink-0 flex items-center gap-2">
        {canCancel && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(task)}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            <XCircle className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        )}
        {showCompleteButton && isConfirmed && onComplete ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComplete(task)}
            className="text-green-600 border-green-600 hover:bg-green-500/10 dark:text-green-400 dark:border-green-400"
          >
            Complete
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            {task.status === "unclaimed" ? "Edit" : "View Details"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
