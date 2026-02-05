export interface Organization {
  id: string;
  code: string;
  name: string;
  type: "company" | "department" | "team";
  parentId?: string;
  parentName?: string;
  level: number;
  sortOrder: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface OrganizationFormData {
  code: string;
  name: string;
  type: "company" | "department" | "team";
  parentId?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}
