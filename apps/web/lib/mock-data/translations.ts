import type { TranslationKey, Translation, SupportedLanguage } from "@fms/types"

// 번역 키 Mock 데이터
export const mockTranslationKeys: TranslationKey[] = [
  {
    id: "1",
    key: "save",
    namespace: "common",
    description: "저장 버튼 텍스트",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    key: "cancel",
    namespace: "common",
    description: "취소 버튼 텍스트",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    key: "title",
    namespace: "dashboard",
    description: "대시보드 제목",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    key: "equipment_name",
    namespace: "equipment",
    description: "설비명 라벨",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

// 번역 Mock 데이터
export const mockTranslations: Translation[] = [
  // common.save
  {
    id: "1",
    keyId: "1",
    language: "ko",
    value: "저장",
    isApproved: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "2",
    keyId: "1",
    language: "en",
    value: "Save",
    isApproved: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "3",
    keyId: "1",
    language: "ja",
    value: "保存",
    isApproved: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "4",
    keyId: "1",
    language: "zh",
    value: "保存",
    isApproved: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "translator",
    updatedBy: "translator",
  },
  // common.cancel
  {
    id: "5",
    keyId: "2",
    language: "ko",
    value: "취소",
    isApproved: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "6",
    keyId: "2",
    language: "en",
    value: "Cancel",
    isApproved: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
  },
  // dashboard.title (일부 번역 누락)
  {
    id: "7",
    keyId: "3",
    language: "ko",
    value: "대시보드",
    isApproved: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "8",
    keyId: "3",
    language: "en",
    value: "Dashboard",
    isApproved: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
  },
]

// 번역 진행률 계산 함수
export function getTranslationProgress() {
  const languages: SupportedLanguage[] = ["ko", "en", "ja", "zh"]
  const totalKeys = mockTranslationKeys.length

  return languages.map((language) => {
    const translatedKeys = mockTranslations.filter((t) => t.language === language && t.isApproved).length

    const pendingKeys = mockTranslations.filter((t) => t.language === language && !t.isApproved).length

    const missingKeys = totalKeys - mockTranslations.filter((t) => t.language === language).length

    return {
      language,
      totalKeys,
      translatedKeys,
      pendingKeys,
      missingKeys,
      progress: Math.round((translatedKeys / totalKeys) * 100),
    }
  })
}

// 네임스페이스별 번역 진행률
export function getNamespaceProgress() {
  const namespaces = [...new Set(mockTranslationKeys.map((k) => k.namespace))]
  const languages: SupportedLanguage[] = ["ko", "en", "ja", "zh"]

  return namespaces.map((namespace) => {
    const namespaceKeys = mockTranslationKeys.filter((k) => k.namespace === namespace)
    const totalKeys = namespaceKeys.length

    const languageProgress = languages.map((language) => {
      const translatedKeys = mockTranslations.filter(
        (t) => namespaceKeys.some((k) => k.id === t.keyId) && t.language === language && t.isApproved,
      ).length

      return {
        language,
        progress: Math.round((translatedKeys / totalKeys) * 100),
      }
    })

    return {
      namespace,
      totalKeys,
      languageProgress,
    }
  })
}
