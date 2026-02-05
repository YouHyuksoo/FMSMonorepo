/**
 * @file components/landing/features-section.tsx
 * @description
 * 랜딩페이지 기능 소개 섹션입니다.
 * FMS의 주요 기능을 카드 형태로 보여줍니다.
 *
 * 초보자 가이드:
 * 1. **cardVariants**: 호버 시 살짝 떠오르는 효과
 * 2. **Feature Cards**: 주요 기능별 카드
 */

"use client"

import { motion } from "framer-motion"
import { Icon } from "@fms/ui/icon"
import { Card, CardContent } from "@fms/ui"
import { useTranslation } from "@/lib/language-context"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
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

export function FeaturesSection() {
  const { t } = useTranslation("landing")

  const features = [
    {
      icon: "bolt",
      titleKey: "features.energy_title",
      descKey: "features.energy_desc",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: "build",
      titleKey: "features.maintenance_title",
      descKey: "features.maintenance_desc",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: "bar_chart",
      titleKey: "features.kpi_title",
      descKey: "features.kpi_desc",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: "notifications",
      titleKey: "features.alert_title",
      descKey: "features.alert_desc",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: "eco",
      titleKey: "features.carbon_title",
      descKey: "features.carbon_desc",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: "shield",
      titleKey: "features.safety_title",
      descKey: "features.safety_desc",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ]

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t("features.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("features.description")}
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.titleKey} variants={cardVariants}>
              <Card hover className="h-full">
                <CardContent className="pt-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}
                  >
                    <Icon name={feature.icon} size="md" className={feature.color} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-muted-foreground">{t(feature.descKey)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
