import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  AlertCircle,
  Car,
  Shield,
  Heart,
  Languages,
  Star,
  CheckCircle,
  Clock,
  Loader2,
  Calendar,
  Send,
  CalendarDays,
} from "lucide-react";
import {
  getBabysitterById,
  getReviewsForBabysitter,
  type Review,
} from "@/api/user";
import { getParentTasks, inviteBabysitterToTask } from "@/api/tasks";
import type { User, BabysitterProfile } from "@/types/user";
import type { Task } from "@/types/task";
import { cn, getProfileImageUrl } from "@/lib/utils";

const AGE_GROUPS = [
  { value: "baby", label: "Infants (0-1 yr)" },
  { value: "toddler", label: "Toddlers (1-3 yrs)" },
  { value: "preschool", label: "Preschool (3-5 yrs)" },
  { value: "school-age", label: "Gradeschool (6-12 yrs)" },
  { value: "teen", label: "Teen (12+)" },
] as const;

export default function BabysitterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [babysitter, setBabysitter] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [parentTasks, setParentTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    async function fetchBabysitter() {
      if (!id) {
        setError("No babysitter ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

                const babysitterData = await getBabysitterById(id);
        setBabysitter(babysitterData);

                try {
          const reviewsData = await getReviewsForBabysitter(id);
          setReviews(reviewsData);
        } catch (reviewErr) {
          console.error("Failed to fetch reviews:", reviewErr);
                    setReviews([]);
        }
      } catch (err) {
        console.error("Failed to fetch babysitter:", err);
        setError("Failed to load babysitter profile.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBabysitter();
  }, [id]);

    const handleOpenInviteDialog = async () => {
    setInviteDialogOpen(true);
    setLoadingTasks(true);
    setSelectedTaskId(null);
    setInviteMessage("");

    try {
            const tasks = await getParentTasks("open");
      setParentTasks(tasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      toast.error("Failed to load your tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

    const handleSendInvitation = async () => {
    if (!selectedTaskId || !id) return;

    setSendingInvite(true);
    try {
      await inviteBabysitterToTask(
        selectedTaskId,
        id,
        inviteMessage || undefined,
      );
      toast.success(`Invitation sent to ${babysitter?.name || "babysitter"}!`);
      setInviteDialogOpen(false);
      setSelectedTaskId(null);
      setInviteMessage("");
    } catch (err) {
      console.error("Failed to send invitation:", err);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

    if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/babysitters")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Browse
          </button>
          <Card className="rounded-xl">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

    if (error || !babysitter) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/babysitters")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Browse
          </button>
          <Card className="rounded-xl">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="mb-4 h-10 w-10 text-muted-foreground/50" />
                <h3 className="font-semibold">Babysitter Not Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {error || "The profile doesn't exist or has been removed."}
                </p>
                <Button
                  variant="link"
                  onClick={() => navigate("/babysitters")}
                  className="mt-2"
                >
                  Browse all babysitters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const profile = babysitter.profile as BabysitterProfile | undefined;
  const initials =
    babysitter.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    babysitter.email?.[0]?.toUpperCase() ||
    "U";

  const isVerified = profile?.background_check_status === "verified";
  const isFirstAidCertified =
    profile?.first_aid_certified === true ||
    profile?.first_aid_certified === "verified";
  const profileRating = profile?.average_rating ?? 0;
  const totalReviews = profile?.total_reviews ?? reviews.length;
  const hourlyRate = profile?.hourly_rate ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/babysitters")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Browse
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-6">
                        <Card className="rounded-xl shadow-sm border-0 bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="relative shrink-0">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                      <AvatarImage
                        src={getProfileImageUrl(
                          babysitter.profile_image,
                          babysitter.email,
                        )}
                        alt={babysitter.name || "Babysitter"}
                      />
                      <AvatarFallback className="text-3xl bg-muted">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-background" />
                  </div>

                                    <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold mb-1 text-left">
                          {babysitter.name}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-4 w-4",
                                  star <= Math.round(Number(profileRating))
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30",
                                )}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-foreground">
                            {Number(profileRating).toFixed(1)}
                          </span>
                          <span className="text-sm">
                            ({totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          ${hourlyRate}
                          <span className="text-base font-normal text-muted-foreground">
                            /hr
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Starting Rate
                        </p>
                      </div>
                    </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <QuickStat
                        label="EXPERIENCE"
                        value={
                          profile?.experience_years
                            ? `${profile.experience_years}+ Years`
                            : "N/A"
                        }
                      />
                      <QuickStat
                        label="EDUCATION"
                        value={profile?.education || "N/A"}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

                        <div className="text-left">
              <h2 className="text-lg font-semibold mb-3">
                About {babysitter.name?.split(" ")[0]}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile?.description || "No description provided."}
              </p>
            </div>

                        {profile?.experience_with_ages &&
              profile.experience_with_ages.length > 0 && (
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Experience with Ages
                    </h2>
                    <div className="flex items-stretch gap-1">
                      {AGE_GROUPS.map((ageGroup, index) => {
                        const hasExperience =
                          profile.experience_with_ages?.includes(
                            ageGroup.value,
                          ) ?? false;
                        const isFirst = index === 0;
                        const isLast = index === AGE_GROUPS.length - 1;
                        return (
                          <div
                            key={ageGroup.value}
                            className="flex-1 flex flex-col items-center gap-2"
                          >
                            <div
                              className={cn(
                                "w-full h-3 transition-colors",
                                isFirst && "rounded-l-full",
                                isLast && "rounded-r-full",
                                hasExperience ? "bg-primary" : "bg-muted",
                              )}
                            />
                            <span
                              className={cn(
                                "text-xs text-center leading-tight",
                                hasExperience
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground",
                              )}
                            >
                              {ageGroup.label.split(" ")[0]}
                              <br />
                              <span className="text-[10px]">
                                {ageGroup.label.match(/\(([^)]+)\)/)?.[1]}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

                        {profile?.characteristics && profile.characteristics.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Characteristics
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.characteristics.map((char) => (
                      <Badge
                        key={char}
                        variant="outline"
                        className="px-4 py-2 text-sm font-medium rounded-full"
                      >
                        {char}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

                        <div className="text-left">
              <h2 className="text-lg font-semibold mb-4">
                Trust & Certifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CertificationItem
                  icon={Shield}
                  title="Background Checked"
                  subtitle={
                    isVerified ? "Verified on Sep 2023" : "Not verified"
                  }
                  verified={isVerified}
                />
                <CertificationItem
                  icon={Heart}
                  title="First Aid & CPR"
                  subtitle={
                    isFirstAidCertified
                      ? "Red Cross Certified"
                      : "Not certified"
                  }
                  verified={isFirstAidCertified}
                />
                <CertificationItem
                  icon={Car}
                  title="Driver's License"
                  subtitle={
                    profile?.drivers_license ? "Has own car" : "No license"
                  }
                  verified={profile?.drivers_license}
                />
                <CertificationItem
                  icon={Languages}
                  title={profile?.languages?.join(" & ") || "English"}
                  subtitle={
                    profile?.languages && profile.languages.length > 1
                      ? "Bilingual proficiency"
                      : "Fluent"
                  }
                  verified={true}
                />
              </div>
            </div>

                        <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Reviews ({totalReviews})
                  </h2>
                  {reviews.length > 3 && (
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                    >
                      {showAllReviews ? "Show less" : "See all reviews"}
                    </Button>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="py-8 text-center">
                    <Star className="mx-auto h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No reviews yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map(
                      (review) => (
                        <ReviewCard key={review.id} review={review} />
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

                    <div className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-6 space-y-4">
                            <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      Starting at
                    </span>
                    <div className="text-2xl font-bold">
                      ${hourlyRate}
                      <span className="text-sm font-normal text-muted-foreground">
                        /hr
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full mb-3 h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                    onClick={handleOpenInviteDialog}
                  >
                    Book a Task
                  </Button>
                </CardContent>
              </Card>

                            <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DetailRow
                    label="Has Children"
                    value={profile?.has_children ? "Yes" : "No"}
                  />
                  <DetailRow
                    label="Smoker"
                    value={profile?.smoker ? "Yes" : "No"}
                  />
                  <DetailRow
                    label="Living Situation"
                    value="Private Residence"
                  />
                  <DetailRow
                    label="Location"
                    value={`${babysitter.city || "Unknown"}${babysitter.country ? `, ${babysitter.country}` : ""}`}
                  />
                </CardContent>
              </Card>

                          </div>
          </div>
        </div>
      </div>

            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Invite {babysitter.name?.split(" ")[0]} to a Task
            </DialogTitle>
            <DialogDescription>
              Select one of your open tasks to invite this babysitter to.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {loadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : parentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  You don't have any open tasks.
                </p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => {
                    setInviteDialogOpen(false);
                    navigate("/dashboard/parent");
                  }}
                >
                  Create a new task
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select a Task</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {parentTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedTaskId === task.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                        )}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <div
                          className={cn(
                            "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                            selectedTaskId === task.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {selectedTaskId === task.id && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(parseISO(task.start), "MMM d, yyyy")}
                            </span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(parseISO(task.start), "h:mm a")}
                            </span>
                          </div>
                          {task.category && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {task.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="invite-message"
                    className="text-sm font-medium"
                  >
                    Message (optional)
                  </Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Add a personal message to your invitation..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    disabled={!selectedTaskId || sendingInvite}
                    onClick={handleSendInvitation}
                  >
                    {sendingInvite ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="font-semibold text-sm truncate">{value}</p>
    </div>
  );
}

function CertificationItem({
  icon: Icon,
  title,
  subtitle,
  verified,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  verified?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full",
          verified
            ? "bg-emerald-100 text-emerald-600"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {verified && (
        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const parentName = review.parent_name || "Anonymous";
  const initials = parentName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="border-b last:border-0 pb-4 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={getProfileImageUrl(review.parent_profile_image)}
              alt={parentName}
            />
            <AvatarFallback className="text-xs bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{parentName}</p>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(review.created_at), "MMMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed italic text-left">
        "{review.comment}"
      </p>
    </div>
  );
}
