"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/", label: "🏠 Trang chủ", activeClass: "active" },
  { href: "/english-300", label: "⚡ 300 Giao Tiếp", activeClass: "active" },
  { href: "/chunks", label: "🧩 1000 Chunks EN", activeClass: "active-chunks" },
  { href: "/ielts-words", label: "🎯 IELTS Words", activeClass: "active-ielts" },
  { href: "/interview-qa", label: "💼 500 Q&A Phỏng Vấn", activeClass: "active-interview" },
  { href: "/chinese", label: "🇨🇳 500 Chunks Tiếng Trung", activeClass: "active-chinese" },
  { href: "/japanese", label: "🇯🇵 300 Chunks Tiếng Nhật", activeClass: "active-japanese" },
];

export default function SectionNav() {
  const pathname = usePathname();

  return (
    <nav className="section-nav-bar">
      {SECTIONS.map((sec) => {
        const isActive = pathname === sec.href;
        return (
          <Link
            key={sec.href}
            href={sec.href}
            className={`section-nav-link ${isActive ? sec.activeClass : ""}`}
          >
            {sec.label}
          </Link>
        );
      })}
    </nav>
  );
}

