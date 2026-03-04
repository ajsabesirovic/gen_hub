import type { User } from './user';

export type TaskStatus = 'open' | 'unclaimed' | 'claimed' | 'completed' | 'cancelled' | 'in_progress';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  start: string;
  end?: string | null;
  category?: Category | null;
  location?: string | null;
  formatted_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: TaskStatus;
  duration?: number | null;
  extra_dates?: Record<string, unknown> | null;
  volunteer?: string | null;
  user?: string | null;
  created_at: string;
  updated_at: string;
    applications_count?: number;
  pending_applications_count?: number;
}

export interface VolunteerDetail {
  id: string;
  name?: string | null;
  age?: string | null;
  city?: string | null;
  country?: string | null;
  profile_image?: string | null;
  role: 'babysitter';
  profile?: {
    description?: string | null;
    experience_years?: number | null;
    hourly_rate?: number | null;
    education?: string | null;
    characteristics?: string[] | null;
    drivers_license?: boolean;
    car?: boolean;
    has_children?: boolean;
    smoker?: boolean;
    preferred_babysitting_location?: string | null;
    languages?: string[] | null;
    experience_with_ages?: string[] | null;
    background_check?: boolean;
    first_aid_certified?: boolean;
    average_rating?: number | string | null;
    total_reviews?: number | null;
  } | null;
}

export interface TaskApplication {
  id: string;
  task: Task;
  volunteer: string;
  volunteer_detail: VolunteerDetail;
  status: ApplicationStatus;
  created_at: string;
}

export interface ParentDetail {
  id: string;
  name?: string | null;
  email?: string | null;
  city?: string | null;
  country?: string | null;
  profile_image?: string | null;
}

export interface TaskInvitation {
  id: string;
  task: Task;
  babysitter: string;
  parent_detail: ParentDetail;
  status: InvitationStatus;
  message?: string | null;
  created_at: string;
}

export interface TaskFilters {
  search: string;
  category: number | 'all';
  dateFrom: string | null;
  dateTo: string | null;
  status: TaskStatus | 'all';
}

export interface LegacyTask {
  id: number;
  title: string;
  description: string;
  parent: User;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  city: string;
  hourly_rate: number;
  number_of_children: number;
  children_ages: string[];
  special_requirements?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  applications_count: number;
}

export interface LegacyTaskApplication {
  id: number;
  task: LegacyTask;
  babysitter: User;
  message?: string;
  status: ApplicationStatus;
  applied_at: string;
}
