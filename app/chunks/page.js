"use client";

import { useState, useEffect } from "react";
import rawData from "../../english_chunks_1000.json";
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
import { isTextSelected, isAudioMuted } from "../lib/uiUtils";

const TOPIC_MAP = {
  topic_01: "Core Chunks",
  topic_02: "Society & Education",
  topic_03: "Technology & Environment",
  topic_04: "Work & Career",
  topic_05: "Health & Lifestyle",
  topic_06: "People & Relationships",
  topic_07: "Travel & Places",
  topic_08: "Communication & Media",
  topic_09: "Economy & Public Life",
  topic_10: "Personal Development",
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
  const [studyMode, setStudyMode] = useState("browse");

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
      const savedMode = localStorage.getItem("chunks_1000_study_mode");
      if (savedMode === "lesson" || savedMode === "browse") setStudyMode(savedMode);
      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
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
    if (isAudioMuted()) {
      setPlayingId(null);
      return;
    }
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
      (c.pattern && c.pattern.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.example_en && c.example_en.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTopic && matchesFilterType && matchesSearch;
  });

  const totalCount = chunks.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải dữ liệu học...</p>
      </div>
    );
  }

  const renderChunkCard = (c) => {
    const isLearned = learnedIds.has(c.id);
    const isPlaying = playingId === c.id;
    return (
      <article key={c.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{c.id}</span>
          <span className="card-category">{TOPIC_MAP[c.topic_id] || c.topic_id}</span>
          {c.level && <span className="card-level">{c.level}</span>}
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            playSpeech(c.chunk, c.id);
            incrementStudyCount(c.id);
          }}
        >
          <div className="english-wrapper">
            <h2 className="english-text">{c.chunk}</h2>
            <button type="button" className="play-button" aria-label="Nghe phát âm">
              <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
            </button>
          </div>
          <p className="vietnamese-text">{c.meaning_vi}</p>
          {c.pattern && (
            <div className="reply-box">
              <span className="reply-label">Pattern</span>
              <span className="reply-text">{c.pattern}</span>
            </div>
          )}
        </div>

        <div className="card-details-stack">
          {c.example_en && (
            <div
              className="reply-box reply-box-interactive"
              onClick={() => {
                if (isTextSelected()) return;
                playSpeech(c.example_en, `ex-${c.id}`);
                incrementStudyCount(c.id);
              }}
            >
              <span className="reply-label">Ví dụ</span>
              <span className="reply-text">{c.example_en}</span>
              <Volume2Icon size={14} className="reply-audio-icon" />
            </div>
          )}
          {c.example_vi && <p className="card-sub-translation">→ {c.example_vi}</p>}
          {c.usage_note_vi && (
            <p className="card-usage-note">
              <LightbulbIcon size={14} />
              <span>{c.usage_note_vi}</span>
            </p>
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
            localStorage.setItem("chunks_1000_study_mode", "browse");
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
            localStorage.setItem("chunks_1000_study_mode", "lesson");
          }}
        >
          <BookOpenIcon size={15} />
          <span>Học theo bài (10 chunks/bài)</span>
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">EN • Chunking Collocations</span>
          <h1>1000 English Chunks</h1>
          <p className="hero-subtitle">Cụm từ tự nhiên theo 10 chủ đề IELTS &amp; giao tiếp kèm cấu trúc và ví dụ</p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học 1000 Chunks</span>
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
                placeholder="Tìm kiếm chunk, pattern hoặc ví dụ..."
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
                <label htmlFor="voice-select">Giọng đọc</label>
                <select id="voice-select" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                  {voices.length === 0 && <option>Mặc định hệ thống</option>}
                </select>
              </div>

              <div className="control-group">
                <label htmlFor="rate-range">Tốc độ ({speechRate}x)</label>
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

          <section className="categories-nav">
            <button
              type="button"
              onClick={() => setActiveTopic("all")}
              className={`category-pill ${activeTopic === "all" ? "active" : ""}`}
            >
              Tất cả ({totalCount})
            </button>
            {Object.entries(TOPIC_MAP).map(([key, label]) => {
              const count = chunks.filter((c) => c.topic_id === key).length;
              const completed = chunks.filter((c) => c.topic_id === key && learnedIds.has(c.id)).length;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTopic(key)}
                  className={`category-pill ${activeTopic === key ? "active" : ""}`}
                >
                  <span>{label}</span>
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
        <LessonMode items={chunks} storageKey="chunks_1000" learnedIds={learnedIds} renderItem={renderChunkCard} />
      ) : (
        <section className="sentences-list">
          {filteredChunks.map(renderChunkCard)}

          {filteredChunks.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">
                <InboxIcon size={36} />
              </span>
              <p>Không tìm thấy chunk nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}
        </section>
      )}

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>Tip: Bấm vào chunk hoặc câu ví dụ để nghe phát âm và tăng lượt ôn tập.</span>
        </p>
      </footer>
    </main>
  );
}
