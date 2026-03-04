import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getNotifications, markNotificationAsRead as markAsReadAPI, type Notification } from "@/api/notifications";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationContextType {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  fetchNotifications: (force?: boolean, showLoading?: boolean) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasFetchedRef = useRef(false);
  const userIdRef = useRef<string | number | undefined>(undefined);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(
    async (force = false, showLoading = false) => {
      if (!user?.id) {
        setNotifications([]);
        return;
      }

      if (hasFetchedRef.current && !force) {
        return;
      }

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await getNotifications();
        setNotifications(data);
        hasFetchedRef.current = true;
        userIdRef.current = user.id;
      } catch (err) {
        setError("Failed to load notifications");
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [user?.id]
  );

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );

    try {
      await markAsReadAPI(notificationId);
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: false } : n))
      );
      setError("Failed to mark notification as read");
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      hasFetchedRef.current = false;
      userIdRef.current = undefined;
      setError(null);
      return;
    }

    const isNewUser = user.id !== userIdRef.current;

    if (!hasFetchedRef.current || isNewUser) {
      userIdRef.current = user.id;
      fetchNotifications(false, false);
    }
  }, [user?.id, fetchNotifications]);

  const value: NotificationContextType = {
    notifications,
    isLoading,
    error,
    unreadCount,
    fetchNotifications,
    markNotificationAsRead,
    clearError,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
