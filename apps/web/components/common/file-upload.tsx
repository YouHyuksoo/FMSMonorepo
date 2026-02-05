"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@fms/ui/button";
import { Icon } from "@fms/ui/icon";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export function FileUpload({
  onUpload,
  accept,
  multiple = false,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25"
      }`}
    >
      <input {...getInputProps()} />
      <Icon name="upload" className="mx-auto text-muted-foreground" style={{ fontSize: 48 }} />
      <p className="mt-2 text-sm text-muted-foreground">
        {isDragActive
          ? "파일을 여기에 놓으세요"
          : "파일을 드래그하거나 클릭하여 업로드하세요"}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={(e) => {
          e.stopPropagation();
          getInputProps().onClick?.(e as any);
        }}
      >
        파일 선택
      </Button>
    </div>
  );
}
