import axiosInstance from "@/lib/axios";
import type { User, UserRole } from "@/types/user";

export interface UpdateUserPayload {
  name?: string;
  age?: number | string;
  phone?: string;
  street?: string;
  house_number?: string;
  city?: string;
  country?: string;
  role?: UserRole;
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
}

export interface MonthlySchedule {
  date: string;
  from: string;
  to: string;
}

export interface AvailabilityData {
  mode: "weekly" | "monthly";
  weeklySchedule: WeeklySchedule[];
  monthlySchedule: MonthlySchedule[];
  currentMonth: string;
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
    "/api/availability/",
    data
  );
  return response.data;
}

export async function getAvailabilityForCurrentUser(): Promise<AvailabilityData | null> {
  try {
    const response = await axiosInstance.get<AvailabilityData>("/api/availability/");
    return response.data;
  } catch (error) {
    return null;
  }
}
