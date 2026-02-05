import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserManagement } from "@/components/user/user-management"

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UserManagement />
    </ProtectedRoute>
  )
}
