"use client";

import { useState, useEffect } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import {
  SearchIcon,
  XIcon,
  Volume2Icon,
  RotateCcwIcon,
  BookOpenIcon,
  ListIcon,
  InboxIcon,
  LightbulbIcon,
  CheckIcon,
} from "../components/Icons";
import { isTextSelected } from "../lib/uiUtils";
import rawData from "../../japanese_communication_chunks.json";

const REGISTER_MAP = {
  polite: "Lịch sự (です/ます)",
  casual: "Thân mật",
  formal: "Kính ngữ",
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

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const jaVoices = availableVoices.filter((v) => v.lang.startsWith("ja"));
        setVoices(jaVoices);
        if (jaVoices.length > 0) {
          const defaultVoice =
            jaVoices.find(
              (v) =>
                v.lang.includes("ja-JP") ||
                v.name.includes("Kyoko") ||
                v.name.includes("Otoya") ||
                v.name.includes("Google 日本語")
            ) || jaVoices[0];
          setSelectedVoice(defaultVoice.name);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("japanese_chunks_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {}
      }

      const storedCounts = localStorage.getItem("japanese_chunks_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {}
      }

      setChunks(rawData.chunks || []);
      const savedMode = localStorage.getItem("japanese_chunks_study_mode");
      if (savedMode === "lesson" || savedMode === "browse") setStudyMode(savedMode);
      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
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
      const voiceObj = voices.find((v) => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
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
        <div className="spinner" />
        <p>Đang tải dữ liệu học tiếng Nhật...</p>
      </div>
    );
  }

  const categoriesList = rawData.categories
    ? rawData.categories.map((c) => c.name)
    : Array.from(new Set(chunks.map((c) => c.category)));

  const renderJapaneseCard = (c) => {
    const isLearned = learnedIds.has(c.id);
    const isPlaying = playingId === c.id;
    const hasKanaDifferent = c.kana && c.kana !== c.japanese;

    return (
      <article key={c.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{c.id}</span>
          <span className="card-category">{c.category}</span>
          {c.register && <span className="register-badge">{REGISTER_MAP[c.register] || c.register}</span>}
          {c.level && <span className="card-level">{c.level}</span>}
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            playSpeech(c.japanese, c.id);
            incrementStudyCount(c.id);
          }}
        >
          <div className="english-wrapper">
            <div>
              <h2 className="japanese-text">{c.japanese}</h2>
              <div className="kana-romaji-text">
                {hasKanaDifferent && <span className="kana-badge">{c.kana}</span>}
                {c.romaji && (
                  <span className="romaji-badge">{hasKanaDifferent ? `• ${c.romaji}` : c.romaji}</span>
                )}
              </div>
            </div>
            <button type="button" className="play-button" aria-label="Nghe phát âm">
              <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
            </button>
          </div>
          <p className="vietnamese-text">{c.meaning_vi}</p>

          {c.example_use && c.example_use !== c.japanese && (
            <div className="card-details-stack">
              <div
                className="reply-box reply-box-interactive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isTextSelected()) return;
                  playSpeech(c.example_use, `ex-${c.id}`);
                  incrementStudyCount(c.id);
                }}
              >
                <span className="reply-label">Ví dụ</span>
                <span className="reply-text">{c.example_use}</span>
                <Volume2Icon size={14} className="reply-audio-icon" />
              </div>
              {c.example_translation && <p className="card-sub-translation">→ {c.example_translation}</p>}
            </div>
          )}
        </div>

        <div className="card-footer">
          <label className="checkbox-container">
            <input type="checkbox" checked={isLearned} onChange={() => toggleLearned(c.id)} />
            <span className="checkmark" />
            <span className="checkbox-label">
              {isLearned ? (
                <span className="learned-label-inline">
                  <CheckIcon size={14} /> Đã thuộc
                </span>
              ) : (
                "Đánh dấu đã thuộc"
              )}
            </span>
          </label>
          <div className="study-counter" title="Số lần luyện tập">
            <span className="counter-num">{studyCounts[c.id] || 0}</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="container">
      <SectionNav />

      <div className="mode-toggle-strip" role="tablist" aria-label="Chế độ học">
        <button
          type="button"
          className={`mode-toggle-btn ${studyMode === "browse" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("browse");
            localStorage.setItem("japanese_chunks_study_mode", "browse");
          }}
        >
          <ListIcon size={15} />
          <span>Duyệt tất cả</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${studyMode === "lesson" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("lesson");
            localStorage.setItem("japanese_chunks_study_mode", "lesson");
          }}
        >
          <BookOpenIcon size={15} />
          <span>Học theo bài (10 chunks/bài)</span>
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">JA • Kana &amp; Romaji</span>
          <h1>300 Chunks Tiếng Nhật Giao Tiếp</h1>
          <p className="hero-subtitle">Bấm vào câu tiếng Nhật để nghe phát âm kèm Kana, Romaji và sắc thái ngữ khí</p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học tiếng Nhật</span>
            <span className="stat-value">
              {learnedCount}/{totalCount} chunks ({progressPercent}%)
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-actions">
            <button type="button" onClick={resetProgress} className="btn-reset" title="Xóa toàn bộ tiến trình học">
              <RotateCcwIcon size={14} />
              <span>Reset tiến trình</span>
            </button>
          </div>
        </div>
      </header>

      {studyMode !== "lesson" && (
        <>
          <section className="control-panel">
            <div className="search-box">
              <span className="search-icon">
                <SearchIcon size={16} />
              </span>
              <input
                type="text"
                placeholder="Tìm theo chữ Nhật, Kana, Romaji hoặc nghĩa tiếng Việt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="clear-search" aria-label="Xóa tìm kiếm">
                  <XIcon size={15} />
                </button>
              )}
            </div>

            <div className="tts-controls">
              <div className="control-group">
                <label htmlFor="voice-select">Giọng đọc tiếng Nhật</label>
                <select id="voice-select" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                  {voices.length === 0 && <option value="">Mặc định ja-JP (Hệ thống)</option>}
                </select>
              </div>

              <div className="control-group">
                <label htmlFor="rate-range">Tốc độ ({speechRate}x)</label>
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

          <section className="categories-nav">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              Tất cả ({totalCount})
            </button>
            {categoriesList.map((catName) => {
              const count = chunks.filter((c) => c.category === catName).length;
              const completed = chunks.filter((c) => c.category === catName && learnedIds.has(c.id)).length;
              return (
                <button
                  type="button"
                  key={catName}
                  onClick={() => setActiveCategory(catName)}
                  className={`category-pill ${activeCategory === catName ? "active" : ""}`}
                >
                  <span>{catName}</span>
                  <span className="cat-count">
                    {completed}/{count}
                  </span>
                </button>
              );
            })}
          </section>

          <div className="filter-tabs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`filter-tab ${filterType === "all" ? "active" : ""}`}
            >
              Tất cả ({filteredChunks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("unlearned")}
              className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
            >
              Chưa học ({chunks.filter((c) => !learnedIds.has(c.id)).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("learned")}
              className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
            >
              Đã thuộc ({learnedIds.size})
            </button>
          </div>
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode items={chunks} storageKey="japanese_chunks" learnedIds={learnedIds} renderItem={renderJapaneseCard} />
      ) : (
        <section className="sentences-list">
          {filteredChunks.map(renderJapaneseCard)}

          {filteredChunks.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">
                <InboxIcon size={36} />
              </span>
              <p>Không tìm thấy chunk tiếng Nhật nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}
        </section>
      )}

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>Tip: Bấm vào câu tiếng Nhật để nghe phát âm chuẩn bản xứ.</span>
        </p>
      </footer>
    </main>
  );
}
