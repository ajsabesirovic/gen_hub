import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Bell, Mail, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function Preferences() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [assignmentUpdates, setAssignmentUpdates] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  const handleThemeChange = async (newTheme: string) => {
    setIsLoading(true);
    try {
      setTheme(newTheme);
      toast.success('Theme preference saved');
    } catch (error) {
      toast.error('Failed to save theme preference');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (
    type: string,
    value: boolean,
    setter: (val: boolean) => void
  ) => {
    setter(value);
    try {
      toast.success('Notification preference updated');
    } catch (error) {
      toast.error('Failed to update notification preference');
      setter(!value);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="size-5 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize how GenHub looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={mounted ? (theme || 'system') : 'system'}
              onValueChange={handleThemeChange}
              disabled={isLoading || !mounted}
            >
              <SelectTrigger id="theme" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="size-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="size-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="size-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred color scheme. System will match your device settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="size-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account and activities
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={(checked) =>
                handleNotificationChange('emailNotifications', checked, setEmailNotifications)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task-reminders" className="flex items-center gap-2">
                <Bell className="size-4" />
                Task Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminders about upcoming tasks and deadlines
              </p>
            </div>
            <Switch
              id="task-reminders"
              checked={taskReminders}
              onCheckedChange={(checked) =>
                handleNotificationChange('taskReminders', checked, setTaskReminders)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="assignment-updates" className="flex items-center gap-2">
                <Bell className="size-4" />
                Assignment Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when assignments are created or updated
              </p>
            </div>
            <Switch
              id="assignment-updates"
              checked={assignmentUpdates}
              onCheckedChange={(checked) =>
                handleNotificationChange('assignmentUpdates', checked, setAssignmentUpdates)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletter" className="flex items-center gap-2">
                <Mail className="size-4" />
                Newsletter
              </Label>
              <p className="text-sm text-muted-foreground">
                Subscribe to our newsletter for community updates and tips
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={newsletter}
              onCheckedChange={(checked) =>
                handleNotificationChange('newsletter', checked, setNewsletter)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
