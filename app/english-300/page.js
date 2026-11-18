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
import rawData from "../../300_cau_tieng_anh_giao_tiep.json";

const CATEGORY_MAP = {
  greetings: "Chào hỏi",
  introductions: "Giới thiệu bản thân",
  basic_responses: "Phản hồi cơ bản",
  clarification: "Hỏi lại & Làm rõ",
  daily_life: "Đời sống hàng ngày",
  work: "Công việc & Học tập",
  food: "Ăn uống & Nhà hàng",
  shopping: "Mua sắm",
  travel: "Đi lại & Du lịch",
  social: "Giao tiếp xã hội",
  phone_and_emergency: "Điện thoại & Khẩn cấp",
};

export default function English300Page() {
  const [sentences, setSentences] = useState([]);
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
      const stored = localStorage.getItem("english_300_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {}
      }

      const storedCounts = localStorage.getItem("english_300_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {}
      }

      setSentences(rawData.sentences || []);
      const savedMode = localStorage.getItem("english_300_study_mode");
      if (savedMode === "lesson" || savedMode === "browse") setStudyMode(savedMode);
      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLearnedIds(next);
    localStorage.setItem("english_300_progress", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("english_300_study_counts", JSON.stringify(next));
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học và số lần đọc không?")) {
      setLearnedIds(new Set());
      setStudyCounts({});
      localStorage.removeItem("english_300_progress");
      localStorage.removeItem("english_300_study_counts");
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

  const filteredSentences = sentences.filter((s) => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    const isLearned = learnedIds.has(s.id);
    const matchesFilterType =
      filterType === "all" ||
      (filterType === "learned" && isLearned) ||
      (filterType === "unlearned" && !isLearned);
    const matchesSearch =
      searchQuery.trim() === "" ||
      s.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.suggested_reply && s.suggested_reply.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesFilterType && matchesSearch;
  });

  const totalCount = sentences.length;
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

  const renderSentenceCard = (s) => {
    const isLearned = learnedIds.has(s.id);
    const isPlaying = playingId === s.id;
    return (
      <article key={s.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{s.id}</span>
          <span className="card-category">{CATEGORY_MAP[s.category] || s.category}</span>
          {s.level && <span className="card-level">{s.level}</span>}
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            playSpeech(s.english, s.id);
            incrementStudyCount(s.id);
          }}
        >
          <div className="english-wrapper">
            <h2 className="english-text">{s.english}</h2>
            <button type="button" className="play-button" aria-label="Nghe phát âm">
              <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
            </button>
          </div>
          <p className="vietnamese-text">{s.vietnamese}</p>
          {s.suggested_reply && (
            <div
              className="reply-box reply-box-interactive"
              onClick={(e) => {
                e.stopPropagation();
                if (isTextSelected()) return;
                playSpeech(s.suggested_reply, `reply-${s.id}`);
                incrementStudyCount(s.id);
              }}
            >
              <span className="reply-label">Gợi ý đáp</span>
              <span className="reply-text">{s.suggested_reply}</span>
              <Volume2Icon size={14} className="reply-audio-icon" />
            </div>
          )}
        </div>

        <div className="card-footer">
          <label className="checkbox-container">
            <input type="checkbox" checked={isLearned} onChange={() => toggleLearned(s.id)} />
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
            <span className="counter-num">{studyCounts[s.id] || 0}</span>
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
            localStorage.setItem("english_300_study_mode", "browse");
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
            localStorage.setItem("english_300_study_mode", "lesson");
          }}
        >
          <BookOpenIcon size={15} />
          <span>Học theo bài (10 câu/bài)</span>
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">EN • Giao tiếp nền tảng</span>
          <h1>300 Câu Giao Tiếp Cốt Lõi</h1>
          <p className="hero-subtitle">Bấm vào câu tiếng Anh để nghe phát âm bản xứ và theo dõi lượt luyện tập</p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học của bạn</span>
            <span className="stat-value">
              {learnedCount}/{totalCount} câu ({progressPercent}%)
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
                placeholder="Tìm kiếm theo tiếng Anh hoặc tiếng Việt..."
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
              onClick={() => setActiveCategory("all")}
              className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              Tất cả ({totalCount})
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, label]) => {
              const count = sentences.filter((s) => s.category === key).length;
              const completed = sentences.filter((s) => s.category === key && learnedIds.has(s.id)).length;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`category-pill ${activeCategory === key ? "active" : ""}`}
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
              Tất cả ({filteredSentences.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("unlearned")}
              className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
            >
              Chưa học ({sentences.filter((s) => !learnedIds.has(s.id)).length})
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
        <LessonMode
          items={sentences}
          storageKey="english_300"
          learnedIds={learnedIds}
          renderItem={renderSentenceCard}
        />
      ) : (
        <section className="sentences-list">
          {filteredSentences.map(renderSentenceCard)}

          {filteredSentences.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">
                <InboxIcon size={36} />
              </span>
              <p>Không tìm thấy câu nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}
        </section>
      )}

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>Tip: Chọn giọng đọc và tốc độ phù hợp ở phần trên, hoặc bật Tắt âm ở thanh bên phải để chỉ tăng lượt đếm.</span>
        </p>
      </footer>
    </main>
  );
}
