"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import StudyTimer from "./StudyTimer";
import {
  HomeIcon,
  HeadphonesIcon,
  TargetIcon,
  MessageSquareIcon,
  LayersIcon,
  BookOpenIcon,
  BriefcaseIcon,
  MicIcon,
  LanguagesIcon,
  AwardIcon,
  MenuIcon,
  XIcon,
  FileTextIcon,
} from "./Icons";

export const SECTIONS = [
  { href: "/", label: "Trang chủ", Icon: HomeIcon, lang: "all" },

  // Tiếng Anh (IELTS & Kỹ năng)
  { href: "/listen-drill", label: "Listen & Find", Icon: HeadphonesIcon, lang: "en" },
  { href: "/ielts-listening", label: "IELTS Listening", Icon: TargetIcon, lang: "en" },
  { href: "/ielts-reading", label: "IELTS Reading", Icon: FileTextIcon, lang: "en" },
  { href: "/ielts-speaking", label: "Speaking 30D", Icon: MicIcon, lang: "en" },
  { href: "/ielts-words", label: "IELTS Words", Icon: BookOpenIcon, lang: "en" },
  { href: "/grammar", label: "Grammar → 8.0", Icon: AwardIcon, lang: "en" },

  // Tiếng Anh (Giao tiếp & Dev)
  { href: "/english-300", label: "300 Giao Tiếp", Icon: MessageSquareIcon, lang: "en" },
  { href: "/chunks", label: "1000 Chunks EN", Icon: LayersIcon, lang: "en" },
  { href: "/interview-qa", label: "500 Q&A Dev", Icon: BriefcaseIcon, lang: "en" },

  // Tiếng Trung (HSK 3.0 & Giao tiếp)
  { href: "/hsk-words", label: "HSK Words (1-5)", Icon: BookOpenIcon, lang: "zh" },
  { href: "/hsk-grammar", label: "HSK Ngữ Pháp", Icon: AwardIcon, lang: "zh" },
  { href: "/chinese", label: "600 Chunks ZH", Icon: LanguagesIcon, lang: "zh" },

  // Tiếng Nhật (JLPT & Giao tiếp)
  { href: "/japanese", label: "400 Chunks JA", Icon: LanguagesIcon, lang: "ja" },
];

export default function SectionNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  // Grouped sections for mobile drawer
  const groupedSections = useMemo(() => {
    return [
      {
        id: "en",
        title: "🇬🇧 TIẾNG ANH (IELTS & DEV)",
        items: SECTIONS.filter((s) => s.lang === "en"),
      },
      {
        id: "zh",
        title: "🇨🇳 TIẾNG TRUNG (HSK 3.0 & GIAO TIẾP)",
        items: SECTIONS.filter((s) => s.lang === "zh"),
      },
      {
        id: "ja",
        title: "🇯🇵 TIẾNG NHẬT (GIAO TIẾP & JLPT)",
        items: SECTIONS.filter((s) => s.lang === "ja"),
      },
    ];
  }, []);

  return (
    <>
      <div className="section-nav-wrapper">
        {/* Compact Mobile/Narrow Bar: Hamburger Icon + Home Button */}
        <div className="section-nav-mobile-left">
          <button
            type="button"
            className="nav-hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Mở danh mục học tập"
            aria-expanded={drawerOpen}
            title="Danh mục các phân hệ"
          >
            <MenuIcon size={18} />
          </button>

          <Link
            href="/"
            className={`nav-mobile-home-btn ${pathname === "/" ? "active" : ""}`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <HomeIcon size={15} />
            <span>Trang chủ</span>
          </Link>
        </div>

        {/* Full Desktop Navigation Bar with all Sections */}
        <nav className="section-nav-bar" aria-label="Điều hướng phân hệ học tập">
          {SECTIONS.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`section-nav-link ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="section-nav-right-utils">
          <StudyTimer />
          <ThemeToggle />
        </div>
      </div>

      {/* Slide-out Mobile Navigation Drawer with Structured Language Groups */}
      {drawerOpen && (
        <div
          className="nav-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          role="presentation"
        >
          <aside
            className="nav-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            aria-label="Menu danh mục học tập"
          >
            <div className="nav-drawer-header">
              <span className="nav-drawer-title">Phân Hệ Học Tập</span>
              <button
                type="button"
                className="nav-drawer-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Đóng menu"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="nav-drawer-content">
              {/* Home link */}
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className={`nav-drawer-item nav-drawer-home-item ${pathname === "/" ? "active" : ""}`}
              >
                <HomeIcon size={17} />
                <span>Trang chủ tổng quan</span>
              </Link>

              {/* Grouped by Language */}
              {groupedSections.map((group) => (
                <div key={group.id} className="nav-drawer-group">
                  <div className="nav-drawer-group-title">{group.title}</div>
                  <div className="nav-drawer-group-items">
                    {group.items.map(({ href, label, Icon }) => {
                      const isActive = pathname === href;
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDrawerOpen(false)}
                          className={`nav-drawer-item ${isActive ? "active" : ""}`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon size={17} />
                          <span>{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
