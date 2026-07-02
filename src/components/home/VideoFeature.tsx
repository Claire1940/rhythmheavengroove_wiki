"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, ExternalLink } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * 自适应视频组件：
 * - IntersectionObserver 监测视频区域进入视口时自动加载并播放（autoplay=1&mute=1&loop=1）
 * - 进入视口前展示封面图 + 中央播放按钮，作为点击播放的后备入口
 * - 浏览器自动播放策略要求静音，故自动播放默认 mute；用户点击播放按钮或 YouTube 控件可手动解除静音
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);

  const watchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${videoId}`,
    [videoId],
  );

  const thumbUrl = useMemo(
    () => `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    [videoId],
  );

  // loop=1 在单视频 embed 中需要 playlist=<videoId> 才会真正循环
  const embedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`,
    [videoId],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || activated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActivated(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activated]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black/40 ring-1 ring-[hsl(var(--nav-theme)/0.2)]"
        style={{ paddingBottom: "56.25%" }}
      >
        {activated ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 flex h-full w-full items-center justify-center"
          >
            {/* 封面图 */}
            <img
              src={thumbUrl}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* 渐变遮罩，保证播放按钮可读 */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 transition-opacity group-hover:opacity-90"
            />
            {/* 中央播放按钮（点击后备） */}
            <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] text-white shadow-lg transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
              <Play className="h-7 w-7 translate-x-0.5 fill-current md:h-9 md:w-9" />
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
