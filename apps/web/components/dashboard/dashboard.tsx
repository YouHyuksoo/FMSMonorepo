/**
 * @file apps/web/components/dashboard/dashboard.tsx
 * @description FMS 대시보드 메인 컴포넌트
 */
"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fms/ui/card";
import { Icon } from "@/components/ui/Icon";
import { useTranslation } from "@/lib/language-context";

/**
 * 통계 카드 Props
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  change?: number;
  changeType?: "up" | "down";
  href?: string;
  tooltip?: string;
  animationDelay?: number;
}

/**
 * 통계 카드 컴포넌트 - WBSMASTER 스타일
 */
const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  change,
  changeType,
  href,
  tooltip,
  animationDelay = 0,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const handleClick = () => {
    if (href) router.push(href);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`
        relative bg-card dark:bg-card border border-border dark:border-border rounded-xl p-5
        flex items-center gap-4
        transform transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        ${href ? "cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98]" : ""}
      `}
    >
      {/* 툴팁 */}
      {tooltip && showTooltip && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
        </div>
      )}

      <div
        className={`size-12 rounded-xl ${iconBgColor} flex items-center justify-center shrink-0 transition-transform duration-300`}
      >
        <Icon name={icon} size="md" className={iconColor} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <span
              className={`text-xs font-medium ${
                changeType === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {changeType === "up" ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
      </div>

      {/* 클릭 가능 표시 */}
      {href && (
        <Icon
          name="arrow_forward"
          size="sm"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 hover:opacity-100 transition-opacity"
        />
      )}
    </div>
  );
});

export function Dashboard() {
  const { t } = useTranslation("dashboard");

  // 대시보드 데이터 (실제 API 연동 시 대체 필요)
  const dashboardSummary = {
    totalEquipment: { value: 1248, change: 5.2 },
    failedEquipment: { value: 12, change: -2.1 },
    inspectionRate: { value: 94.5, change: 3.8 },
    pendingWork: { value: 28, change: 1.5 },
  };

  const recentFailures: { id: string; equipment: string; cause: string; time: string }[] = [];
  const todaysInspections: { id: string; title: string; manager: string; status: string }[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("total_equipment")}
          value={dashboardSummary.totalEquipment.value.toLocaleString()}
          icon="precision_manufacturing"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          change={dashboardSummary.totalEquipment.change}
          changeType="up"
          href="/equipment/overview"
          tooltip="설비 현황 보기"
          animationDelay={0}
        />

        <StatCard
          title={t("failed_equipment")}
          value={dashboardSummary.failedEquipment.value}
          icon="warning"
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
          change={dashboardSummary.failedEquipment.change}
          changeType="down"
          href="/failure/history"
          tooltip="고장 현황 보기"
          animationDelay={100}
        />

        <StatCard
          title={t("inspection_rate")}
          value={`${dashboardSummary.inspectionRate.value}%`}
          icon="check_circle"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          change={dashboardSummary.inspectionRate.change}
          changeType="up"
          href="/inspection/result"
          tooltip="점검 현황 보기"
          animationDelay={200}
        />

        <StatCard
          title={t("pending_work")}
          value={dashboardSummary.pendingWork.value}
          icon="schedule"
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
          change={dashboardSummary.pendingWork.change}
          changeType="up"
          href="/maintenance/request"
          tooltip="대기 작업 보기"
          animationDelay={300}
        />
      </div>

      {/* 하단 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Icon name="error" size="sm" className="text-red-600 dark:text-red-400" />
              </div>
              {t("recent_failures")}
            </CardTitle>
            <CardDescription>{t("recent_failures_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFailures.length > 0 ? (
              <div className="space-y-4">
                {recentFailures.map((failure) => (
                  <div
                    key={failure.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{failure.equipment}</p>
                      <p className="text-sm text-muted-foreground">
                        {failure.cause}
                      </p>
                    </div>
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">{failure.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Icon name="check_circle" size="xl" className="mb-2 text-green-500" />
                <p>최근 고장 이력이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon name="assignment" size="sm" className="text-blue-600 dark:text-blue-400" />
              </div>
              {t("todays_inspection")}
            </CardTitle>
            <CardDescription>{t("todays_inspection_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysInspections.length > 0 ? (
              <div className="space-y-4">
                {todaysInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{inspection.title}</p>
                      <p className="text-sm text-muted-foreground">
                        담당자: {inspection.manager}
                      </p>
                    </div>
                    <span className="text-sm font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                      {inspection.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Icon name="event_available" size="xl" className="mb-2 text-blue-500" />
                <p>오늘 예정된 점검이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
