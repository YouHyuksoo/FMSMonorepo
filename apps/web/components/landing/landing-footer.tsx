/**
 * @file components/landing/landing-footer.tsx
 * @description
 * 랜딩페이지 전용 푸터 컴포넌트입니다.
 * WBSMaster 스타일과 동일하게 구현되었습니다.
 *
 * 초보자 가이드:
 * 1. **Links**: 주요 페이지 링크
 * 2. **Social**: 소셜 미디어 링크
 * 3. **Copyright**: 저작권 정보
 */

"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"
import { Icon } from "@fms/ui/icon"
import { useTranslation } from "@/lib/language-context"

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
]

export function LandingFooter() {
  const { t } = useTranslation("landing")

  const footerLinks = {
    product: {
      title: t("footer.product"),
      links: [
        { label: t("footer.product_features"), href: "#features" },
        { label: t("footer.product_solutions"), href: "#showcase" },
        { label: t("footer.product_pricing"), href: "#pricing" },
      ],
    },
    resources: {
      title: t("footer.resources"),
      links: [
        { label: t("footer.resources_docs"), href: "/docs" },
        { label: t("footer.resources_api"), href: "/api" },
        { label: t("footer.resources_guides"), href: "/guides" },
      ],
    },
    company: {
      title: t("footer.company"),
      links: [
        { label: t("footer.company_about"), href: "/about" },
        { label: t("footer.company_blog"), href: "/blog" },
        { label: t("footer.company_contact"), href: "/contact" },
      ],
    },
    legal: {
      title: t("footer.legal"),
      links: [
        { label: t("footer.legal_privacy"), href: "/privacy" },
        { label: t("footer.legal_terms"), href: "/terms" },
        { label: t("footer.legal_license"), href: "/license" },
      ],
    },
  }

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Icon name="apartment" size="md" className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">FMS</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
