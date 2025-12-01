import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, UserCog, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/api/user';
import type { UserRole } from '@/types/user';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === user?.role || isUpdatingRole) return;

    setIsUpdatingRole(true);

    try {
      const updatedUser = await updateUserProfile({ role: newRole });
      updateUser({ role: updatedUser.role });
      toast.success(`Role updated to ${newRole || 'none'}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; message?: string } } };
      const errorData = error.response?.data;
      const errorMessage = errorData?.detail || errorData?.message || 'Failed to update role';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      toast.success('Account deleted successfully');
      await logout();
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; message?: string } } };
      const errorData = error.response?.data;
      const errorMessage = errorData?.detail || errorData?.message || 'Failed to delete account';
      toast.error(errorMessage);
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="size-5 text-primary" />
            <CardTitle>Role Management</CardTitle>
          </div>
          <CardDescription>
            Change your role on the platform. This affects what features and content you see.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Select
              value={user?.role || 'null'}
              onValueChange={(value) => handleRoleChange(value === 'null' ? null : value as UserRole)}
              disabled={isUpdatingRole}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="null">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isUpdatingRole && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Updating role...
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Current role: <span className="font-semibold">{user?.role || 'Not set'}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeletingAccount}>
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}


