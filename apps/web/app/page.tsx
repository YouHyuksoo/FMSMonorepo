/**
 * @file app/page.tsx
 * @description
 * 랜딩페이지입니다.
 * FMS 소개 및 주요 기능을 보여줍니다.
 *
 * 초보자 가이드:
 * 1. **LandingHeader**: 네비게이션 및 테마 토글
 * 2. **HeroSection**: 메인 히어로 영역
 * 3. **FeaturesSection**: 주요 기능 소개
 * 4. **StatsSection**: 성과 통계
 * 5. **ShowcaseSection**: 산업별 솔루션
 * 6. **CTASection**: 행동 유도 영역
 * 7. **LandingFooter**: 푸터
 */

import {
  LandingHeader,
  LandingFooter,
  HeroSection,
  FeaturesSection,
  StatsSection,
  ShowcaseSection,
  CTASection,
} from "@/components/landing"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <ShowcaseSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
