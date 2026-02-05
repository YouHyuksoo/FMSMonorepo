import { ProtectedRoute } from "@/components/auth/protected-route"
import { CodeManagement } from "@/components/code/code-management"

export default function CodesPage() {
  return (
    <ProtectedRoute>
      <CodeManagement />
    </ProtectedRoute>
  )
}
