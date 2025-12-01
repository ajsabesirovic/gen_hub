export type UserRole = 'volunteer' | 'senior' | 'admin' | null;

export interface User {
  id: number;
  email: string;
  name?: string | null;
  age?: number | string | null;
  phone?: string | null;
  street?: string | null;
  house_number?: string | null;
  city?: string | null;
  country?: string | null;
  role?: UserRole;
  image?: string | null;
  profileCompleted?: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


