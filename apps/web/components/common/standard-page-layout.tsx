/**
 * @file apps/web/components/common/standard-page-layout.tsx
 * @description 표준 페이지 레이아웃 컴포넌트 - 탭, 헤더, 필터바 포함
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 일관된 페이지 레이아웃을 위한 표준 컴포넌트
 * 2. **사용 방법**: DataTable과 함께 사용하여 표준 관리 화면 구성
 * 3. **기능**: 탭 네비게이션, 헤더 영역, 액션 버튼, 통계 카드
 */

"use client";

import React, { useState, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs";
import { Button } from "@fms/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card";
import { Icon } from "@/components/ui/Icon";

/**
 * 탭 정의
 */
export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
  badge?: number | string;
}

/**
 * 액션 버튼 정의
 */
export interface ActionButton {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  disabled?: boolean;
}

/**
 * 통계 카드 정의
 */
export interface StatCard {
  label: string;
  value: number | string;
  icon?: string;
  color?: "default" | "primary" | "success" | "warning" | "error";
  change?: {
    value: number;
    direction: "up" | "down";
  };
}

/**
 * StandardPageLayout Props
 */
export interface StandardPageLayoutProps {
  /** 페이지 제목 */
  title: string;
  /** 페이지 부제목 (선택) */
  subtitle?: string;
  /** 탭 설정 (없으면 탭 없이 렌더링) */
  tabs?: TabConfig[];
  /** 기본 선택 탭 ID */
  defaultTab?: string;
  /** 탭 변경 핸들러 */
  onTabChange?: (tabId: string) => void;
  /** 헤더 오른쪽 액션 버튼들 */
  actions?: ActionButton[];
  /** 통계 카드들 (탭 없는 경우 또는 탭 상단에 표시) */
  stats?: StatCard[];
  /** 탭 없이 단일 콘텐츠 */
  children?: ReactNode;
  /** 헤더 왼쪽 커스텀 영역 */
  headerLeft?: ReactNode;
  /** 헤더 오른쪽 커스텀 영역 (actions 대신) */
  headerRight?: ReactNode;
  /** 통계 카드 표시 위치 */
  statsPosition?: "top" | "header";
  /** 로딩 상태 */
  loading?: boolean;
}

/**
 * 통계 카드 색상 맵핑
 */
const statColorMap = {
  default: "bg-surface dark:bg-surface-dark text-text dark:text-white",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

/**
 * 표준 페이지 레이아웃 컴포넌트
 */
export function StandardPageLayout({
  title,
  subtitle,
  tabs,
  defaultTab,
  onTabChange,
  actions,
  stats,
  children,
  headerLeft,
  headerRight,
  statsPosition = "top",
  loading = false,
}: StandardPageLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs?.[0]?.id || "");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // 통계 카드 렌더링
  const renderStats = () => {
    if (!stats || stats.length === 0) return null;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`${statColorMap[stat.color || "default"]} border-0`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-xs mt-1 ${stat.change.direction === "up" ? "text-success" : "text-error"}`}>
                      <Icon name={stat.change.direction === "up" ? "trending_up" : "trending_down"} size="xs" className="inline mr-1" />
                      {stat.change.value}%
                    </p>
                  )}
                </div>
                {stat.icon && (
                  <Icon name={stat.icon} size="lg" className="opacity-50" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // 헤더 렌더링
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {headerLeft || (
          <div>
            <h1 className="text-2xl font-bold text-text dark:text-white tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {headerRight || (
          <>
            {actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon && <Icon name={action.icon} size="sm" className="mr-2" />}
                {action.label}
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  );

  // 로딩 상태
  if (loading) {
    return (
      <div className="p-6">
        {renderHeader()}
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-surface dark:bg-surface-dark rounded-lg" />
          <div className="h-64 bg-surface dark:bg-surface-dark rounded-lg" />
        </div>
      </div>
    );
  }

  // 탭 없이 단일 콘텐츠
  if (!tabs || tabs.length === 0) {
    return (
      <div className="p-6">
        {renderHeader()}
        {statsPosition === "top" && renderStats()}
        {children}
      </div>
    );
  }

  // 탭이 있는 경우
  return (
    <div className="p-6">
      {renderHeader()}
      {statsPosition === "top" && renderStats()}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4 bg-surface dark:bg-surface-dark p-1 rounded-lg">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-background-white dark:data-[state=active]:bg-background-dark"
            >
              {tab.icon && <Icon name={tab.icon} size="sm" />}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/**
 * 통계 카드 전용 컴포넌트 (독립 사용 가능)
 */
export function StatsGrid({ stats }: { stats: StatCard[] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`${statColorMap[stat.color || "default"]} border-0`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.change && (
                  <p className={`text-xs mt-1 ${stat.change.direction === "up" ? "text-success" : "text-error"}`}>
                    <Icon name={stat.change.direction === "up" ? "trending_up" : "trending_down"} size="xs" className="inline mr-1" />
                    {stat.change.value}%
                  </p>
                )}
              </div>
              {stat.icon && (
                <Icon name={stat.icon} size="lg" className="opacity-50" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default StandardPageLayout;
