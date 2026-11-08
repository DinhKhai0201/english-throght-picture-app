"use client";

import { useState, useEffect } from "react";
import rawData from "../../english_chunks_1000.json";
import Link from "next/link";

const TOPIC_MAP = {
  topic_01: "⭐ Core Chunks",
  topic_02: "🏫 Society & Education",
  topic_03: "💻 Technology & Environment",
  topic_04: "💼 Work & Career",
  topic_05: "🏃 Health & Lifestyle",
  topic_06: "👫 People & Relationships",
  topic_07: "✈️ Travel & Places",
  topic_08: "📱 Communication & Media",
  topic_09: "🏛️ Economy & Public Life",
  topic_10: "🌱 Personal Development",
};

export default function ChunksPage() {
  const [chunks, setChunks] = useState([]);
  const [learnedIds, setLearnedIds] = useState(new Set());
  const [studyCounts, setStudyCounts] = useState({});
  const [activeTopic, setActiveTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);


  // Initialize Speech Voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const engVoices = availableVoices.filter((v) => v.lang.startsWith("en"));
        setVoices(engVoices);
        if (engVoices.length > 0) {
          const defaultVoice =
            engVoices.find(
              (v) =>
                v.name.includes("Google US English") ||
                v.name.includes("Google UK English Male") ||
                v.name.includes("Samantha")
            ) || engVoices[0];
          setSelectedVoice(defaultVoice.name);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chunks_1000_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {}
      }
      const storedCounts = localStorage.getItem("chunks_1000_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {}
      }
      setChunks(rawData.chunks || []);
      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setLearnedIds(next);
    localStorage.setItem("chunks_1000_progress", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("chunks_1000_study_counts", JSON.stringify(next));
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học và số lần đọc không?")) {
      setLearnedIds(new Set());
      setStudyCounts({});
      localStorage.removeItem("chunks_1000_progress");
      localStorage.removeItem("chunks_1000_study_counts");
    }
  };

  const playSpeech = (text, id) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speechRate;
    if (selectedVoice) {
      const voiceObj = voices.find((v) => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }
    utterance.onstart = () => setPlayingId(id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const filteredChunks = chunks.filter((c) => {
    const matchesTopic = activeTopic === "all" || c.topic_id === activeTopic;
    const isLearned = learnedIds.has(c.id);
    const matchesFilterType =
      filterType === "all" ||
      (filterType === "learned" && isLearned) ||
      (filterType === "unlearned" && !isLearned);
    const matchesSearch =
      searchQuery.trim() === "" ||
      c.chunk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.meaning_vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.example_en && c.example_en.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTopic && matchesFilterType && matchesSearch;
  });

  const totalCount = chunks.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu học...</p>
      </div>
    );
  }

  return (
    <main className="container">
      {/* Multi-Section Navigation Bar */}
      <nav className="section-nav-bar">
        <Link href="/" className="section-nav-link">
          🏠 Trang chủ
        </Link>
        <Link href="/english-300" className="section-nav-link">
          ⚡ 300 Câu Giao Tiếp
        </Link>
        <Link href="/chunks" className="section-nav-link active-chunks">
          🧩 1000 Chunks Tiếng Anh
        </Link>
        <Link href="/ielts-words" className="section-nav-link">
          🎯 IELTS Words
        </Link>
        <Link href="/chinese" className="section-nav-link">
          🇨🇳 500 Chunks Tiếng Trung
        </Link>
        <Link href="/japanese" className="section-nav-link">
          🇯🇵 300 Chunks Tiếng Nhật
        </Link>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1 style={{ background: "linear-gradient(135deg, #059669 0%, #0284c7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🧩 1000 English Chunks
          </h1>
          <p className="hero-subtitle">Bấm vào chunk tiếng Anh để nghe phát âm giọng bản xứ</p>
        </div>

        {/* Progress Card */}
        <div className="progress-card" style={{ background: "linear-gradient(135deg, #059669 0%, #0284c7 100%)", boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.3)" }}>
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học của bạn</span>
            <span className="stat-value">{learnedCount}/{totalCount} chunks ({progressPercent}%)</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="progress-actions">
            <button onClick={resetProgress} className="btn-reset" title="Xóa toàn bộ tiến trình học">
              🔄 Reset tiến trình
            </button>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <section className="control-panel">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm chunk, nghĩa tiếng Việt hoặc ví dụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="clear-search">✕</button>
          )}
        </div>

        <div className="tts-controls">
          <div className="control-group">
            <label htmlFor="voice-select">Giọng đọc:</label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option>Mặc định hệ thống</option>}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="rate-range">Tốc độ ({speechRate}x):</label>
            <input
              id="rate-range"
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* Topic Navigation */}
      <section className="categories-nav">
        <button
          onClick={() => setActiveTopic("all")}
          className={`category-pill ${activeTopic === "all" ? "active" : ""}`}
        >
          📂 Tất cả ({totalCount})
        </button>
        {Object.entries(TOPIC_MAP).map(([key, label]) => {
          const count = chunks.filter((c) => c.topic_id === key).length;
          const completed = chunks.filter((c) => c.topic_id === key && learnedIds.has(c.id)).length;
          return (
            <button
              key={key}
              onClick={() => setActiveTopic(key)}
              className={`category-pill ${activeTopic === key ? "active" : ""}`}
            >
              {label} <span className="cat-count">({completed}/{count})</span>
            </button>
          );
        })}
      </section>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          onClick={() => setFilterType("all")}
          className={`filter-tab ${filterType === "all" ? "active" : ""}`}
        >
          🎯 Tất cả ({filteredChunks.length})
        </button>
        <button
          onClick={() => setFilterType("unlearned")}
          className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
        >
          📖 Chưa học ({chunks.filter((c) => !learnedIds.has(c.id)).length})
        </button>
        <button
          onClick={() => setFilterType("learned")}
          className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
        >
          ✅ Đã thuộc ({learnedIds.size})
        </button>
      </div>

      {/* Chunks List */}
      <section className="sentences-list">
        {filteredChunks.map((c) => {
          const isLearned = learnedIds.has(c.id);
          const isPlaying = playingId === c.id;

          return (
            <article
              key={c.id}
              className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}
            >
              <div className="card-top">
                <span className="card-index">#{c.id}</span>
                <span className="card-category">{TOPIC_MAP[c.topic_id] || c.topic_id}</span>
                {c.level && <span className="card-level">{c.level}</span>}
              </div>

              <div
                className="card-body"
                onClick={() => {
                  playSpeech(c.chunk, c.id);
                  incrementStudyCount(c.id);
                }}
              >
                <div className="english-wrapper">
                  <h2 className="english-text">{c.chunk}</h2>
                  <button className="play-button" aria-label="Nghe phát âm">
                    {isPlaying ? (
                      <span className="playing-animation">🔊</span>
                    ) : (
                      <span className="play-icon">🗣️</span>
                    )}
                  </button>
                </div>

                <p className="vietnamese-text">{c.meaning_vi}</p>

                {c.pattern && (
                  <div className="reply-box">
                    <span className="reply-label">Pattern:</span>
                    <span className="reply-text">{c.pattern}</span>
                  </div>
                )}
              </div>

              {/* Detail section - always visible */}
              <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {c.example_en && (
                  <div
                    className="reply-box"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      playSpeech(c.example_en, `ex-${c.id}`);
                      incrementStudyCount(c.id);
                    }}
                  >
                    <span className="reply-label">Ví dụ:</span>
                    <span className="reply-text">{c.example_en} 🗣️</span>
                  </div>
                )}
                {c.example_vi && (
                  <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", paddingLeft: "4px" }}>
                    → {c.example_vi}
                  </p>
                )}
                {c.usage_note_vi && (
                  <p style={{ fontSize: "0.9rem", color: "#64748b", fontStyle: "italic", paddingLeft: "4px" }}>
                    💡 {c.usage_note_vi}
                  </p>
                )}
              </div>

              <div className="card-footer">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isLearned}
                    onChange={() => toggleLearned(c.id)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">{isLearned ? "Đã thuộc 🎉" : "Đánh dấu đã thuộc"}</span>
                </label>

                <div className="study-counter">
                  <span className="counter-num">{studyCounts[c.id] || 0}</span>
                </div>
              </div>
            </article>
          );
        })}

        {filteredChunks.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🏜️</span>
            <p>Không tìm thấy chunk nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </section>

      <footer className="app-footer">
        <p>💡 Tip: Bấm vào chunk để nghe phát âm, bấm &quot;Xem ví dụ&quot; để học sâu hơn.</p>
      </footer>
    </main>
  );
}

