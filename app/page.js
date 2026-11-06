"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import en300Data from "../300_cau_tieng_anh_giao_tiep.json";
import chunksData from "../english_chunks_1000.json";
import zhData from "../chinese_communication_chunks_v3_500plus.json";

export default function Home() {
  const [en300Count, setEn300Count] = useState(0);
  const [chunksCount, setChunksCount] = useState(0);
  const [zhCount, setZhCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
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

      setIsLoaded(true);
    }
  }, []);

  const totalEn300 = en300Data.sentences?.length || 300;
  const totalChunks = chunksData.chunks?.length || 1000;
  const totalZh = zhData.chunks?.length || 500;

  const en300Percent = Math.round((en300Count / totalEn300) * 100);
  const chunksPercent = Math.round((chunksCount / totalChunks) * 100);
  const zhPercent = Math.round((zhCount / totalZh) * 100);

  const totalLearned = en300Count + chunksCount + zhCount;
  const totalAll = totalEn300 + totalChunks + totalZh;
  const totalOverallPercent = Math.round((totalLearned / totalAll) * 100);

  return (
    <main className="container">
      {/* Multi-Section Navigation Bar */}
      <nav className="section-nav-bar">
        <Link href="/" className="section-nav-link active">
          🏠 Trang chủ
        </Link>
        <Link href="/english-300" className="section-nav-link">
          ⚡ 300 Câu Giao Tiếp
        </Link>
        <Link href="/chunks" className="section-nav-link">
          🧩 1000 Chunks Tiếng Anh
        </Link>
        <Link href="/chinese" className="section-nav-link">
          🇨🇳 500 Chunks Tiếng Trung
        </Link>
      </nav>

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
      </section>

      <footer className="app-footer">
        <p>💡 Tip: Bấm vào bất kỳ section nào ở trên hoặc dùng thanh điều hướng phía trên để bắt đầu học.</p>
      </footer>
    </main>
  );
}
