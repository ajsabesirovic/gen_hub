import axiosInstance from "@/lib/axios";
import type { User } from "@/types/user";
import type { Task, TaskApplication } from "@/types/task";

export interface AdminUser extends User {
  profile_summary?: {
    number_of_children?: number;
    city?: string;
    experience_years?: number;
    hourly_rate?: number;
    first_aid_certified?: boolean;
  } | null;
  task_count?: number;
  application_count?: number;
  parent_profile?: any;
  babysitter_profile?: any;
  date_joined?: string;
  last_login?: string | null;
  is_active?: boolean;
}

export interface AdminStatistics {
  tasks_per_category: Array<{ category: string; count: number }>;
  tasks_per_month: Array<{ month: string | null; count: number }>;
  tasks_by_status: {
    unclaimed: number;
    claimed: number;
    total: number;
  };
  user_totals: {
    total: number;
    parents: number;
    babysitters: number;
    admins: number;
    active_total: number;
    active_parents: number;
    active_babysitters: number;
  };
  applications_by_status: {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };
  average_babysitter_rating: number;
  total_reviews: number;
}

export interface AdminListParams {
  role?: "parent" | "babysitter";
  is_active?: boolean;
  is_admin?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface TaskListParams {
  status?: "unclaimed" | "claimed";
  user_role?: "parent" | "volunteer";
  start_date?: string;
  end_date?: string;
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface ApplicationListParams {
  status?: "pending" | "accepted" | "rejected";
  task_status?: "unclaimed" | "claimed";
  created_after?: string;
  created_before?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface StatisticsParams {
  role?: "parent" | "babysitter";
  task_status?: "unclaimed" | "claimed";
  date_from?: string;
  date_to?: string;
}

export async function getAdminUsers(params?: AdminListParams): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}> {
  const response = await axiosInstance.get<any>("/users/admin/users/", { params });
    if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    };
  }
  return response.data;
}

export async function getAdminUser(userId: string): Promise<AdminUser> {
  const response = await axiosInstance.get<AdminUser>(`/users/admin/users/${userId}/`);
  return response.data;
}

export async function updateAdminUser(userId: string, data: Partial<AdminUser>): Promise<AdminUser> {
  const response = await axiosInstance.patch<AdminUser>(`/users/admin/users/${userId}/`, data);
  return response.data;
}

export async function activateUser(userId: string): Promise<AdminUser> {
  const response = await axiosInstance.post<AdminUser>(`/users/admin/users/${userId}/activate/`);
  return response.data;
}

export async function deactivateUser(userId: string): Promise<AdminUser> {
  const response = await axiosInstance.post<AdminUser>(`/users/admin/users/${userId}/deactivate/`);
  return response.data;
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await axiosInstance.delete(`/users/admin/users/${userId}/`);
}

export async function getAdminTasks(params?: TaskListParams): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}> {
  const response = await axiosInstance.get<any>("/tasks/admin/all/", { params });
  if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    };
  }
  return response.data;
}

export async function updateAdminTask(taskId: string, data: Partial<Task>): Promise<Task> {
  const response = await axiosInstance.patch<Task>(`/tasks/${taskId}/`, data);
  return response.data;
}

export async function deleteAdminTask(taskId: string): Promise<void> {
  await axiosInstance.delete(`/tasks/${taskId}/`);
}

export async function getAdminApplications(params?: ApplicationListParams): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: TaskApplication[];
}> {
  const response = await axiosInstance.get<any>("/applications/admin/all/", { params });
  if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    };
  }
  return response.data;
}

export async function getAdminStatistics(params?: StatisticsParams): Promise<AdminStatistics> {
  const response = await axiosInstance.get<AdminStatistics>("/tasks/statistics/", { params });
  return response.data;
}

export interface CategoryData {
  id?: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getCategories(): Promise<CategoryData[]> {
  const response = await axiosInstance.get<any>("/categories/");
    if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data?.results) {
    return response.data.results;
  }
  return [];
}

export async function getCategory(categoryId: string): Promise<CategoryData> {
  const response = await axiosInstance.get<CategoryData>(`/categories/${categoryId}/`);
  return response.data;
}

export async function createCategory(data: Omit<CategoryData, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryData> {
  const response = await axiosInstance.post<CategoryData>("/categories/", data);
  return response.data;
}

export async function updateCategory(categoryId: string, data: Partial<CategoryData>): Promise<CategoryData> {
  const response = await axiosInstance.patch<CategoryData>(`/categories/${categoryId}/`, data);
  return response.data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await axiosInstance.delete(`/categories/${categoryId}/`);
}

