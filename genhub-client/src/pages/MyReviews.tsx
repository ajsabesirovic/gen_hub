import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { getMyReviews, type Review } from "@/api/user";

const REVIEWS_PER_PAGE = 5;

export default function MyReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

    useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMyReviews();
                const sorted = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setReviews(sorted);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError("Failed to load reviews. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const rating = Math.round(r.rating);
      if (counts[rating] !== undefined) counts[rating] += 1;
    });
    return counts;
  }, [reviews]);

  const totalReviews = reviews.length;

  const ratingDistribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((stars) => {
        const count = ratingCounts[stars] || 0;
        const percentage = totalReviews
          ? Math.round((count / totalReviews) * 100)
          : 0;
        return { stars, count, percentage };
      }),
    [ratingCounts, totalReviews],
  );

  const averageRounded = Math.round(averageRating || 0);

    const fiveStarCount = ratingCounts[5] || 0;
  const fiveStarPercentage = totalReviews
    ? Math.round((fiveStarCount / totalReviews) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
                <div className="text-left mb-10">
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground">
            See how parents have rated your babysitting services.
          </p>
        </div>

                {isLoading && (
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <h3 className="text-lg font-semibold">Loading reviews...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we fetch your reviews.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

                {!isLoading && error && (
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <Star className="mb-4 h-12 w-12 text-destructive" />
                <h3 className="text-lg font-semibold">Error loading reviews</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

                {!isLoading && !error && totalReviews === 0 && (
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <Star className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No reviews yet</h3>
                <p className="text-sm text-muted-foreground">
                  Complete babysitting tasks to receive reviews from parents.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

                {!isLoading && !error && totalReviews > 0 && (
          <div className="flex flex-col gap-6 lg:flex-row">
                        <aside className="w-full shrink-0 lg:w-96">
              <div className="space-y-6">
                                <Card>
                  <CardHeader className="text-left">
                    <CardTitle>Rating Summary</CardTitle>
                    <CardDescription>Overview of your reviews</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                                        <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={
                                index < averageRounded
                                  ? "h-5 w-5 fill-yellow-400 text-yellow-400"
                                  : "h-5 w-5 text-muted-foreground/30"
                              }
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Based on {totalReviews} review
                          {totalReviews === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>

                                        <div className="space-y-4">
                      {ratingDistribution.map(
                        ({ stars, count, percentage }) => (
                          <div key={stars} className="flex items-center gap-4">
                            <div className="flex w-12 items-center gap-2 text-sm">
                              <span>{stars}</span>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </div>
                            <Progress
                              value={percentage}
                              className="h-3 flex-1"
                            />
                            <div className="w-8 text-right text-xs text-muted-foreground">
                              {count}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                                <Card>
                  <CardHeader className="text-left">
                    <CardTitle className="text-base">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Total Reviews</span>
                      </div>
                      <span className="font-semibold">{totalReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">5-Star Reviews</span>
                      </div>
                      <span className="font-semibold">{fiveStarCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">5-Star Rate</span>
                      </div>
                      <span className="font-semibold">
                        {fiveStarPercentage}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>

                        <main className="flex-1 min-w-0 space-y-4">
              {reviews.slice(0, visibleCount).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {visibleCount < totalReviews && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setVisibleCount((prev) => prev + REVIEWS_PER_PAGE)}
                >
                  Load More ({totalReviews - visibleCount} remaining)
                </Button>
              )}
            </main>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const navigate = useNavigate();
  const parentName = review.parent_name || review.parent || "Unknown";
  const initials = parentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleViewTask = () => {
    if (review.task_uuid) {
      navigate(`/tasks/${review.task_uuid}`);
    }
  };

  return (
    <Card className="py-3">
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {review.parent_profile_image ? (
                <AvatarImage
                  src={review.parent_profile_image}
                  alt={parentName}
                />
              ) : null}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium">{parentName}</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(review.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={
                    index < review.rating
                      ? "h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      : "h-3.5 w-3.5 text-muted-foreground/30"
                  }
                />
              ))}
            </div>
          </div>
        </div>
        {review.task_title && (
          <p className="text-sm text-muted-foreground text-left">
            Task:{" "}
            <span className="font-medium text-foreground">
              {review.task_title}
            </span>
          </p>
        )}
        {review.comment && (
          <p className="text-lg text-muted-foreground text-left italic">
            "{review.comment}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}
