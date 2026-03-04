import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  format,
  parseISO,
  isBefore,
  getDay,
  addMinutes,
  addHours,
  addDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isToday,
  isWeekend,
} from "date-fns";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  X,
  Briefcase,
  CalendarCheck,
  Send,
  Loader2,
  CheckCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAvailableTasks,
  getAvailabilityForCurrentUser,
  type AvailabilityData,
} from "@/api/user";
import {
  applyForTask,
  cancelApplication,
  getMyApplication,
  getCategories,
} from "@/api/tasks";
import type { TaskApplication, Category, TaskStatus } from "@/types/task";
import type { Task } from "@/types/task";
import { formatLocalDate, formatLocalTime } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

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

function getTaskEndDate(task: Task): Date {
  const startDate = parseISO(task.start);
  if (task.end) {
    return parseISO(task.end);
  }
  if (task.duration) {
    return addMinutes(startDate, task.duration);
  }
  return addHours(startDate, 1);
}

function isTaskWithinAvailability(
  task: Task,
  availability: AvailabilityData | null,
): boolean {
  if (!availability) return true;

  const taskStart = parseISO(task.start);
  const taskEnd = getTaskEndDate(task);
  const taskDate = format(taskStart, "yyyy-MM-dd");
  const taskDayOfWeek = DAY_NAMES[getDay(taskStart)];
  const taskStartTime = format(taskStart, "HH:mm");
  const taskEndTime = format(taskEnd, "HH:mm");

  const monthlyMatch = availability.monthlySchedule.find(
    (entry) => entry.date === taskDate,
  );

  if (monthlyMatch) {
    if (!monthlyMatch.from || !monthlyMatch.to) {
      return true;
    }
    return taskStartTime >= monthlyMatch.from && taskEndTime <= monthlyMatch.to;
  }

  const weeklyMatch = availability.weeklySchedule.find(
    (entry) => entry.day.toLowerCase() === taskDayOfWeek,
  );

  if (weeklyMatch) {
    if (!weeklyMatch.timeRanges || weeklyMatch.timeRanges.length === 0) {
      return true;
    }
    return weeklyMatch.timeRanges.some((range) => {
      if (!range.from || !range.to) return true;
      return taskStartTime >= range.from && taskEndTime <= range.to;
    });
  }

  return false;
}

const ITEMS_PER_PAGE = 12;

export default function Tasks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<"all" | "babysitter_home" | "parent_home">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [matchAvailability, setMatchAvailability] = useState(false);

    const [availableToday, setAvailableToday] = useState(false);
  const [thisWeekend, setThisWeekend] = useState(false);
  const [eveningShift, setEveningShift] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null,
  );

    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAvailableTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
    async function fetchAvailability() {
      if (matchAvailability && !availability) {
        try {
          const data = await getAvailabilityForCurrentUser();
          setAvailability(data);
        } catch (err) {
          console.error("Failed to fetch availability:", err);
        }
      }
    }
    fetchAvailability();
  }, [matchAvailability, availability]);

    const LOCATION_OPTIONS = [
    { value: "all", label: "All Locations" },
    { value: "babysitter_home", label: "Babysitter's Home" },
    { value: "parent_home", label: "Parent's Home" },
  ] as const;

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const filtered = tasks.filter((task) => {
            const taskStart = parseISO(task.start);
      if (isBefore(taskStart, now)) {
        return false;
      }

      const searchTerm = search.toLowerCase();
      if (searchTerm) {
        const matchesTitle = task.title.toLowerCase().includes(searchTerm);
        const matchesDescription = (task.description || "")
          .toLowerCase()
          .includes(searchTerm);
        const matchesLocation = (task.location || "")
          .toLowerCase()
          .includes(searchTerm);
        if (!matchesTitle && !matchesDescription && !matchesLocation) {
          return false;
        }
      }

            if (locationFilter !== "all") {
        if (locationFilter === "babysitter_home") {
                    if (task.location && task.location !== "babysitter_home") {
            return false;
          }
        } else if (locationFilter === "parent_home") {
                    if (!task.location || task.location === "babysitter_home") {
            return false;
          }
        }
      }

      if (
        categoryFilter !== "all" &&
        String(task.category?.id) !== categoryFilter
      ) {
        return false;
      }

      
      if (availableToday && !isToday(taskStart)) {
        return false;
      }

      if (thisWeekend && !isWeekend(taskStart)) {
        return false;
      }

      if (eveningShift) {
        const hour = taskStart.getHours();
        if (hour < 17) {
                    return false;
        }
      }

      if (matchAvailability) {
        if (!isTaskWithinAvailability(task, availability)) {
          return false;
        }
      }

      return true;
    });

        return filtered.sort((a, b) => {
      const aDate = parseISO(a.start);
      const bDate = parseISO(b.start);
      if (sortBy === "newest") {
        return bDate.getTime() - aDate.getTime();
      }
      return aDate.getTime() - bDate.getTime();
    });
  }, [
    search,
    locationFilter,
    categoryFilter,
    availableToday,
    thisWeekend,
    eveningShift,
    matchAvailability,
    sortBy,
    tasks,
    availability,
  ]);

    const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTasks, currentPage]);

    useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    locationFilter,
    categoryFilter,
    availableToday,
    thisWeekend,
    eveningShift,
    matchAvailability,
  ]);

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("all");
    setCategoryFilter("all");
    setAvailableToday(false);
    setThisWeekend(false);
    setEveningShift(false);
    setMatchAvailability(false);
  };

  const hasActiveFilters =
    search ||
    locationFilter !== "all" ||
    categoryFilter !== "all" ||
    availableToday ||
    thisWeekend ||
    eveningShift ||
    matchAvailability;

    const FilterContent = () => (
    <div className="space-y-6">
            <div>
        <h3 className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Date & Time
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={availableToday}
              onCheckedChange={(checked) => setAvailableToday(checked === true)}
            />
            <span className="text-sm">Available Today</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={thisWeekend}
              onCheckedChange={(checked) => setThisWeekend(checked === true)}
            />
            <span className="text-sm">This Weekend</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={eveningShift}
              onCheckedChange={(checked) => setEveningShift(checked === true)}
            />
            <span className="text-sm">Evening Shift</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={matchAvailability}
              onCheckedChange={(checked) =>
                setMatchAvailability(checked === true)
              }
            />
            <span className="text-sm flex items-center gap-1">
              <CalendarCheck className="h-3.5 w-3.5" />
              Match My Availability
            </span>
          </label>
        </div>
      </div>

            <div>
        <h3 className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Category
        </h3>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

            <div>
        <h3 className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Location
        </h3>
        <Select
          value={locationFilter}
          onValueChange={(value) =>
            setLocationFilter(value as typeof locationFilter)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            {LOCATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

            <Button
        className="w-full lg:hidden"
        onClick={() => setMobileFilterOpen(false)}
      >
        Apply Filters
      </Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
                <div className="text-left">
          <h1 className="text-3xl font-bold">Available Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discover tasks that match your skills and schedule
          </p>
        </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-6">
                            <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-muted/50"
                  />
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-xs text-left font-semibold uppercase tracking-wider text-muted-foreground">
                  Refine Search
                </h2>
              </div>
              <FilterContent />
            </div>
          </aside>

                    <main className="flex-1 min-w-0">
                        <div className="lg:hidden mb-6 space-y-4">
                            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/50"
                />
              </div>

              <div className="flex items-center justify-between">
                                <Sheet
                  open={mobileFilterOpen}
                  onOpenChange={setMobileFilterOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          !
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] overflow-y-auto"
                  >
                    <SheetHeader className="mb-6">
                      <SheetTitle>Refine Search</SheetTitle>
                    </SheetHeader>
                    <FilterContent />
                  </SheetContent>
                </Sheet>

                                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Sort by:
                  </span>
                  <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as typeof sortBy)}
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
              </div>
            </div>

                        <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length}{" "}
                {filteredTasks.length === 1 ? "task" : "tasks"} found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as typeof sortBy)}
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
            </div>

                        {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : error ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Briefcase className="mb-4 h-10 w-10 text-muted-foreground/50" />
                    <h3 className="font-semibold">Error loading tasks</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="mt-4"
                    >
                      Try again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : filteredTasks.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Briefcase className="mb-4 h-10 w-10 text-muted-foreground/50" />
                    <h3 className="font-semibold">No tasks found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        className="mt-2"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onViewDetails={() => navigate(`/tasks/${task.id}`)}
                      onApplied={fetchTasks}
                    />
                  ))}
                </div>

                                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "w-10 h-10",
                            currentPage === pageNum &&
                              "bg-primary text-primary-foreground",
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2 text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface TaskCardProps {
  task: Task;
  onViewDetails: () => void;
  onApplied?: () => void;
}

function TaskCard({ task, onViewDetails, onApplied }: TaskCardProps) {
  const taskStart = parseISO(task.start);
  const taskEnd = getTaskEndDate(task);

  const formattedDate = format(taskStart, "EEE, MMM d");
  const formattedStartTime = format(taskStart, "h:mm a");
  const formattedEndTime = format(taskEnd, "h:mm a");

  const getTimeDisplay = () => {
    return `${formattedStartTime} - ${formattedEndTime}`;
  };

  const categoryName = task.category?.name || "General";
  const categoryColor = getCategoryColor(categoryName);

    const truncatedDescription = task.description
    ? task.description.length > 100
      ? task.description.substring(0, 100) + "..."
      : task.description
    : "No description provided.";

  return (
    <Card
      className="rounded-xl border bg-card hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
      onClick={onViewDetails}
    >
      <CardContent className="px-5 py-0">
                <div className="flex items-start justify-between mb-3">
          <Badge className={cn("text-xs font-medium", categoryColor)}>
            {categoryName.toUpperCase()}
          </Badge>
        </div>

                <h3 className="pl-1 pt-1.5 font-semibold text-2xl text-left mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {task.title}
        </h3>

                <p className="pl-1 text-sm text-left text-muted-foreground mb-4 line-clamp-2">
          {truncatedDescription}
        </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>
            {formattedDate} • {getTimeDisplay()}
          </span>
        </div>

                {task.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{task.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
