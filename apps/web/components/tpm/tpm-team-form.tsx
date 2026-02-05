"use client"

import { useState } from "react"
import { StandardForm, type FormField, type FormGroup } from "@fms/ui/standard-form"
import { Button } from "@fms/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@fms/ui/table"
import { Input } from "@fms/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { useTranslation } from "@/lib/language-context"
import { Icon } from "@fms/ui/icon"
import type { TPMTeam, TPMTeamFormData, TPMTeamMember } from "@fms/types"

interface TPMTeamFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TPMTeamFormData) => Promise<void>
  initialData?: TPMTeam
  mode: "create" | "edit" | "view"
}

export function TPMTeamForm({ open, onOpenChange, onSubmit, initialData, mode }: TPMTeamFormProps) {
  const { t } = useTranslation("tpm")
  const { t: tCommon } = useTranslation("common")
  const [members, setMembers] = useState<TPMTeamMember[]>(initialData?.members || [])
  const [newMember, setNewMember] = useState<Partial<TPMTeamMember>>({})

  // 부서 옵션
  const departmentOptions = [
    { label: "생산1팀", value: "생산1팀" },
    { label: "생산2팀", value: "생산2팀" },
    { label: "설비관리팀", value: "설비관리팀" },
    { label: "정비1팀", value: "정비1팀" },
    { label: "정비2팀", value: "정비2팀" },
    { label: "전기팀", value: "전기팀" },
    { label: "기계팀", value: "기계팀" },
    { label: "안전환경팀", value: "안전환경팀" },
    { label: "품질관리팀", value: "품질관리팀" },
  ]

  // 요일 옵션
  const dayOptions = [
    { label: "월요일", value: "월요일" },
    { label: "화요일", value: "화요일" },
    { label: "수요일", value: "수요일" },
    { label: "목요일", value: "목요일" },
    { label: "금요일", value: "금요일" },
  ]

  // 사용자 옵션
  const userOptions: Array<{ label: string; value: string; description?: string }> = []

  // 설비 옵션
  const equipmentOptions: Array<{ label: string; value: string; description?: string }> = []

  // 역할 옵션
  const roleOptions: Array<{ label: string; value: string }> = []

  const formFields: FormField[] = [
    {
      name: "code",
      label: "분임조 코드",
      type: "text",
      required: true,
      placeholder: "TPM-TEAM-001",
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "name",
      label: "분임조명",
      type: "text",
      required: true,
      placeholder: "설비개선 1팀",
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "department",
      label: "소속 부서",
      type: "select",
      required: true,
      options: departmentOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "leader",
      label: "분임조장",
      type: "select",
      required: true,
      options: userOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "description",
      label: "분임조 설명",
      type: "textarea",
      required: true,
      placeholder: "분임조의 목적과 활동 영역을 입력하세요",
      group: "basic",
      gridColumn: "md:col-span-2",
      rows: 3,
    },
    {
      name: "equipmentArea",
      label: "담당 구역",
      type: "text",
      required: true,
      placeholder: "A동 1층 컨베이어 라인",
      group: "activity",
      gridColumn: "md:col-span-1",
    },
    {
      name: "targetEquipments",
      label: "담당 설비",
      type: "multiselect",
      required: true,
      options: equipmentOptions,
      group: "activity",
      gridColumn: "md:col-span-1",
    },
    {
      name: "establishedDate",
      label: "설립일",
      type: "date",
      required: true,
      group: "activity",
      gridColumn: "md:col-span-1",
    },
    {
      name: "meetingDay",
      label: "정기 모임 요일",
      type: "select",
      required: true,
      options: dayOptions,
      group: "activity",
      gridColumn: "md:col-span-1",
    },
    {
      name: "meetingTime",
      label: "정기 모임 시간",
      type: "time",
      required: true,
      group: "activity",
      gridColumn: "md:col-span-1",
    },
    {
      name: "meetingLocation",
      label: "모임 장소",
      type: "text",
      required: true,
      placeholder: "A동 회의실",
      group: "activity",
      gridColumn: "md:col-span-1",
    },
    {
      name: "members",
      label: "구성원 관리",
      type: "custom",
      renderInput: () => (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">분임조 구성원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>부서</TableHead>
                    <TableHead>직위</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead className="w-[100px]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{member.userName}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>
                        {roleOptions.find((role) => role.value === member.role)?.label || member.role}
                      </TableCell>
                      <TableCell>{member.joinDate}</TableCell>
                      <TableCell>
                        {mode !== "view" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setMembers(members.filter((_, i) => i !== index))
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
                  <h4 className="text-sm font-medium">구성원 추가</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Select
                        onValueChange={(value) => {
                          const selectedUser = userOptions.find((u) => u.value === value)
                          if (selectedUser) {
                            setNewMember({
                              ...newMember,
                              userId: selectedUser.value,
                              userName: selectedUser.label.split(" (")[0],
                              department: selectedUser.label.match(/\(([^)]+)\)/)?.[1] || "",
                              position: selectedUser.description || "",
                            })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="사용자 선택" />
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
                    <div>
                      <Select
                        onValueChange={(value) => {
                          setNewMember({
                            ...newMember,
                            role: value as "leader" | "facilitator" | "secretary" | "member",
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="역할 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Input
                        type="date"
                        value={newMember.joinDate || ""}
                        onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Button
                        onClick={() => {
                          if (
                            newMember.userId &&
                            newMember.userName &&
                            newMember.role &&
                            newMember.joinDate &&
                            newMember.department &&
                            newMember.position
                          ) {
                            setMembers([
                              ...members,
                              {
                                id: `temp-${Date.now()}`,
                                userId: newMember.userId,
                                userName: newMember.userName,
                                department: newMember.department,
                                position: newMember.position,
                                role: newMember.role,
                                joinDate: newMember.joinDate,
                                isActive: true,
                              },
                            ])
                            setNewMember({})
                          }
                        }}
                        disabled={
                          !newMember.userId ||
                          !newMember.userName ||
                          !newMember.role ||
                          !newMember.joinDate ||
                          !newMember.department ||
                          !newMember.position
                        }
                      >
                        <Icon name="add" size="sm" className="mr-2" />
                        추가
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ),
      group: "members",
      gridColumn: "md:col-span-2",
    },
  ]

  const formGroups: FormGroup[] = [
    {
      name: "basic",
      title: "기본 정보",
      description: "분임조의 기본 정보를 입력하세요",
    },
    {
      name: "activity",
      title: "활동 정보",
      description: "분임조의 활동 영역과 일정을 입력하세요",
    },
    {
      name: "members",
      title: "구성원 관리",
      description: "분임조 구성원을 관리합니다",
    },
  ]

  const getInitialData = () => {
    if (!initialData) return {}

    return {
      code: initialData.code,
      name: initialData.name,
      description: initialData.description,
      department: initialData.department,
      leader: initialData.leader,
      equipmentArea: initialData.equipmentArea,
      targetEquipments: initialData.targetEquipments,
      establishedDate: initialData.establishedDate,
      meetingDay: initialData.meetingDay,
      meetingTime: initialData.meetingTime,
      meetingLocation: initialData.meetingLocation,
    }
  }

  const handleSubmit = async (data: TPMTeamFormData) => {
    // 구성원 정보 추가
    const formData = {
      ...data,
      members,
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
      title={mode === "create" ? "분임조 등록" : mode === "edit" ? "분임조 수정" : "분임조 상세"}
      description={
        mode === "create"
          ? "새로운 TPM 분임조를 등록합니다."
          : mode === "edit"
            ? "분임조 정보를 수정합니다."
            : "분임조 정보를 확인합니다."
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
