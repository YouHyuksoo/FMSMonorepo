/**
 * @file components/landing/landing-header.tsx
 * @description
 * 랜딩페이지 전용 헤더 컴포넌트입니다.
 * WBSMaster 스타일과 동일하게 구현되었습니다.
 *
 * 초보자 가이드:
 * 1. **Navigation**: 랜딩페이지 내 섹션 이동
 * 2. **Theme Toggle**: 다크/라이트 모드 전환
 * 3. **Language Selector**: 다국어 선택
 * 4. **CTA Button**: 시작하기 버튼
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { Icon } from "@fms/ui/icon"
import { Button } from "@fms/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fms/ui"
import { cn } from "@fms/utils"
import { useTranslation, useLanguage, supportedLanguages } from "@/lib/language-context"

export function LandingHeader() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation("landing")
  const { currentLanguage, setLanguage } = useLanguage()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navItems = [
    { label: t("header.features"), href: "#features" },
    { label: t("header.stats"), href: "#stats" },
    { label: t("header.showcase"), href: "#showcase" },
  ]

  const currentLang = supportedLanguages.find((l) => l.code === currentLanguage)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Icon name="apartment" size="md" className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FMS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="text-base">{currentLang?.flag}</span>
                  <span className="sr-only">언어 선택</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "cursor-pointer",
                      currentLanguage === lang.code && "bg-muted"
                    )}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t("header.theme_toggle")}</span>
            </Button>

            {/* CTA Button */}
            <Link href="/login" className="hidden sm:block">
              <Button>{t("header.start")}</Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <Icon name="close" size="sm" />
              ) : (
                <Icon name="menu" size="sm" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-background border-b border-border"
        >
          <nav className="flex flex-col p-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}

            {/* Mobile Language Selector */}
            <div className="flex items-center gap-2 py-2">
              <Icon name="language" size="sm" className="text-muted-foreground" />
              <div className="flex gap-2">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "px-2 py-1 text-sm rounded-md transition-colors",
                      currentLanguage === lang.code
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
            </div>

            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">{t("header.start")}</Button>
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
