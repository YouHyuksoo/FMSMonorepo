"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Badge } from "@fms/ui/badge"
import { Progress } from "@fms/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@fms/ui/table"
import { Icon } from "@fms/ui/icon"

// Mock 데이터
const mockTranslationKeys = [
  { id: "1", key: "save", namespace: "common", description: "저장 버튼", completionRate: 100 },
  { id: "2", key: "cancel", namespace: "common", description: "취소 버튼", completionRate: 75 },
  { id: "3", key: "equipment_name", namespace: "equipment", description: "설비명", completionRate: 50 },
  { id: "4", key: "dashboard_title", namespace: "dashboard", description: "대시보드 제목", completionRate: 25 },
]

const mockTranslations = {
  "1": { ko: "저장", en: "Save", ja: "保存", zh: "" },
  "2": { ko: "취소", en: "Cancel", ja: "", zh: "" },
  "3": { ko: "설비명", en: "", ja: "", zh: "" },
  "4": { ko: "대시보드", en: "", ja: "", zh: "" },
}

const languages = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
]

export default function LanguageManagementPage() {
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [translations, setTranslations] = useState(mockTranslations)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editKeyData, setEditKeyData] = useState({ key: "", namespace: "", description: "" })
  const [translationKeys, setTranslationKeys] = useState(mockTranslationKeys)

  const handleEdit = (keyId: string, language: string, currentValue: string) => {
    setEditingCell(`${keyId}-${language}`)
    setEditValue(currentValue)
  }

  const handleSave = (keyId: string, language: string) => {
    setTranslations((prev) => ({
      ...prev,
      [keyId]: {
        ...prev[keyId],
        [language]: editValue,
      },
    }))
    setEditingCell(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const getCompletionRate = (keyId: string) => {
    const translation = translations[keyId]
    if (!translation) return 0
    const totalLanguages = languages.length
    const completedLanguages = languages.filter((lang) => translation[lang.code]?.trim()).length
    return Math.round((completedLanguages / totalLanguages) * 100)
  }

  const getOverallProgress = () => {
    const totalKeys = mockTranslationKeys.length
    const totalTranslations = totalKeys * languages.length
    let completedTranslations = 0

    mockTranslationKeys.forEach((key) => {
      const translation = translations[key.id]
      if (translation) {
        languages.forEach((lang) => {
          if (translation[lang.code]?.trim()) {
            completedTranslations++
          }
        })
      }
    })

    return Math.round((completedTranslations / totalTranslations) * 100)
  }

  const handleEditKey = (keyData: any) => {
    setEditingKey(keyData.id)
    setEditKeyData({
      key: keyData.key,
      namespace: keyData.namespace,
      description: keyData.description,
    })
  }

  const handleSaveKey = (keyId: string) => {
    setTranslationKeys((prev) => prev.map((key) => (key.id === keyId ? { ...key, ...editKeyData } : key)))
    setEditingKey(null)
    setEditKeyData({ key: "", namespace: "", description: "" })
  }

  const handleCancelEditKey = () => {
    setEditingKey(null)
    setEditKeyData({ key: "", namespace: "", description: "" })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="language" size="sm" className="h-6 w-6" />
        <h1 className="text-2xl font-bold">다국어 관리</h1>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">대시보드</TabsTrigger>
          <TabsTrigger value="keys">번역 키 관리</TabsTrigger>
          <TabsTrigger value="translations">번역 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 진행률</CardTitle>
                <Icon name="language" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getOverallProgress()}%</div>
                <Progress value={getOverallProgress()} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">번역 키</CardTitle>
                <Icon name="description" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTranslationKeys.length}</div>
                <p className="text-xs text-muted-foreground">총 번역 키 수</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">지원 언어</CardTitle>
                <Icon name="language" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{languages.length}</div>
                <p className="text-xs text-muted-foreground">지원하는 언어 수</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>언어별 진행률</CardTitle>
              <CardDescription>각 언어별 번역 완성도를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languages.map((language) => {
                  const completedKeys = mockTranslationKeys.filter((key) =>
                    translations[key.id]?.[language.code]?.trim(),
                  ).length
                  const progress = Math.round((completedKeys / mockTranslationKeys.length) * 100)

                  return (
                    <div key={language.code} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-32">
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                      </div>
                      <Progress value={progress} className="flex-1" />
                      <span className="text-sm font-medium w-12">{progress}%</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>번역 키 관리</CardTitle>
              <CardDescription>번역 키를 추가, 수정, 삭제할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input placeholder="번역 키 검색..." className="max-w-sm" />
                <Button>
                  <Icon name="add" size="sm" className="mr-2" />새 번역 키
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>키</TableHead>
                    <TableHead>네임스페이스</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>완성도</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {translationKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-mono">
                        {editingKey === key.id ? (
                          <Input
                            value={editKeyData.key}
                            onChange={(e) => setEditKeyData((prev) => ({ ...prev, key: e.target.value }))}
                            className="h-8"
                          />
                        ) : (
                          key.key
                        )}
                      </TableCell>
                      <TableCell>
                        {editingKey === key.id ? (
                          <Input
                            value={editKeyData.namespace}
                            onChange={(e) => setEditKeyData((prev) => ({ ...prev, namespace: e.target.value }))}
                            className="h-8"
                          />
                        ) : (
                          <Badge variant="outline">{key.namespace}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingKey === key.id ? (
                          <Input
                            value={editKeyData.description}
                            onChange={(e) => setEditKeyData((prev) => ({ ...prev, description: e.target.value }))}
                            className="h-8"
                          />
                        ) : (
                          key.description
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={getCompletionRate(key.id)} className="w-16" />
                          <span className="text-sm">{getCompletionRate(key.id)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {editingKey === key.id ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleSaveKey(key.id)}>
                                <Icon name="save" size="sm" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleCancelEditKey}>
                                <Icon name="close" size="sm" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleEditKey(key)}>
                                <Icon name="edit" size="sm" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="delete" size="sm" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>번역 관리</CardTitle>
              <CardDescription>각 언어별 번역을 편집할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>키</TableHead>
                    {languages.map((lang) => (
                      <TableHead key={lang.code}>
                        <div className="flex items-center space-x-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTranslationKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-mono">{key.key}</TableCell>
                      {languages.map((lang) => {
                        const cellId = `${key.id}-${lang.code}`
                        const isEditing = editingCell === cellId
                        const value = translations[key.id]?.[lang.code] || ""

                        return (
                          <TableCell key={lang.code}>
                            {isEditing ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-8"
                                />
                                <Button size="sm" onClick={() => handleSave(key.id, lang.code)}>
                                  <Icon name="save" size="sm" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancel}>
                                  <Icon name="close" size="sm" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-muted p-2 rounded min-h-[2rem] flex items-center"
                                onClick={() => handleEdit(key.id, lang.code, value)}
                              >
                                {value || <span className="text-muted-foreground italic">번역 없음</span>}
                              </div>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
