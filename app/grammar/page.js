"use client";

import { useState, useEffect, useMemo } from "react";
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
  AlertTriangleIcon,
  AwardIcon,
} from "../components/Icons";
import { isTextSelected, isAudioMuted } from "../lib/uiUtils";
import rawData from "../../english_grammar_ielts8.json";

const LEVEL_MAP = {
  all: "Tất cả trình độ",
  basic: "Cơ bản (A1–A2)",
  intermediate: "Trung cấp (B1–B2)",
  advanced: "IELTS 7.0–8.0+",
};

export default function GrammarPage() {
  const categories = rawData.categories || [];
  const items = rawData.items || [];

  const [learnedIds, setLearnedIds] = useState(new Set());
  const [studyCounts, setStudyCounts] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [studyMode, setStudyMode] = useState("browse");

  const categoryNameMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

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
      try {
        const stored = localStorage.getItem("english_grammar_progress");
        if (stored) setLearnedIds(new Set(JSON.parse(stored)));
      } catch (e) {}

      try {
        const storedCounts = localStorage.getItem("english_grammar_study_counts");
        if (storedCounts) setStudyCounts(JSON.parse(storedCounts));
      } catch (e) {}

      const savedMode = localStorage.getItem("english_grammar_study_mode");
      if (savedMode === "lesson" || savedMode === "browse") setStudyMode(savedMode);
      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLearnedIds(next);
    localStorage.setItem("english_grammar_progress", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("english_grammar_study_counts", JSON.stringify(next));
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình học và số lần đọc Grammar không?")) {
      setLearnedIds(new Set());
      setStudyCounts({});
      localStorage.removeItem("english_grammar_progress");
      localStorage.removeItem("english_grammar_study_counts");
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

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCat = activeCategory === "all" || item.category === activeCategory;
      const matchesLevel = activeLevel === "all" || item.level === activeLevel;
      const isLearned = learnedIds.has(item.id);
      const matchesFilter =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        item.explanation_vi.toLowerCase().includes(q) ||
        (item.ielts_tip_vi && item.ielts_tip_vi.toLowerCase().includes(q)) ||
        (item.examples &&
          item.examples.some(
            (ex) => ex.en.toLowerCase().includes(q) || ex.vi.toLowerCase().includes(q)
          ));
      return matchesCat && matchesLevel && matchesFilter && matchesSearch;
    });
  }, [items, activeCategory, activeLevel, filterType, searchQuery, learnedIds]);

  const totalCount = items.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải giáo trình English Grammar...</p>
      </div>
    );
  }

  const renderGrammarCard = (item, idx) => {
    const isLearned = learnedIds.has(item.id);
    const displayNum = idx !== undefined ? idx + 1 : item.id.replace("gr_", "");

    return (
      <article key={item.id} className={`sentence-card grammar-card ${isLearned ? "learned" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{displayNum}</span>
          <span className="card-category">{categoryNameMap[item.category] || item.category}</span>
          <span className={`grammar-level-badge grammar-level-${item.level}`}>{item.band}</span>
        </div>

        <div className="grammar-header-block">
          <h2 className="grammar-title">{item.title}</h2>
          <div className="grammar-formula-box">
            <span className="grammar-formula-label">Cấu trúc</span>
            <code className="grammar-formula-code">{item.formula}</code>
          </div>
          <p className="grammar-explanation">{item.explanation_vi}</p>
        </div>

        {item.examples && item.examples.length > 0 && (
          <div className="grammar-examples-block">
            <div className="grammar-sub-heading">Ví dụ thực tế (Bấm để nghe &amp; tăng lượt đọc)</div>
            <div className="grammar-examples-list">
              {item.examples.map((ex, exIdx) => {
                const exPlayId = `${item.id}_ex_${exIdx}`;
                const isPlayingEx = playingId === exPlayId;
                return (
                  <div
                    key={exIdx}
                    className={`grammar-example-row ${isPlayingEx ? "is-playing" : ""}`}
                    onClick={() => {
                      if (isTextSelected()) return;
                      playSpeech(ex.en, exPlayId);
                      incrementStudyCount(item.id);
                    }}
                    title="Bấm để nghe ví dụ và tăng lượt đọc"
                  >
                    <div className="grammar-example-text">
                      <p className="grammar-example-en">{ex.en}</p>
                      <p className="grammar-example-vi">→ {ex.vi}</p>
                    </div>
                    <button
                      type="button"
                      className={`play-button play-button--sm ${isPlayingEx ? "playing" : ""}`}
                      aria-label="Nghe câu ví dụ"
                    >
                      <Volume2Icon size={15} className={isPlayingEx ? "playing-animation" : ""} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {item.common_mistake && (
          <div className="grammar-mistake-box">
            <div className="grammar-mistake-head">
              <AlertTriangleIcon size={14} />
              <span>Lỗi hay gặp &amp; Cách sửa chuẩn</span>
            </div>
            <div className="grammar-mistake-pair">
              <span className="grammar-wrong">{item.common_mistake.wrong}</span>
              <span className="grammar-correct">{item.common_mistake.correct}</span>
            </div>
          </div>
        )}

        {item.ielts_tip_vi && (
          <div className="grammar-tip-box">
            <LightbulbIcon size={15} />
            <span>{item.ielts_tip_vi}</span>
          </div>
        )}

        <div className="card-footer">
          <label className="checkbox-container">
            <input type="checkbox" checked={isLearned} onChange={() => toggleLearned(item.id)} />
            <span className="checkmark" />
            <span className="checkbox-label">
              {isLearned ? (
                <span className="learned-label-inline">
                  <CheckIcon size={14} /> Đã nắm vững
                </span>
              ) : (
                "Đánh dấu đã nắm vững"
              )}
            </span>
          </label>

          <div className="study-counter" title="Số lần bấm đọc ví dụ">
            <span className="counter-num">{studyCounts[item.id] || 0}</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="container">
      <SectionNav />

      <div className="mode-toggle-strip" role="tablist" aria-label="Chế độ học Grammar">
        <button
          type="button"
          className={`mode-toggle-btn ${studyMode === "browse" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("browse");
            localStorage.setItem("english_grammar_study_mode", "browse");
          }}
        >
          <ListIcon size={15} />
          <span>Duyệt theo dạng bài</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${studyMode === "lesson" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("lesson");
            localStorage.setItem("english_grammar_study_mode", "lesson");
          }}
        >
          <BookOpenIcon size={15} />
          <span>Học theo bài (10 chủ điểm/bài)</span>
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">EN • Grammar Mastery (Basic → IELTS 8.0+)</span>
          <h1>Ngữ Pháp Tiếng Anh Từ Cơ Bản Đến IELTS 8.0</h1>
          <p className="hero-subtitle">
            Tổng hợp đầy đủ 10 nhóm dạng bài ngữ pháp trọng tâm kèm công thức, ví dụ phát âm chuẩn, mẹo IELTS và lưu lượt đọc
          </p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tiến trình làm chủ Grammar</span>
            <span className="stat-value">
              {learnedCount}/{totalCount} chủ điểm ({progressPercent}%)
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-actions">
            <button type="button" onClick={resetProgress} className="btn-reset" title="Xóa toàn bộ tiến trình học Grammar">
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
                placeholder="Tìm theo tên ngữ pháp, công thức, ví dụ hoặc mẹo IELTS..."
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
            {categories.map((cat) => {
              const catItems = items.filter((it) => it.category === cat.id);
              const completed = catItems.filter((it) => learnedIds.has(it.id)).length;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
                >
                  <span>{cat.name}</span>
                  <span className="cat-count">
                    {completed}/{catItems.length}
                  </span>
                </button>
              );
            })}
          </section>

          <div className="filter-difficulty-row">
            <div className="filter-tabs filter-tabs--inline">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`filter-tab ${filterType === "all" ? "active" : ""}`}
              >
                Tất cả ({filteredItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("unlearned")}
                className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
              >
                Chưa nắm ({items.filter((i) => !learnedIds.has(i.id)).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("learned")}
                className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
              >
                Đã nắm vững ({learnedIds.size})
              </button>
            </div>

            <div className="difficulty-filter-group">
              <span className="difficulty-filter-label">
                <AwardIcon size={13} /> Trình độ:
              </span>
              {Object.entries(LEVEL_MAP).map(([lvlKey, lvlLabel]) => (
                <button
                  type="button"
                  key={lvlKey}
                  onClick={() => setActiveLevel(lvlKey)}
                  className={`difficulty-filter-btn ${activeLevel === lvlKey ? "active" : ""}`}
                >
                  {lvlLabel}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode
          items={items}
          storageKey="english_grammar"
          learnedIds={learnedIds}
          renderItem={(item, idx) => renderGrammarCard(item, idx)}
        />
      ) : (
        <section className="sentences-list">
          {filteredItems.map((item, idx) => renderGrammarCard(item, idx))}

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">
                <InboxIcon size={36} />
              </span>
              <p>Không tìm thấy điểm ngữ pháp nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}
        </section>
      )}

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>Tip: Bấm vào từng câu ví dụ để nghe phát âm và tăng lượt đọc, hoặc bật tắt âm bên phải để đếm nhanh khi tự nhẩm.</span>
        </p>
      </footer>
    </main>
  );
}

