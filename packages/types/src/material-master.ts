export interface MaterialCategory {
  id: string
  code: string
  name: string
  description: string
  level: "major" | "middle" | "minor"
  parentId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MaterialCodeRule {
  id: string
  categoryId: string
  prefix: string
  pattern: string
  description: string
  example: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MaterialAttributeTemplate {
  id: string
  categoryId: string
  name: string
  dataType: "text" | "number" | "select" | "date" | "boolean"
  isRequired: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApprovalWorkflow {
  id: string
  name: string
  steps: ApprovalStep[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApprovalStep {
  id: string
  stepNumber: number
  name: string
  approverRole: string
  isRequired: boolean
  description: string
}
