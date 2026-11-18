"use client";

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

  return (
    <div className="section-nav-wrapper">
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
      <StudyTimer />
      <ThemeToggle />
    </div>
  );
}
