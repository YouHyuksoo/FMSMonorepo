/**
 * @file apps/web/components/language/translation-key-management.tsx
 * @description 번역 키 관리 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 시스템에서 사용하는 번역 키를 관리하는 페이지
 *    - 번역 키 목록 조회, 검색, 필터링
 *    - 네임스페이스별 분류
 *    - 번역 완성도 표시
 * 2. **사용 방법**: LanguageManagement 페이지에서 탭으로 렌더링됨
 * 3. **CRUD 작업**: useCrudState 훅을 사용하여 추가/수정/삭제 상태 관리
 */

"use client"

import { useState } from "react"
import { Icon } from "@fms/ui/icon"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Badge } from "@fms/ui/badge"
import { DataTable } from "@/components/common/data-table"
import { useTranslation } from "@/lib/language-context"
import { useCrudState } from "@/hooks/use-crud-state"
import type { TranslationKey, Translation } from "@fms/types"

export function TranslationKeyManagement() {
  const { t } = useTranslation("language")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all")

  // CRUD 상태 관리
  const crud = useCrudState<TranslationKey>()

  // 번역 키 및 번역 데이터 (실제 API 연동 시 대체 필요)
  const translationKeys: TranslationKey[] = []
  const translations: Translation[] = []

  // 네임스페이스 목록
  const namespaces = ["all", ...new Set(translationKeys.map((k) => k.namespace))]

  // 필터링된 번역 키
  const filteredKeys = translationKeys.filter((key) => {
    const matchesSearch =
      key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.namespace.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (key.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesNamespace = selectedNamespace === "all" || key.namespace === selectedNamespace
    return matchesSearch && matchesNamespace
  })

  // 번역 키별 번역 완성도 계산
  const getKeyCompleteness = (keyId: string) => {
    const keyTranslations = translations.filter((t) => t.keyId === keyId)
    const approvedTranslations = keyTranslations.filter((t) => t.isApproved)
    return {
      total: 4, // 지원 언어 수
      completed: approvedTranslations.length,
      pending: keyTranslations.length - approvedTranslations.length,
    }
  }

  const columns = [
    {
      accessorKey: "namespace",
      header: t("namespace", "language", "네임스페이스"),
      cell: ({ row }: { row: { original: TranslationKey } }) => (
        <Badge variant="outline">{row.original.namespace}</Badge>
      ),
    },
    {
      accessorKey: "key",
      header: t("translation_key", "language", "번역 키"),
      cell: ({ row }: { row: { original: TranslationKey } }) => (
        <code className="text-sm bg-muted px-2 py-1 rounded">{row.original.key}</code>
      ),
    },
    {
      accessorKey: "description",
      header: t("description", "common", "설명"),
    },
    {
      accessorKey: "completeness",
      header: t("translation_status", "language", "번역 상태"),
      cell: ({ row }: { row: { original: TranslationKey } }) => {
        const completeness = getKeyCompleteness(row.original.id)
        const percentage = Math.round((completeness.completed / completeness.total) * 100)

        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-sm text-muted-foreground">
              {completeness.completed}/{completeness.total}
            </span>
            {completeness.pending > 0 && (
              <Badge variant="secondary" className="text-xs">
                {completeness.pending} 대기
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "actions",
      header: t("actions", "common", "작업"),
      cell: ({ row }: { row: { original: TranslationKey } }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => crud.handleEdit(row.original)}>
            <Icon name="edit" size="sm" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => crud.handleView(row.original)}>
            <Icon name="description" size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => crud.handleDelete(row.original)}
          >
            <Icon name="delete" size="sm" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("translation_key_management", "language", "번역 키 관리")}</h2>
          <p className="text-muted-foreground">
            {t("translation_key_management_desc", "language", "시스템에서 사용하는 번역 키를 관리합니다")}
          </p>
        </div>
        <Button onClick={crud.handleAdd}>
          <Icon name="add" size="sm" className="mr-2" />
          {t("add_translation_key", "language", "번역 키 추가")}
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("total_keys", "language", "총 키 수")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translationKeys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("namespaces", "language", "네임스페이스")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{namespaces.length - 1}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("completed_translations", "language", "완료된 번역")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {translations.filter((t) => t.isApproved).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pending_translations", "language", "대기 중인 번역")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {translations.filter((t) => !t.isApproved).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search_keys", "language", "번역 키 검색...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedNamespace}
          onChange={(e) => setSelectedNamespace(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          {namespaces.map((namespace) => (
            <option key={namespace} value={namespace}>
              {namespace === "all" ? t("all_namespaces", "language", "모든 네임스페이스") : namespace}
            </option>
          ))}
        </select>
      </div>

      {/* 데이터 테이블 */}
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={filteredKeys} searchKey="key" />
        </CardContent>
      </Card>

      {/* TODO: 폼 다이얼로그 추가 시 아래 주석 해제
      <TranslationKeyFormDialog
        open={crud.formOpen}
        mode={crud.formMode}
        translationKey={crud.selectedItem}
        onOpenChange={crud.setFormOpen}
      />

      <DeleteConfirmDialog
        open={crud.deleteDialogOpen}
        onOpenChange={crud.setDeleteDialogOpen}
        onConfirm={() => {
          // 삭제 로직 구현
          crud.closeDeleteDialog()
        }}
        title="번역 키 삭제"
        description={`"${crud.itemToDelete?.key}" 키를 삭제하시겠습니까?`}
      />
      */}
    </div>
  )
}
