"use client"

import { useState } from "react"
import { StandardForm, type FormField, type FormGroup } from "@fms/ui/standard-form"
import { Button } from "@fms/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@fms/ui/table"
import { Input } from "@fms/ui/input"
import { Textarea } from "@fms/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { mockTPMTeams, tpmActivityTypes, tpmPillars } from "@/lib/mock-data/tpm"
import { mockUsers } from "@/lib/mock-data/users"
import { mockEquipment } from "@/lib/mock-data/equipment"
import { useTranslation } from "@/lib/language-context"
import { Icon } from "@fms/ui/icon"
import type { TPMActivity, TPMActivityFormData, TPMGoal, TPMSubActivity } from "@fms/types"

interface TPMActivityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TPMActivityFormData) => Promise<void>
  initialData?: TPMActivity
  mode: "create" | "edit" | "view"
}

export function TPMActivityForm({ open, onOpenChange, onSubmit, initialData, mode }: TPMActivityFormProps) {
  const { t } = useTranslation("tpm")
  const { t: tCommon } = useTranslation("common")
  const [goals, setGoals] = useState<TPMGoal[]>(initialData?.goals || [])
  const [activities, setActivities] = useState<TPMSubActivity[]>(initialData?.activities || [])
  const [newGoal, setNewGoal] = useState<Partial<TPMGoal>>({})
  const [newActivity, setNewActivity] = useState<Partial<TPMSubActivity>>({})

  // 분임조 옵션
  const teamOptions = mockTPMTeams.map((team) => ({
    label: team.name,
    value: team.id,
    description: team.department,
  }))

  // 활동 유형 옵션
  const activityTypeOptions = tpmActivityTypes.map((type) => ({
    label: type.label,
    value: type.value,
  }))

  // TPM 기둥 옵션
  const pillarOptions = tpmPillars.map((pillar) => ({
    label: pillar.label,
    value: pillar.value,
  }))

  // 우선순위 옵션
  const priorityOptions = [
    { label: "높음", value: "high" },
    { label: "보통", value: "normal" },
    { label: "낮음", value: "low" },
  ]

  // 설비 옵션
  const equipmentOptions = mockEquipment.map((eq) => ({
    label: `${eq.code} - ${eq.name}`,
    value: eq.id,
    description: eq.location,
  }))

  // 사용자 옵션
  const userOptions = mockUsers.map((user) => ({
    label: `${user.name} (${user.department})`,
    value: user.id,
    description: user.position,
  }))

  const formFields: FormField[] = [
    {
      name: "title",
      label: "활동 제목",
      type: "text",
      required: true,
      placeholder: "TPM 활동 제목을 입력하세요",
      group: "basic",
      gridColumn: "md:col-span-2",
    },
    {
      name: "teamId",
      label: "담당 분임조",
      type: "select",
      required: true,
      options: teamOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "activityType",
      label: "활동 유형",
      type: "select",
      required: true,
      options: activityTypeOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "pillar",
      label: "TPM 기둥",
      type: "select",
      required: true,
      options: pillarOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "priority",
      label: "우선순위",
      type: "select",
      required: true,
      options: priorityOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "description",
      label: "활동 설명",
      type: "textarea",
      required: true,
      placeholder: "TPM 활동에 대한 상세 설명을 입력하세요",
      group: "basic",
      gridColumn: "md:col-span-2",
      rows: 3,
    },
    {
      name: "equipmentIds",
      label: "대상 설비",
      type: "multiselect",
      required: true,
      options: equipmentOptions,
      group: "details",
      gridColumn: "md:col-span-1",
    },
    {
      name: "location",
      label: "활동 장소",
      type: "text",
      required: true,
      placeholder: "A동 1층",
      group: "details",
      gridColumn: "md:col-span-1",
    },
    {
      name: "startDate",
      label: "시작일",
      type: "date",
      required: true,
      group: "details",
      gridColumn: "md:col-span-1",
    },
    {
      name: "endDate",
      label: "종료일",
      type: "date",
      required: true,
      group: "details",
      gridColumn: "md:col-span-1",
    },
    {
      name: "goals",
      label: "활동 목표",
      type: "custom",
      renderInput: () => (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">활동 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>목표명</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>목표값</TableHead>
                    <TableHead>단위</TableHead>
                    <TableHead className="w-[100px]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.map((goal, index) => (
                    <TableRow key={index}>
                      <TableCell>{goal.title}</TableCell>
                      <TableCell>{goal.description}</TableCell>
                      <TableCell>{goal.targetValue}</TableCell>
                      <TableCell>{goal.unit}</TableCell>
                      <TableCell>
                        {mode !== "view" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setGoals(goals.filter((_, i) => i !== index))
                            }}
                          >
                            <Icon name="delete" size="sm" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {mode !== "view" && (
                <div className="flex flex-col space-y-4 border rounded-md p-4">
                  <h4 className="text-sm font-medium">목표 추가</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Input
                        placeholder="목표명"
                        value={newGoal.title || ""}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        placeholder="설명"
                        value={newGoal.description || ""}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="목표값"
                        value={newGoal.targetValue || ""}
                        onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="단위"
                        value={newGoal.unit || ""}
                        onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      />
                      <Button
                        onClick={() => {
                          if (newGoal.title && newGoal.targetValue && newGoal.unit) {
                            setGoals([
                              ...goals,
                              {
                                id: `temp-${Date.now()}`,
                                title: newGoal.title,
                                description: newGoal.description || "",
                                targetValue: newGoal.targetValue,
                                currentValue: 0,
                                unit: newGoal.unit,
                                achievementRate: 0,
                              },
                            ])
                            setNewGoal({})
                          }
                        }}
                        disabled={!newGoal.title || !newGoal.targetValue || !newGoal.unit}
                      >
                        <Icon name="add" size="sm" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ),
      group: "goals",
      gridColumn: "md:col-span-2",
    },
    {
      name: "activities",
      label: "세부 활동",
      type: "custom",
      renderInput: () => (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">세부 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">단계</TableHead>
                    <TableHead>활동명</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>담당자</TableHead>
                    <TableHead>시작일</TableHead>
                    <TableHead>종료일</TableHead>
                    <TableHead className="w-[80px]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.step}</TableCell>
                      <TableCell>{activity.title}</TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>{activity.assignedToName}</TableCell>
                      <TableCell>{activity.plannedStartDate}</TableCell>
                      <TableCell>{activity.plannedEndDate}</TableCell>
                      <TableCell>
                        {mode !== "view" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setActivities(activities.filter((_, i) => i !== index))
                            }}
                          >
                            <Icon name="delete" size="sm" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {mode !== "view" && (
                <div className="flex flex-col space-y-4 border rounded-md p-4">
                  <h4 className="text-sm font-medium">세부 활동 추가</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="단계"
                        className="w-20"
                        value={newActivity.step || ""}
                        onChange={(e) => setNewActivity({ ...newActivity, step: Number(e.target.value) })}
                      />
                      <Input
                        placeholder="활동명"
                        value={newActivity.title || ""}
                        onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="설명"
                        value={newActivity.description || ""}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Select
                        onValueChange={(value) => {
                          const user = mockUsers.find((u) => u.id === value)
                          if (user) {
                            setNewActivity({
                              ...newActivity,
                              assignedTo: user.id,
                              assignedToName: user.name,
                            })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="담당자 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {userOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="date"
                          placeholder="시작일"
                          value={newActivity.plannedStartDate || ""}
                          onChange={(e) => setNewActivity({ ...newActivity, plannedStartDate: e.target.value })}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="date"
                          placeholder="종료일"
                          value={newActivity.plannedEndDate || ""}
                          onChange={(e) => setNewActivity({ ...newActivity, plannedEndDate: e.target.value })}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (
                            newActivity.step &&
                            newActivity.title &&
                            newActivity.assignedTo &&
                            newActivity.assignedToName &&
                            newActivity.plannedStartDate &&
                            newActivity.plannedEndDate
                          ) {
                            setActivities([
                              ...activities,
                              {
                                id: `temp-${Date.now()}`,
                                step: newActivity.step,
                                title: newActivity.title,
                                description: newActivity.description || "",
                                assignedTo: newActivity.assignedTo,
                                assignedToName: newActivity.assignedToName,
                                plannedStartDate: newActivity.plannedStartDate,
                                plannedEndDate: newActivity.plannedEndDate,
                                status: "planned",
                              },
                            ])
                            setNewActivity({})
                          }
                        }}
                        disabled={
                          !newActivity.step ||
                          !newActivity.title ||
                          !newActivity.assignedTo ||
                          !newActivity.plannedStartDate ||
                          !newActivity.plannedEndDate
                        }
                      >
                        <Icon name="add" size="sm" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ),
      group: "activities",
      gridColumn: "md:col-span-2",
    },
  ]

  const formGroups: FormGroup[] = [
    {
      name: "basic",
      title: "기본 정보",
      description: "TPM 활동의 기본 정보를 입력하세요",
    },
    {
      name: "details",
      title: "상세 정보",
      description: "활동 대상 및 일정을 입력하세요",
    },
    {
      name: "goals",
      title: "활동 목표",
      description: "TPM 활동의 목표를 설정하세요",
    },
    {
      name: "activities",
      title: "세부 활동",
      description: "TPM 활동의 세부 단계를 계획하세요",
    },
  ]

  const getInitialData = () => {
    if (!initialData) return {}

    return {
      title: initialData.title,
      description: initialData.description,
      teamId: initialData.teamId,
      activityType: initialData.activityType,
      pillar: initialData.pillar,
      priority: initialData.priority,
      equipmentIds: initialData.equipmentIds,
      location: initialData.location,
      startDate: initialData.startDate,
      endDate: initialData.endDate,
    }
  }

  const handleSubmit = async (data: TPMActivityFormData) => {
    // 목표와 세부 활동 정보 추가
    const formData = {
      ...data,
      goals,
      activities,
    }
    await onSubmit(formData)
  }

  return (
    <StandardForm
      fields={formFields}
      groups={formGroups}
      initialData={getInitialData()}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      mode={mode}
      title={mode === "create" ? "TPM 활동 등록" : mode === "edit" ? "TPM 활동 수정" : "TPM 활동 상세"}
      description={
        mode === "create"
          ? "새로운 TPM 활동을 등록합니다."
          : mode === "edit"
            ? "TPM 활동 정보를 수정합니다."
            : "TPM 활동 정보를 확인합니다."
      }
      submitText={mode === "create" ? "등록" : mode === "edit" ? "수정" : tCommon("confirm")}
      open={open}
      onOpenChange={onOpenChange}
      showInDialog={true}
      layout="tabs"
      maxWidth="900px"
    />
  )
}
