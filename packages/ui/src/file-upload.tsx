/**
 * @file packages/ui/src/file-upload.tsx
 * @description 드래그 앤 드롭 파일 업로드 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: react-dropzone을 사용한 파일 업로드 UI
 * 2. **사용 방법**: <FileUpload onUpload={(files) => handleFiles(files)} />
 * 3. **커스터마이징**: accept, multiple, children props로 동작 및 UI 변경 가능
 */
"use client";

import * as React from "react";
import { useCallback } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { Icon } from "./icon";
import { cn } from "@fms/utils";
import { Button } from "./button";

export interface FileUploadProps {
  /** 파일 업로드 시 호출되는 콜백 */
  onUpload: (files: File[]) => void;
  /** 허용할 파일 MIME 타입 (예: "image/*", "application/pdf") */
  accept?: string | Accept;
  /** 여러 파일 선택 허용 여부 */
  multiple?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 드롭존 영역의 추가 className */
  className?: string;
  /** 커스텀 드래그 중 텍스트 */
  dragActiveText?: string;
  /** 커스텀 기본 텍스트 */
  defaultText?: string;
  /** 커스텀 버튼 텍스트 */
  buttonText?: string;
  /** 커스텀 children (전체 UI를 대체) */
  children?: React.ReactNode;
}

/**
 * 드래그 앤 드롭 파일 업로드 컴포넌트
 *
 * @example
 * // 기본 사용
 * <FileUpload onUpload={(files) => console.log(files)} />
 *
 * @example
 * // 이미지만 허용, 다중 선택
 * <FileUpload
 *   onUpload={handleUpload}
 *   accept="image/*"
 *   multiple
 * />
 *
 * @example
 * // Accept 객체 형태로 세밀한 제어
 * <FileUpload
 *   onUpload={handleUpload}
 *   accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
 * />
 */
export function FileUpload({
  onUpload,
  accept,
  multiple = false,
  disabled = false,
  className,
  dragActiveText = "파일을 여기에 놓으세요",
  defaultText = "파일을 드래그하거나 클릭하여 업로드하세요",
  buttonText = "파일 선택",
  children,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
    },
    [onUpload]
  );

  // accept가 문자열이면 객체 형태로 변환
  const acceptConfig: Accept | undefined = React.useMemo(() => {
    if (!accept) return undefined;
    if (typeof accept === "string") {
      return { [accept]: [] };
    }
    return accept;
  }, [accept]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptConfig,
    multiple,
    disabled,
    noClick: !!children, // children이 있으면 영역 클릭 비활성화 (버튼으로만 동작)
  });

  // 커스텀 children이 있으면 그것만 렌더링
  if (children) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input {...getInputProps()} />
        {children}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />
      <Icon name="upload" className="mx-auto text-muted-foreground" style={{ fontSize: 48 }} />
      <p className="mt-2 text-sm text-muted-foreground">
        {isDragActive ? dragActiveText : defaultText}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
      >
        {buttonText}
      </Button>
    </div>
  );
}
