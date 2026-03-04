import { useEffect, useState, useRef } from "react";
import { Loader2, Mail, KeyRound, Camera } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import ChangePassword from "./settings/ChangePassword";
import PasswordResetRequest from "./settings/PasswordResetRequest";
import { cn, getProfileImageUrl } from "@/lib/utils";
import { UserProfile } from "@/components/UserProfile";
import { updateAccountProfile } from "@/api/user";

type PasswordSection = "change-password" | "reset-password" | null;

export default function Profile() {
  const { user, isLoading, updateUser } = useAuth();
  const [activePasswordSection, setActivePasswordSection] =
    useState<PasswordSection>(null);

    const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

    const displayImageUrl = tempPreviewUrl ?? (
    user?.profile_image || user?.image
      ? getProfileImageUrl(user?.profile_image || user?.image, user?.email)
      : null
  );

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? (user?.email ? user.email[0]?.toUpperCase() : "U");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const url = URL.createObjectURL(file);
    setTempPreviewUrl(url);
    setIsDialogOpen(false);

    setIsSaving(true);
    try {
      const updatedUser = await updateAccountProfile({
        imageFile: file,
        removeImage: false,
      });

      updateUser(updatedUser);
      setTempPreviewUrl(null);
      toast.success("Profile photo updated");
    } catch (err: any) {
      setTempPreviewUrl(null);
      const data = err?.response?.data;
      toast.error(
        data?.profile_image?.[0] ||
          data?.detail ||
          data?.message ||
          "Failed to update profile photo",
      );
    } finally {
      setIsSaving(false);
      URL.revokeObjectURL(url);
    }
  };

  const handleRemoveImage = async () => {
    if (!user) return;

    setIsDialogOpen(false);
    setIsSaving(true);

    try {
      const updatedUser = await updateAccountProfile({
        removeImage: true,
      });

      updateUser(updatedUser);
      setTempPreviewUrl(null);
      toast.success("Profile photo removed");
    } catch (err: any) {
      const data = err?.response?.data;
      toast.error(
        data?.profile_image?.[0] ||
          data?.detail ||
          data?.message ||
          "Failed to remove profile photo",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSectionChange = (section: PasswordSection) => {
    setActivePasswordSection(
      activePasswordSection === section ? null : section,
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24 lg:pb-6">
                <div className="text-left">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account settings and profile information
          </p>
        </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                                    <div className="relative group">
                    <Avatar className="h-24 w-24">
                      {displayImageUrl ? (
                        <AvatarImage
                          src={displayImageUrl}
                          alt={user?.name || "Profile"}
                        />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>

                                        <button
                      onClick={() => setIsDialogOpen(true)}
                      disabled={isSaving}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-full",
                        "bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
                        "focus:opacity-100",
                      )}
                    >
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <Camera className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>

                                    <h2 className="mt-3 text-lg font-semibold">
                    {user?.name || "User"}
                  </h2>
                  {user?.username && (
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    {user?.role}
                  </p>
                </div>
              </CardContent>
            </Card>

                        <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Password & Security
                </CardTitle>
                <CardDescription className="text-left">
                  Manage your password settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                                <div className="space-y-3">
                  <button
                    onClick={() =>
                      handlePasswordSectionChange("change-password")
                    }
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
                      "hover:bg-accent",
                      activePasswordSection === "change-password" &&
                        "border-primary bg-primary/5",
                    )}
                  >
                    <KeyRound className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-xs text-muted-foreground">
                        Update your current password
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handlePasswordSectionChange("reset-password")
                    }
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
                      "hover:bg-accent",
                      activePasswordSection === "reset-password" &&
                        "border-primary bg-primary/5",
                    )}
                  >
                    <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Reset Password</p>
                      <p className="text-xs text-muted-foreground">
                        Receive a reset link via email
                      </p>
                    </div>
                  </button>
                </div>

                                {activePasswordSection === "change-password" && (
                  <div className="pt-4 border-t">
                    <ChangePassword noCard />
                  </div>
                )}
                {activePasswordSection === "reset-password" && (
                  <div className="pt-4 border-t">
                    <PasswordResetRequest noCard />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

                    <div className="lg:col-span-2">
            <UserProfile />
          </div>
        </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Profile Photo</DialogTitle>
            </DialogHeader>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition",
                "hover:border-primary hover:bg-primary/5",
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload a new photo
              </p>
            </div>

            {displayImageUrl && (
              <div className="mt-4 flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={displayImageUrl} />
                </Avatar>
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Button
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
              >
                Upload Photo
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleRemoveImage}
                disabled={isSaving || !displayImageUrl}
              >
                Remove Photo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
