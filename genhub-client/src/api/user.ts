import axiosInstance from "@/lib/axios";
import type { User, UserRole } from "@/types/user";

export interface UpdateUserPayload {
  name?: string;
  age?: number | string;
  phone?: string;
  city?: string;
  country?: string;
  role?: UserRole;
}

export interface UpdateParentProfilePayload extends UpdateUserPayload {
  street?: string;
  apartment_number?: string;
    formatted_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  number_of_children?: number;
  children_ages?: string[];
  has_special_needs?: boolean;
  special_needs_description?: string;
  description?: string;
  preferred_babysitting_location?: string;
  preferred_languages?: string[];
  preferred_experience_years?: number;
  preferred_experience_with_ages?: string[];
  smoking_allowed?: boolean;
  pets_in_home?: boolean;
  additional_notes?: string;
}

export interface UpdateBabysitterProfilePayload extends UpdateUserPayload {
  description?: string;
  characteristics?: string[];
  experience_years?: number;
  hourly_rate?: number;
  education?: string;
  drivers_license?: boolean;
  car?: boolean;
  has_children?: boolean;
  smoker?: boolean;
  street?: string;
  apartment_number?: string;
    formatted_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  preferred_babysitting_location?: string;
  languages?: string[];
  experience_with_ages?: string[];
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password1: string;
  new_password2: string;
}

export interface ResetPasswordPayload {
  email: string;
}

export interface ResetPasswordConfirmPayload {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

export interface TimeRange {
  id: string;
  from: string;
  to: string;
}

export interface WeeklySchedule {
  day: string;
  timeRanges: TimeRange[];
  whole_day?: boolean;
}

export interface MonthlySchedule {
  date: string;
  from: string;
  to: string;
  whole_day?: boolean;
}

export interface AvailabilityData {
  mode: "weekly" | "monthly";
  weeklySchedule: WeeklySchedule[];
  monthlySchedule: MonthlySchedule[];
  currentMonth: string;
}

export interface UpdateAccountProfileOptions {
  username?: string;
  imageFile?: File | null;
  removeImage?: boolean;
}

export async function getCurrentUser(): Promise<User> {
  const response = await axiosInstance.get<User>("/auth/user/");
  return response.data;
}

export async function updateUserProfile(
  data: UpdateUserPayload
): Promise<User> {
  const response = await axiosInstance.patch<User>("/auth/user/", data);
  return response.data;
}

export async function updateUserMeProfile(
  data: UpdateParentProfilePayload | UpdateBabysitterProfilePayload
): Promise<User> {
  const response = await axiosInstance.patch<User>("/api/me/profile/", data);
  return response.data;
}

export async function updateAccountProfile(
  options: UpdateAccountProfileOptions
): Promise<User> {
  const formData = new FormData();

  if (options.imageFile) {
    formData.append("profile_image", options.imageFile);
  }

  const response = await axiosInstance.patch<User>("/auth/user/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function changePassword(
  data: ChangePasswordPayload
): Promise<{ detail: string }> {
  const response = await axiosInstance.post<{ detail: string }>(
    "/auth/password/change/",
    data
  );
  return response.data;
}

export async function requestPasswordReset(
  data: ResetPasswordPayload
): Promise<{ detail: string }> {
  const response = await axiosInstance.post<{ detail: string }>(
    "/auth/password/reset/",
    data
  );
  return response.data;
}

export async function confirmPasswordReset(
  data: ResetPasswordConfirmPayload
): Promise<{ detail: string }> {
  const response = await axiosInstance.post<{ detail: string }>(
    `/auth/password/reset/confirm/${data.uid}/${data.token}/`,
    data
  );
  return response.data;
}

export async function saveAvailability(
  data: AvailabilityData
): Promise<{ detail: string }> {
  const response = await axiosInstance.post<{ detail: string }>(
    "/api/availability/aggregate/",
    data
  );
  return response.data;
}

export async function getAvailabilityForCurrentUser(): Promise<AvailabilityData | null> {
  try {
    const response = await axiosInstance.get<AvailabilityData>("/api/availability/aggregate/");
    return response.data;
  } catch (error) {
    return null;
  }
}

export interface BabysitterListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export async function getBabysitters(): Promise<User[]> {
  const response = await axiosInstance.get<BabysitterListResponse | User[]>(
    "/api/users/",
    { params: { role: "babysitter" } }
  );
    if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.results;
}

export async function getBabysitterById(id: string): Promise<User> {
  const response = await axiosInstance.get<User>(`/api/users/${id}/`);
  return response.data;
}

export async function getUserByUsername(username: string): Promise<User> {
  const response = await axiosInstance.get<User>(`/api/users/by-username/${username}/`);
  return response.data;
}

export interface Review {
  id: string;
  task: string;
  task_uuid: string;
  task_title?: string;
  parent: string;
  parent_id?: string;
  parent_name?: string;
  parent_profile_image?: string | null;
  volunteer: string;
  volunteer_id?: string;
  volunteer_name?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
  is_editable?: boolean;
}

export interface ReviewListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

export async function getMyReviews(): Promise<Review[]> {
  const response = await axiosInstance.get<ReviewListResponse | Review[]>(
    "/api/reviews/"
  );
    if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.results;
}

export interface CreateReviewPayload {
  task_id: string;
  rating: number;
  comment?: string;
}

export interface CanReviewResponse {
  can_review: boolean;
  reason?: string;
  review_id?: string;
  is_editable?: boolean;
  volunteer_id?: string;
  volunteer_name?: string;
}

export async function createReview(data: CreateReviewPayload): Promise<Review> {
  const response = await axiosInstance.post<Review>("/api/reviews/", data);
  return response.data;
}

export async function updateReview(
  reviewId: string,
  data: { rating?: number; comment?: string }
): Promise<Review> {
  const response = await axiosInstance.patch<Review>(
    `/api/reviews/${reviewId}/`,
    data
  );
  return response.data;
}

export async function canReviewTask(taskId: string): Promise<CanReviewResponse> {
  const response = await axiosInstance.get<CanReviewResponse>(
    `/api/reviews/can-review/${taskId}/`
  );
  return response.data;
}

export async function getReviewsForBabysitter(
  babysitterId: string
): Promise<Review[]> {
  const response = await axiosInstance.get<Review[] | ReviewListResponse>(
    `/api/reviews/babysitter/${babysitterId}/`
  );
    if (Array.isArray(response.data)) {
    return response.data;
  }
    if (response.data && 'results' in response.data) {
    return response.data.results;
  }
  return [];
}

export async function getReviewForTask(taskId: string): Promise<Review | null> {
  try {
    const reviews = await getMyReviews();
        return reviews.find((r) => r.task_uuid === taskId) || null;
  } catch {
    return null;
  }
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_task_id?: string | null;
  related_user_id?: string | null;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await axiosInstance.get<Notification[] | { results: Notification[] }>(
    "/api/notifications/"
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.results || [];
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await axiosInstance.patch<Notification>(
    `/api/notifications/${id}/`,
    { is_read: true }
  );
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await axiosInstance.post("/api/notifications/mark-all-read/");
}

import type { Task } from "@/types/task";

export interface TaskListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export interface TaskFilters {
  category?: string;
  location?: string;
  date?: string;
}

export async function getAvailableTasks(filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.location) params.append("location", filters.location);
  if (filters?.date) params.append("date", filters.date);

  const url = `/api/tasks/available/${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await axiosInstance.get<TaskListResponse | Task[]>(url);

    if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.results || [];
}

export async function getTaskById(id: string): Promise<Task> {
  const response = await axiosInstance.get<Task>(`/api/tasks/${id}/`);
  return response.data;
}
