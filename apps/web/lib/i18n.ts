/**
 * @file lib/i18n.ts
 * @description i18next 초기화 및 설정
 *
 * 초보자 가이드:
 * 1. **네임스페이스**: 각 JSON 파일이 하나의 네임스페이스 (common, menu, equipment 등)
 * 2. **언어 감지**: 브라우저 언어 자동 감지 + localStorage 저장
 * 3. **동적 로드**: 필요한 번역 파일만 로드 (성능 최적화)
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// 지원 언어 목록
export const supportedLanguages = [
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
] as const;

export type Language = (typeof supportedLanguages)[number]["code"];

// 사용 가능한 네임스페이스 목록
export const namespaces = [
  "common",
  "menu",
  "dashboard",
  "equipment",
  "sensor",
  "maintenance",
  "materials",
  "inspection",
  "location",
  "metering",
  "failure",
  "preventive",
  "tpm",
  "prediction",
  "login",
  "header",
  "budget_management",
  "mobile",
  "maintenanceTemplate",
  "system",
  "landing",
] as const;

export type Namespace = (typeof namespaces)[number];

// i18next 초기화
i18n
  .use(HttpBackend) // 번역 파일 동적 로드
  .use(LanguageDetector) // 브라우저 언어 감지
  .use(initReactI18next) // React 바인딩
  .init({
    // 기본 언어
    fallbackLng: "ko",

    // 지원 언어
    supportedLngs: ["ko", "en", "vi", "zh"],

    // 기본 네임스페이스
    defaultNS: "common",
    ns: ["common", "menu"],

    // 언어 감지 설정
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },

    // 백엔드 설정 (번역 파일 로드 경로)
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    // 보간 설정
    interpolation: {
      escapeValue: false, // React는 XSS 보호 내장
      formatSeparator: ",",
    },

    // React 설정
    react: {
      useSuspense: false, // SSR 호환성
    },

    // 디버그 모드 (개발 환경에서만)
    debug: process.env.NODE_ENV === "development",

    // 누락된 키 처리
    saveMissing: false,
    missingKeyHandler: (lngs, ns, key) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Missing translation: [${lngs}] ${ns}:${key}`);
      }
    },
  });

export default i18n;
