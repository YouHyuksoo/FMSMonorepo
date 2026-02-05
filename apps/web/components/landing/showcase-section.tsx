/**
 * @file components/landing/showcase-section.tsx
 * @description
 * 랜딩페이지 솔루션 쇼케이스 섹션입니다.
 * FMS의 다양한 활용 사례를 보여줍니다.
 *
 * 초보자 가이드:
 * 1. **Solutions**: 산업별 솔루션 소개
 * 2. **Interactive Cards**: 호버 효과가 있는 카드
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

export function ShowcaseSection() {
  const { t } = useTranslation("landing")

  const solutions = [
    {
      icon: "apartment",
      titleKey: "showcase.office_title",
      descKey: "showcase.office_desc",
    },
    {
      icon: "factory",
      titleKey: "showcase.factory_title",
      descKey: "showcase.factory_desc",
    },
    {
      icon: "local_hospital",
      titleKey: "showcase.hospital_title",
      descKey: "showcase.hospital_desc",
    },
    {
      icon: "school",
      titleKey: "showcase.school_title",
      descKey: "showcase.school_desc",
    },
    {
      icon: "shopping_bag",
      titleKey: "showcase.retail_title",
      descKey: "showcase.retail_desc",
    },
    {
      icon: "hotel",
      titleKey: "showcase.hotel_title",
      descKey: "showcase.hotel_desc",
    },
  ]

  return (
    <section id="showcase" className="py-24 bg-muted/30">
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
            {t("showcase.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("showcase.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("showcase.description")}
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {solutions.map((solution) => (
            <motion.div key={solution.titleKey} variants={cardVariants}>
              <Card hover className="h-full group cursor-pointer">
                <CardContent className="pt-6">
                  {/* Icon with gradient background */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon name={solution.icon} size="lg" className="text-primary" />
                    </div>
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {t(solution.titleKey)}
                  </h3>
                  <p className="text-muted-foreground">{t(solution.descKey)}</p>

                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">{t("showcase.view_more")}</span>
                    <svg
                      className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
