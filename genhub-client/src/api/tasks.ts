import axiosInstance from "@/lib/axios";
import type { Task, TaskApplication, TaskInvitation, Category } from "@/types/task";

export type TaskSegment = "open" | "assigned" | "completed";

export interface CreateTaskData {
  title: string;
  description: string;
  category_id: string;
  location?: string;
  formatted_address?: string;
  latitude?: number;
  longitude?: number;
  start: string;
  duration?: number;
}

export async function getCategories(): Promise<Category[]> {
  const response = await axiosInstance.get<any>("/api/categories/");
    return Array.isArray(response.data)
    ? response.data
    : response.data?.results || [];
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const response = await axiosInstance.post<Task>("/api/tasks/", data);
  return response.data;
}

export async function applyForTask(taskId: string): Promise<TaskApplication> {
  const response = await axiosInstance.post<TaskApplication>(
    `/api/tasks/${taskId}/apply/`
  );
  return response.data;
}


export async function getMyApplication(
  taskId: string
): Promise<TaskApplication | { applied: false }> {
  const response = await axiosInstance.get<
    TaskApplication | { applied: false }
  >(`/api/tasks/${taskId}/my-application/`);
  return response.data;
}

export async function getMyAcceptedTasks(
  segment?: TaskSegment
): Promise<Task[]> {
  const params = segment ? { segment } : {};
  const response = await axiosInstance.get<any>("/api/tasks/volunteer/me/", {
    params,
  });
    return Array.isArray(response.data)
    ? response.data
    : response.data?.results || [];
}

export async function getParentTasks(segment?: TaskSegment): Promise<Task[]> {
  const params = segment ? { segment } : {};
  const response = await axiosInstance.get<any>("/api/tasks/parent/me/", {
    params,
  });
    return Array.isArray(response.data)
    ? response.data
    : response.data?.results || [];
}

export async function getTaskApplications(
  taskId: string
): Promise<TaskApplication[]> {
  const response = await axiosInstance.get<TaskApplication[]>(
    `/api/tasks/${taskId}/applications/`
  );
  return response.data;
}

export async function acceptApplication(
  taskId: string,
  volunteerId: string
): Promise<TaskApplication> {
  const response = await axiosInstance.post<TaskApplication>(
    `/api/tasks/${taskId}/accept/${volunteerId}/`
  );
  return response.data;
}

export async function rejectApplication(
  taskId: string,
  volunteerId: string
): Promise<TaskApplication> {
  const response = await axiosInstance.post<TaskApplication>(
    `/api/tasks/${taskId}/reject/${volunteerId}/`
  );
  return response.data;
}

export async function cancelApplication(
  taskId: string
): Promise<TaskApplication> {
  const response = await axiosInstance.patch<TaskApplication>(
    `/api/tasks/${taskId}/cancel-application/`
  );
  return response.data;
}

export async function getTaskById(taskId: string): Promise<Task> {
  const response = await axiosInstance.get<Task>(`/api/tasks/${taskId}/`);
  return response.data;
}

export async function getAvailableTasks(params?: {
  category?: number;
  location?: string;
  date?: string;
}): Promise<Task[]> {
  const response = await axiosInstance.get<Task[]>("/api/tasks/available/", {
    params,
  });
  return response.data;
}

export async function completeTask(taskId: string): Promise<Task> {
  const response = await axiosInstance.post<Task>(
    `/api/tasks/${taskId}/complete/`
  );
  return response.data;
}

export async function updateTask(
  taskId: string,
  data: Partial<CreateTaskData>
): Promise<Task> {
  const response = await axiosInstance.patch<Task>(
    `/api/tasks/${taskId}/`,
    data
  );
  return response.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await axiosInstance.delete(`/api/tasks/${taskId}/`);
}

export async function inviteBabysitterToTask(
  taskId: string,
  babysitterId: string,
  message?: string
): Promise<TaskInvitation> {
  const response = await axiosInstance.post<TaskInvitation>(
    `/api/tasks/${taskId}/invite/${babysitterId}/`,
    { message }
  );
  return response.data;
}

export async function getMyApplications(): Promise<TaskApplication[]> {
  const response = await axiosInstance.get<TaskApplication[]>(
    "/api/tasks/applications/me/"
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function getMyInvitations(): Promise<TaskInvitation[]> {
  const response = await axiosInstance.get<TaskInvitation[]>(
    "/api/tasks/invitations/me/"
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function acceptInvitation(invitationId: string): Promise<TaskInvitation> {
  const response = await axiosInstance.post<TaskInvitation>(
    `/api/tasks/invitations/${invitationId}/accept/`
  );
  return response.data;
}

export async function declineInvitation(invitationId: string): Promise<TaskInvitation> {
  const response = await axiosInstance.post<TaskInvitation>(
    `/api/tasks/invitations/${invitationId}/decline/`
  );
  return response.data;
}
