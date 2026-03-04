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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
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
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryData,
} from "@/api/admin";

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", description: "", is_active: true });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      });
      toast.success("Category created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchCategories();
    } catch (err: any) {
      console.error("Failed to create category:", err);
      toast.error(err.response?.data?.name?.[0] || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory?.id || !formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateCategory(selectedCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      });
      toast.success("Category updated successfully");
      setIsEditOpen(false);
      setSelectedCategory(null);
      resetForm();
      fetchCategories();
    } catch (err: any) {
      console.error("Failed to update category:", err);
      toast.error(err.response?.data?.name?.[0] || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: CategoryData) => {
    if (!category.id) return;

    try {
      await deleteCategory(category.id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast.error("Failed to delete category");
    }
  };

  const openEditDialog = (category: CategoryData) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
    });
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Categories</h1>
              <p className="text-muted-foreground">Manage task categories</p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
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
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage task categories</p>
          </div>
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-destructive">
                  {error}
                </h3>
                <Button onClick={fetchCategories} className="mt-4">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage task categories</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Add a new category for organizing tasks.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Evening Care"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional description..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              All Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No categories yet</h3>
                <p className="text-muted-foreground">
                  Create your first category to get started.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="text-left font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-left max-w-xs truncate text-muted-foreground">
                        {category.description || "-"}
                      </TableCell>
                      <TableCell className="text-left">
                        <Badge
                          variant={category.is_active ? "default" : "secondary"}
                        >
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left text-muted-foreground">
                        {category.created_at
                          ? new Date(category.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(category)}
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
                                  Delete Category
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {category.name}"? This action cannot be
                                  undone. Tasks using this category will need to
                                  be reassigned.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category)}
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
            )}
          </CardContent>
        </Card>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the category details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is_active">Active</Label>
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
