export type SupportedLanguage = "ko" | "en" | "ja" | "zh"

export interface LanguageOption {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

export interface TranslationData {
  [namespace: string]: {
    [key: string]: {
      [language in SupportedLanguage]?: string
    }
  }
}

// 번역 키 관리를 위한 타입
export interface TranslationKey {
  id: string
  key: string
  namespace: string
  description?: string
  createdAt: string
  updatedAt: string
}

// 번역 데이터 관리를 위한 타입
export interface Translation {
  id: string
  keyId: string
  language: SupportedLanguage
  value: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// 번역 진행률 타입
export interface TranslationProgress {
  language: SupportedLanguage
  totalKeys: number
  translatedKeys: number
  pendingKeys: number
  missingKeys: number
  progress: number
}

// 네임스페이스 진행률 타입
export interface NamespaceProgress {
  namespace: string
  totalKeys: number
  languageProgress: {
    language: SupportedLanguage
    progress: number
  }[]
}
