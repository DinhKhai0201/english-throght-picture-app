"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import SectionNav from "../components/SectionNav";
import rawData from "../../ielts_listening_drills.json";

// Web Audio API Sound generator
function playAudioFeedback(type) {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "correct") {
      const now = ctx.currentTime;
      [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.08 },
        { freq: 783.99, time: 0.16 },
      ].forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.18, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.3);
      });
    } else if (type === "wrong") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch (e) {}
}

export default function IeltsListeningPage() {
  const categories = rawData.categories || [];

  // Active Category & Tab Mode
  const [activeCatId, setActiveCatId] = useState("names_postcodes");
  const [studyMode, setStudyMode] = useState("drill"); // "drill" | "list"
  const [filterType, setFilterType] = useState("all"); // "all" | "unlearned" | "learned"

  // Progress & Stats
  const [learnedIds, setLearnedIds] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Drill Mode State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null); // "correct" | "wrong" | null
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.85);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  const inputRef = useRef(null);

  // Active category data
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCatId) || categories[0];
  }, [categories, activeCatId]);

  const currentItems = currentCategory ? currentCategory.items : [];
  const currentItem = currentItems[currentIndex] || currentItems[0];

  // Initialize Voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const avail = window.speechSynthesis.getVoices();
        const en = avail.filter((v) => v.lang.startsWith("en"));
        setVoices(en);
        if (en.length > 0 && !selectedVoice) {
          const pref =
            en.find(
              (v) =>
                v.name.includes("Google UK English Male") ||
                v.name.includes("Google US English") ||
                v.name.includes("Samantha")
            ) || en[0];
          setSelectedVoice(pref.name);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ielts_listening_progress");
        if (stored) {
          setLearnedIds(new Set(JSON.parse(stored)));
        }
      } catch (e) {}
      setIsLoaded(true);
    }
  }, []);

  // Save progress
  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setLearnedIds(next);
    localStorage.setItem("ielts_listening_progress", JSON.stringify(Array.from(next)));
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học IELTS Listening không?")) {
      setLearnedIds(new Set());
      localStorage.removeItem("ielts_listening_progress");
    }
  };

  // Speak current item
  const speakItem = useCallback(
    (item, mode = "full") => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const it = item || currentItem;
      if (!it) return;

      window.speechSynthesis.cancel();

      // Use spelling prompt if available and mode is spelling, else full_tts
      let text = it.full_tts || it.target;
      if (mode === "spelling" && it.spelling_tts) {
        text = it.spelling_tts;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB"; // Default to UK accent for IELTS
      utterance.rate = speechRate;

      if (selectedVoice) {
        const v = voices.find((vox) => vox.name === selectedVoice);
        if (v) utterance.voice = v;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    },
    [currentItem, speechRate, selectedVoice, voices]
  );

  // Transition to next drill question
  const nextQuestion = useCallback(
    (indexOverride) => {
      let nextIdx = indexOverride !== undefined ? indexOverride : currentIndex + 1;
      if (nextIdx >= currentItems.length) {
        nextIdx = 0; // Loop back
      }
      setCurrentIndex(nextIdx);
      setUserInput("");
      setFeedbackStatus(null);
      setShowAnswer(false);

      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Auto play audio of next question
      setTimeout(() => {
        speakItem(currentItems[nextIdx]);
      }, 200);
    },
    [currentIndex, currentItems, speakItem]
  );

  // Handle Submit Answer via Enter or Button
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!currentItem) return;

    const cleanInput = userInput.trim().replace(/\s+/g, " ").toLowerCase();
    const cleanTarget = (currentItem.target_clean || currentItem.target).trim().replace(/\s+/g, " ").toLowerCase();
    const rawTarget = currentItem.target.trim().replace(/\s+/g, " ").toLowerCase();

    // Check match
    const isCorrect = cleanInput === cleanTarget || cleanInput === rawTarget;

    if (isCorrect) {
      playAudioFeedback("correct");
      setFeedbackStatus("correct");

      // Auto mark as learned
      if (!learnedIds.has(currentItem.id)) {
        const next = new Set(learnedIds);
        next.add(currentItem.id);
        setLearnedIds(next);
        localStorage.setItem("ielts_listening_progress", JSON.stringify(Array.from(next)));
      }

      // Transition to next after celebration
      setTimeout(() => {
        nextQuestion();
      }, 850);
    } else {
      playAudioFeedback("wrong");
      setFeedbackStatus("wrong");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Keyboard Shortcuts: Space = repeat audio, Enter = submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (studyMode !== "drill") return;

      // Spacebar outside text input -> replay audio
      if (e.key === " " && document.activeElement !== inputRef.current) {
        e.preventDefault();
        speakItem();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [studyMode, speakItem]);

  // Overall Statistics
  const totalAllItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const learnedTotal = learnedIds.size;
  const progressPercent = totalAllItems > 0 ? Math.round((learnedTotal / totalAllItems) * 100) : 0;

  // Filtered Items for List Mode
  const filteredListItems = currentItems.filter((item) => {
    const isLearned = learnedIds.has(item.id);
    if (filterType === "learned") return isLearned;
    if (filterType === "unlearned") return !isLearned;
    return true;
  });

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu IELTS Listening...</p>
      </div>
    );
  }

  return (
    <main className="container">
      {/* Navigation Bar */}
      <SectionNav />

      {/* Hero Welcome Header */}
      <header className="hero">
        <div className="hero-content">
          <h1 style={{ background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🎯 IELTS Listening Part 1 & 2 Trainer
          </h1>
          <p className="hero-subtitle">
            Luyện phản xạ nghe và gõ phím bắt chuẩn Tên riêng, Mã bưu điện, Bẫy chính tả và Số đếm trong đề thi IELTS
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="progress-card" style={{ background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)", boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.3)" }}>
          <div className="progress-stats">
            <span className="stat-label">Tiến trình đã thuộc (Toàn bộ 3 bài)</span>
            <span className="stat-value">{learnedTotal}/{totalAllItems} mục ({progressPercent}%)</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: "#a7f3d0" }}></div>
          </div>
          <div className="progress-actions">
            <button onClick={resetProgress} className="btn-reset" title="Đặt lại toàn bộ tiến trình học">
              🔄 Reset tiến trình
            </button>
          </div>
        </div>
      </header>

      {/* 3 Main Lessons Selector (Category Nav) */}
      <section className="categories-nav" style={{ marginTop: "16px" }}>
        {categories.map((cat) => {
          const catLearned = cat.items.filter((it) => learnedIds.has(it.id)).length;
          const isActive = activeCatId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCatId(cat.id);
                setCurrentIndex(0);
                setUserInput("");
                setFeedbackStatus(null);
                setShowAnswer(false);
              }}
              className={`category-pill ${isActive ? "active" : ""}`}
              style={isActive ? { backgroundColor: "#0e7490", borderColor: "#0e7490" } : {}}
            >
              {cat.name} <span className="cat-count">({catLearned}/{cat.items.length})</span>
            </button>
          );
        })}
      </section>

      {/* Study Mode Toggle: Flash Drill vs Study List */}
      <div className="mode-toggle-strip">
        <button
          className={`mode-toggle-btn ${studyMode === "drill" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("drill");
            if (inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
          }}
          style={studyMode === "drill" ? { background: "#0e7490", borderColor: "#0e7490" } : {}}
        >
          ⚡ Luyện phản xạ gõ phím (Flash Drill)
        </button>
        <button
          className={`mode-toggle-btn ${studyMode === "list" ? "active" : ""}`}
          onClick={() => setStudyMode("list")}
          style={studyMode === "list" ? { background: "#0e7490", borderColor: "#0e7490" } : {}}
        >
          📋 Danh sách & Bẫy cần lưu ý (Study List)
        </button>
      </div>

      {/* ========================================================
          MODE 1: FLASH DRILL (Listen -> Type -> Enter)
         ======================================================== */}
      {studyMode === "drill" && currentItem && (
        <section className="ielts-drill-wrapper">
          <div className="ielts-drill-card">
            {/* Top Indicator */}
            <div className="drill-top-row">
              <span className="drill-question-number">
                Câu {currentIndex + 1} / {currentItems.length}
              </span>
              <span className="drill-cat-badge">
                {currentCategory.name.split(":")[0]}
              </span>
              <label className="checkbox-container" style={{ marginLeft: "auto", fontSize: "0.88rem" }}>
                <input
                  type="checkbox"
                  checked={learnedIds.has(currentItem.id)}
                  onChange={() => toggleLearned(currentItem.id)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">
                  {learnedIds.has(currentItem.id) ? "Đã thuộc 🎉" : "Đánh dấu đã thuộc"}
                </span>
              </label>
            </div>

            {/* Audio Listening Center Bubble */}
            <div className="drill-audio-center">
              <button
                className={`listen-big-btn ${isPlaying ? "playing" : ""}`}
                onClick={() => speakItem(currentItem)}
                aria-label="Nghe lại phát âm"
                title="Bấm hoặc nhấn Spacebar để nghe lại"
              >
                <svg className="speaker-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </button>
              <div className="audio-label-group">
                <span className="listen-btn-label" onClick={() => speakItem(currentItem)}>
                  Hear it again
                </span>
                <span className="listen-shortcut-hint">
                  (Nhấn <b>Space</b> để nghe lại, gõ đáp án rồi nhấn <b>Enter ↵</b> để nộp)
                </span>
              </div>
            </div>

            {/* User Input Form */}
            <form onSubmit={handleSubmit} className="drill-form">
              <div className="drill-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  className={`drill-text-input ${feedbackStatus === "correct" ? "input-correct" : ""} ${feedbackStatus === "wrong" ? "input-wrong" : ""}`}
                  placeholder="Gõ từ, tên hoặc số bạn vừa nghe được..."
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    if (feedbackStatus) setFeedbackStatus(null);
                  }}
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                />
                <button type="submit" className="drill-submit-btn">
                  Gửi đáp án ↵
                </button>
              </div>

              {/* Feedback messages */}
              {feedbackStatus === "correct" && (
                <div className="feedback-message feedback-success">
                  🎉 Chính xác! Đáp án: <b>{currentItem.target}</b>
                </div>
              )}
              {feedbackStatus === "wrong" && (
                <div className="feedback-message feedback-danger">
                  ⚠️ Chưa chính xác, hãy nghe lại hoặc bấm &quot;👁 Xem đáp án&quot; bên dưới!
                </div>
              )}
            </form>

            {/* Revealed Answer Box */}
            {showAnswer && (
              <div className="drill-revealed-box">
                <div className="revealed-header">
                  <span className="revealed-title">Đáp án chính xác:</span>
                  <span className="revealed-target">{currentItem.target}</span>
                </div>
                <p className="revealed-meaning">💡 Nghĩa / Giải thích: {currentItem.meaning_vi}</p>
                {currentItem.trap_note && (
                  <p className="revealed-trap">⚠️ Bẫy IELTS cần nhớ: {currentItem.trap_note}</p>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="drill-actions-bottom">
              <button
                type="button"
                className="btn-drill-secondary"
                onClick={() => setShowAnswer(true)}
              >
                👁 Xem đáp án
              </button>

              <div className="drill-nav-right">
                <button
                  type="button"
                  className="btn-drill-nav"
                  onClick={() => nextQuestion(currentIndex - 1 >= 0 ? currentIndex - 1 : currentItems.length - 1)}
                >
                  ← Câu trước
                </button>
                <button
                  type="button"
                  className="btn-drill-nav btn-drill-next"
                  onClick={() => nextQuestion(currentIndex + 1)}
                >
                  Câu tiếp theo →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          MODE 2: STUDY LIST (All items in category)
         ======================================================== */}
      {studyMode === "list" && (
        <section className="ielts-list-wrapper">
          {/* Filter Tabs */}
          <div className="filter-tabs" style={{ marginBottom: "16px" }}>
            <button
              onClick={() => setFilterType("all")}
              className={`filter-tab ${filterType === "all" ? "active" : ""}`}
            >
              🎯 Tất cả ({currentItems.length})
            </button>
            <button
              onClick={() => setFilterType("unlearned")}
              className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
            >
              📖 Chưa thuộc ({currentItems.filter((it) => !learnedIds.has(it.id)).length})
            </button>
            <button
              onClick={() => setFilterType("learned")}
              className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
            >
              ✅ Đã thuộc ({currentItems.filter((it) => learnedIds.has(it.id)).length})
            </button>
          </div>

          {/* Items Grid */}
          <div className="ielts-study-items">
            {filteredListItems.map((item, idx) => {
              const isLearned = learnedIds.has(item.id);
              return (
                <article
                  key={item.id}
                  className={`sentence-card ${isLearned ? "learned" : ""}`}
                  style={{ borderLeftColor: "#0e7490" }}
                >
                  <div className="card-top">
                    <span className="card-index" style={{ color: "#0e7490", backgroundColor: "#e0f2fe" }}>
                      #{idx + 1}
                    </span>
                    {item.type && (
                      <span className="card-category" style={{ textTransform: "capitalize" }}>
                        {item.type}
                      </span>
                    )}
                  </div>

                  <div className="card-body">
                    <div className="english-wrapper">
                      <div>
                        <h2 className="english-text" style={{ fontSize: "1.45rem", color: "#0f172a" }}>
                          {item.display || item.target}
                        </h2>
                      </div>
                      <button
                        className="play-button"
                        onClick={() => speakItem(item)}
                        aria-label="Nghe câu hoàn chỉnh"
                        title="Bấm để nghe câu phát âm mẫu"
                      >
                        <span className="play-icon">🗣️</span>
                      </button>
                    </div>

                    <p className="vietnamese-text" style={{ fontSize: "1rem", color: "#475569", fontWeight: "600", marginTop: "4px" }}>
                      {item.meaning_vi}
                    </p>

                    {item.trap_note && (
                      <div className="reply-box" style={{ borderLeftColor: "#f59e0b", backgroundColor: "#fffbeb", marginTop: "8px" }}>
                        <span className="reply-label" style={{ color: "#b45309" }}>⚠️ Bẫy IELTS:</span>
                        <span className="reply-text" style={{ color: "#92400e" }}>
                          {item.trap_note}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={isLearned}
                        onChange={() => toggleLearned(item.id)}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-label">
                        {isLearned ? "Đã thuộc 🎉" : "Đánh dấu đã thuộc"}
                      </span>
                    </label>
                  </div>
                </article>
              );
            })}

            {filteredListItems.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">🏜️</span>
                <p>Không có mục nào trong danh sách lọc này.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer tips */}
      <footer className="app-footer" style={{ marginTop: "30px" }}>
        <p>💡 Tip IELTS: Trong Part 1, tên người lạ luôn được đánh vần. Hãy chú ý những bẫy tự sửa (self-correction) và các âm dễ nhầm như A - E - I, G - J, B - P.</p>
      </footer>
    </main>
  );
}

