export interface CodeGroup {
  id: string;
  groupCode: string;
  groupName: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  codeCount?: number;
}

export interface Code {
  id: string;
  groupId: string;
  groupCode: string;
  groupName: string;
  code: string;
  name: string;
  description?: string;
  value?: string;
  parentCode?: string;
  parentName?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  attributes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CodeGroupFormData {
  groupCode: string;
  groupName: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CodeFormData {
  groupId: string;
  code: string;
  name: string;
  description?: string;
  value?: string;
  parentCode?: string;
  sortOrder: number;
  isActive: boolean;
  attributes?: Record<string, any>;
}
