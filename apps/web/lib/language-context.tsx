/**
 * @file lib/language-context.tsx
 * @description i18next 기반 다국어 Context (하위 호환성 유지)
 *
 * 초보자 가이드:
 * 1. **useTranslation**: react-i18next의 훅을 래핑하여 기존 API 유지
 * 2. **useLanguage**: 언어 전환 기능 제공
 * 3. **supportedLanguages**: 지원 언어 목록 export
 *
 * 마이그레이션 노트:
 * - 기존 커스텀 구현에서 i18next로 마이그레이션
 * - 기존 useTranslation, useLanguage 훅 API 유지
 * - LanguageProvider는 더 이상 필요 없음 (I18nProvider 사용)
 */

"use client";

import { useTranslation as useI18nTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import type { Namespace } from "@/lib/i18n";

// 타입 재export
export type Language = "ko" | "en" | "vi" | "zh";

// 지원 언어 목록
export const supportedLanguages = [
  { code: "ko" as const, name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "en" as const, name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "vi" as const, name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "zh" as const, name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
] as const;

/**
 * useTranslation 훅 (하위 호환성 유지)
 *
 * @param namespace - 번역 네임스페이스 (기본값: "common")
 * @returns { t } - 번역 함수
 *
 * @example
 * const { t } = useTranslation("equipment");
 * return <h1>{t("title")}</h1>;
 *
 * // 파라미터 사용
 * t("validation.required", { field: "이름" })
 */
export function useTranslation(namespace: Namespace | string = "common") {
  const { t: i18nT, ready } = useI18nTranslation(namespace);

  // 기존 API와 호환되는 t 함수
  const t = (key: string, params?: Record<string, any>): string => {
    if (!ready) {
      return key;
    }
    return i18nT(key, params) as string;
  };

  return { t, ready };
}

/**
 * useLanguage 훅 - 언어 전환 기능
 *
 * @returns { currentLanguage, setLanguage }
 *
 * @example
 * const { currentLanguage, setLanguage } = useLanguage();
 * setLanguage("en"); // 영어로 전환
 */
export function useLanguage() {
  const currentLanguage = (i18n.language || "ko") as Language;

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    // localStorage는 i18n language detector가 자동 처리
  };

  return {
    currentLanguage,
    setLanguage,
  };
}

/**
 * @deprecated LanguageProvider는 더 이상 필요 없습니다.
 * I18nProvider를 사용하세요.
 *
 * 하위 호환성을 위해 빈 래퍼로 유지합니다.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // I18nProvider가 이미 상위에서 감싸고 있으므로 children만 반환
  return <>{children}</>;
}
