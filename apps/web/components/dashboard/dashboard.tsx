"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fms/ui/card";
import { Icon } from "@fms/ui/icon";
import { useTranslation } from "@/lib/language-context";
import {
  dashboardSummary,
  recentFailures,
  todaysInspections,
  inspectionStatus,
} from "@/lib/mock-data/dashboard";

export function Dashboard() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_equipment")}
            </CardTitle>
            <Icon name="bar_chart" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardSummary.totalEquipment.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardSummary.totalEquipment.change >= 0 ? "+" : ""}
              {dashboardSummary.totalEquipment.change}% {t("from_last_month")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("failed_equipment")}
            </CardTitle>
            <Icon name="warning" size="sm" className="text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardSummary.failedEquipment.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardSummary.failedEquipment.change >= 0 ? "+" : ""}
              {dashboardSummary.failedEquipment.change}% {t("from_last_month")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inspection_rate")}
            </CardTitle>
            <Icon name="check_circle" size="sm" className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardSummary.inspectionRate.value}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardSummary.inspectionRate.change >= 0 ? "+" : ""}
              {dashboardSummary.inspectionRate.change}% {t("from_last_month")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pending_work")}
            </CardTitle>
            <Icon name="schedule" size="sm" className="text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardSummary.pendingWork.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardSummary.pendingWork.change >= 0 ? "+" : ""}
              {dashboardSummary.pendingWork.change}% {t("from_last_month")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("recent_failures")}</CardTitle>
            <CardDescription>{t("recent_failures_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFailures.map((failure) => (
                <div
                  key={failure.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{failure.equipment}</p>
                    <p className="text-sm text-muted-foreground">
                      {failure.cause}
                    </p>
                  </div>
                  <span className="text-sm text-red-600">{failure.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("todays_inspection")}</CardTitle>
            <CardDescription>{t("todays_inspection_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{inspection.title}</p>
                    <p className="text-sm text-muted-foreground">
                      담당자: {inspection.manager}
                    </p>
                  </div>
                  <span
                    className={`text-sm ${
                      inspectionStatus[inspection.status].color
                    }`}
                  >
                    {t(`inspection_status.${inspection.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
