import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrganizationManagement } from "@/components/organization/organization-management"

export default function OrganizationPage() {
  return (
    <ProtectedRoute>
      <OrganizationManagement />
    </ProtectedRoute>
  )
}
