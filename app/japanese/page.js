"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import rawData from "../../japanese_communication_chunks.json";

const REGISTER_MAP = {
  polite: "Lịch sự (です/ます)",
  casual: "Thân mật (Suồng sã)",
  formal: "Trang trọng (Kính ngữ)",
};

export default function JapanesePage() {
  const [chunks, setChunks] = useState([]);
  const [learnedIds, setLearnedIds] = useState(new Set());
  const [studyCounts, setStudyCounts] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [studyMode, setStudyMode] = useState("browse");

  // Initialize Speech Voices for Japanese (ja-JP)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const jaVoices = availableVoices.filter(v => v.lang.startsWith("ja"));
        setVoices(jaVoices);
        if (jaVoices.length > 0) {
          const defaultVoice = jaVoices.find(v => v.lang.includes("ja-JP") || v.name.includes("Kyoko") || v.name.includes("Otoya") || v.name.includes("Google 日本語")) || jaVoices[0];
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
      const stored = localStorage.getItem("japanese_chunks_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {
          console.error("Error loading japanese progress", e);
        }
      }

      const storedCounts = localStorage.getItem("japanese_chunks_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {
          console.error("Error loading japanese study counts", e);
        }
      }

      setChunks(rawData.chunks || []);
      const savedMode = localStorage.getItem("japanese_chunks_study_mode");
      if (savedMode === "lesson" || savedMode === "browse") setStudyMode(savedMode);
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
    localStorage.setItem("japanese_chunks_progress", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("japanese_chunks_study_counts", JSON.stringify(next));
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học tiếng Nhật không?")) {
      setLearnedIds(new Set());
      setStudyCounts({});
      localStorage.removeItem("japanese_chunks_progress");
      localStorage.removeItem("japanese_chunks_study_counts");
    }
  };

  const playSpeech = (text, id) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = speechRate;

    if (selectedVoice) {
      const voiceObj = voices.find(v => v.name === selectedVoice);
      if (voiceObj) {
        utterance.voice = voiceObj;
      }
    }

    utterance.onstart = () => setPlayingId(id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const filteredChunks = chunks.filter((c) => {
    const matchesCategory = activeCategory === "all" || c.category === activeCategory;
    const isLearned = learnedIds.has(c.id);
    const matchesFilterType =
      filterType === "all" ||
      (filterType === "learned" && isLearned) ||
      (filterType === "unlearned" && !isLearned);

    const matchesSearch =
      searchQuery.trim() === "" ||
      c.japanese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.kana && c.kana.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.romaji && c.romaji.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.meaning_vi.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesFilterType && matchesSearch;
  });

  const totalCount = chunks.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu học tiếng Nhật...</p>
      </div>
    );
  }

  // Get distinct categories
  const categoriesList = rawData.categories ? rawData.categories.map(c => c.name) : Array.from(new Set(chunks.map(c => c.category)));

  return (
    <main className="container">
      {/* Multi-Section Navigation Bar */}
      <SectionNav />

      {/* Study Mode Toggle */}
      <div className="mode-toggle-strip">
        <button
          className={`mode-toggle-btn ${studyMode === "browse" ? "active" : ""}`}
          onClick={() => { setStudyMode("browse"); localStorage.setItem("japanese_chunks_study_mode", "browse"); }}
        >
          🔍 Duyệt tất cả
        </button>
        <button
          className={`mode-toggle-btn ${studyMode === "lesson" ? "active" : ""}`}
          onClick={() => { setStudyMode("lesson"); localStorage.setItem("japanese_chunks_study_mode", "lesson"); }}
        >
          📚 Học theo bài (10 chunks/bài)
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <h1 style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🇯🇵 300 Chunks Tiếng Nhật Giao Tiếp
          </h1>
          <p className="hero-subtitle">Bấm vào câu tiếng Nhật để nghe phát âm giọng bản xứ (kèm Kana, Romaji & Sắc thái ngữ khí)</p>
        </div>

        {/* Progress Card */}
        <div className="progress-card" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3)" }}>
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học tiếng Nhật</span>
            <span className="stat-value">{learnedCount}/{totalCount} chunks ({progressPercent}%)</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: "#fbcfe8" }}></div>
          </div>
          <div className="progress-actions">
            <button onClick={resetProgress} className="btn-reset" title="Xóa toàn bộ tiến trình học">
              🔄 Reset tiến trình
            </button>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <section className="control-panel" style={{ display: studyMode === "lesson" ? "none" : undefined }}>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo chữ Nhật, Kana, Romaji hoặc nghĩa tiếng Việt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="clear-search">✕</button>
          )}
        </div>

        <div className="tts-controls">
          <div className="control-group">
            <label htmlFor="voice-select">Giọng đọc tiếng Nhật:</label>
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
              {voices.length === 0 && <option value="">Mặc định ja-JP (Hệ thống)</option>}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="rate-range">Tốc độ ({speechRate}x):</label>
            <input
              id="rate-range"
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="categories-nav" style={{ display: studyMode === "lesson" ? "none" : undefined }}>
        <button
          onClick={() => setActiveCategory("all")}
          className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
        >
          📂 Tất cả ({totalCount})
        </button>
        {categoriesList.map((catName) => {
          const count = chunks.filter((c) => c.category === catName).length;
          const completed = chunks.filter((c) => c.category === catName && learnedIds.has(c.id)).length;
          return (
            <button
              key={catName}
              onClick={() => setActiveCategory(catName)}
              className={`category-pill ${activeCategory === catName ? "active" : ""}`}
            >
              {catName} <span className="cat-count">({completed}/{count})</span>
            </button>
          );
        })}
      </section>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ display: studyMode === "lesson" ? "none" : undefined }}>
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
      {studyMode === "lesson" ? (
        <LessonMode
          items={chunks}
          storageKey="japanese_chunks"
          learnedIds={learnedIds}
          renderItem={(c) => {
            const isLearned = learnedIds.has(c.id);
            const isPlaying = playingId === c.id;
            const hasKanaDifferent = c.kana && c.kana !== c.japanese;
            return (
              <article key={c.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
                <div className="card-top">
                  <span className="card-index" style={{ color: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.08)" }}>#{c.id}</span>
                  <span className="card-category">{c.category}</span>
                  {c.register && (
                    <span style={{ fontSize: "0.8rem", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>
                      {REGISTER_MAP[c.register] || c.register}
                    </span>
                  )}
                  {c.level && <span className="card-level">{c.level}</span>}
                </div>
                <div className="card-body" onClick={() => { playSpeech(c.japanese, c.id); incrementStudyCount(c.id); }}>
                  <div className="english-wrapper">
                    <div>
                      <h2 className="japanese-text">{c.japanese}</h2>
                      <div className="kana-romaji-text">
                        {hasKanaDifferent && <span className="kana-badge">{c.kana}</span>}
                        {c.romaji && <span className="romaji-badge">{hasKanaDifferent ? `• ${c.romaji}` : c.romaji}</span>}
                      </div>
                    </div>
                    <button className="play-button" aria-label="Nghe phát âm">
                      {isPlaying ? <span className="playing-animation">🔊</span> : <span className="play-icon">🗣️</span>}
                    </button>
                  </div>
                  <p className="vietnamese-text" style={{ marginTop: "4px" }}>{c.meaning_vi}</p>
                  {c.example_use && c.example_use !== c.japanese && (
                    <div style={{ marginTop: "8px" }}>
                      <div className="reply-box" style={{ cursor: "pointer", borderLeftColor: "#8b5cf6" }}
                        onClick={(e) => { e.stopPropagation(); playSpeech(c.example_use, `ex-${c.id}`); incrementStudyCount(c.id); }}>
                        <span className="reply-label" style={{ color: "#7c3aed" }}>Ví dụ:</span>
                        <span className="reply-text" style={{ color: "#6d28d9" }}>{c.example_use} 🗣️</span>
                      </div>
                      {c.example_translation && (
                        <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", paddingLeft: "4px", marginTop: "4px" }}>→ {c.example_translation}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <label className="checkbox-container">
                    <input type="checkbox" checked={isLearned} onChange={() => toggleLearned(c.id)} />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{isLearned ? "Đã thuộc 🎉" : "Đánh dấu đã thuộc"}</span>
                  </label>
                  <div className="study-counter" style={{ color: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.08)" }}>
                    <span className="counter-num">{studyCounts[c.id] || 0}</span>
                  </div>
                </div>
              </article>
            );
          }}
        />
      ) : (
      <section className="sentences-list">
        {filteredChunks.map((c) => {
          const isLearned = learnedIds.has(c.id);
          const isPlaying = playingId === c.id;
          const hasKanaDifferent = c.kana && c.kana !== c.japanese;

          return (
            <article
              key={c.id}
              className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}
            >
              <div className="card-top">
                <span className="card-index" style={{ color: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.08)" }}>
                  #{c.id}
                </span>
                <span className="card-category">
                  {c.category}
                </span>
                {c.register && (
                  <span style={{ fontSize: "0.8rem", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>
                    {REGISTER_MAP[c.register] || c.register}
                  </span>
                )}
                {c.level && <span className="card-level">{c.level}</span>}
              </div>

              <div
                className="card-body"
                onClick={() => {
                  playSpeech(c.japanese, c.id);
                  incrementStudyCount(c.id);
                }}
              >
                <div className="english-wrapper">
                  <div>
                    <h2 className="japanese-text">{c.japanese}</h2>
                    <div className="kana-romaji-text">
                      {hasKanaDifferent && (
                        <span className="kana-badge">{c.kana}</span>
                      )}
                      {c.romaji && (
                        <span className="romaji-badge">
                          {hasKanaDifferent ? `• ${c.romaji}` : c.romaji}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="play-button" aria-label="Nghe phát âm">
                    {isPlaying ? (
                      <span className="playing-animation">🔊</span>
                    ) : (
                      <span className="play-icon">🗣️</span>
                    )}
                  </button>
                </div>

                <p className="vietnamese-text" style={{ marginTop: "4px" }}>
                  {c.meaning_vi}
                </p>

                {/* Ví dụ thực tế nếu có */}
                {c.example_use && c.example_use !== c.japanese && (
                  <div style={{ marginTop: "8px" }}>
                    <div
                      className="reply-box"
                      style={{ cursor: "pointer", borderLeftColor: "#8b5cf6" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        playSpeech(c.example_use, `ex-${c.id}`);
                        incrementStudyCount(c.id);
                      }}
                    >
                      <span className="reply-label" style={{ color: "#7c3aed" }}>Ví dụ:</span>
                      <span className="reply-text" style={{ color: "#6d28d9" }}>{c.example_use} 🗣️</span>
                    </div>
                    {c.example_translation && (
                      <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", paddingLeft: "4px", marginTop: "4px" }}>
                        → {c.example_translation}
                      </p>
                    )}
                  </div>
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

                <div className="study-counter" style={{ color: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.08)" }}>
                  <span className="counter-num">{studyCounts[c.id] || 0}</span>
                </div>
              </div>
            </article>
          );
        })}

        {filteredChunks.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🏜️</span>
            <p>Không tìm thấy chunk tiếng Nhật nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </section>
      )}

      <footer className="app-footer">
        <p>💡 Tip: Bấm vào câu tiếng Nhật để nghe phát âm giọng bản xứ chuẩn.</p>
      </footer>
    </main>
  );
}

