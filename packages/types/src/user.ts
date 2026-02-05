export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  level: "admin" | "manager" | "user" | "viewer";
  department: string;
  departmentId: string;
  position: string;
  company: string;
  companyId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  permissions?: string[];
  profileImage?: string;
}

export interface UserFormData {
  username: string;
  email: string;
  name: string;
  phone?: string;
  level: "admin" | "manager" | "user" | "viewer";
  departmentId: string;
  position: string;
  companyId: string;
  isActive: boolean;
  permissions?: string[];
  password?: string;
  confirmPassword?: string;
}

export interface UserFilter {
  level?: string;
  department?: string;
  company?: string;
  isActive?: boolean;
  searchTerm?: string;
}
