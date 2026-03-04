import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, addMinutes, formatDistanceToNow, isBefore } from "date-fns";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StickyBottomCTA } from "@/components/ui/sticky-bottom-cta";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  Pencil,
  Star,
  Heart,
  MessageCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import {
  getTaskById,
  applyForTask,
  updateTask,
  deleteTask,
  getCategories,
  getTaskApplications,
  acceptApplication,
  rejectApplication,
  getMyApplication,
  cancelApplication,
} from "@/api/tasks";
import type { Task, Category, TaskApplication } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LocationDisplay } from "@/components/GoogleMap";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlacesAutocomplete,
  type PlaceResult,
} from "@/components/PlacesAutocomplete";
import type { ParentProfile } from "@/types/user";
import { getUserByUsername } from "@/api/user";
import { localToUtcISOString } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import {
  Languages,
  Clock3,
  Baby,
  Cigarette,
  PawPrint,
  HeartHandshake,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Infant Care": "bg-teal-500 text-white",
  Tutoring: "bg-blue-500 text-white",
  "Creative Play": "bg-purple-500 text-white",
  Overnight: "bg-orange-500 text-white",
  "School Pick-up": "bg-green-500 text-white",
  Childcare: "bg-pink-500 text-white",
  default: "bg-primary text-primary-foreground",
};

function getCategoryColor(categoryName: string): string {
  return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS["default"];
}

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

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      if (user?.role === "parent") {
        navigate("/task-applications");
      } else {
        navigate("/tasks");
      }
    }
  };

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [myApplicationStatus, setMyApplicationStatus] = useState<string | null>(
    null,
  );
  const [isCancelling, setIsCancelling] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [processingAppId, setProcessingAppId] = useState<string | null>(null);
  const [taskParentProfile, setTaskParentProfile] =
    useState<ParentProfile | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category_id: "",
    location: "",
    formatted_address: null as string | null,
    latitude: null as number | null,
    longitude: null as number | null,
    start: "",
    duration: undefined as number | undefined,
  });

  useEffect(() => {
    async function fetchTask() {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await getTaskById(id);
        setTask(data);
      } catch (err) {
        console.error("Failed to fetch task:", err);
        setError("Failed to load task details.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTask();
  }, [id]);

  useEffect(() => {
    async function fetchCats() {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCats();
  }, []);

    useEffect(() => {
    async function fetchParentProfile() {
      if (!task?.user) return;
      try {
        const userData = await getUserByUsername(task.user);
        if (userData.role === "parent" && userData.profile) {
          setTaskParentProfile(userData.profile as ParentProfile);
        }
      } catch (err) {
                console.debug("Could not fetch parent profile:", err);
      }
    }
    fetchParentProfile();
  }, [task?.user]);

    useEffect(() => {
    async function fetchApplications() {
      if (
        !task ||
        !user ||
        user.role !== "parent" ||
        task.user !== user.username
      )
        return;
      try {
        setLoadingApplications(true);
        const data = await getTaskApplications(task.id);
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoadingApplications(false);
      }
    }
    fetchApplications();
  }, [task, user]);

    useEffect(() => {
    async function checkExistingApplication() {
      if (!task || !user || user.role !== "babysitter") return;
      try {
        const result = await getMyApplication(task.id);
                        if ("applied" in result && result.applied === false) {
          setHasApplied(false);
          setMyApplicationStatus(null);
        } else {
          setHasApplied(true);
                    setMyApplicationStatus(
            (result as TaskApplication).status || "pending",
          );
        }
      } catch (err) {
                console.debug("Could not check existing application:", err);
      }
    }
    checkExistingApplication();
  }, [task, user]);

  useEffect(() => {
    if (isEditDialogOpen && task) {
      const startDate = parseISO(task.start);
      const localStart = format(startDate, "yyyy-MM-dd'T'HH:mm");

      setEditForm({
        title: task.title,
        description: task.description || "",
        category_id: task.category ? String(task.category.id) : "",
        location: task.location || "",
        formatted_address: task.formatted_address || null,
        latitude: task.latitude || null,
        longitude: task.longitude || null,
        start: localStart,
        duration: task.duration || undefined,
      });
    }
  }, [isEditDialogOpen, task]);

  const handleApply = async () => {
    if (!task) return;

    try {
      setIsSubmitting(true);
      await applyForTask(task.id);
      setHasApplied(true);
      setMyApplicationStatus("pending");
      setIsApplyDialogOpen(false);
      toast.success("Application submitted!", {
        description: "The parent will review your application.",
      });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!task) return;

    try {
      setIsCancelling(true);
      await cancelApplication(task.id);
      setHasApplied(false);
      setMyApplicationStatus(null);
      toast.success("Application cancelled", {
        description: "You can apply again if you change your mind.",
      });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to cancel application");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEditPlaceSelect = (place: PlaceResult) => {
    setEditForm((prev) => ({
      ...prev,
      location: place.address,
      formatted_address: place.formattedAddress,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
  };

  const handleUpdate = async () => {
    if (!task) return;

    try {
      setIsUpdating(true);

      const startUtc = localToUtcISOString(editForm.start);

      const updateData = {
        title: editForm.title,
        description: editForm.description || undefined,
        category_id: editForm.category_id,
        location: editForm.location || undefined,
        formatted_address: editForm.formatted_address || undefined,
        latitude: editForm.latitude || undefined,
        longitude: editForm.longitude || undefined,
        start: startUtc,
        duration: editForm.duration || undefined,
      };

      const updatedTask = await updateTask(task.id, updateData);
      setTask(updatedTask);
      setIsEditDialogOpen(false);
      toast.success("Task updated successfully!");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    try {
      setIsDeleting(true);
      await deleteTask(task.id);
      toast.success("Task deleted successfully!");
            navigate(-1);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to delete task");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleAcceptApplication = async (application: TaskApplication) => {
    if (!task) return;
    try {
      setProcessingAppId(application.id);
      await acceptApplication(task.id, application.volunteer_detail.id);
      toast.success("Application accepted!", {
        description: `You have accepted ${application.volunteer_detail.name || "the babysitter"}'s application.`,
      });
            const [updatedApps, updatedTask] = await Promise.all([
        getTaskApplications(task.id),
        getTaskById(String(task.id)),
      ]);
      setApplications(updatedApps);
      setTask(updatedTask);
    } catch (err) {
      console.error("Failed to accept application:", err);
      toast.error("Failed to accept application");
    } finally {
      setProcessingAppId(null);
    }
  };

  const handleRejectApplication = async (application: TaskApplication) => {
    if (!task) return;
    try {
      setProcessingAppId(application.id);
      await rejectApplication(task.id, application.volunteer_detail.id);
      toast.success("Application rejected");
      const updatedApps = await getTaskApplications(task.id);
      setApplications(updatedApps);
    } catch (err) {
      console.error("Failed to reject application:", err);
      toast.error("Failed to reject application");
    } finally {
      setProcessingAppId(null);
    }
  };

  const parentProfile =
    user?.role === "parent" ? (user.profile as ParentProfile | null) : null;
  const profileCity = user?.city || parentProfile?.city;
  const profileCountry = user?.country || parentProfile?.country;

    if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to search
          </button>
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading task...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

    if (error || !task) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to search
          </button>
          <Card className="rounded-xl">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="mb-4 h-10 w-10 text-muted-foreground/50" />
                <h3 className="font-semibold">{error || "Task Not Found"}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The task you're looking for doesn't exist or has been removed.
                </p>
                <Button variant="link" onClick={handleBack} className="mt-2">
                  Browse all tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const taskStart = parseISO(task.start);
  const taskEnd = getTaskEndDate(task);
  const formattedDate = format(taskStart, "EEEE, MMMM d");
  const formattedStartTime = format(taskStart, "h:mm a");
  const formattedEndTime = taskEnd ? format(taskEnd, "h:mm a") : null;
  const postedAgo = formatDistanceToNow(parseISO(task.created_at), {
    addSuffix: true,
  });

  const getTimeDisplay = () => {
    if (task.end && formattedEndTime)
      return `${formattedStartTime} - ${formattedEndTime}`;
    if (task.duration) {
      const durationHours = task.duration / 60;
      return `${formattedStartTime} (~${durationHours.toFixed(1)}h)`;
    }
    return `From ${formattedStartTime}`;
  };

  const categoryName = task.category?.name || "General";
  const categoryColor = getCategoryColor(categoryName);

  const canApply =
    user?.role === "babysitter" && task.status === "unclaimed" && !hasApplied;

  const canEdit =
    user?.role === "parent" &&
    task.user === user?.username &&
    !task.volunteer &&
    (task.status === "unclaimed" || task.status === "open");

    const parentName = task.user || "Parent";
  const parentInitials = parentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-24 lg:pb-6">
                <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to search
        </button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <Badge className={cn("text-xs font-medium", categoryColor)}>
                {categoryName.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Posted {postedAgo}
              </span>
            </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-left">{task.title}</h1>

                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Date
                </p>
                <p className="text-sm sm:text-base font-medium">{formattedDate}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Time
                </p>
                <p className="text-sm sm:text-base font-medium">{getTimeDisplay()}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Location
                </p>
                <p className="text-sm sm:text-base font-medium truncate">
                  {task.location || "To be discussed"}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Est. Duration
                </p>
                <p className="text-sm sm:text-base font-medium">
                  {task.duration
                    ? `${(task.duration / 60).toFixed(1)} hours`
                    : "Flexible"}
                </p>
              </div>
            </div>

                        <div className="mb-8 text-left">
              <h2 className="text-lg font-semibold mb-3">About the Task</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>

                        {task.location && (task.latitude || task.formatted_address) && (
              <div className="rounded-xl overflow-hidden border mb-8">
                <LocationDisplay
                  location={task.location}
                  formattedAddress={task.formatted_address}
                  latitude={task.latitude}
                  longitude={task.longitude}
                />
              </div>
            )}

                        {taskParentProfile && (
              <div className="text-left">
                <h2 className="text-lg font-semibold mb-4">Preferences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {taskParentProfile.preferred_languages &&
                    taskParentProfile.preferred_languages.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                        <Languages className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Preferred Languages
                          </p>
                          <p className="font-medium">
                            {taskParentProfile.preferred_languages.join(", ")}
                          </p>
                        </div>
                      </div>
                    )}

                                    {taskParentProfile.preferred_experience_years != null && (
                    <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                      <Clock3 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Preferred Experience
                        </p>
                        <p className="font-medium">
                          {taskParentProfile.preferred_experience_years}+ years
                        </p>
                      </div>
                    </div>
                  )}

                                    {taskParentProfile.preferred_experience_with_ages &&
                    taskParentProfile.preferred_experience_with_ages.length >
                      0 && (
                      <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                        <Baby className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Experience With Ages
                          </p>
                          <p className="font-medium">
                            {taskParentProfile.preferred_experience_with_ages
                              .map((age) =>
                                age
                                  .split("-")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1),
                                  )
                                  .join(" "),
                              )
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    )}

                                    {taskParentProfile.smoking_allowed != null && (
                    <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                      <Cigarette className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Smoking
                        </p>
                        <p className="font-medium">
                          {taskParentProfile.smoking_allowed
                            ? "Allowed"
                            : "Not allowed"}
                        </p>
                      </div>
                    </div>
                  )}

                                    {taskParentProfile.pets_in_home != null && (
                    <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                      <PawPrint className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Pets
                        </p>
                        <p className="font-medium">
                          {taskParentProfile.pets_in_home
                            ? "Pets in home"
                            : "No pets"}
                        </p>
                      </div>
                    </div>
                  )}

                                    {taskParentProfile.has_special_needs && (
                    <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3 sm:col-span-2">
                      <HeartHandshake className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Special Needs
                        </p>
                        <p className="font-medium">
                          {taskParentProfile.special_needs_description ||
                            "Special care required"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

                    {user?.role === "babysitter" && (
            <div className="lg:w-80 shrink-0">
              <div className="sticky top-6">
                                <Card className="rounded-xl overflow-hidden bg-slate-900 dark:bg-slate-800 text-white">
                  <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12 border-2 border-white/20">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {parentInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{parentName}</p>
                      </div>
                    </div>

                                        {taskParentProfile?.description && (
                      <p className="text-sm text-slate-300 italic mb-6">
                        "{taskParentProfile.description}"
                      </p>
                    )}

                                        {canApply && (
                      <Dialog
                        open={isApplyDialogOpen}
                        onOpenChange={setIsApplyDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="w-full mb-3 bg-primary hover:bg-primary/90"
                            size="lg"
                          >
                            Apply for this Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Apply for this Task</DialogTitle>
                            <DialogDescription>
                              Confirm your application for this task.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="rounded-lg bg-muted p-4 my-4">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formattedDate} • {getTimeDisplay()}
                            </p>
                            {task.location && (
                              <p className="text-sm text-muted-foreground">
                                {task.location}
                              </p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsApplyDialogOpen(false)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleApply}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit Application"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {hasApplied && (
                      <div className="w-full mb-3 space-y-2">
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-medium text-white">
                          <CheckCircle className="h-4 w-4" />
                          {myApplicationStatus === "accepted"
                            ? "Application Accepted"
                            : myApplicationStatus === "rejected"
                              ? "Application Rejected"
                              : "Application Submitted"}
                        </div>
                        {myApplicationStatus === "pending" && !isBefore(parseISO(task.start), new Date()) && (
                          <Button
                            variant="outline"
                            className="w-full text-destructive border-destructive hover:bg-destructive/10"
                            onClick={handleCancelApplication}
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
                                Cancel Application
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

                    {user?.role === "parent" && task.user === user?.username && (
            <div className="lg:w-80 shrink-0">
              <div className="sticky top-6 space-y-4">
                                {canEdit && (
                  <div className="flex items-center justify-end gap-2">
                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9" title="Edit Task">
                          <Pencil className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">Title</Label>
                          <Input
                            id="edit-title"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Task title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Task description"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={editForm.category_id}
                            onValueChange={(value) =>
                              setEditForm((prev) => ({
                                ...prev,
                                category_id: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose Category" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <PlacesAutocomplete
                            value={editForm.location}
                            onChange={(value) =>
                              setEditForm((prev) => ({
                                ...prev,
                                location: value,
                              }))
                            }
                            onPlaceSelect={handleEditPlaceSelect}
                            placeholder="Start typing an address..."
                            cityBias={profileCity || undefined}
                            countryBias={profileCountry || undefined}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-start">Start</Label>
                          <Input
                            id="edit-start"
                            type="datetime-local"
                            value={editForm.start}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                start: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-duration">
                            Duration (minutes)
                          </Label>
                          <Input
                            id="edit-duration"
                            type="number"
                            min={1}
                            value={editForm.duration ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                duration: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }))
                            }
                            placeholder="e.g. 60"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isDeleteDialogOpen}
                      onOpenChange={setIsDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete Task"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Task</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this task? This action
                            cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg bg-muted p-4 my-4">
                          <h4 className="font-medium text-foreground">
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.location || "No location specified"}
                          </p>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Task
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                                <Card className="rounded-xl">
                  <CardContent className="p-4 text-left">
                    <h3 className="font-semibold mb-3 ">
                      Applicants ({applications.length})
                    </h3>
                    {loadingApplications ? (
                      <div className="py-4 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Loading...
                        </p>
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="py-4 text-center">
                        <p className="text-sm text-muted-foreground text-left">
                          No applicants yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {applications.map((app) => {
                          const volunteer = app.volunteer_detail;
                          const profile = volunteer.profile;
                          const initials =
                            volunteer.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "U";
                          const isPending = app.status === "pending";
                          const rating = profile?.average_rating
                            ? Number(profile.average_rating)
                            : 0;

                          return (
                            <div
                              key={app.id}
                              className={cn(
                                "p-3 rounded-lg border",
                                isPending && "border-primary/20 bg-primary/5",
                              )}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar className="h-10 w-10">
                                  {volunteer.profile_image ? (
                                    <AvatarImage
                                      src={volunteer.profile_image}
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-muted text-xs">
                                      {initials}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {volunteer.name || "Unknown"}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {rating > 0 && (
                                      <span className="flex items-center gap-0.5">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        {rating.toFixed(1)}
                                      </span>
                                    )}
                                    {profile?.hourly_rate && (
                                      <span>€{profile.hourly_rate}/hr</span>
                                    )}
                                  </div>
                                </div>
                                {!isPending && (
                                  <Badge
                                    variant={
                                      app.status === "accepted"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={cn(
                                      "text-xs",
                                      app.status === "accepted" && "bg-primary",
                                    )}
                                  >
                                    {app.status.charAt(0).toUpperCase() +
                                      app.status.slice(1)}
                                  </Badge>
                                )}
                              </div>
                              {isPending && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs"
                                    onClick={() =>
                                      navigate(`/babysitters/${volunteer.id}`)
                                    }
                                  >
                                    View Profile
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRejectApplication(app)}
                                    disabled={processingAppId === app.id}
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => handleAcceptApplication(app)}
                                    disabled={processingAppId === app.id}
                                  >
                                    {processingAppId === app.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Accept"
                                    )}
                                  </Button>
                                </div>
                              )}
                              {!isPending && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-8 text-xs"
                                  onClick={() =>
                                    navigate(`/babysitters/${volunteer.id}`)
                                  }
                                >
                                  View Profile
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

            {canApply && (
        <StickyBottomCTA>
          <Button
            className="w-full"
            size="lg"
            onClick={() => setIsApplyDialogOpen(true)}
          >
            Apply for this Task
          </Button>
        </StickyBottomCTA>
      )}

      {hasApplied && (
        <StickyBottomCTA>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              {myApplicationStatus === "accepted"
                ? "Application Accepted"
                : myApplicationStatus === "rejected"
                  ? "Application Rejected"
                  : "Application Submitted"}
            </div>
            {myApplicationStatus === "pending" && (
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive hover:bg-destructive/10"
                onClick={handleCancelApplication}
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
                    Cancel Application
                  </>
                )}
              </Button>
            )}
          </div>
        </StickyBottomCTA>
      )}
    </DashboardLayout>
  );
}
