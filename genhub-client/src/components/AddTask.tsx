import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CalendarPlus, X, Loader2, Home, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addHours } from "date-fns";
import { useForm } from "react-hook-form";
import { localToUtcISOString } from "@/lib/dateUtils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormData } from "@/lib/zod.schema";
import { Textarea } from "@/components/ui/textarea";
import { createTask, getCategories } from "@/api/tasks";
import { toast } from "sonner";
import type { Category } from "@/types/task";
import type { ParentProfile } from "@/types/user";
import { PlacesAutocomplete, type PlaceResult } from "@/components/PlacesAutocomplete";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

function formatInitialDate() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

function formatEndDate() {
  return format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm");
}

interface AddTaskProps {
  onTaskAdded?: () => void;
}

export function AddTask({ onTaskAdded }: AddTaskProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [multiDateEnabled, setMultiDateEnabled] = useState(false);
  const [extraDates, setExtraDates] = useState<string[]>([]);
  const [newExtraDate, setNewExtraDate] = useState("");
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const [useBabysitterHome, setUseBabysitterHome] = useState(false);

    const parentProfile = user?.role === "parent" ? (user.profile as ParentProfile | null) : null;
  const profileCity = user?.city || parentProfile?.city;
  const profileCountry = user?.country || parentProfile?.country;
  const profileAddress = parentProfile?.formatted_address || parentProfile?.street;
  const hasProfileAddress = !!(parentProfile?.street && parentProfile?.formatted_address);
  const preferredLocation = parentProfile?.preferred_babysitting_location;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      location: "",
      formatted_address: null,
      latitude: null,
      longitude: null,
      start: formatInitialDate(),
      duration: undefined,
    },
  });

    const handleUseProfileAddress = (checked: boolean) => {
    setUseProfileAddress(checked);
    if (checked) {
      setUseBabysitterHome(false);
    }
    if (checked && parentProfile) {
      form.setValue("location", parentProfile.street || "");
      form.setValue("formatted_address", parentProfile.formatted_address || null);
            const lat = parentProfile.latitude != null
        ? typeof parentProfile.latitude === "string" ? parseFloat(parentProfile.latitude) : parentProfile.latitude
        : null;
      const lng = parentProfile.longitude != null
        ? typeof parentProfile.longitude === "string" ? parseFloat(parentProfile.longitude) : parentProfile.longitude
        : null;
      form.setValue("latitude", lat);
      form.setValue("longitude", lng);
    } else {
      form.setValue("location", "");
      form.setValue("formatted_address", null);
      form.setValue("latitude", null);
      form.setValue("longitude", null);
    }
  };

    const handleUseBabysitterHome = (checked: boolean) => {
    setUseBabysitterHome(checked);
    if (checked) {
      setUseProfileAddress(false);
      form.setValue("location", "babysitter_home");
      form.setValue("formatted_address", null);
      form.setValue("latitude", null);
      form.setValue("longitude", null);
    } else {
      form.setValue("location", "");
      form.setValue("formatted_address", null);
      form.setValue("latitude", null);
      form.setValue("longitude", null);
    }
  };

  const handlePlaceSelect = (place: PlaceResult) => {
    setUseProfileAddress(false);
    form.setValue("location", place.address);
    form.setValue("formatted_address", place.formattedAddress);
    form.setValue("latitude", place.latitude);
    form.setValue("longitude", place.longitude);
  };

  const addExtraDate = () => {
    if (newExtraDate && !extraDates.includes(newExtraDate)) {
      setExtraDates([...extraDates, newExtraDate]);
      setNewExtraDate("");
    }
  };

  const removeExtraDate = (dateToRemove: string) => {
    setExtraDates(extraDates.filter((d) => d !== dateToRemove));
  };

    useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
                setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  async function onSubmit(data: TaskFormData) {
    try {
      setIsSubmitting(true);

            const startUtc = localToUtcISOString(data.start);

            const taskData = {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        location: data.location || undefined,
        formatted_address: data.formatted_address || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
        duration: data.duration || undefined,
      };

            if (multiDateEnabled && extraDates.length > 0) {
                await createTask({
          ...taskData,
          start: startUtc,
        });

                for (const extraDate of extraDates) {
          const extraStartUtc = localToUtcISOString(extraDate);
          await createTask({
            ...taskData,
            start: extraStartUtc,
          });
        }

        toast.success(`${extraDates.length + 1} tasks created successfully!`);
      } else {
        await createTask({
          ...taskData,
          start: startUtc,
        });

        toast.success("Task created successfully!");
      }

      setOpen(false);
      form.reset({
        title: "",
        description: "",
        category_id: "",
        location: "",
        formatted_address: null,
        latitude: null,
        longitude: null,
        start: formatInitialDate(),
        duration: undefined,
      });
      setMultiDateEnabled(false);
      setExtraDates([]);
      setUseProfileAddress(false);
      setUseBabysitterHome(false);

      onTaskAdded?.();
    } catch (err: unknown) {
      console.error("Failed to create task:", err);
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      toast.error(detail || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 pb-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detailed task description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(categories) &&
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormDescription>
                    Where the babysitting will take place
                  </FormDescription>

                                    <div className="space-y-2 py-2">
                                        <div className="flex items-center space-x-3">
                      <Checkbox
                        id="use-babysitter-home"
                        checked={useBabysitterHome}
                        onCheckedChange={(val) => handleUseBabysitterHome(Boolean(val))}
                      />
                      <label
                        htmlFor="use-babysitter-home"
                        className="cursor-pointer text-sm font-medium leading-none flex items-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Babysitter's home
                      </label>
                    </div>

                    {/* Use profile address option */}
                    {hasProfileAddress && (
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="use-profile-address"
                          checked={useProfileAddress}
                          onCheckedChange={(val) => handleUseProfileAddress(Boolean(val))}
                        />
                        <label
                          htmlFor="use-profile-address"
                          className="cursor-pointer text-sm font-medium leading-none flex items-center gap-2"
                        >
                          <Home className="h-4 w-4" />
                          Use my home address
                        </label>
                      </div>
                    )}
                  </div>

                  <FormControl>
                    <PlacesAutocomplete
                      value={useBabysitterHome ? "Babysitter's Home" : (field.value || "")}
                      onChange={(value) => {
                        field.onChange(value);
                        if (useProfileAddress && value !== parentProfile?.street) {
                          setUseProfileAddress(false);
                        }
                        if (useBabysitterHome && value !== "Babysitter's Home") {
                          setUseBabysitterHome(false);
                        }
                      }}
                      onPlaceSelect={handlePlaceSelect}
                      placeholder="Start typing an address..."
                      disabled={useProfileAddress || useBabysitterHome}
                      cityBias={profileCity || undefined}
                      countryBias={profileCountry || undefined}
                      hint={profileCity ? `Showing addresses near ${profileCity}` : undefined}
                      showOutsideCityWarning={true}
                    />
                  </FormControl>

                  {/* Location preference hint */}
                  {!field.value && preferredLocation && (
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {preferredLocation === "parents_home" && hasProfileAddress && (
                          <>Your profile indicates babysitting at your home. Check "Use my home address" above or enter a custom location.</>
                        )}
                        {preferredLocation === "parents_home" && !hasProfileAddress && (
                          <>Your profile indicates babysitting at your home, but you haven't set your address yet. <a href="/profile" className="underline">Update your profile</a> to use this feature.</>
                        )}
                        {preferredLocation === "babysitters_home" && (
                          <>Your profile indicates babysitting at the babysitter's home. The babysitter will share their location after accepting.</>
                        )}
                        {preferredLocation === "flexible" && (
                          <>Your profile indicates flexible location. You can leave this empty and arrange with the babysitter later.</>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approximate Duration (in minutes)</FormLabel>
                  <FormDescription>
                    Optional - leave empty if unknown
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 60 (optional)"
                      min={1}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multi-date section */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="multi-date"
                  checked={multiDateEnabled}
                  onCheckedChange={(val) => {
                    setMultiDateEnabled(Boolean(val));
                    if (!val) {
                      setExtraDates([]);
                    }
                  }}
                />
                <label
                  htmlFor="multi-date"
                  className="cursor-pointer text-sm font-medium leading-none flex items-center gap-2"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Add the same task to multiple dates
                </label>
              </div>

              {multiDateEnabled && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    The task will be created for the main date above plus all
                    dates added below. Duration settings will be applied to all.
                  </p>

                  <div className="flex gap-2">
                    <Input
                      type="datetime-local"
                      value={newExtraDate}
                      onChange={(e) => setNewExtraDate(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExtraDate}
                      disabled={!newExtraDate}
                    >
                      Add
                    </Button>
                  </div>

                  {extraDates.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Additional dates ({extraDates.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {extraDates.map((date) => (
                          <div
                            key={date}
                            className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                          >
                            <span>
                              {format(new Date(date), "MMM d, yyyy HH:mm")}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExtraDate(date)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Task{multiDateEnabled && extraDates.length > 0 ? "s" : ""}...
                </>
              ) : (
                <>
                  Create Task
                  {multiDateEnabled && extraDates.length > 0
                    ? `s (${extraDates.length + 1})`
                    : ""}
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
