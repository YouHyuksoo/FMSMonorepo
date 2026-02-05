/**
 * @file components/auth/login-form.tsx
 * @description
 * 로그인 페이지 컴포넌트입니다.
 * WBSMaster 스타일의 스플릿 레이아웃을 적용했습니다.
 *
 * 초보자 가이드:
 * 1. **Left Panel**: 배경 이미지와 슬로건을 표시
 * 2. **Right Panel**: 로그인 폼 (회사 선택, 사용자 ID, 비밀번호)
 * 3. **Responsive**: 모바일에서는 폼만 표시
 */

"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Alert, AlertDescription } from "@fms/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Icon } from "@fms/ui/icon"
import { useTranslation, useLanguage, supportedLanguages } from "@/lib/language-context"
import { cn } from "@fms/utils"

const companies = [
  { id: "company1", name: "ABC 제조" },
  { id: "company2", name: "XYZ 산업" },
  { id: "company3", name: "DEF 엔지니어링" },
]

export function LoginForm() {
  const [companyId, setCompanyId] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { t } = useTranslation("login")
  const { currentLanguage, setLanguage } = useLanguage()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!companyId || !username || !password) {
      setError(t("fill_all_fields"))
      return
    }

    setIsLoading(true)

    const success = await login(companyId, username, password)

    if (success) {
      router.push("/dashboard")
    } else {
      setError(t("error_message"))
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Back to Home */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Icon name="arrow_back" size="sm" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <span className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
              {t("hero_badge")}
            </span>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {t("hero_title_1")}
              <br />
              <span className="text-white/90">{t("hero_title_2")}</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-white/80 max-w-md mb-8">
              {t("hero_description")}
            </p>

            {/* Feature List */}
            <div className="space-y-3">
              {[
                "실시간 설비 모니터링",
                "예방 정비 자동화",
                "에너지 사용량 분석",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-2 text-white/90"
                >
                  <Icon name="check_circle" size="sm" className="text-white" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center"
                >
                  <Icon name="apartment" size="sm" className="text-white" />
                </div>
              ))}
            </div>
            <p className="text-white/80 text-sm">
              {t("trust_badge")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Language Selector */}
          <div className="flex justify-end mb-8">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    currentLanguage === lang.code
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang.flag}
                </button>
              ))}
            </div>
          </div>

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Icon name="apartment" size="lg" className="text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">FMS</span>
            </Link>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("welcome_title")}
            </h2>
            <p className="text-muted-foreground">{t("welcome_description")}</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Select */}
            <div className="space-y-2">
              <Label htmlFor="company">{t("company_select")}</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="h-12">
                  <Icon name="apartment" size="sm" className="mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t("company_placeholder")} />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  align="start"
                  className="w-[var(--radix-select-trigger-width)]"
                >
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <div className="relative">
                <Icon name="person" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder={t("username_placeholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Icon name="lock" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <Icon name="error" size="sm" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? t("login_loading") : t("login_button")}
            </Button>
          </form>

          {/* Test Accounts */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-3">{t("test_accounts")}</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{t("admin")}</span> admin / admin123 (ABC 제조)
              </p>
              <p>
                <span className="font-medium text-foreground">{t("user")}</span> user1 / user123 (ABC 제조)
              </p>
              <p>
                <span className="font-medium text-foreground">{t("manager")}</span> manager / manager123 (XYZ 산업)
              </p>
            </div>
          </div>

          {/* Mobile Only: Back to Home */}
          <div className="lg:hidden mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="arrow_back" size="sm" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
