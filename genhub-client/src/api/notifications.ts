import axiosInstance from "@/lib/axios";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedNotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await axiosInstance.get<PaginatedNotificationsResponse>(`/api/notifications/`);
  return response.data.results;
}

