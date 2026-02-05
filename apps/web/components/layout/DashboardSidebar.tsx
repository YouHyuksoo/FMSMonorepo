/**
 * @file src/components/layout/DashboardSidebar.tsx
 * @description
 * Dashboard Sidebar Navigation with full menu structure.
 *
 * 초보자 가이드:
 * 1. **메뉴 구조**: 계층형 메뉴를 지원 (children 속성)
 * 2. **다국어 지원**: useTranslation 훅으로 메뉴명 번역
 * 3. **상태 저장**: localStorage에 접힌 상태와 확장된 메뉴 저장
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useTranslation } from "@/lib/language-context";
import { cn } from "@fms/utils";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface MenuItem {
  titleKey: string;
  icon: string;
  href: string;
  children?: {
    titleKey: string;
    href: string;
  }[];
}

export function DashboardSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation("menu");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 메뉴 항목 정의
  const menuItems: MenuItem[] = [
    {
      titleKey: "dashboard.title",
      icon: "dashboard",
      href: "/dashboard",
      children: [
        { titleKey: "dashboard.integrated", href: "/dashboard" },
        { titleKey: "sensor.dashboard", href: "/sensor/dashboard" },
      ],
    },
    {
      titleKey: "master.title",
      icon: "storage",
      href: "/master",
      children: [
        { titleKey: "equipment.master_management", href: "/equipment/master" },
        { titleKey: "sensor.groups", href: "/sensor/groups" },
        { titleKey: "sensor.types", href: "/sensor/types" },
      ],
    },
    {
      titleKey: "equipment.title",
      icon: "settings",
      href: "/equipment",
      children: [
        { titleKey: "equipment.overview", href: "/equipment/overview" },
        { titleKey: "equipment.registration_management", href: "/equipment/register" },
        { titleKey: "equipment.bom_management", href: "/equipment/bom" },
        { titleKey: "equipment.spec", href: "/equipment/spec" },
        { titleKey: "equipment.docs", href: "/equipment/docs" },
        { titleKey: "sensor.overview", href: "/sensor/overview" },
        { titleKey: "sensor.registration_management", href: "/sensor/register" },
        { titleKey: "sensor.analysis", href: "/sensor/analysis" },
      ],
    },
    {
      titleKey: "inspection.title",
      icon: "assignment_turned_in",
      href: "/inspection",
      children: [
        { titleKey: "inspection.schedule", href: "/inspection/schedule" },
        { titleKey: "inspection.result", href: "/inspection/result" },
        { titleKey: "inspection.calendar", href: "/inspection/calendar" },
      ],
    },
    {
      titleKey: "maintenance.title",
      icon: "build",
      href: "/maintenance",
      children: [
        { titleKey: "maintenance.request_management", href: "/maintenance/request" },
        { titleKey: "maintenance.plan_management", href: "/maintenance/plan" },
        { titleKey: "maintenance.complete_management", href: "/maintenance/complete" },
        { titleKey: "maintenanceTemplate.master", href: "/maintenance-template/master" },
        { titleKey: "maintenanceTemplate.standard", href: "/maintenance-template/standard" },
        { titleKey: "materials.registration_management", href: "/materials/register" },
        { titleKey: "materials.master_management", href: "/materials/master" },
        { titleKey: "materials.inventory_management", href: "/materials/stock" },
        { titleKey: "materials.inbound", href: "/materials/inbound" },
        { titleKey: "materials.outbound", href: "/materials/outbound" },
        { titleKey: "materials.issuance_request", href: "/materials/issuance-request" },
      ],
    },
    {
      titleKey: "failure.title",
      icon: "warning",
      href: "/failure",
      children: [
        { titleKey: "failure.registration", href: "/failure/desktop-register" },
        { titleKey: "failure.history", href: "/failure/history" },
      ],
    },
    {
      titleKey: "preventive.title",
      icon: "calendar_month",
      href: "/preventive",
      children: [
        { titleKey: "preventive.master", href: "/preventive/master" },
        { titleKey: "preventive.order", href: "/preventive/order" },
        { titleKey: "preventive.calendar", href: "/preventive/calendar" },
      ],
    },
    {
      titleKey: "metering.title",
      icon: "speed",
      href: "/metering",
      children: [
        { titleKey: "metering.reading_management", href: "/metering/reading" },
        { titleKey: "metering.calibration_management", href: "/metering/calibration" },
        { titleKey: "metering.analytics_management", href: "/metering/analytics" },
        { titleKey: "metering.calendar_management", href: "/metering/calendar" },
      ],
    },
    {
      titleKey: "prediction.title",
      icon: "psychology",
      href: "/prediction",
      children: [
        { titleKey: "prediction.result_management", href: "/prediction/result" },
        { titleKey: "prediction.sensor_management", href: "/prediction/sensor" },
      ],
    },
    {
      titleKey: "tpm.title",
      icon: "group",
      href: "/tpm",
      children: [
        { titleKey: "tpm.registration", href: "/tpm/activity" },
        { titleKey: "tpm.team", href: "/tpm/team" },
      ],
    },
    {
      titleKey: "location.title",
      icon: "map",
      href: "/location",
      children: [
        { titleKey: "location.layout_management", href: "/location/layout" },
        { titleKey: "location.monitor_management", href: "/location/monitor" },
      ],
    },
    {
      titleKey: "mobile.title",
      icon: "smartphone",
      href: "/mobile",
      children: [
        { titleKey: "mobile.qr_management", href: "/mobile/qr" },
        { titleKey: "mobile.result_management", href: "/mobile/result" },
        { titleKey: "mobile.failure_register", href: "/mobile-qr/failure-register" },
      ],
    },
    {
      titleKey: "system.title",
      icon: "settings",
      href: "/system",
      children: [
        { titleKey: "system.organization_management", href: "/system/organization" },
        { titleKey: "system.users_management", href: "/system/users" },
        { titleKey: "system.permissions_management", href: "/system/permissions" },
        { titleKey: "system.roles_management", href: "/system/permissions/roles" },
        { titleKey: "system.codes_management", href: "/system/codes" },
        { titleKey: "system.configuration", href: "/system/configuration" },
        { titleKey: "system.language_management", href: "/system/language" },
      ],
    },
  ];

  // 초기 마운트 시 localStorage에서 상태 로드
  useEffect(() => {
    setIsMounted(true);
    const savedExpandedItems = localStorage.getItem("sidebarExpandedItems");
    if (savedExpandedItems) {
      setExpandedItems(JSON.parse(savedExpandedItems));
    }

    // 현재 경로에 해당하는 부모 메뉴 자동 확장
    const activeParent = menuItems.find((item) =>
      item.children?.some(
        (child) => pathname === child.href || pathname.startsWith(child.href + "/")
      )
    );
    if (activeParent) {
      setExpandedItems((prev) => {
        if (!prev.includes(activeParent.titleKey)) {
          return [...prev, activeParent.titleKey];
        }
        return prev;
      });
    }
  }, [pathname]);

  // expandedItems 변경 시 localStorage에 저장
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebarExpandedItems", JSON.stringify(expandedItems));
    }
  }, [expandedItems, isMounted]);

  const toggleExpanded = (titleKey: string) => {
    setExpandedItems((prev) =>
      prev.includes(titleKey)
        ? prev.filter((item) => item !== titleKey)
        : [...prev, titleKey]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isParentActive = (item: MenuItem) => {
    return item.children?.some(
      (child) => pathname === child.href || pathname.startsWith(child.href + "/")
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          isCollapsed ? "lg:w-16" : "w-64",
          "bg-background-white dark:bg-background-dark",
          "border-r border-border dark:border-border-dark",
          "flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:flex"
        )}
      >
        {/* Toggle Button (Desktop) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 z-10 size-6 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-hover transition-colors"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <Icon
            name={isCollapsed ? "chevron_right" : "chevron_left"}
            size="xs"
          />
        </button>

        {/* Menu Area */}
        <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <p className={cn(
            "px-3 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2",
            isCollapsed ? "lg:hidden" : ""
          )}>
            Menu
          </p>

          {menuItems.map((item) => {
            const isExpanded = expandedItems.includes(item.titleKey);
            const hasChildren = item.children && item.children.length > 0;
            const parentActive = isParentActive(item);

            return (
              <div key={item.titleKey} className="mb-1">
                {hasChildren ? (
                  // 하위 메뉴가 있는 경우: 버튼으로 확장/축소
                  <button
                    onClick={() => toggleExpanded(item.titleKey)}
                    title={isCollapsed ? t(item.titleKey) : undefined}
                    className={cn(
                      "flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-colors",
                      isCollapsed ? "lg:justify-center lg:px-0" : "",
                      parentActive
                        ? "bg-primary/10 text-primary"
                        : "text-text dark:text-white hover:bg-surface dark:hover:bg-surface-dark"
                    )}
                  >
                    <Icon
                      name={item.icon}
                      size="sm"
                      className={cn(
                        "shrink-0",
                        parentActive ? "text-primary" : "text-text-secondary"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium flex-1 text-left truncate",
                      isCollapsed ? "lg:hidden" : ""
                    )}>
                      {t(item.titleKey)}
                    </span>
                    {!isCollapsed && (
                      <Icon
                        name={isExpanded ? "expand_more" : "chevron_right"}
                        size="xs"
                        className="text-text-secondary shrink-0"
                      />
                    )}
                  </button>
                ) : (
                  // 하위 메뉴가 없는 경우: 링크
                  <Link
                    href={item.href}
                    title={isCollapsed ? t(item.titleKey) : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isCollapsed ? "lg:justify-center lg:px-0" : "",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-text dark:text-white hover:bg-surface dark:hover:bg-surface-dark"
                    )}
                  >
                    <Icon
                      name={item.icon}
                      size="sm"
                      className={cn(
                        "shrink-0",
                        isActive(item.href) ? "text-primary" : "text-text-secondary"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isCollapsed ? "lg:hidden" : ""
                    )}>
                      {t(item.titleKey)}
                    </span>
                  </Link>
                )}

                {/* 하위 메뉴 */}
                {hasChildren && isExpanded && !isCollapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children!.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center w-full h-8 px-3 text-sm rounded-md transition-colors",
                            childActive
                              ? "bg-primary/10 text-primary"
                              : "text-text-secondary hover:bg-surface dark:hover:bg-surface-dark hover:text-text dark:hover:text-white"
                          )}
                        >
                          <span className="truncate">{t(child.titleKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Area */}
        <div className={cn(
          "p-4 pt-0 flex flex-col gap-1 shrink-0",
          isCollapsed ? "lg:p-2 lg:pt-0" : ""
        )}>
          <div className={cn(
            "h-px bg-border dark:bg-border-dark my-2",
            isCollapsed ? "lg:mx-0" : ""
          )} />

          <button
            title={isCollapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left",
              "text-text dark:text-white hover:bg-surface dark:hover:bg-surface-dark",
              isCollapsed ? "lg:justify-center lg:px-0" : ""
            )}
            onClick={() => console.log("Logout clicked")}
          >
            <Icon name="logout" size="sm" className="text-text-secondary" />
            <span className={cn("text-sm font-medium", isCollapsed ? "lg:hidden" : "")}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
