import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Clock3,
  Mail,
  User,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Star,
  Users,
  Timer,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import {
  getMyApplications,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
  cancelApplication,
} from "@/api/tasks";
import type { TaskApplication, TaskInvitation } from "@/types/task";
import { cn } from "@/lib/utils";

type ApplicationStatusFilter =
  | "all"
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";
type InvitationStatusFilter =
  | "all"
  | "pending"
  | "accepted"
  | "declined"
  | "expired";
type SortOrder = "newest" | "oldest";

export default function MyApplicationsInvites() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("applications");

    const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

    const [invitations, setInvitations] = useState<TaskInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

    const [processingId, setProcessingId] = useState<string | null>(null);

    const [applicationStatusFilter, setApplicationStatusFilter] =
    useState<ApplicationStatusFilter>("all");
  const [invitationStatusFilter, setInvitationStatusFilter] =
    useState<InvitationStatusFilter>("all");
  const [applicationSortOrder, setApplicationSortOrder] =
    useState<SortOrder>("newest");
  const [invitationSortOrder, setInvitationSortOrder] =
    useState<SortOrder>("newest");

  useEffect(() => {
    fetchApplications();
    fetchInvitations();
  }, []);

  async function fetchApplications() {
    try {
      setLoadingApplications(true);
      const data = await getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      toast.error("Failed to load your applications");
    } finally {
      setLoadingApplications(false);
    }
  }

  async function fetchInvitations() {
    try {
      setLoadingInvitations(true);
      const data = await getMyInvitations();
      setInvitations(data);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
      toast.error("Failed to load your invitations");
    } finally {
      setLoadingInvitations(false);
    }
  }

  async function handleAcceptInvitation(invitationId: string) {
    setProcessingId(invitationId);
    try {
      await acceptInvitation(invitationId);
      toast.success("Invitation accepted!");
            setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId
            ? { ...inv, status: "accepted" as const }
            : inv,
        ),
      );
    } catch (err) {
      console.error("Failed to accept invitation:", err);
      toast.error("Failed to accept invitation");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeclineInvitation(invitationId: string) {
    setProcessingId(invitationId);
    try {
      await declineInvitation(invitationId);
      toast.success("Invitation declined");
            setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId
            ? { ...inv, status: "declined" as const }
            : inv,
        ),
      );
    } catch (err) {
      console.error("Failed to decline invitation:", err);
      toast.error("Failed to decline invitation");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleCancelApplication(
    applicationId: string,
    taskId: string,
  ) {
    setProcessingId(applicationId);
    try {
      await cancelApplication(taskId);
      toast.success("Application cancelled");
            setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: "cancelled" as const }
            : app,
        ),
      );
    } catch (err) {
      console.error("Failed to cancel application:", err);
      toast.error("Failed to cancel application");
    } finally {
      setProcessingId(null);
    }
  }

  const pendingApplicationsCount = applications.filter(
    (a) => a.status === "pending",
  ).length;
  const pendingInvitationsCount = invitations.filter(
    (i) => i.status === "pending",
  ).length;

    const filteredApplications = useMemo(() => {
    let filtered = applications;

        if (applicationStatusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === applicationStatusFilter);
    }

        return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return applicationSortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [applications, applicationStatusFilter, applicationSortOrder]);

    const filteredInvitations = useMemo(() => {
    let filtered = invitations;

        if (invitationStatusFilter !== "all") {
      filtered = filtered.filter((i) => i.status === invitationStatusFilter);
    }

        return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return invitationSortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [invitations, invitationStatusFilter, invitationSortOrder]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
                <div className="text-left">
          <h1 className="text-3xl font-bold">Applications & Invites</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your task applications and invitations from parents
          </p>
        </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="applications" className="gap-2">
              Applications
              {pendingApplicationsCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {pendingApplicationsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              Invitations
              {pendingInvitationsCount > 0 && (
                <Badge className="ml-1 h-5 px-1.5 bg-primary">
                  {pendingInvitationsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

                    <TabsContent value="applications" className="mt-6 space-y-4">
                        {applications.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={applicationStatusFilter}
                    onValueChange={(v) =>
                      setApplicationStatusFilter(v as ApplicationStatusFilter)
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={applicationSortOrder}
                    onValueChange={(v) =>
                      setApplicationSortOrder(v as SortOrder)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground self-center">
                  {filteredApplications.length} of {applications.length}
                </p>
              </div>
            )}

            {loadingApplications ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : applications.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="font-semibold text-lg">
                      No applications yet
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      You haven't applied to any tasks yet. Browse available
                      tasks to find opportunities.
                    </p>
                    <Button className="mt-4" onClick={() => navigate("/tasks")}>
                      Browse Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : filteredApplications.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Filter className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <h3 className="font-semibold">No matching applications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setApplicationStatusFilter("all")}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    isProcessing={processingId === application.id}
                    onCancel={() =>
                      handleCancelApplication(
                        application.id,
                        application.task.id,
                      )
                    }
                    onViewTask={() => navigate(`/tasks/${application.task.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="mt-6 space-y-6">
            {loadingInvitations ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : invitations.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Mail className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="font-semibold text-lg">
                      No invitations yet
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Parents haven't invited you to any tasks yet. Keep your
                      profile updated to attract more invitations.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/profile")}
                    >
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Task Invitations</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage and respond to parents who have personally selected
                      you for their needs.
                    </p>
                  </div>
                  <span className="text-sm text-emerald-600 font-medium">
                    {invitations.length} Total Invites
                  </span>
                </div>

                                {pendingInvitationsCount > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                      <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                        You're in demand!
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        You have{" "}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {pendingInvitationsCount} personal invitation
                          {pendingInvitationsCount !== 1 ? "s" : ""}
                        </span>{" "}
                        from parents who specifically requested to work with
                        you.
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Total
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {String(invitations.length).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-orange-500 uppercase tracking-wide">
                      Pending
                    </p>
                    <p className="text-2xl font-bold mt-1 text-orange-500">
                      {String(
                        invitations.filter((i) => i.status === "pending")
                          .length,
                      ).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-emerald-500 uppercase tracking-wide">
                      Accepted
                    </p>
                    <p className="text-2xl font-bold mt-1 text-emerald-500">
                      {String(
                        invitations.filter((i) => i.status === "accepted")
                          .length,
                      ).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Declined
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {String(
                        invitations.filter((i) => i.status === "declined")
                          .length,
                      ).padStart(2, "0")}
                    </p>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={invitationStatusFilter}
                      onValueChange={(v) =>
                        setInvitationStatusFilter(v as InvitationStatusFilter)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={invitationSortOrder}
                      onValueChange={(v) =>
                        setInvitationSortOrder(v as SortOrder)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground self-center">
                    {filteredInvitations.length} of {invitations.length}
                  </p>
                </div>

                {/* Invitation Cards */}
                {filteredInvitations.length === 0 ? (
                  <Card className="rounded-xl">
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Filter className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <h3 className="font-semibold">
                          No matching invitations
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your filters
                        </p>
                        <Button
                          variant="link"
                          onClick={() => setInvitationStatusFilter("all")}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredInvitations.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        isProcessing={processingId === invitation.id}
                        onAccept={() => handleAcceptInvitation(invitation.id)}
                        onDecline={() => handleDeclineInvitation(invitation.id)}
                        onViewTask={() =>
                          navigate(`/tasks/${invitation.task.id}`)
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function ApplicationCard({
  application,
  isProcessing,
  onCancel,
  onViewTask,
}: {
  application: TaskApplication;
  isProcessing: boolean;
  onCancel: () => void;
  onViewTask: () => void;
}) {
  const task = application.task;

  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock3,
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    accepted: {
      label: "Accepted",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 border-green-200",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-100 text-red-700 border-red-200",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
  };

  const status = statusConfig[application.status];
  const StatusIcon = status.icon;

  return (
    <Card
      className="rounded-xl hover:shadow-md transition-shadow cursor-pointer"
      onClick={onViewTask}
    >
      <CardContent className="p-5">
        {/* Header: Title + Status/Cancel */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg line-clamp-1 text-left">
              {task.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Applied{" "}
              {formatDistanceToNow(parseISO(application.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge
              variant="outline"
              className={cn("shrink-0", status.className)}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
            {application.status === "pending" && (
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(parseISO(task.start), "MMM d, yyyy, h:mm a")}</span>
        </div>

        {/* Category */}
        {task.category && (
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="secondary">{task.category.name}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvitationCard({
  invitation,
  isProcessing,
  onAccept,
  onDecline,
  onViewTask,
}: {
  invitation: TaskInvitation;
  isProcessing: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onViewTask: () => void;
}) {
  const task = invitation.task;
  const parent = invitation.parent_detail;

  // If task is missing, don't render the card
  if (!task) {
    return null;
  }

  const parentName = parent?.name || "A parent";
  const parentInitials =
    parentName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "P";

    const taskStart = parseISO(task.start);
  const now = new Date();
  const hoursUntilStart = Math.max(
    0,
    Math.floor((taskStart.getTime() - now.getTime()) / (1000 * 60 * 60)),
  );

    const startTime = format(taskStart, "h:mm a");
  const endTime = task.end ? format(parseISO(task.end), "h:mm a") : null;
  const timeRange = endTime ? `${startTime} - ${endTime}` : startTime;

    const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label:
        hoursUntilStart > 0
          ? `Expires in ${hoursUntilStart}h`
          : "Expiring soon",
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    accepted: {
      label: "Accepted",
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    declined: {
      label: "Declined",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
    expired: {
      label: "Expired",
      className: "bg-gray-100 text-gray-500 border-gray-200",
    },
  };

  const status = statusConfig[invitation.status] || statusConfig.pending;

  return (
    <Card
      className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onViewTask}
    >
      <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {parent?.profile_image ? (
                <AvatarImage src={parent.profile_image} alt={parentName} />
              ) : (
                <AvatarFallback className="bg-muted text-sm">
                  {parentInitials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold">{parentName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>4.9</span>
                </div>
                <span>•</span>
                <span>Reviews</span>
                <span>•</span>
                <div className="flex items-center gap-0.5 text-emerald-600">
                  <BadgeCheck className="h-3 w-3" />
                  <span>Verified Parent</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="outline"
              className={cn("shrink-0", status.className)}
            >
              {invitation.status === "pending" && (
                <Timer className="h-3 w-3 mr-1" />
              )}
              {status.label}
            </Badge>
          </div>
        </div>

                {invitation.message && (
          <div className="mt-4 pl-4 border-l-2 border-emerald-200">
            <p className="text-sm text-muted-foreground italic">
              "{invitation.message}"
            </p>
          </div>
        )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(taskStart, "EEEE, MMM d")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{timeRange}</span>
          </div>
          {task.formatted_address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[150px]">
                {task.formatted_address}
              </span>
            </div>
          )}
          {task.category && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{task.category.name}</span>
            </div>
          )}
        </div>

                <div
          className="flex items-center gap-3 mt-5"
          onClick={(e) => e.stopPropagation()}
        >
          {invitation.status === "pending" ? (
            <>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={onAccept}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Accept Invitation"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onDecline}
                disabled={isProcessing}
              >
                Decline
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onViewTask}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Task
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
