"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SectionNav from "./components/SectionNav";
import {
  ArrowRightIcon,
  HeadphonesIcon,
  TargetIcon,
  MessageSquareIcon,
  LayersIcon,
  BookOpenIcon,
  BriefcaseIcon,
  MicIcon,
  LanguagesIcon,
  LightbulbIcon,
  AwardIcon,
  FileTextIcon,
} from "./components/Icons";
import en300Data from "../300_cau_tieng_anh_giao_tiep.json";
import chunksData from "../english_chunks_1000.json";
import grammarData from "../english_grammar_ielts8.json";
import zhData from "../chinese_communication_chunks_v3_500plus.json";
import jaData from "../japanese_communication_chunks.json";
import { ZH_EXTRA_CHUNKS } from "./lib/chineseCommModules";
import { JA_EXTRA_CHUNKS } from "./lib/japaneseCommModules";
import ieltsData from "../ielts_vocabulary.json";
import interviewData from "../interview_500_qa.json";
import speakingData from "../ielts_speaking_30_days.json";

export default function Home() {
  const [en300Count, setEn300Count] = useState(0);
  const [chunksCount, setChunksCount] = useState(0);
  const [grammarCount, setGrammarCount] = useState(0);
  const [zhCount, setZhCount] = useState(0);
  const [jaCount, setJaCount] = useState(0);
  const [ieltsCount, setIeltsCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [speakingDaysCount, setSpeakingDaysCount] = useState(0);
  const [listenDrillFound, setListenDrillFound] = useState(0);
  const [listenDrillFirstTry, setListenDrillFirstTry] = useState(0);
  const [ieltsListeningCount, setIeltsListeningCount] = useState(0);
  const [ieltsReadingCount, setIeltsReadingCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const ieltsReadingStored = localStorage.getItem("ielts_reading_progress");
        if (ieltsReadingStored) {
          const parsed = JSON.parse(ieltsReadingStored);
          setIeltsReadingCount(Object.keys(parsed).length);
        }
      } catch (e) {}
      try {
        const ieltsListeningStored = localStorage.getItem("ielts_listening_progress");
        if (ieltsListeningStored) setIeltsListeningCount(JSON.parse(ieltsListeningStored).length);
      } catch (e) {}
      try {
        const found = parseInt(localStorage.getItem("listen_drill_found") || "0", 10);
        const firstTry = parseInt(localStorage.getItem("listen_drill_first_try") || "0", 10);
        if (!isNaN(found)) setListenDrillFound(found);
        if (!isNaN(firstTry)) setListenDrillFirstTry(firstTry);
      } catch (e) {}
      try {
        const en300Stored = localStorage.getItem("english_300_progress");
        if (en300Stored) setEn300Count(JSON.parse(en300Stored).length);
      } catch (e) {}
      try {
        const chunksStored = localStorage.getItem("chunks_1000_progress");
        if (chunksStored) setChunksCount(JSON.parse(chunksStored).length);
      } catch (e) {}
      try {
        const grammarStored = localStorage.getItem("english_grammar_progress");
        if (grammarStored) setGrammarCount(JSON.parse(grammarStored).length);
      } catch (e) {}
      try {
        const zhStored = localStorage.getItem("chinese_500_progress");
        if (zhStored) setZhCount(JSON.parse(zhStored).length);
      } catch (e) {}
      try {
        const jaStored = localStorage.getItem("japanese_chunks_progress");
        if (jaStored) setJaCount(JSON.parse(jaStored).length);
      } catch (e) {}
      try {
        const ieltsStored = localStorage.getItem("ielts_words_progress");
        if (ieltsStored) setIeltsCount(JSON.parse(ieltsStored).length);
      } catch (e) {}
      try {
        const interviewStored = localStorage.getItem("interview_qa_progress");
        if (interviewStored) setInterviewCount(JSON.parse(interviewStored).length);
      } catch (e) {}
      try {
        const speakingStored = localStorage.getItem("ielts_speaking_completed_days");
        if (speakingStored) setSpeakingDaysCount(JSON.parse(speakingStored).length);
      } catch (e) {}
    }
  }, []);

  const totalEn300 = en300Data.sentences?.length || 300;
  const totalChunks = chunksData.chunks?.length || 1000;
  const totalGrammar = grammarData.items?.length || 45;
  const totalZh = (zhData.chunks?.length || 500) + ZH_EXTRA_CHUNKS.length;
  const totalJa = (jaData.chunks?.length || 300) + JA_EXTRA_CHUNKS.length;
  const totalIelts = Array.isArray(ieltsData) ? ieltsData.length : 3517;
  const totalInterview = interviewData.total_questions || 155;
  const totalSpeakingDays = speakingData.days?.length || 30;
  const totalReadingTests = 304;

  const en300Percent = Math.round((en300Count / totalEn300) * 100);
  const chunksPercent = Math.round((chunksCount / totalChunks) * 100);
  const grammarPercent = Math.round((grammarCount / totalGrammar) * 100);
  const zhPercent = Math.round((zhCount / totalZh) * 100);
  const jaPercent = Math.round((jaCount / totalJa) * 100);
  const ieltsPercent = Math.round((ieltsCount / totalIelts) * 100);
  const interviewPercent = Math.round((interviewCount / totalInterview) * 100);
  const speakingPercent = Math.round((speakingDaysCount / totalSpeakingDays) * 100);
  const ieltsListeningPercent = Math.round((ieltsListeningCount / 210) * 100);
  const readingPercent = Math.round((ieltsReadingCount / totalReadingTests) * 100);
  const drillPercent = Math.min(100, Math.round((listenDrillFound / 50) * 100));

  const totalLearned =
    en300Count + chunksCount + grammarCount + zhCount + jaCount + ieltsCount + interviewCount + speakingDaysCount + ieltsReadingCount;
  const totalAll =
    totalEn300 + totalChunks + totalGrammar + totalZh + totalJa + totalIelts + totalInterview + totalSpeakingDays + totalReadingTests;
  const totalOverallPercent = Math.round((totalLearned / totalAll) * 100);

  const tracks = [
    {
      title: "Luyện Nghe & Đọc Phản Xạ (IELTS)",
      subtitle: "Rèn tốc độ nhận diện âm thanh, từ khóa và kỹ năng làm bài Reading Academic trên máy.",
      cards: [
        {
          href: "/listen-drill",
          code: "DRILL",
          badge: "IELTS Part 1 • 7 Dạng Phản Xạ",
          title: "Listen & Find (Task 1 Studio)",
          desc: "Luyện đủ mọi dạng Listening Part 1: Alphabet, Số lên tới hàng triệu, Số điện thoại, Date & Time, Tên riêng, Địa chỉ & Word.",
          statLabel: "Đã tìm đúng",
          statValue: `${listenDrillFound} lần (First try: ${listenDrillFirstTry})`,
          percent: drillPercent,
          cta: "Luyện phản xạ",
          Icon: HeadphonesIcon,
        },
        {
          href: "/ielts-listening",
          code: "IELTS",
          badge: "Part 1 & 2 • Names, Traps & Numbers",
          title: "IELTS Listening Trainer",
          desc: "Luyện gõ phím bắt chuẩn 3 mỏ điểm: Đánh vần Tên & Postcode, Bẫy chính tả và Số đếm.",
          statLabel: "Tiến độ",
          statValue: `${ieltsListeningCount}/210 mục (${ieltsListeningPercent}%)`,
          percent: ieltsListeningPercent,
          cta: "Luyện Part 1 & 2",
          Icon: TargetIcon,
        },
        {
          href: "/ielts-reading",
          code: "IELTS",
          badge: `Academic • ${totalReadingTests} Đề Chuẩn (${totalReadingTests * 40} Câu)`,
          title: "IELTS Reading Practice",
          desc: `Luyện trọn bộ ${totalReadingTests} đề IELTS Reading Academic với giao diện split-screen thi trên máy tính, chọn/điền đáp án, bấm Submit chấm điểm IELTS Band Score tự động.`,
          statLabel: "Đã làm",
          statValue: `${ieltsReadingCount}/${totalReadingTests} đề (${readingPercent}%)`,
          percent: readingPercent,
          cta: "Luyện Reading",
          Icon: FileTextIcon,
        },
      ],
    },
    {
      title: "IELTS & Phỏng Vấn",
      subtitle: "Hệ thống lộ trình 30 ngày Speaking, từ vựng học thuật và câu hỏi phỏng vấn.",
      cards: [
        {
          href: "/ielts-speaking",
          code: "IELTS",
          badge: "Speaking • 30-Day Chunking Plan",
          title: "IELTS Speaking 30 Ngày",
          desc: "Lộ trình 30 ngày phản xạ Chunking & tư duy A-R-D hướng tới Band 7.0 – 8.0+.",
          statLabel: "Tiến độ",
          statValue: `${speakingDaysCount}/${totalSpeakingDays} ngày (${speakingPercent}%)`,
          percent: speakingPercent,
          cta: "Vào luyện nói",
          Icon: MicIcon,
        },
        {
          href: "/ielts-words",
          code: "IELTS",
          badge: "Học thuật • 3,500+ Từ Vựng",
          title: "IELTS Word Trainer",
          desc: "Từ vựng IELTS phân loại theo chủ đề, cấp độ, phiên âm IPA, ví dụ và từ đồng/trái nghĩa.",
          statLabel: "Tiến độ",
          statValue: `${ieltsCount}/${totalIelts} (${ieltsPercent}%)`,
          percent: ieltsPercent,
          cta: "Học từ vựng",
          Icon: BookOpenIcon,
        },
        {
          href: "/grammar",
          code: "EN",
          badge: "Grammar • Cơ bản đến IELTS 8.0+",
          title: "English Grammar Mastery",
          desc: "45 chủ điểm ngữ pháp theo 10 dạng bài từ A1 đến Band 8.0+, kèm ví dụ nghe phát âm và đếm lượt đọc.",
          statLabel: "Tiến độ",
          statValue: `${grammarCount}/${totalGrammar} chủ điểm (${grammarPercent}%)`,
          percent: grammarPercent,
          cta: "Học ngữ pháp",
          Icon: AwardIcon,
        },
        {
          href: "/interview-qa",
          code: "DEV",
          badge: "Phỏng vấn • Web Developer Q&A",
          title: "Phỏng Vấn Web Developer",
          desc: "155 câu hỏi phỏng vấn tiếng Anh thực chiến và câu trả lời mẫu cho Web Developer.",
          statLabel: "Tiến độ",
          statValue: `${interviewCount}/${totalInterview} (${interviewPercent}%)`,
          percent: interviewPercent,
          cta: "Luyện phỏng vấn",
          Icon: BriefcaseIcon,
        },
      ],
    },
    {
      title: "Giao Tiếp & Chunks Đa Ngôn Ngữ",
      subtitle: "Nạp cụm từ tự nhiên (chunks) để phản xạ giao tiếp không dịch từng từ.",
      cards: [
        {
          href: "/english-300",
          code: "EN",
          badge: "Tiếng Anh • Giao tiếp nền tảng",
          title: "300 Câu Giao Tiếp Cốt Lõi",
          desc: "Các mẫu câu thông dụng theo 11 chủ đề thực tế, kèm gợi ý đáp lại và phát âm US/UK.",
          statLabel: "Tiến độ",
          statValue: `${en300Count}/${totalEn300} (${en300Percent}%)`,
          percent: en300Percent,
          cta: "Vào học",
          Icon: MessageSquareIcon,
        },
        {
          href: "/chunks",
          code: "EN",
          badge: "Tiếng Anh • Chunking Collocations",
          title: "1000 English Chunks",
          desc: "1000 cụm từ liên kết tự nhiên theo 10 chủ đề IELTS & giao tiếp kèm pattern và ví dụ.",
          statLabel: "Tiến độ",
          statValue: `${chunksCount}/${totalChunks} (${chunksPercent}%)`,
          percent: chunksPercent,
          cta: "Vào học",
          Icon: LayersIcon,
        },
        {
          href: "/chinese",
          code: "ZH",
          badge: "Tiếng Trung • HSK 1 → HSK 6",
          title: "600 Chunks & Hội Thoại Trung",
          desc: "600 chunks thực chiến, 15 kịch bản hội thoại, 12 mẫu câu ghép và phát âm 4 thanh điệu.",
          statLabel: "Tiến độ",
          statValue: `${zhCount}/${totalZh} (${zhPercent}%)`,
          percent: zhPercent,
          cta: "Học tiếng Trung",
          Icon: LanguagesIcon,
        },
        {
          href: "/japanese",
          code: "JA",
          badge: "Tiếng Nhật • N5 → N2 (Đủ 3 sắc thái)",
          title: "400+ Chunks & Hội Thoại Nhật",
          desc: "401 chunks (Bạn bè, Lịch sự, Kính ngữ), 15 bài hội thoại, 12 mẫu câu và phát âm nền tảng.",
          statLabel: "Tiến độ",
          statValue: `${jaCount}/${totalJa} (${jaPercent}%)`,
          percent: jaPercent,
          cta: "Học tiếng Nhật",
          Icon: LanguagesIcon,
        },
      ],
    },
  ];

  return (
    <main className="container">
      <SectionNav />

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Language Study Studio</span>
          <h1>Học Ngoại Ngữ Qua Chunks &amp; Phản Xạ</h1>
          <p className="hero-subtitle">
            Phương pháp học cụm từ tự nhiên, luyện nghe phát âm bản xứ và theo dõi tiến độ từng ngày.
          </p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tổng tiến trình toàn bộ lộ trình</span>
            <span className="stat-value">
              {totalLearned}/{totalAll} mục ({totalOverallPercent}%)
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${totalOverallPercent}%` }} />
          </div>
        </div>
      </header>

      <div className="home-tracks">
        {tracks.map((track) => (
          <section key={track.title} className="home-track-section">
            <div className="home-track-header">
              <h2 className="home-track-title">{track.title}</h2>
              <p className="home-track-desc">{track.subtitle}</p>
            </div>

            <div className="home-sections-grid">
              {track.cards.map(({ href, code, badge, title, desc, statLabel, statValue, percent, cta, Icon }) => (
                <Link key={href} href={href} className="home-section-card">
                  <div>
                    <div className="home-card-top">
                      <span className="home-section-badge">
                        <span className="badge-code">{code}</span>
                        <span>{badge}</span>
                      </span>
                      <span className="home-card-icon">
                        <Icon size={17} />
                      </span>
                    </div>
                    <h3 className="home-section-title">{title}</h3>
                    <p className="home-section-desc">{desc}</p>
                  </div>

                  <div className="home-section-progress-wrap">
                    <div className="home-section-stats">
                      <span className="home-stat-label">{statLabel}</span>
                      <span className="home-stat-value">{statValue}</span>
                    </div>
                    <div className="progress-bar-container progress-bar-container--thin">
                      <div className="progress-bar" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="home-section-cta">
                      <span>{cta}</span>
                      <ArrowRightIcon size={15} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>Tip: Bấm vào bất kỳ phân hệ nào ở trên hoặc chuyển nhanh qua thanh điều hướng phía trên.</span>
        </p>
      </footer>
    </main>
  );
}
