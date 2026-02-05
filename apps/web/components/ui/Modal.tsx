/**
 * @file apps/web/components/ui/Modal.tsx
 * @description
 * 범용 모달 다이얼로그 컴포넌트입니다.
 * 다양한 크기와 애니메이션을 지원하며, Radix/Shadcn pattern (open/onOpenChange)을 지원합니다.
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { Icon } from "./Icon";

/** 모달 크기 타입 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/** 모달 Props */
export interface ModalProps {
  /** 모달 열림 상태 (alias for open) */
  isOpen?: boolean;
  /** 모달 열림 상태 */
  open?: boolean;
  /** 모달 닫기 핸들러 (alias for onOpenChange) */
  onClose?: () => void;
  /** 모달 상태 변경 핸들러 */
  onOpenChange?: (open: boolean) => void;
  /** 모달 제목 */
  title?: string;
  /** 모달 크기 */
  size?: ModalSize;
  /** 모달 내용 */
  children: React.ReactNode;
  /** 배경 클릭으로 닫기 허용 여부 */
  closeOnOverlayClick?: boolean;
  /** ESC 키로 닫기 허용 여부 */
  closeOnEscape?: boolean;
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
}

/** 모달 크기별 너비 클래스 */
const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

/**
 * 범용 모달 컴포넌트
 */
export function Modal({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  size = "md",
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const isModalOpen = open ?? isOpen ?? false;
  
  const handleClose = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false);
    } else if (onClose) {
      onClose();
    }
  }, [onOpenChange, onClose]);

  // ESC 키 핸들러
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        handleClose();
      }
    },
    [closeOnEscape, handleClose]
  );

  // ESC 키 이벤트 등록
  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      // 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, handleEscape]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
        onClick={closeOnOverlayClick ? handleClose : undefined}
      />

      {/* 모달 컨텐츠 */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-background-white dark:bg-surface-dark
          rounded-2xl shadow-2xl border border-border dark:border-border-dark
          transform transition-all
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark">
            {title && (
              <h2 className="text-xl font-bold text-text dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-surface dark:hover:bg-background-dark transition-colors ml-auto group"
              >
                <Icon name="close" size="sm" className="text-text-secondary group-hover:text-text dark:group-hover:text-white" />
              </button>
            )}
          </div>
        )}

        {/* 본문 */}
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
