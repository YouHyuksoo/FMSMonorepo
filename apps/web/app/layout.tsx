import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryProvider } from "@/providers/query-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { PermissionProvider } from "@/lib/permission-context";
import "./globals.css";
import {
  DashboardIcon,
  EnergyIcon,
  MaterialsIcon,
  EquipmentIcon,
  SensorIcon,
  CarbonIcon,
  KPIIcon,
} from "@/components/icons";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FMS - Facility Management System",
  description: "Comprehensive facility management solution",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    {
      titleKey: "menu.dashboard",
      icon: <DashboardIcon className="w-5 h-5" />,
      href: "/dashboard",
    },
    {
      titleKey: "menu.energy",
      icon: <EnergyIcon className="w-5 h-5" />,
      href: "/energy",
    },
    {
      titleKey: "menu.materials",
      icon: <MaterialsIcon className="w-5 h-5" />,
      href: "/materials",
    },
    {
      titleKey: "menu.equipment",
      icon: <EquipmentIcon className="w-5 h-5" />,
      href: "/equipment",
    },
    {
      titleKey: "menu.sensor",
      icon: <SensorIcon className="w-5 h-5" />,
      href: "/sensor",
    },
    {
      titleKey: "menu.carbon",
      icon: <CarbonIcon className="w-5 h-5" />,
      href: "/carbon",
    },
    {
      titleKey: "menu.kpi",
      icon: <KPIIcon className="w-5 h-5" />,
      href: "/kpi",
    },
  ];

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={inter.className}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <QueryProvider>
            <I18nProvider>
              <LanguageProvider>
                <AuthProvider>
                  <PermissionProvider>{children}</PermissionProvider>
                </AuthProvider>
              </LanguageProvider>
            </I18nProvider>
          </QueryProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
