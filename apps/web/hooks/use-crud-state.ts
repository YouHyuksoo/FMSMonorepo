/**
 * @file apps/web/hooks/use-crud-state.ts
 * @description CRUD 작업을 위한 상태 관리 커스텀 훅
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 폼 열기/닫기, 생성/수정/조회 모드, 삭제 다이얼로그 등
 *    CRUD 작업에 필요한 UI 상태를 한 곳에서 관리
 * 2. **사용 방법**:
 *    ```tsx
 *    const crud = useCrudState<Equipment>();
 *
 *    // 생성 폼 열기
 *    crud.handleAdd();
 *
 *    // 수정 폼 열기 (아이템 전달)
 *    crud.handleEdit(equipment);
 *
 *    // 삭제 다이얼로그 열기
 *    crud.handleDelete(equipment);
 *    ```
 * 3. **제네릭 타입**: 어떤 엔티티 타입이든 사용 가능 (Equipment, Material 등)
 */

"use client";

import { useState, useCallback } from "react";

/**
 * 폼 모드 타입
 * - create: 새 항목 생성
 * - edit: 기존 항목 수정
 * - view: 항목 상세 조회 (읽기 전용)
 */
export type FormMode = "create" | "edit" | "view";

/**
 * CRUD 상태 훅의 반환 타입
 */
export interface CrudState<T> {
  // 폼 상태
  formOpen: boolean;
  formMode: FormMode;
  selectedItem: T | null;

  // 삭제 다이얼로그 상태
  deleteDialogOpen: boolean;
  itemToDelete: T | null;

  // 가져오기/내보내기 상태
  importExportOpen: boolean;

  // 폼 핸들러
  handleAdd: () => void;
  handleEdit: (item: T) => void;
  handleView: (item: T) => void;
  setFormOpen: (open: boolean) => void;

  // 삭제 핸들러
  handleDelete: (item: T) => void;
  closeDeleteDialog: () => void;
  setDeleteDialogOpen: (open: boolean) => void;

  // 가져오기/내보내기 핸들러
  openImportExport: () => void;
  closeImportExport: () => void;
  setImportExportOpen: (open: boolean) => void;

  // 유틸리티
  resetForm: () => void;
  resetAll: () => void;
}

/**
 * CRUD 상태 관리 옵션
 */
export interface UseCrudStateOptions<T> {
  /** 폼이 닫힐 때 호출되는 콜백 */
  onFormClose?: () => void;
  /** 삭제 다이얼로그가 닫힐 때 호출되는 콜백 */
  onDeleteDialogClose?: () => void;
  /** 초기 선택 아이템 */
  initialSelectedItem?: T | null;
}

/**
 * CRUD 작업을 위한 상태 관리 커스텀 훅
 *
 * @template T - 관리할 엔티티 타입 (예: Equipment, Material)
 * @param options - 옵션 설정
 * @returns CRUD 상태와 핸들러 함수들
 *
 * @example
 * ```tsx
 * // 기본 사용
 * const crud = useCrudState<Equipment>();
 *
 * // 옵션과 함께 사용
 * const crud = useCrudState<Material>({
 *   onFormClose: () => console.log('폼 닫힘'),
 *   onDeleteDialogClose: () => console.log('삭제 다이얼로그 닫힘'),
 * });
 *
 * // JSX에서 사용
 * return (
 *   <>
 *     <Button onClick={crud.handleAdd}>추가</Button>
 *     <Button onClick={() => crud.handleEdit(item)}>수정</Button>
 *     <Button onClick={() => crud.handleDelete(item)}>삭제</Button>
 *
 *     <FormDialog
 *       open={crud.formOpen}
 *       mode={crud.formMode}
 *       item={crud.selectedItem}
 *       onClose={() => crud.setFormOpen(false)}
 *     />
 *
 *     <DeleteDialog
 *       open={crud.deleteDialogOpen}
 *       item={crud.itemToDelete}
 *       onClose={crud.closeDeleteDialog}
 *     />
 *   </>
 * );
 * ```
 */
export function useCrudState<T>(
  options: UseCrudStateOptions<T> = {}
): CrudState<T> {
  const { onFormClose, onDeleteDialogClose, initialSelectedItem = null } = options;

  // ===== 폼 상태 =====
  const [formOpen, setFormOpenState] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedItem, setSelectedItem] = useState<T | null>(initialSelectedItem);

  // ===== 삭제 다이얼로그 상태 =====
  const [deleteDialogOpen, setDeleteDialogOpenState] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  // ===== 가져오기/내보내기 상태 =====
  const [importExportOpen, setImportExportOpenState] = useState(false);

  // ===== 폼 핸들러 =====

  /**
   * 생성 모드로 폼 열기
   */
  const handleAdd = useCallback(() => {
    setSelectedItem(null);
    setFormMode("create");
    setFormOpenState(true);
  }, []);

  /**
   * 수정 모드로 폼 열기
   */
  const handleEdit = useCallback((item: T) => {
    setSelectedItem(item);
    setFormMode("edit");
    setFormOpenState(true);
  }, []);

  /**
   * 조회 모드로 폼 열기 (읽기 전용)
   */
  const handleView = useCallback((item: T) => {
    setSelectedItem(item);
    setFormMode("view");
    setFormOpenState(true);
  }, []);

  /**
   * 폼 열기/닫기 상태 설정
   */
  const setFormOpen = useCallback(
    (open: boolean) => {
      setFormOpenState(open);
      if (!open) {
        onFormClose?.();
      }
    },
    [onFormClose]
  );

  // ===== 삭제 핸들러 =====

  /**
   * 삭제 다이얼로그 열기
   */
  const handleDelete = useCallback((item: T) => {
    setItemToDelete(item);
    setDeleteDialogOpenState(true);
  }, []);

  /**
   * 삭제 다이얼로그 닫기
   */
  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpenState(false);
    setItemToDelete(null);
    onDeleteDialogClose?.();
  }, [onDeleteDialogClose]);

  /**
   * 삭제 다이얼로그 열기/닫기 상태 설정
   */
  const setDeleteDialogOpen = useCallback(
    (open: boolean) => {
      setDeleteDialogOpenState(open);
      if (!open) {
        setItemToDelete(null);
        onDeleteDialogClose?.();
      }
    },
    [onDeleteDialogClose]
  );

  // ===== 가져오기/내보내기 핸들러 =====

  /**
   * 가져오기/내보내기 다이얼로그 열기
   */
  const openImportExport = useCallback(() => {
    setImportExportOpenState(true);
  }, []);

  /**
   * 가져오기/내보내기 다이얼로그 닫기
   */
  const closeImportExport = useCallback(() => {
    setImportExportOpenState(false);
  }, []);

  /**
   * 가져오기/내보내기 열기/닫기 상태 설정
   */
  const setImportExportOpen = useCallback((open: boolean) => {
    setImportExportOpenState(open);
  }, []);

  // ===== 유틸리티 =====

  /**
   * 폼 상태만 초기화
   */
  const resetForm = useCallback(() => {
    setFormOpenState(false);
    setFormMode("create");
    setSelectedItem(null);
    onFormClose?.();
  }, [onFormClose]);

  /**
   * 모든 상태 초기화
   */
  const resetAll = useCallback(() => {
    // 폼 초기화
    setFormOpenState(false);
    setFormMode("create");
    setSelectedItem(null);

    // 삭제 다이얼로그 초기화
    setDeleteDialogOpenState(false);
    setItemToDelete(null);

    // 가져오기/내보내기 초기화
    setImportExportOpenState(false);

    // 콜백 호출
    onFormClose?.();
    onDeleteDialogClose?.();
  }, [onFormClose, onDeleteDialogClose]);

  return {
    // 폼 상태
    formOpen,
    formMode,
    selectedItem,

    // 삭제 다이얼로그 상태
    deleteDialogOpen,
    itemToDelete,

    // 가져오기/내보내기 상태
    importExportOpen,

    // 폼 핸들러
    handleAdd,
    handleEdit,
    handleView,
    setFormOpen,

    // 삭제 핸들러
    handleDelete,
    closeDeleteDialog,
    setDeleteDialogOpen,

    // 가져오기/내보내기 핸들러
    openImportExport,
    closeImportExport,
    setImportExportOpen,

    // 유틸리티
    resetForm,
    resetAll,
  };
}

export default useCrudState;
