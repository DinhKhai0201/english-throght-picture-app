"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SectionNav from "./components/SectionNav";
import en300Data from "../300_cau_tieng_anh_giao_tiep.json";
import chunksData from "../english_chunks_1000.json";
import zhData from "../chinese_communication_chunks_v3_500plus.json";
import jaData from "../japanese_communication_chunks.json";
import ieltsData from "../ielts_vocabulary.json";
import interviewData from "../interview_500_qa.json";

export default function Home() {
  const [en300Count, setEn300Count] = useState(0);
  const [chunksCount, setChunksCount] = useState(0);
  const [zhCount, setZhCount] = useState(0);
  const [jaCount, setJaCount] = useState(0);
  const [ieltsCount, setIeltsCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [listenDrillFound, setListenDrillFound] = useState(0);
  const [listenDrillFirstTry, setListenDrillFirstTry] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const found = parseInt(localStorage.getItem("listen_drill_found") || "0", 10);
        const firstTry = parseInt(localStorage.getItem("listen_drill_first_try") || "0", 10);
        if (!isNaN(found)) setListenDrillFound(found);
        if (!isNaN(firstTry)) setListenDrillFirstTry(firstTry);
      } catch (e) {}
      try {
        const en300Stored = localStorage.getItem("english_300_progress");
        if (en300Stored) {
          setEn300Count(JSON.parse(en300Stored).length);
        }
      } catch (e) {}

      try {
        const chunksStored = localStorage.getItem("chunks_1000_progress");
        if (chunksStored) {
          setChunksCount(JSON.parse(chunksStored).length);
        }
      } catch (e) {}

      try {
        const zhStored = localStorage.getItem("chinese_500_progress");
        if (zhStored) {
          setZhCount(JSON.parse(zhStored).length);
        }
      } catch (e) {}

      try {
        const jaStored = localStorage.getItem("japanese_chunks_progress");
        if (jaStored) {
          setJaCount(JSON.parse(jaStored).length);
        }
      } catch (e) {}

      try {
        const ieltsStored = localStorage.getItem("ielts_words_progress");
        if (ieltsStored) {
          setIeltsCount(JSON.parse(ieltsStored).length);
        }
      } catch (e) {}

      try {
        const interviewStored = localStorage.getItem("interview_qa_progress");
        if (interviewStored) {
          setInterviewCount(JSON.parse(interviewStored).length);
        }
      } catch (e) {}

      setIsLoaded(true);
    }
  }, []);

  const totalEn300 = en300Data.sentences?.length || 300;
  const totalChunks = chunksData.chunks?.length || 1000;
  const totalZh = zhData.chunks?.length || 500;
  const totalJa = jaData.chunks?.length || 300;
  const totalIelts = Array.isArray(ieltsData) ? ieltsData.length : 3517;
  const totalInterview = interviewData.total_questions || 155;

  const en300Percent = Math.round((en300Count / totalEn300) * 100);
  const chunksPercent = Math.round((chunksCount / totalChunks) * 100);
  const zhPercent = Math.round((zhCount / totalZh) * 100);
  const jaPercent = Math.round((jaCount / totalJa) * 100);
  const ieltsPercent = Math.round((ieltsCount / totalIelts) * 100);
  const interviewPercent = Math.round((interviewCount / totalInterview) * 100);

  const totalLearned = en300Count + chunksCount + zhCount + jaCount + ieltsCount + interviewCount;
  const totalAll = totalEn300 + totalChunks + totalZh + totalJa + totalIelts + totalInterview;
  const totalOverallPercent = Math.round((totalLearned / totalAll) * 100);

  return (
    <main className="container">
      {/* Multi-Section Navigation Bar */}
      <SectionNav />

      {/* Hero Welcome */}
      <header className="hero">
        <div className="hero-content">
          <h1>🎯 Học Ngoại Ngữ Qua Chunks & Phản Xạ</h1>
          <p className="hero-subtitle">
            Phương pháp học cụm từ tự nhiên, nghe phát âm bản xứ, ghi nhớ lâu và tự tin giao tiếp
          </p>
        </div>

        {/* Global Progress Card */}
        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tổng tiến trình học của bạn</span>
            <span className="stat-value">
              {totalLearned}/{totalAll} mục ({totalOverallPercent}%)
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${totalOverallPercent}%` }}></div>
          </div>
        </div>
      </header>

      {/* 3 Main Sections Grid */}
      <section className="home-sections-grid">
        {/* Section 0: Listen & Find Drill (Alphabet & Numbers) */}
        <Link href="/listen-drill" className="home-section-card card-drill" style={{ borderLeftColor: "#0e7490" }}>
          <div>
            <span className="home-section-badge badge-drill" style={{ background: "#e0f2fe", color: "#0369a1" }}>
              🎧 Phản Xạ Nghe • Alphabet & Numbers
            </span>
            <h2 className="home-section-title">Listen & Find (Luyện Nghe Phản Xạ)</h2>
            <p className="home-section-desc">
              Nghe âm thanh và tìm nhanh chữ cái (Alphabet a-z, A-Z) và số đếm (Numbers), hỗ trợ bấm phím máy tính trực tiếp siêu nhanh.
            </p>
          </div>

          <div className="home-section-progress-wrap">
            <div className="home-section-stats">
              <span style={{ color: "var(--color-text-muted)" }}>Đã tìm đúng:</span>
              <span style={{ color: "#0e7490", fontWeight: "700" }}>
                {listenDrillFound} lần (First Try: {listenDrillFirstTry})
              </span>
            </div>
            <div className="progress-bar-container" style={{ height: "8px", backgroundColor: "#e2e8f0" }}>
              <div
                className="progress-bar"
                style={{ width: `${Math.min(100, Math.round((listenDrillFound / 50) * 100))}%`, backgroundColor: "#0e7490" }}
              ></div>
            </div>
            <div className="home-section-cta" style={{ color: "#0e7490" }}>
              Vào luyện phản xạ ngay →
            </div>
          </div>
        </Link>

        {/* Section 1: 300 English Sentences */}
        <Link href="/english-300" className="home-section-card card-en300">
          <div>
            <span className="home-section-badge badge-en300">
              ⚡ Tiếng Anh • Giao Tiếp Nền Tảng
            </span>
            <h2 className="home-section-title">300 Câu Giao Tiếp Cốt Lõi</h2>
            <p className="home-section-desc">
              Các mẫu câu thông dụng nhất chia theo 11 chủ đề thực tế, kèm gợi ý câu phản hồi và phát âm chuẩn US/UK.
            </p>
          </div>

          <div className="home-section-progress-wrap">
            <div className="home-section-stats">
              <span style={{ color: "var(--color-text-muted)" }}>Tiến độ:</span>
              <span style={{ color: "#4f46e5" }}>
                {en300Count}/{totalEn300} ({en300Percent}%)
              </span>
            </div>
            <div className="progress-bar-container" style={{ height: "8px", backgroundColor: "#e2e8f0" }}>
              <div
                className="progress-bar"
                style={{ width: `${en300Percent}%`, backgroundColor: "#4f46e5" }}
              ></div>
            </div>
            <div className="home-section-cta">
              Vào học ngay →
            </div>
          </div>
        </Link>

        {/* Section 2: 1000 English Chunks */}
        <Link href="/chunks" className="home-section-card card-chunks">
          <div>
            <span className="home-section-badge badge-chunks">
              🧩 Tiếng Anh • Chunking Collocations
            </span>
            <h2 className="home-section-title">1000 English Chunks</h2>
            <p className="home-section-desc">
              1000 cụm từ và mẫu liên kết tự nhiên theo 10 chủ đề IELTS & giao tiếp, kèm cấu trúc pattern và câu ví dụ minh họa.
            </p>
          </div>

          <div className="home-section-progress-wrap">
            <div className="home-section-stats">
              <span style={{ color: "var(--color-text-muted)" }}>Tiến độ:</span>
              <span style={{ color: "#059669" }}>
                {chunksCount}/{totalChunks} ({chunksPercent}%)
              </span>
            </div>
            <div className="progress-bar-container" style={{ height: "8px", backgroundColor: "#e2e8f0" }}>
              <div
                className="progress-bar"
                style={{ width: `${chunksPercent}%`, backgroundColor: "#059669" }}
              ></div>
            </div>
            <div className="home-section-cta">
              Vào học ngay →
            </div>
          </div>
        </Link>

        {/* Section: IELTS Word Trainer */}
        <Link href="/ielts-words" className="home-section-card card-ielts">
          <div>
            <span className="home-section-badge badge-ielts">
              🎯 Học Thuật • 3,500+ IELTS Words
            </span>
            <h2 className="home-section-title">IELTS Word Trainer</h2>
            <p className="home-section-desc">
              Hơn 3,500 từ vựng IELTS học thuật phân loại theo chủ đề, cấp độ, câu ví dụ và từ đồng nghĩa/trái nghĩa.
            </p>
          </div>

          <div className="home-section-progress-wrap">
            <div className="home-section-stats">
              <span style={{ color: "var(--color-text-muted)" }}>Tiến độ:</span>
              <span style={{ color: "#d97706" }}>
                {ieltsCount}/{totalIelts} ({ieltsPercent}%)
              </span>
            </div>
            <div className="progress-bar-container" style={{ height: "8px", backgroundColor: "#e2e8f0" }}>
              <div
                className="progress-bar"
                style={{ width: `${ieltsPercent}%`, backgroundColor: "#f59e0b" }}
              ></div>
            </div>
            <div className="home-section-cta">
              Vào học ngay →
            </div>
          </div>
        </Link>

        {/* Section: 500 Interview Q&A */}
        <Link href="/interview-qa" className="home-section-card card-interview">
          <div>
            <span className="home-section-badge badge-interview">
              💼 Phỏng Vấn • 500 Q&A Xin Việc
            </span>
            <h2 className="home-section-title">500 Phỏng Vấn Xin Việc</h2>
            <p className="home-section-desc">
              155 câu hỏi phỏng vấn tiếng Anh cốt lõi và 350 phương án trả lời mẫu ghi điểm với nhà tuyển dụng.
            </p>
          </div>

          <div className="home-section-progress-wrap">
            <div className="home-section-stats">
              <span style={{ color: "var(--color-text-muted)" }}>Tiến độ:</span>
              <span style={{ color: "#0284c7" }}>
                {interviewCount}/{totalInterview} ({interviewPercent}%)
              </span>
            </div>
            <div className="progress-bar-container" style={{ height: "8px", backgroundColor: "#e2e8f0" }}>
              <div
                className="progress-bar"
                style={{ width: `${interviewPercent}%`, backgroundColor: "#0284c7" }}
              ></div>
            </div>
            <div className="home-section-cta">
              Vào học ngay →
            </div>
          </div>
        </Link>

        {/* Section 3: 500 Chinese Chunks */}
        <Link href="/chinese" className="home-section-card card-chinese">
          <div>
            <span className="home-section-badge badge-chinese">
              🇨🇳 Tiếng Trung • Hán Tự & Pinyin
            </span>
            <h2 className="home-section-title">500 Chunks Tiếng Trung</h2>
            <p className="home-section-desc">
              500 mẫu chunks và phản xạ hội thoại tiếng Trung thông dụng nhất, đầy đủ Pinyin thanh điệu, giải nghĩa và mẹo học nhanh.
            </p>
          </div>

          <div className="home-section-progress-wrap">
            <div className="home-section-stats">
              <span style={{ color: "var(--color-text-muted)" }}>Tiến độ:</span>
              <span style={{ color: "#e11d48" }}>
                {zhCount}/{totalZh} ({zhPercent}%)
              </span>
            </div>
            <div className="progress-bar-container" style={{ height: "8px", backgroundColor: "#e2e8f0" }}>
              <div
                className="progress-bar"
                style={{ width: `${zhPercent}%`, backgroundColor: "#e11d48" }}
              ></div>
            </div>
            <div className="home-section-cta">
              Vào học ngay →
            </div>
          </div>
        </Link>

        {/* Section 4: 300 Japanese Chunks */}
        <Link href="/japanese" className="home-section-card card-japanese">
          <div>
            <span className="home-section-badge badge-japanese">
              🇯🇵 Tiếng Nhật • Kana & Romaji
            </span>
            <h2 className="home-section-title">300 Chunks Tiếng Nhật</h2>
            <p className="home-section-desc">
              301 cụm giao tiếp tiếng Nhật thực chiến theo 31 chủ đề, kèm Kana, Romaji và phân loại sắc thái lịch sự / thân mật.
            </p>
          </div>

          <div className="home-section-progress-wrap">
            <div className="home-section-stats">
              <span style={{ color: "var(--color-text-muted)" }}>Tiến độ:</span>
              <span style={{ color: "#8b5cf6" }}>
                {jaCount}/{totalJa} ({jaPercent}%)
              </span>
            </div>
            <div className="progress-bar-container" style={{ height: "8px", backgroundColor: "#e2e8f0" }}>
              <div
                className="progress-bar"
                style={{ width: `${jaPercent}%`, backgroundColor: "#8b5cf6" }}
              ></div>
            </div>
            <div className="home-section-cta">
              Vào học ngay →
            </div>
          </div>
        </Link>
      </section>

      <footer className="app-footer">
        <p>💡 Tip: Bấm vào bất kỳ section nào ở trên hoặc dùng thanh điều hướng phía trên để bắt đầu học.</p>
      </footer>
    </main>
  );
}
