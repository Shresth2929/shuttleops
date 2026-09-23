export type UserRole = 'Operations Manager' | 'Campus Admin' | 'Student' | 'Faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  campusLocation: string; // e.g. "North Campus — Tech Hub"
}
