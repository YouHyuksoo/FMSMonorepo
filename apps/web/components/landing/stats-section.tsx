/**
 * @file components/landing/stats-section.tsx
 * @description
 * 랜딩페이지 통계 섹션입니다.
 * 카운팅 애니메이션으로 FMS 성과를 보여줍니다.
 *
 * 초보자 가이드:
 * 1. **useCountUp**: 숫자 카운팅 애니메이션 훅
 * 2. **Stats Grid**: 주요 지표 표시
 */

"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Icon } from "@fms/ui/icon"
import { useTranslation } from "@/lib/language-context"

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!start) return

    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, start])

  return count
}

function StatCard({
  stat,
  index,
}: {
  stat: {
    icon: string
    value: number
    suffix: string
    labelKey: string
    descKey: string
  }
  index: number
}) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const count = useCountUp(stat.value, 2000, isInView)
  const { t } = useTranslation("landing")

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon name={stat.icon} size="lg" className="text-primary" />
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-lg font-semibold text-foreground mb-1">
        {t(stat.labelKey)}
      </div>
      <div className="text-sm text-muted-foreground">{t(stat.descKey)}</div>
    </motion.div>
  )
}

export function StatsSection() {
  const { t } = useTranslation("landing")

  const stats = [
    {
      icon: "apartment",
      value: 500,
      suffix: "+",
      labelKey: "stats.facilities",
      descKey: "stats.facilities_desc",
    },
    {
      icon: "group",
      value: 10000,
      suffix: "+",
      labelKey: "stats.users",
      descKey: "stats.users_desc",
    },
    {
      icon: "bolt",
      value: 30,
      suffix: "%",
      labelKey: "stats.energy_saving",
      descKey: "stats.energy_saving_desc",
    },
    {
      icon: "trending_down",
      value: 50,
      suffix: "%",
      labelKey: "stats.failure_reduction",
      descKey: "stats.failure_reduction_desc",
    },
  ]

  return (
    <section id="stats" className="py-24 bg-background">
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
            {t("stats.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("stats.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("stats.description")}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatCard key={stat.labelKey} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
