export type UserRole = 'parent' | 'babysitter' | 'admin' | null;

export interface ParentProfile {
  id?: number;
  street?: string | null;
  apartment_number?: string | null;
  city?: string | null;
  country?: string | null;
    formatted_address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  number_of_children?: number | null;
  children_ages?: string[] | string | null;
  has_special_needs?: boolean | null;
  special_needs_description?: string | null;
  description?: string | null;
  preferred_babysitting_location?: 'parents_home' | 'babysitters_home' | 'flexible' | null;
  preferred_languages?: string[] | null;
  preferred_experience_years?: number | null;
  preferred_experience_with_ages?: string[] | null;
  smoking_allowed?: boolean | null;
  pets_in_home?: boolean | null;
  additional_notes?: string | null;
}

export interface BabysitterProfile {
  id?: number;
  description?: string | null;
  characteristics?: string[] | null;
  experience_years?: number | null;
  hourly_rate?: number | null;
  education?: string | null;
  drivers_license?: boolean;
  car?: boolean;
  has_children?: boolean;
  smoker?: boolean;
  street?: string | null;
  apartment_number?: string | null;
    formatted_address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  preferred_babysitting_location?: 'parents_home' | 'babysitters_home' | 'flexible' | null;
  languages?: string[] | null;
  experience_with_ages?: string[] | null;
  background_check?: boolean;
  background_check_status?: 'verified' | 'pending' | 'not_verified' | string;
  first_aid_certified?: boolean | string;
    average_rating?: number | string | null;
  total_reviews?: number | null;
}

export interface User {
  id: string | number;
  email: string;
  username?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  age?: number | string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  role?: UserRole;
  profile_image?: string | null;
  image?: string | null;
  is_staff?: boolean;
  is_superuser?: boolean;
  profile?: ParentProfile | BabysitterProfile | null;
  profileCompleted?: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
