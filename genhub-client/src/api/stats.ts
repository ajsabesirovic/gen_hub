
import axiosInstance from "@/lib/axios";


export interface MostHiredBabysitter {
  id: string;
  name: string;
  hire_count: number;
}

export interface ParentStatistics {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  upcoming_bookings: number;
  total_hours: number;
  average_duration_minutes: number;
  most_hired_babysitter: MostHiredBabysitter | null;
  total_spent: number;
}


export interface TasksPerDayParent {
  date: string | null;
  count: number;
}

export interface BusiestDayParent {
  day: string;
  count: number;
}

export interface StatusDistributionParent {
  status: string;
  count: number;
}

export interface CategoryDistributionParent {
  category: string;
  count: number;
}

export interface LocationDistributionParent {
  location: string;
  count: number;
}

export interface TopBabysitter {
  id: string;
  name: string;
  task_count: number;
}

export interface ParentDashboardStatistics {
    total_posted_tasks: number;
  accepted_tasks: number;
  cancelled_tasks: number;
  completed_tasks: number;
  acceptance_rate: number;
  cancellation_rate: number;
    tasks_posted_per_day: TasksPerDayParent[];
  tasks_completed_per_day: TasksPerDayParent[];
  busiest_days: BusiestDayParent[];
  status_distribution: StatusDistributionParent[];
  category_distribution: CategoryDistributionParent[];
  location_distribution: LocationDistributionParent[];
    total_unique_babysitters: number;
  repeat_babysitters_count: number;
  repeat_rate: number;
  top_babysitters: TopBabysitter[];
    avg_time_to_first_application_hours: number;
  avg_time_to_acceptance_hours: number;
  tasks_without_applications_percent: number;
    total_hours_booked: number;
  average_task_duration: number;
  total_spent: number;
  average_cost_per_task: number;
  average_rating: number;
  review_count: number;
    range_days: number;
}


export interface EarningsPerMonth {
  month: string | null;
  earnings: number;
  hours: number;
}

export interface BabysitterStatistics {
  total_jobs: number;
  completed_jobs: number;
  cancelled_jobs: number;
  total_hours: number;
  average_duration_minutes: number;
  total_earnings: number;
  hourly_rate: number;
  average_rating: number;
  review_count: number;
  repeat_parents: number;
  earnings_per_month: EarningsPerMonth[];
}


export interface TasksPerDay {
  date: string | null;
  count: number;
}

export interface BusiestDay {
  day: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface LocationDistribution {
  location: string;
  count: number;
}

export interface BabysitterDashboardStatistics {
    total_applications: number;
  accepted_applications: number;
  cancelled_applications: number;
  completed_tasks: number;
  acceptance_rate: number;
  cancellation_rate: number;
    tasks_per_day: TasksPerDay[];
  busiest_days: BusiestDay[];
  status_distribution: StatusDistribution[];
  category_distribution: CategoryDistribution[];
  location_distribution: LocationDistribution[];
    total_unique_parents: number;
  repeat_parents_count: number;
  repeat_rate: number;
    total_hours_worked: number;
  average_task_duration: number;
  average_rating: number;
  review_count: number;
    range_days: number;
}


export interface UserTotals {
  total: number;
  parents: number;
  babysitters: number;
  admins: number;
  active_parents: number;
  active_babysitters: number;
}

export interface MonthlyCount {
  month: string | null;
  count: number;
}

export interface TasksByStatus {
  unclaimed: number;
  claimed: number;
  total: number;
}

export interface ApplicationsByStatus {
  pending: number;
  accepted: number;
  rejected: number;
  total: number;
}

export interface TasksPerCategory {
  category: string;
  count: number;
}

export interface AdminStatistics {
  user_totals: UserTotals;
  new_users_per_month: MonthlyCount[];
  total_bookings: number;
  bookings_per_month: MonthlyCount[];
  tasks_by_status: TasksByStatus;
  completion_rate: number;
  cancellation_rate: number;
  average_duration_minutes: number;
  parent_to_babysitter_ratio: number;
  applications_by_status: ApplicationsByStatus;
  average_rating: number;
  total_reviews: number;
  tasks_per_category: TasksPerCategory[];
}


export async function getParentStatistics(): Promise<ParentStatistics> {
  const response = await axiosInstance.get<ParentStatistics>("/stats/parent/");
  return response.data;
}

/**
 * Get dashboard statistics for the authenticated parent with time filtering.
 * Requires role='parent'.
 * @param range - Number of days to filter (7, 14, or 30). Defaults to 7.
 */
export async function getParentDashboardStatistics(
  range: 7 | 14 | 30 = 7
): Promise<ParentDashboardStatistics> {
  const response = await axiosInstance.get<ParentDashboardStatistics>(
    `/stats/parent/dashboard/`,
    { params: { range } }
  );
  return response.data;
}

export async function getBabysitterStatistics(): Promise<BabysitterStatistics> {
  const response = await axiosInstance.get<BabysitterStatistics>("/stats/babysitter/");
  return response.data;
}

/**
 * Get dashboard statistics for the authenticated babysitter with time filtering.
 * Requires role='babysitter'.
 * @param range - Number of days to filter (7, 14, or 30). Defaults to 30.
 */
export async function getBabysitterDashboardStatistics(
  range: 7 | 14 | 30 = 30
): Promise<BabysitterDashboardStatistics> {
  const response = await axiosInstance.get<BabysitterDashboardStatistics>(
    `/stats/babysitter/dashboard/`,
    { params: { range } }
  );
  return response.data;
}

export async function getAdminStats(): Promise<AdminStatistics> {
  const response = await axiosInstance.get<AdminStatistics>("/stats/admin/");
  return response.data;
}
