"use client";

import { useState, Suspense, lazy } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronDown,
  Clapperboard,
  Download,
  ExternalLink,
  GraduationCap,
  Joystick,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} animate-pulse rounded-xl border border-border bg-white/5`}
  />
);

// 通用模块标题：图标 + 标题 + 简介（每个 section 仍独立声明，未用循环替代）
function SectionHeader({
  icon: Icon,
  title,
  intro,
}: {
  icon: LucideIcon;
  title: string;
  intro: string;
}) {
  return (
    <div className="scroll-reveal mb-8 text-center md:mb-12">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] md:h-14 md:w-14">
        <Icon className="h-6 w-6 text-[hsl(var(--nav-theme-light))] md:h-7 md:w-7" />
      </div>
      <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">{title}</h2>
      <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
        {intro}
      </p>
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://rhythmheavengroove.wiki";

  // Controls & Accessibility 模块的手风琴展开状态
  const [controlsExpanded, setControlsExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Tools Grid 卡片 → section 锚点映射（顺序与 en.json tools.cards 一一对应）
  const toolCardAnchors = [
    "release-date-platforms",
    "demo-guide",
    "minigames-list",
    "beginner-guide",
    "multiplayer-modes",
    "beatspell-mode",
    "controls-accessibility",
    "trailers-videos",
  ];

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Rhythm Heaven Groove Wiki",
        description:
          "Complete Rhythm Heaven Groove Wiki covering release info, demo, 80+ minigames, Beatspell, local multiplayer, controls, tips, and trailers for the Nintendo Switch rhythm game.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Rhythm Heaven Groove - Quirky Rhythm Minigame Collection",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Rhythm Heaven Groove Wiki",
        alternateName: "Rhythm Heaven Groove",
        url: siteUrl,
        description:
          "Complete Rhythm Heaven Groove Wiki resource hub for release info, demo, minigames, Beatspell, multiplayer, controls, and tips",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Rhythm Heaven Groove Wiki - Quirky Rhythm Minigame Collection",
        },
        sameAs: [
          "https://www.nintendo.com/us/store/products/rhythm-heaven-groove-switch/",
          "https://www.nintendo.com/ph/switch/bflta/index.html",
          "https://www.reddit.com/r/rhythmheaven/",
          "https://www.youtube.com/watch?v=ZdMwqKiSeEE",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Rhythm Heaven Groove",
        gamePlatform: ["Nintendo Switch"],
        applicationCategory: "Game",
        genre: ["Music", "Rhythm", "Party", "Minigame"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 4,
        },
        offers: {
          "@type": "Offer",
          price: "39.99",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.nintendo.com/us/store/products/rhythm-heaven-groove-switch/",
        },
      },
      {
        "@type": "VideoObject",
        name: "Rhythm Heaven Groove – Overview Trailer",
        description:
          "Official Rhythm Heaven Groove Overview Trailer from Nintendo, showcasing 80+ rhythm games, Beatspell, and local multiplayer.",
        uploadDate: "2026-06-18",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/ZdMwqKiSeEE",
        url: "https://www.youtube.com/watch?v=ZdMwqKiSeEE",
      },
    ],
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-14 pt-24 md:pb-20 md:pt-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 scroll-reveal text-center">
            {/* Badge */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 md:mb-6 md:px-4 md:py-2"
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs font-medium md:text-sm">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:mb-6 md:text-7xl">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--nav-theme))] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[hsl(var(--nav-theme)/0.9)] md:px-8 md:py-4 md:text-lg"
              >
                <BookOpen className="h-5 w-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.nintendo.com/us/store/products/rhythm-heaven-groove-switch/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 text-base font-semibold transition-colors hover:bg-white/10 md:px-8 md:py-4 md:text-lg"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 之后（自动播放 + 点击播放后备） */}
      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl scroll-reveal">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="ZdMwqKiSeEE"
              title="Rhythm Heaven Groove – Overview Trailer – Nintendo Switch"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 张导航卡片（位于视频区之后、Latest Updates 之前） */}
      <section className="bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 scroll-reveal text-center md:mb-12">
            <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolCardAnchors[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group cursor-pointer rounded-xl border border-border bg-card p-4 text-left transition-all duration-300 hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)] md:p-6"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] transition-colors group-hover:bg-[hsl(var(--nav-theme)/0.2)] md:mb-4 md:h-12 md:w-12">
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))] md:h-6 md:w-6"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold md:text-base">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section（模板1保留模块） */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Release Date and Platforms（info-cards） */}
      <section id="release-date-platforms" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            icon={CalendarCheck}
            title={t.modules.releaseDateAndPlatforms.title}
            intro={t.modules.releaseDateAndPlatforms.intro}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.modules.releaseDateAndPlatforms.specs.map(
              (spec: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
                >
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {spec.label}
                  </span>
                  <div className="mb-1 mt-1.5 text-lg font-bold text-[hsl(var(--nav-theme-light))]">
                    {spec.value}
                  </div>
                  <p className="text-sm text-muted-foreground">{spec.detail}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Demo Guide（step-by-step） */}
      <section id="demo-guide" className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            icon={Download}
            title={t.modules.demoGuide.title}
            intro={t.modules.demoGuide.intro}
          />
          <div className="space-y-3 md:space-y-4">
            {t.modules.demoGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                  <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-bold md:mb-2 md:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: Minigames List（card-list） */}
      <section id="minigames-list" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            icon={Joystick}
            title={t.modules.minigamesList.title}
            intro={t.modules.minigamesList.intro}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {t.modules.minigamesList.games.map((game: any, index: number) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-white/5 p-6 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-1 text-xs">
                    {game.type}
                  </span>
                </div>
                <h3 className="mb-2 font-bold text-[hsl(var(--nav-theme-light))]">
                  {game.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {game.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 5: 中部停顿 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 4: Beginner Guide（step-by-step + quick tips） */}
      <section id="beginner-guide" className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            icon={GraduationCap}
            title={t.modules.beginnerGuide.title}
            intro={t.modules.beginnerGuide.intro}
          />
          <div className="mb-8 space-y-3 md:space-y-4 md:mb-10">
            {t.modules.beginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                  <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-bold md:mb-2 md:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.05)] p-4 md:p-6">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <BookOpen className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-base font-bold md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.beginnerGuide.quickTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 5: Multiplayer Modes（mode-cards） */}
      <section id="multiplayer-modes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            icon={Users}
            title={t.modules.multiplayerModes.title}
            intro={t.modules.multiplayerModes.intro}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.modules.multiplayerModes.modes.map((mode: any, index: number) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-white/5 p-6 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {mode.label}
                </span>
                <h3 className="my-2 text-lg font-bold text-[hsl(var(--nav-theme-light))]">
                  {mode.value}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  {mode.description}
                </p>
                <ul className="space-y-1.5">
                  {mode.details.map((d: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <span className="text-sm text-muted-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 6: Beatspell Mode（feature-breakdown） */}
      <section id="beatspell-mode" className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            icon={Wand2}
            title={t.modules.beatspellMode.title}
            intro={t.modules.beatspellMode.intro}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.modules.beatspellMode.features.map(
              (feature: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-6 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
                >
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {feature.label}
                  </span>
                  <h3 className="my-2 text-lg font-bold text-[hsl(var(--nav-theme-light))]">
                    {feature.value}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Controls and Accessibility（accordion） */}
      <section id="controls-accessibility" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            icon={SlidersHorizontal}
            title={t.modules.controlsAndAccessibility.title}
            intro={t.modules.controlsAndAccessibility.intro}
          />
          <div className="space-y-3">
            {t.modules.controlsAndAccessibility.faqs.map(
              (faq: any, index: number) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <button
                    onClick={() =>
                      setControlsExpanded(controlsExpanded === index ? null : index)
                    }
                    className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
                    aria-expanded={controlsExpanded === index}
                  >
                    <span className="pr-3 font-semibold">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${
                        controlsExpanded === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {controlsExpanded === index && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 8: Trailers and Videos（video-cards） */}
      <section id="trailers-videos" className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            icon={Clapperboard}
            title={t.modules.trailersAndVideos.title}
            intro={t.modules.trailersAndVideos.intro}
          />

          {/* 主视频：自动播放 + 点击播放后备 */}
          <div className="mb-8 md:mb-10">
            <VideoFeature
              videoId={t.modules.trailersAndVideos.mainVideo.videoId}
              title={t.modules.trailersAndVideos.mainVideo.title}
            />
          </div>

          {/* 视频卡片列表（外链 YouTube） */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.modules.trailersAndVideos.videos.map((video: any, index: number) => (
              <a
                key={index}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-1 text-xs">
                    {video.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {video.date}
                  </span>
                  <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground transition-colors group-hover:text-[hsl(var(--nav-theme-light))]" />
                </div>
                <h3 className="mb-2 font-bold transition-colors group-hover:text-[hsl(var(--nav-theme-light))]">
                  {video.title}
                </h3>
                <ul className="space-y-1">
                  {video.watchFor.map((w: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="border-t border-border bg-white/[0.02]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.reddit.com/r/rhythmheaven/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.reddit}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=ZdMwqKiSeEE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.nintendo.com/us/store/products/rhythm-heaven-groove-switch/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.nintendoStore}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.nintendo.com/ph/switch/bflta/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.officialSite}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
