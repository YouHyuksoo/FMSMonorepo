"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { Progress } from "@fms/ui/progress"
import { Badge } from "@fms/ui/badge"
import { useTranslation, supportedLanguages } from "@/lib/language-context"

export function TranslationDashboard() {
  const { t } = useTranslation("language")

  // TODO: 실제 API에서 번역 진행률 데이터를 가져와야 함
  const progressData: { language: string; progress: number; translatedKeys: number; totalKeys: number; pendingKeys: number; missingKeys: number }[] = []
  const namespaceData: { namespace: string; totalKeys: number; languageProgress: { language: string; progress: number }[] }[] = []

  const overallProgress = progressData.length > 0 ? Math.round(progressData.reduce((sum, p) => sum + p.progress, 0) / progressData.length) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("translation_dashboard", "language", "번역 대시보드")}</h2>
        <p className="text-muted-foreground">
          {t("translation_dashboard_desc", "language", "전체 번역 진행 상황을 확인합니다")}
        </p>
      </div>

      {/* 전체 진행률 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("overall_progress", "language", "전체 진행률")}</CardTitle>
          <CardDescription>{t("overall_progress_desc", "language", "모든 언어의 평균 번역 완성도")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{overallProgress}%</div>
              <p className="text-muted-foreground">{t("completed", "language", "완료")}</p>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* 언어별 진행률 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("language_progress", "language", "언어별 진행률")}</CardTitle>
          <CardDescription>{t("language_progress_desc", "language", "각 언어의 번역 완성도")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.map((progress) => {
              const language = supportedLanguages.find((l) => l.code === progress.language)
              return (
                <div key={progress.language} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{language?.flag}</span>
                      <span className="font-medium">{language?.nativeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {progress.translatedKeys}/{progress.totalKeys}
                      </span>
                      <span className="font-bold">{progress.progress}%</span>
                    </div>
                  </div>
                  <Progress value={progress.progress} className="h-2" />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {t("completed", "language", "완료")}: {progress.translatedKeys}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      {t("pending", "language", "대기")}: {progress.pendingKeys}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      {t("missing", "language", "누락")}: {progress.missingKeys}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 네임스페이스별 진행률 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("namespace_progress", "language", "네임스페이스별 진행률")}</CardTitle>
          <CardDescription>{t("namespace_progress_desc", "language", "기능 영역별 번역 완성도")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {namespaceData.map((namespace) => (
              <div key={namespace.namespace} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{namespace.namespace}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {namespace.totalKeys} {t("keys", "language", "키")}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {namespace.languageProgress.map((langProgress) => {
                    const language = supportedLanguages.find((l) => l.code === langProgress.language)
                    return (
                      <div key={langProgress.language} className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-1">
                          <span>{language?.flag}</span>
                          <span className="text-sm font-medium">{language?.code.toUpperCase()}</span>
                        </div>
                        <Progress value={langProgress.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">{langProgress.progress}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
