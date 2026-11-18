"use client";

import { useState, useEffect } from "react";
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
} from "./Icons";

const SECTIONS = [
  { href: "/", label: "Trang chủ", Icon: HomeIcon },
  { href: "/listen-drill", label: "Listen & Find", Icon: HeadphonesIcon },
  { href: "/ielts-listening", label: "IELTS Listening", Icon: TargetIcon },
  { href: "/english-300", label: "300 Giao Tiếp", Icon: MessageSquareIcon },
  { href: "/chunks", label: "1000 Chunks EN", Icon: LayersIcon },
  { href: "/grammar", label: "Grammar → 8.0", Icon: AwardIcon },
  { href: "/ielts-words", label: "IELTS Words", Icon: BookOpenIcon },
  { href: "/interview-qa", label: "500 Q&A Dev", Icon: BriefcaseIcon },
  { href: "/ielts-speaking", label: "Speaking 30D", Icon: MicIcon },
  { href: "/chinese", label: "600 Chunks ZH", Icon: LanguagesIcon },
  { href: "/japanese", label: "400 Chunks JA", Icon: LanguagesIcon },
];

export default function SectionNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer automatically on route change or Escape key
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

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
            title="Danh mục các phần học"
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

        {/* Full Desktop Bar */}
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

      {/* Slide-out Mobile Navigation Drawer */}
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
              <span className="nav-drawer-title">Danh mục học tập</span>
              <button
                type="button"
                className="nav-drawer-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Đóng menu"
              >
                <XIcon size={18} />
              </button>
            </div>

            <nav className="nav-drawer-list">
              {SECTIONS.map(({ href, label, Icon }) => {
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
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
