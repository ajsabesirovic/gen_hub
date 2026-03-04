import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { differenceInMinutes, format } from "date-fns";
import type { CalendarEvent } from "@/components/full-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { applyForTask, updateTask, deleteTask, getCategories } from "@/api/tasks";
import type { Category } from "@/types/task";
import type { ParentProfile } from "@/types/user";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { localToUtcISOString } from "@/lib/dateUtils";

interface TaskDetailsProps {
  event: CalendarEvent | null;
  setEvent: (e: CalendarEvent | null) => void;
}

function calculateDuration(duration: number): string {
  const totalMinutes = duration;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
}

export function TaskDetails({ event, setEvent }: TaskDetailsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const parentProfile =
    user?.role === "parent" ? (user.profile as ParentProfile | null) : null;
  const profileCity = user?.city || parentProfile?.city;
  const profileCountry = user?.country || parentProfile?.country;

    const canEdit =
    user?.role === "parent" &&
    event?.userId === user?.username &&
    event?.status === "unclaimed";

  useEffect(() => {
    async function fetchCats() {
      if (!canEdit) return;
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCats();
  }, [canEdit]);

  useEffect(() => {
    if (isEditDialogOpen && event) {
      const startDate = event.start;
      const localStart = format(startDate, "yyyy-MM-dd'T'HH:mm");

            const durationMinutes = event.end
        ? differenceInMinutes(event.end, event.start)
        : undefined;

            const categoryId =
        categories.find((c) => c.name === event.category)?.id || "";

      setEditForm({
        title: event.title,
        description: event.description || "",
        category_id: categoryId ? String(categoryId) : "",
        location: event.location || "",
        formatted_address: null,
        latitude: null,
        longitude: null,
        start: localStart,
        duration: durationMinutes,
      });
    }
  }, [isEditDialogOpen, event, categories]);

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
    if (!event) return;

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

      await updateTask(event.id, updateData);
      setIsEditDialogOpen(false);
      toast.success("Task updated successfully!");
      setEvent(null);
            window.location.reload();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    try {
      setIsDeleting(true);
      await deleteTask(event.id);
      toast.success("Task deleted successfully!");
      setIsDeleteDialogOpen(false);
      setEvent(null);
            window.location.reload();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to delete task");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!event) return null;

  const formattedCategory = event.category
    ?.replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const handleApply = async () => {
    try {
      await applyForTask(event.id);
      toast.success("Application submitted successfully!", {
        description: "The parent will review your application.",
      });
      setEvent(null);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to apply for task");
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={() => setEvent(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              {canEdit && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit Task"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete Task"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground mt-2">
          <div>
            <p className="mt-1 text-muted-foreground line-clamp-3">
              {event.description ? (
                event.description
              ) : (
                <span className="italic text-muted-foreground">
                  No description
                </span>
              )}
            </p>
          </div>
          <div>
            <span className="font-medium text-foreground">Category:</span>{" "}
            {formattedCategory ? (
              <Badge variant="outline" className="ml-1">
                {formattedCategory}
              </Badge>
            ) : (
              <span className="italic">Not defined</span>
            )}
          </div>

          <div>
            <span className="font-medium text-foreground">Location:</span>{" "}
            {event.location || "Not specified"}
          </div>
          <div>
            <span className="font-medium text-foreground">Start:</span>{" "}
            {format(event.start, "dd.MM.yyyy HH:mm")}
          </div>
          <div>
            <span className="font-medium text-foreground">
              Approximate Duration:
            </span>{" "}
            {event.end
              ? calculateDuration(differenceInMinutes(event.end, event.start))
              : "Not defined"}
          </div>
          {user?.role === "parent" && (
            <div>
              <span className="font-medium text-foreground">Status:</span>{" "}
              {event.status === "claimed" ? (
                <Badge className="bg-green-600">Claimed</Badge>
              ) : (
                <Badge variant="secondary">Open</Badge>
              )}
            </div>
          )}
          {user?.role === "babysitter" && (
            <div>
              <span className="font-medium text-foreground">Posted by:</span>{" "}
              {event.userId}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              navigate(`/tasks/${event.id}`);
              setEvent(null);
            }}
          >
            View Details
          </Button>
        </div>

                {canEdit && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
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
        )}

                {canEdit && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this task? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg bg-muted p-4 my-4">
                <h4 className="font-medium text-foreground">{event.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {event.location || "No location specified"}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
