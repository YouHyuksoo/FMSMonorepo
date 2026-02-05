/**
 * @file providers/i18n-provider.tsx
 * @description i18next Provider 컴포넌트
 *
 * 초보자 가이드:
 * 1. **초기화**: 앱 시작 시 i18n 초기화
 * 2. **로딩 상태**: 번역 로드 완료까지 로딩 표시
 * 3. **Context 제공**: 하위 컴포넌트에서 useTranslation 사용 가능
 */

"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // i18n이 이미 초기화되어 있으면 바로 사용
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      // 초기화 완료 이벤트 대기
      i18n.on("initialized", () => {
        setIsInitialized(true);
      });
    }

    return () => {
      i18n.off("initialized");
    };
  }, []);

  // 초기화 전 로딩 표시 (깜빡임 방지를 위해 최소화)
  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
