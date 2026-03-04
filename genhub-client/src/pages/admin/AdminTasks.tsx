import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  User,
  Eye,
  X,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  getAdminTasks,
  updateAdminTask,
  deleteAdminTask,
  getCategories,
  type TaskListParams,
  type CategoryData,
} from "@/api/admin";
import type { Task } from "@/types/task";

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

    const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    status: "unclaimed" as "unclaimed" | "claimed",
  });

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: TaskListParams = {
        page: currentPage,
        page_size: pageSize,
      };

      if (search) params.search = search;
      if (statusFilter !== "all")
        params.status = statusFilter as "unclaimed" | "claimed";
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (startDate) params.start_date = format(startDate, "yyyy-MM-dd");
      if (endDate) params.end_date = format(endDate, "yyyy-MM-dd");

      const data = await getAdminTasks(params);
      setTasks(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [currentPage, statusFilter, categoryFilter, startDate, endDate]);

    useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    startDate ||
    endDate;

  const totalPages = Math.ceil(totalCount / pageSize);

  const openViewDialog = (task: Task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      location: task.location || "",
      status: task.status === "claimed" ? "claimed" : "unclaimed",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedTask?.id) return;
    try {
      setIsSubmitting(true);
      await updateAdminTask(selectedTask.id, editForm);
      toast.success("Task updated successfully");
      setIsEditOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err: any) {
      console.error("Failed to update task:", err);
      toast.error(err.response?.data?.detail || "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (task: Task) => {
    try {
      await deleteAdminTask(task.id);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      toast.error(err.response?.data?.detail || "Failed to delete task");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "claimed":
        return <Badge variant="default">Claimed</Badge>;
      case "unclaimed":
        return <Badge variant="secondary">Unclaimed</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading && tasks.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">View and manage all tasks</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">View and manage all tasks</p>
          </div>
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-destructive">
                  {error}
                </h3>
                <Button onClick={fetchTasks} className="mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">View and manage all tasks</p>
        </div>

                <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unclaimed">Unclaimed</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[200px]">
                    <Tag className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id || ""}>
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
                        "w-[180px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "MMM d, yyyy")
                        : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                    />
                  </PopoverContent>
                </Popover>

                                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                    />
                  </PopoverContent>
                </Popover>

                                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

                <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              All Tasks
            </CardTitle>
            <CardDescription>
              {totalCount} {totalCount === 1 ? "task" : "tasks"} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No tasks found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="text-left font-medium max-w-xs truncate">
                          {task.title}
                        </TableCell>
                        <TableCell className="text-left text-muted-foreground">
                          {task.category?.name || "-"}
                        </TableCell>
                        <TableCell className="text-left text-muted-foreground">
                          <div className="flex flex-col">
                            <span>{formatDate(task.start)}</span>
                            <span className="text-xs">
                              {formatTime(task.start)}{" "}
                              {task.end ? `- ${formatTime(task.end)}` : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-left text-muted-foreground max-w-[150px] truncate">
                          {task.location || "-"}
                        </TableCell>
                        <TableCell className="text-left">
                          {getStatusBadge(task.status)}
                        </TableCell>
                        <TableCell className="text-left text-muted-foreground">
                          {task.user || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openViewDialog(task)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(task)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Task
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {task.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(task)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, totalCount)} of{" "}
                      {totalCount}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
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
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTask?.title}</DialogTitle>
              <DialogDescription>Task details</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {formatDate(selectedTask.start)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {formatTime(selectedTask.start)}{" "}
                        {selectedTask.end
                          ? `- ${formatTime(selectedTask.end)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  {selectedTask.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">{selectedTask.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created By
                      </p>
                      <p className="font-medium">
                        {selectedTask.user || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedTask.status)}
                </div>
                {selectedTask.category && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Category
                    </p>
                    <Badge variant="outline">
                      {selectedTask.category.name}
                    </Badge>
                  </div>
                )}
                {selectedTask.volunteer && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Assigned To
                    </p>
                    <p className="font-medium">{selectedTask.volunteer}</p>
                  </div>
                )}
                {selectedTask.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm">{selectedTask.description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewOpen(false);
                  if (selectedTask) openEditDialog(selectedTask);
                }}
              >
                Edit Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update task information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: "unclaimed" | "claimed") =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unclaimed">Unclaimed</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
