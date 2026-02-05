/**
 * @file components/landing/hero-section.tsx
 * @description
 * 랜딩페이지 히어로 섹션입니다.
 * Framer Motion 애니메이션으로 임팩트 있는 첫 인상을 제공합니다.
 *
 * 초보자 가이드:
 * 1. **containerVariants**: 자식 요소들의 순차 애니메이션
 * 2. **itemVariants**: 개별 요소 페이드인 + 슬라이드업
 */

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@fms/ui/icon"
import { Button } from "@fms/ui"
import { useTranslation } from "@/lib/language-context"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

export function HeroSection() {
  const { t } = useTranslation("landing")

  const featureIcons = [
    { icon: "apartment", label: t("hero.feature_integrated") },
    { icon: "bolt", label: t("hero.feature_realtime") },
    { icon: "shield", label: t("hero.feature_preventive") },
    { icon: "bar_chart", label: t("hero.feature_analytics") },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Icon name="bolt" size="sm" />
              {t("hero.badge")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
          >
            {t("hero.title_1")}
            <br />
            <span className="text-primary">{t("hero.title_2")}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t("hero.description_1")}
            <br className="hidden sm:block" />
            {t("hero.description_2")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/login">
              <Button size="lg" className="gap-2 px-10">
                {t("hero.cta_start")}
                <Icon name="arrow_forward" size="sm" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2 px-10">
              <Icon name="play_arrow" size="sm" />
              {t("hero.cta_demo")}
            </Button>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-8 mb-16"
          >
            {featureIcons.map((item, index) => (
              <motion.div
                key={item.label}
                variants={floatingVariants}
                animate="animate"
                custom={index}
                className="flex items-center gap-2 text-muted-foreground"
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Icon name={item.icon} size="sm" className="text-primary" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            className="relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Mock Dashboard */}
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 p-4 sm:p-8">
                <div className="grid grid-cols-3 gap-4 h-full">
                  {/* Sidebar Mock */}
                  <div className="hidden sm:block col-span-1 bg-background/50 rounded-xl p-4">
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-8 bg-muted rounded-lg animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Main Content Mock */}
                  <div className="col-span-3 sm:col-span-2 space-y-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-background/50 rounded-xl p-3 sm:p-4"
                        >
                          <div className="h-3 w-12 bg-muted rounded animate-pulse mb-2" />
                          <div className="h-6 w-16 bg-primary/20 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>

                    {/* Chart Mock */}
                    <div className="bg-background/50 rounded-xl p-4 flex-1">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse mb-4" />
                      <div className="flex items-end gap-2 h-32">
                        {[40, 65, 45, 80, 55, 70, 60, 75, 50, 85, 65, 90].map((h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 bg-primary/30 rounded-t"
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/20 blur-2xl" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
