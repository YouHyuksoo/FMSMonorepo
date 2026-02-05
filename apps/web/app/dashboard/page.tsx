/**
 * @file app/dashboard/page.tsx
 * @description
 * 대시보드 메인 페이지입니다.
 * 로그인한 사용자만 접근할 수 있습니다.
 *
 * 초보자 가이드:
 * 1. **ProtectedRoute**: 인증된 사용자만 접근 가능
 * 2. **DashboardLayout**: layout.tsx에서 자동 적용됨
 * 3. **Dashboard**: 대시보드 메인 컴포넌트
 */

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Dashboard } from "@/components/dashboard/dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
