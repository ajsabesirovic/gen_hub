import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, formatDistanceToNow, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  MapPin,
  Users,
  Briefcase,
  Shield,
  Loader2,
  Star,
  CheckCircle,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import {
  getParentTasks,
  getTaskApplications,
  acceptApplication,
  rejectApplication,
  getCategories,
} from "@/api/tasks";
import {
  canReviewTask,
  getReviewForTask,
  type CanReviewResponse,
  type Review,
} from "@/api/user";
import { getErrorMessage } from "@/lib/error-utils";
import type { Task, TaskApplication, Category } from "@/types/task";
import { ReviewDialog } from "@/components/ReviewDialog";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "most_applicants" | "highest_pay";
type StatusFilter = "all" | "open" | "confirmed" | "filled" | "drafting";

export default function TaskApplications() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [taskToReview, setTaskToReview] = useState<Task | null>(null);
  const [reviewInfo, setReviewInfo] = useState<CanReviewResponse | null>(null);
  const [taskReviews, setTaskReviews] = useState<Record<string, Review | null>>(
    {},
  );

    const [stats, setStats] = useState({
    activeTasks: 0,
    totalApplicants: 0,
    tasksFilled: 0,
    pendingReviews: 0,
  });

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
            const [openTasks, assignedTasks, completedTasks] = await Promise.all([
        getParentTasks("open"),
        getParentTasks("assigned"),
        getParentTasks("completed"),
      ]);

      const allTasks = [
        ...(Array.isArray(openTasks) ? openTasks : []),
        ...(Array.isArray(assignedTasks) ? assignedTasks : []),
        ...(Array.isArray(completedTasks) ? completedTasks : []),
      ];

      setTasks(allTasks);

            const today = startOfDay(new Date());
      const active = allTasks.filter(
        (t) =>
          (t.status === "unclaimed" || t.status === "claimed") &&
          !isBefore(parseISO(t.start), today),
      ).length;
      const filled = allTasks.filter((t) => t.status === "completed").length;
      const totalApps = allTasks.reduce(
        (sum, t) => sum + (t.applications_count || 0),
        0,
      );
      const pendingReviews = allTasks.filter(
        (t) => t.status === "completed" && t.volunteer,
      ).length;

      setStats({
        activeTasks: active,
        totalApplicants: totalApps,
        tasksFilled: filled,
        pendingReviews,
      });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, [fetchTasks, fetchCategories]);

    useEffect(() => {
    async function fetchReviews() {
      const completedTasks = tasks.filter(
        (t) => t.status === "completed" && t.volunteer,
      );
      if (completedTasks.length === 0) return;

      const reviewPromises = completedTasks.map(async (task) => {
        const review = await getReviewForTask(task.id);
        return { taskId: task.id, review };
      });

      const results = await Promise.all(reviewPromises);
      const reviewsMap: Record<string, Review | null> = {};
      results.forEach(({ taskId, review }) => {
        reviewsMap[taskId] = review;
      });
      setTaskReviews(reviewsMap);
    }

    fetchReviews();
  }, [tasks]);

  const handleViewApplicants = async (task: Task) => {
    setSelectedTask(task);
    setApplicationsDialogOpen(true);
    setLoadingApplications(true);

    try {
      const data = await getTaskApplications(task.id);
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      toast.error(getErrorMessage(err, "Failed to load applications"));
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleAccept = async (application: TaskApplication) => {
    if (!selectedTask) return;

    try {
      setIsProcessing(application.id);
      await acceptApplication(selectedTask.id, application.volunteer_detail.id);
      toast.success("Application accepted!", {
        description: `You have accepted ${application.volunteer_detail.name || "the babysitter"}'s application.`,
      });
            const updatedApplications = await getTaskApplications(selectedTask.id);
      setApplications(updatedApplications);
      fetchTasks();
    } catch (err) {
      console.error("Failed to accept application:", err);
      toast.error(getErrorMessage(err, "Failed to accept application"));
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (application: TaskApplication) => {
    if (!selectedTask) return;

    try {
      setIsProcessing(application.id);
      await rejectApplication(selectedTask.id, application.volunteer_detail.id);
      toast.success("Application rejected");
      const updatedApplications = await getTaskApplications(selectedTask.id);
      setApplications(updatedApplications);
    } catch (err) {
      console.error("Failed to reject application:", err);
      toast.error(getErrorMessage(err, "Failed to reject application"));
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReviewClick = async (task: Task) => {
    try {
      const info = await canReviewTask(String(task.id));
      setReviewInfo(info);
      setTaskToReview(task);
      setReviewDialogOpen(true);
    } catch (err) {
      console.error("Failed to check review status:", err);
      toast.error(getErrorMessage(err, "Failed to check review status"));
    }
  };

  const handleReviewSuccess = () => {
    fetchTasks();
  };

    const filteredTasks = tasks
    .filter((task) => {
            if (statusFilter === "open" && task.status !== "unclaimed") return false;
      if (statusFilter === "confirmed" && task.status !== "claimed") return false;
      if (statusFilter === "filled" && task.status !== "completed")
        return false;
            if (selectedCategories.length > 0) {
        if (!task.category || !selectedCategories.includes(String(task.category.id))) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (sortBy === "most_applicants") {
        return (b.applications_count || 0) - (a.applications_count || 0);
      }
      return 0;
    });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
                <div className="flex items-start justify-between">
          <div className="pl-2">
            <h1 className="text-left text-2xl font-bold">Task Applications</h1>
            <p className="text-muted-foreground text-sm">
              You have {stats.activeTasks} active listings currently receiving
              applications
            </p>
          </div>
        </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Tasks"
            value={stats.activeTasks}
            subtext="Current & upcoming"
            icon={Briefcase}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatCard
            label="Total Applicants"
            value={stats.totalApplicants}
            subtext="Across all tasks"
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatCard
            label="Completed"
            value={stats.tasksFilled}
            subtext="All time"
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
          />
          <StatCard
            label="Pending Reviews"
            value={stats.pendingReviews}
            subtext={stats.pendingReviews > 0 ? "Action required" : "All done"}
            subtextColor={
              stats.pendingReviews > 0 ? "text-orange-600" : undefined
            }
            icon={Star}
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
                    <aside className="hidden lg:block">
            <div className="sticky top-6">
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-5 text-left">
                  Filters
                </h3>

                                <div className="mb-6">
                  <h4 className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    Task Status
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { value: "all", label: "All Statuses" },
                      { value: "open", label: "Open" },
                      { value: "confirmed", label: "Confirmed" },
                      { value: "filled", label: "Completed" },
                    ].map((status) => (
                      <div
                        key={status.value}
                        className="flex items-center gap-2.5"
                      >
                        <Checkbox
                          id={`status-${status.value}`}
                          checked={statusFilter === status.value}
                          onCheckedChange={() =>
                            setStatusFilter(status.value as StatusFilter)
                          }
                        />
                        <Label
                          htmlFor={`status-${status.value}`}
                          className="text-sm cursor-pointer font-normal"
                        >
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                                {categories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground mb-3">
                      Category
                    </h4>
                    <Select
                      value={
                        selectedCategories.length > 0
                          ? String(selectedCategories[0])
                          : "all"
                      }
                      onValueChange={(value) => {
                        if (value === "all") {
                          setSelectedCategories([]);
                        } else {
                          setSelectedCategories([value]);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                              </div>
            </div>
          </aside>

                    <main className="min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="hidden sm:flex gap-1 p-1 bg-muted rounded-lg">
                {[
                  { value: "newest", label: "Most Recent" },
                  { value: "most_applicants", label: "Most Applicants" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as SortOption)}
                    className={cn(
                      "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors",
                      sortBy === option.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Sort by
                </span>
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as SortOption)}
                >
                  <SelectTrigger className="w-[140px] sm:w-[130px] h-8 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="most_applicants">
                      Most Applicants
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

                        {isLoading ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading tasks...</p>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Briefcase className="mb-4 h-10 w-10 text-muted-foreground/50" />
                    <h3 className="font-semibold">Error loading tasks</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredTasks.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Briefcase className="mb-4 h-10 w-10 text-muted-foreground/50" />
                    <h3 className="font-semibold">No tasks found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or post a new task.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    existingReview={taskReviews[task.id]}
                    onViewApplicants={() => handleViewApplicants(task)}
                    onReview={() => handleReviewClick(task)}
                    onViewTask={() => navigate(`/tasks/${task.id}`)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

                <Dialog
          open={applicationsDialogOpen}
          onOpenChange={setApplicationsDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Applicants for {selectedTask?.title}</DialogTitle>
            </DialogHeader>

            {loadingApplications ? (
              <div className="py-8 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Loading applicants...
                </p>
              </div>
            ) : applications.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  No applicants yet
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {applications.map((app) => (
                  <ApplicantRow
                    key={app.id}
                    application={app}
                    onViewProfile={() =>
                      navigate(`/babysitters/${app.volunteer_detail.id}`)
                    }
                    onAccept={() => handleAccept(app)}
                    onReject={() => handleReject(app)}
                    isProcessing={isProcessing === app.id}
                  />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

                {taskToReview && (
          <ReviewDialog
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            taskId={String(taskToReview.id)}
            taskTitle={taskToReview.title}
            volunteerName={reviewInfo?.volunteer_name || undefined}
            existingReview={
              reviewInfo && !reviewInfo.can_review && reviewInfo.review_id
                ? {
                    id: reviewInfo.review_id,
                    rating: 0,
                    comment: "",
                    is_editable: reviewInfo.is_editable || false,
                  }
                : null
            }
            onSuccess={handleReviewSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  subtext: string;
  subtextColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

function StatCard({
  label,
  value,
  subtext,
  subtextColor,
  icon: Icon,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <Card className="rounded-xl border-0 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 text-left truncate">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-left">{value}</p>
            <p
              className={cn(
                "text-xs mt-1 text-left truncate",
                subtextColor || "text-muted-foreground",
              )}
            >
              {subtext}
            </p>
          </div>
          <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0", iconBg)}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TaskCardProps {
  task: Task;
  existingReview?: Review | null;
  onViewApplicants: () => void;
  onReview: () => void;
  onViewTask: () => void;
}

function TaskCard({
  task,
  existingReview,
  onViewApplicants,
  onReview,
  onViewTask,
}: TaskCardProps) {
  const taskStart = parseISO(task.start);
  const formattedDate = format(taskStart, "EEEE's', h:mma");
  const postedAgo = formatDistanceToNow(parseISO(task.created_at), {
    addSuffix: true,
  });
  const pendingCount = task.pending_applications_count || 0;
  const totalCount = task.applications_count || 0;
  const isCompleted = task.status === "completed";
  const canReview = isCompleted && task.volunteer && !existingReview;

  const getStatusBadge = () => {
    switch (task.status) {
      case "unclaimed":
        return (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
            OPEN
          </Badge>
        );
      case "claimed":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            CONFIRMED
          </Badge>
        );
      case "completed":
        return <Badge variant="secondary">COMPLETED</Badge>;
      default:
        return <Badge variant="outline">{task.status}</Badge>;
    }
  };

  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-semibold text-base sm:text-lg cursor-pointer hover:text-primary"
              onClick={onViewTask}
            >
              {task.title}
            </h3>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Posted {postedAgo}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-3">
          {task.category && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {task.category.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {formattedDate}
          </span>
          {task.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate max-w-[150px] sm:max-w-none">{task.location}</span>
            </span>
          )}
        </div>

                {task.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4 text-left">
            {task.description}
          </p>
        )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
          <div className="flex items-center gap-3">
                        {totalCount > 0 && (
              <div className="flex -space-x-2">
                {[...Array(Math.min(3, totalCount))].map((_, i) => (
                  <Avatar
                    key={i}
                    className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-background"
                  >
                    <AvatarFallback className="text-xs bg-muted">
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {totalCount > 3 && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium">
                      +{totalCount - 3}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div>
              <span className="font-medium text-xs sm:text-sm">
                {totalCount} Applicants
              </span>
              {pendingCount > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  <span className="text-primary font-medium">
                    {pendingCount} NEW
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReview}
                className="gap-1 text-xs sm:text-sm"
              >
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Leave</span> Review
              </Button>
            )}
            {existingReview && (
              <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3.5 w-3.5 sm:h-4 sm:w-4",
                      star <= existingReview.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
            )}
            <Button
              onClick={onViewApplicants}
              className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
              size="sm"
            >
              View Applicants
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ApplicantRowProps {
  application: TaskApplication;
  onViewProfile: () => void;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

function ApplicantRow({
  application,
  onViewProfile,
  onAccept,
  onReject,
  isProcessing,
}: ApplicantRowProps) {
  const volunteer = application.volunteer_detail;
  const profile = volunteer.profile;
  const initials =
    volunteer.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";
  const isVerified = profile?.background_check;
  const isPending = application.status === "pending";
  const rating = profile?.average_rating ? Number(profile.average_rating) : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 rounded-xl border bg-background",
        isPending && "border-primary/20 bg-primary/5 dark:bg-primary/10",
      )}
    >
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 shrink-0">
          {volunteer.profile_image ? (
            <AvatarImage src={volunteer.profile_image} />
          ) : (
            <AvatarFallback className="bg-muted">{initials}</AvatarFallback>
          )}
        </Avatar>

                <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold">{volunteer.name || "Unknown"}</span>
            {isVerified && <Shield className="h-4 w-4 text-primary" />}
            {rating > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {profile?.experience_years && (
              <span>{profile.experience_years} yrs experience</span>
            )}
            {profile?.hourly_rate && <span>€{profile.hourly_rate}/hr</span>}
            {volunteer.city && <span>{volunteer.city}</span>}
          </div>
        </div>

                {!isPending && (
          <Badge
            variant={
              application.status === "accepted" ? "default" : "secondary"
            }
            className={cn(
              "shrink-0",
              application.status === "accepted" && "bg-primary",
            )}
          >
            {application.status === "accepted"
              ? "Accepted"
              : application.status}
          </Badge>
        )}
      </div>

            <div className="flex items-center gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onViewProfile}>
          View Profile
        </Button>

        {isPending && (
          <>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onReject}
              disabled={isProcessing}
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={onAccept}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
