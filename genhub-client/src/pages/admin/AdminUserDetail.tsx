import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
  activateUser,
  deactivateUser,
  type AdminUser,
} from "@/api/admin";
import { getProfileImageUrl } from "@/lib/utils";

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

    const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
  });

  const fetchUser = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAdminUser(id);
      setUser(data);
      setEditForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        country: data.country || "",
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError("Failed to load user details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateAdminUser(id, editForm);
      toast.success("User updated successfully");
      setIsEditOpen(false);
      fetchUser();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      toast.error(err.response?.data?.detail || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteAdminUser(id);
      toast.success("User deleted successfully");
      navigate("/admin/users");
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      toast.error(err.response?.data?.detail || "Failed to delete user");
    }
  };

  const handleActivate = async () => {
    if (!id) return;
    try {
      await activateUser(id);
      toast.success("User activated successfully");
      fetchUser();
    } catch (err: any) {
      console.error("Failed to activate user:", err);
      toast.error(err.response?.data?.detail || "Failed to activate user");
    }
  };

  const handleDeactivate = async () => {
    if (!id) return;
    try {
      await deactivateUser(id);
      toast.success("User deactivated successfully");
      fetchUser();
    } catch (err: any) {
      console.error("Failed to deactivate user:", err);
      toast.error(err.response?.data?.detail || "Failed to deactivate user");
    }
  };

  const getInitials = (user: AdminUser) => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || "??";
  };

  const isAdmin = user?.is_staff || user?.is_superuser;
  const isActive = user?.is_active !== false;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-destructive">
                  {error || "User not found"}
                </h3>
                <Button onClick={() => navigate("/admin/users")} className="mt-4">
                  Back to Users
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-16 w-16">
              <AvatarImage src={getProfileImageUrl(user.profile_image, user.email)} />
              <AvatarFallback className="text-lg">{getInitials(user)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name || "No name"}</h1>
              <div className="flex items-center gap-2 mt-1">
                {isAdmin && (
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
                {user.role === "parent" && <Badge variant="secondary">Parent</Badge>}
                {user.role === "babysitter" && <Badge variant="outline">Babysitter</Badge>}
                <Badge variant={isActive ? "default" : "destructive"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {!isAdmin && (
              <>
                {isActive ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to deactivate {user.name || user.email}? They
                          will not be able to log in until reactivated.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeactivate}>
                          Deactivate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button variant="outline" onClick={handleActivate}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {user.name || user.email}? This action
                        cannot be undone. All their tasks and applications will also be removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
                    <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>User contact and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              {(user.city || user.country) && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[user.city, user.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Joined:{" "}
                  {user.date_joined
                    ? new Date(user.date_joined).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
              {user.last_login && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Last login: {new Date(user.last_login).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

                    <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>User engagement statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <Briefcase className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{user.task_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <FileCheck className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{user.application_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

                    {user.role === "parent" && user.parent_profile && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Parent Profile</CardTitle>
                <CardDescription>Family and preference details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {user.parent_profile.number_of_children && (
                    <div>
                      <p className="text-sm text-muted-foreground">Number of Children</p>
                      <p className="font-medium">{user.parent_profile.number_of_children}</p>
                    </div>
                  )}
                  {user.parent_profile.children_ages && (
                    <div>
                      <p className="text-sm text-muted-foreground">Children Ages</p>
                      <p className="font-medium">
                        {Array.isArray(user.parent_profile.children_ages)
                          ? user.parent_profile.children_ages.join(", ")
                          : user.parent_profile.children_ages}
                      </p>
                    </div>
                  )}
                  {user.parent_profile.preferred_babysitting_location && (
                    <div>
                      <p className="text-sm text-muted-foreground">Preferred Location</p>
                      <p className="font-medium capitalize">
                        {user.parent_profile.preferred_babysitting_location.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                  {user.parent_profile.preferred_languages && (
                    <div>
                      <p className="text-sm text-muted-foreground">Preferred Languages</p>
                      <p className="font-medium">
                        {Array.isArray(user.parent_profile.preferred_languages)
                          ? user.parent_profile.preferred_languages.join(", ")
                          : user.parent_profile.preferred_languages}
                      </p>
                    </div>
                  )}
                  {user.parent_profile.description && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium">{user.parent_profile.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

                    {user.role === "babysitter" && user.babysitter_profile && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Babysitter Profile</CardTitle>
                <CardDescription>Professional details and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {user.babysitter_profile.experience_years !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">
                        {user.babysitter_profile.experience_years} years
                      </p>
                    </div>
                  )}
                  {user.babysitter_profile.hourly_rate !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium">${user.babysitter_profile.hourly_rate}/hr</p>
                    </div>
                  )}
                  {user.babysitter_profile.education && (
                    <div>
                      <p className="text-sm text-muted-foreground">Education</p>
                      <p className="font-medium">{user.babysitter_profile.education}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Certifications</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.babysitter_profile.first_aid_certified && (
                        <Badge variant="outline">First Aid</Badge>
                      )}
                      {user.babysitter_profile.background_check && (
                        <Badge variant="outline">Background Check</Badge>
                      )}
                      {user.babysitter_profile.drivers_license && (
                        <Badge variant="outline">Driver's License</Badge>
                      )}
                    </div>
                  </div>
                  {user.babysitter_profile.languages && (
                    <div>
                      <p className="text-sm text-muted-foreground">Languages</p>
                      <p className="font-medium">
                        {Array.isArray(user.babysitter_profile.languages)
                          ? user.babysitter_profile.languages.join(", ")
                          : user.babysitter_profile.languages}
                      </p>
                    </div>
                  )}
                  {user.babysitter_profile.description && (
                    <div className="md:col-span-3">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium">{user.babysitter_profile.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  />
                </div>
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
