import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createReview, updateReview } from "@/api/user";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
  volunteerName?: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
    is_editable: boolean;
  } | null;
  onSuccess?: () => void;
}

export function ReviewDialog({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  volunteerName,
  existingReview,
  onSuccess,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!existingReview;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && existingReview) {
        await updateReview(existingReview.id, { rating, comment });
        toast.success("Review updated successfully!");
      } else {
        await createReview({
          task_id: taskId,
          rating,
          comment,
        });
        toast.success("Review submitted successfully!", {
          description: "Thank you for your feedback!",
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || `Failed to ${isEditing ? "update" : "submit"} review`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Your Review" : "Leave a Review"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update your review for "${taskTitle}"`
              : `Rate your experience with ${volunteerName || "the babysitter"} for "${taskTitle}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
                    <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {displayRating > 0 && (
                  <>
                    {displayRating === 1 && "Poor"}
                    {displayRating === 2 && "Fair"}
                    {displayRating === 3 && "Good"}
                    {displayRating === 4 && "Very Good"}
                    {displayRating === 5 && "Excellent"}
                  </>
                )}
              </span>
            </div>
          </div>

                    <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {isEditing && !existingReview?.is_editable && (
            <p className="text-sm text-destructive">
              This review can no longer be edited (24-hour window has passed).
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              rating === 0 ||
              (isEditing && !existingReview?.is_editable)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Submitting..."}
              </>
            ) : isEditing ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
