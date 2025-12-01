import { useState, useEffect, useCallback } from 'react';
import { Bell, Loader2, CheckCircle2, AlertCircle, Info, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, type Notification } from '@/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('success') || typeLower.includes('complete')) {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
  if (typeLower.includes('error') || typeLower.includes('fail')) {
    return <XCircle className="h-4 w-4 text-destructive" />;
  }
  if (typeLower.includes('warning') || typeLower.includes('alert')) {
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  }
  return <Info className="h-4 w-4 text-primary" />;
};

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    if (open && user?.id) {
      fetchNotifications();
    }
  }, [open, user?.id, fetchNotifications]);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-lg">Notifications</SheetTitle>
                <SheetDescription className="mt-1">
                  {unreadCount > 0 ? (
                    <span className="text-sm font-medium text-primary">
                      {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                    </span>
                  ) : (
                    'Stay updated with your latest activity'
                  )}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center px-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">{error}</p>
                    <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
                  </div>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex h-full items-center justify-center px-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You're all caught up! Check back later for updates.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="divide-y">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "relative px-6 py-4 transition-all hover:bg-accent/50",
                        !notification.is_read && "bg-accent/30",
                        index === 0 && "rounded-t-lg"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                              "text-sm font-semibold leading-tight",
                              !notification.is_read && "text-foreground"
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(notification.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
