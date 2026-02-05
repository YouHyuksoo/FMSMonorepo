/**
 * @file apps/web/components/equipment/equipment-type-management.tsx
 * @description 설비 유형 관리 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 설비 유형(EquipmentType)의 CRUD 작업을 담당하는 컴포넌트
 *    - 설비 유형 목록 표시
 *    - 새 유형 추가/수정/삭제
 *    - 각 유형에 속성(properties) 추가/삭제
 * 2. **사용 방법**: 설비 관리 페이지에서 탭으로 렌더링됨
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼 열기/닫기, 수정/생성 모드 관리
 */

"use client";

import { useState, useEffect } from "react";
import { Icon } from "@fms/ui/icon";
import { useToast } from "@fms/ui/use-toast";
import { Button } from "@fms/ui/button";
import { Input } from "@fms/ui/input";
import { Label } from "@fms/ui/label";
import { Textarea } from "@fms/ui/textarea";
import { Checkbox } from "@fms/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@fms/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fms/ui/select";
import { DataTable } from "@/components/common/data-table";
import { EquipmentType, EquipmentProperty } from "@fms/types";
import { useTranslation } from "@/lib/language-context";
import { useCrudState } from "@/hooks/use-crud-state";

const initialEquipmentType: EquipmentType = {
  id: "",
  code: "",
  name: "",
  description: "",
  properties: [],
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

const initialEquipmentProperty: EquipmentProperty = {
  id: "",
  code: "",
  name: "",
  dataType: "string",
  required: false,
  order: 0,
};

const mockEquipmentTypes: EquipmentType[] = [
  {
    id: "type-1",
    code: "MACHINE",
    name: "기계장비",
    description: "일반적인 기계장비",
    properties: [
      {
        id: "prop-1",
        code: "MODEL",
        name: "모델명",
        dataType: "string",
        required: true,
        order: 1,
      },
      {
        id: "prop-2",
        code: "SERIAL",
        name: "시리얼번호",
        dataType: "string",
        required: true,
        order: 2,
      },
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export function EquipmentTypeManagement() {
  const { toast } = useToast();
  const { t } = useTranslation("equipment");
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [typeFormData, setTypeFormData] =
    useState<EquipmentType>(initialEquipmentType);

  // useCrudState 훅으로 CRUD 상태 관리
  const crud = useCrudState<EquipmentType>();

  useEffect(() => {
    setTypes(mockEquipmentTypes);
  }, []);

  // selectedItem이 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (crud.selectedItem) {
      setTypeFormData(crud.selectedItem);
    } else {
      setTypeFormData(initialEquipmentType);
    }
  }, [crud.selectedItem]);

  const handleTypeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTypeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeCheckboxChange = (
    name: keyof EquipmentType,
    checked: boolean
  ) => {
    setTypeFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePropertyChange = (
    index: number,
    field: keyof EquipmentProperty,
    value: string | boolean | number
  ) => {
    const newProperties = [...(typeFormData.properties || [])];
    // @ts-ignore
    newProperties[index][field] = value;
    setTypeFormData((prev) => ({ ...prev, properties: newProperties }));
  };

  const addProperty = () => {
    const newProperty: EquipmentProperty = {
      ...initialEquipmentProperty,
      id: `prop-${Date.now()}`,
      order: (typeFormData.properties?.length || 0) + 1,
    };
    setTypeFormData((prev) => ({
      ...prev,
      properties: [...(prev.properties || []), newProperty],
    }));
  };

  const removeProperty = (index: number) => {
    setTypeFormData((prev) => ({
      ...prev,
      properties: (prev.properties || []).filter((_, i) => i !== index),
    }));
  };

  const handleTypeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (crud.formMode === "edit" && crud.selectedItem) {
      setTypes(
        types.map((t) =>
          t.id === crud.selectedItem!.id
            ? {
                ...typeFormData,
                id: crud.selectedItem!.id,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      toast({ title: "성공", description: "설비 유형이 수정되었습니다." });
    } else {
      const newType = {
        ...typeFormData,
        id: `type-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTypes([...types, newType]);
      toast({
        title: "성공",
        description: "새로운 설비 유형이 추가되었습니다.",
      });
    }
    crud.setFormOpen(false);
  };

  const confirmDelete = () => {
    if (crud.itemToDelete) {
      setTypes(types.filter((t) => t.id !== crud.itemToDelete!.id));
      toast({ title: "성공", description: "설비 유형이 삭제되었습니다." });
      crud.closeDeleteDialog();
    }
  };

  const columns = [
    { key: "code", title: "코드", searchable: true },
    { key: "name", title: "이름", searchable: true },
    {
      key: "properties",
      title: "속성 수",
      render: (properties: EquipmentProperty[]) => properties?.length || 0,
    },
    {
      key: "isActive",
      title: "활성",
      render: (isActive: boolean) => (isActive ? "예" : "아니오"),
    },
  ];

  const actions = [
    {
      key: "edit",
      label: "수정",
      icon: () => <Icon name="edit" size="sm" />,
      onClick: (record: EquipmentType) => crud.handleEdit(record),
    },
    {
      key: "delete",
      label: "삭제",
      icon: () => <Icon name="delete" size="sm" />,
      onClick: (record: EquipmentType) => crud.handleDelete(record),
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">설비 유형 관리</h1>
        <p className="text-sm text-text-secondary mt-1">설비 유형을 등록하고 관리합니다.</p>
      </div>

      <div className="flex justify-end items-center mb-4">
        <Button onClick={crud.handleAdd}>
          <Icon name="add" size="sm" className="mr-2" /> 새 유형 추가
        </Button>
      </div>
      <DataTable
        data={types}
        columns={columns}
        actions={actions}
        title={t("type_title")}
        searchPlaceholder={t("type_search_placeholder")}
        showExport={true}
        showImport={true}
      />
      <Dialog open={crud.formOpen} onOpenChange={crud.setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {crud.formMode === "edit" ? t("edit_type") : t("add_type_dialog")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTypeFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">코드</Label>
                <Input
                  id="code"
                  name="code"
                  value={typeFormData.code}
                  onChange={handleTypeInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={typeFormData.name}
                  onChange={handleTypeInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                value={typeFormData.description}
                onChange={handleTypeInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={typeFormData.isActive}
                onCheckedChange={(checked) =>
                  handleTypeCheckboxChange("isActive", checked as boolean)
                }
              />
              <Label htmlFor="isActive">활성</Label>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">속성</h4>
                <Button type="button" onClick={addProperty} variant="outline">
                  속성 추가
                </Button>
              </div>
              {typeFormData.properties?.map((property, index) => (
                <div
                  key={property.id}
                  className="grid grid-cols-4 gap-4 p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Label>코드</Label>
                    <Input
                      value={property.code}
                      onChange={(e) =>
                        handlePropertyChange(index, "code", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>이름</Label>
                    <Input
                      value={property.name}
                      onChange={(e) =>
                        handlePropertyChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>데이터 타입</Label>
                    <Select
                      value={property.dataType}
                      onValueChange={(value) =>
                        handlePropertyChange(index, "dataType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">문자열</SelectItem>
                        <SelectItem value="number">숫자</SelectItem>
                        <SelectItem value="boolean">불리언</SelectItem>
                        <SelectItem value="date">날짜</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={property.required}
                        onCheckedChange={(checked) =>
                          handlePropertyChange(
                            index,
                            "required",
                            checked as boolean
                          )
                        }
                      />
                      <Label>필수</Label>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProperty(index)}
                    >
                      <Icon name="delete" size="sm" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit">
                {crud.formMode === "edit" ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
