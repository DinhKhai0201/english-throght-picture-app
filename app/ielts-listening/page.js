"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import SectionNav from "../components/SectionNav";
import {
  Volume2Icon,
  EyeIcon,
  CheckIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  ListIcon,
  ZapIcon,
  InboxIcon,
  LightbulbIcon,
} from "../components/Icons";
import { isAudioMuted } from "../lib/uiUtils";
import rawData from "../../ielts_listening_drills.json";

function playAudioFeedback(type) {
  if (typeof window === "undefined" || isAudioMuted()) return;
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

  const [activeCatId, setActiveCatId] = useState("names_postcodes");
  const [studyMode, setStudyMode] = useState("drill");
  const [filterType, setFilterType] = useState("all");

  const [learnedIds, setLearnedIds] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.85);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  const inputRef = useRef(null);

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCatId) || categories[0];
  }, [categories, activeCatId]);

  const currentItems = currentCategory ? currentCategory.items : [];
  const currentItem = currentItems[currentIndex] || currentItems[0];

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ielts_listening_progress");
        if (stored) setLearnedIds(new Set(JSON.parse(stored)));
      } catch (e) {}
      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLearnedIds(next);
    localStorage.setItem("ielts_listening_progress", JSON.stringify(Array.from(next)));
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học IELTS Listening không?")) {
      setLearnedIds(new Set());
      localStorage.removeItem("ielts_listening_progress");
    }
  };

  const speakItem = useCallback(
    (item, mode = "full") => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const it = item || currentItem;
      if (!it) return;

      window.speechSynthesis.cancel();
      if (isAudioMuted()) {
        setIsPlaying(false);
        return;
      }
      let text = it.full_tts || it.target;
      if (mode === "spelling" && it.spelling_tts) {
        text = it.spelling_tts;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
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

  const nextQuestion = useCallback(
    (indexOverride) => {
      let nextIdx = indexOverride !== undefined ? indexOverride : currentIndex + 1;
      if (nextIdx >= currentItems.length) {
        nextIdx = 0;
      }
      setCurrentIndex(nextIdx);
      setUserInput("");
      setFeedbackStatus(null);
      setShowAnswer(false);

      if (inputRef.current) inputRef.current.focus();

      setTimeout(() => {
        speakItem(currentItems[nextIdx]);
      }, 200);
    },
    [currentIndex, currentItems, speakItem]
  );

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!currentItem) return;

    const cleanInput = userInput.trim().replace(/\s+/g, " ").toLowerCase();
    const cleanTarget = (currentItem.target_clean || currentItem.target).trim().replace(/\s+/g, " ").toLowerCase();
    const rawTarget = currentItem.target.trim().replace(/\s+/g, " ").toLowerCase();

    const isCorrect = cleanInput === cleanTarget || cleanInput === rawTarget;

    if (isCorrect) {
      playAudioFeedback("correct");
      setFeedbackStatus("correct");

      if (!learnedIds.has(currentItem.id)) {
        const next = new Set(learnedIds);
        next.add(currentItem.id);
        setLearnedIds(next);
        localStorage.setItem("ielts_listening_progress", JSON.stringify(Array.from(next)));
      }

      setTimeout(() => {
        nextQuestion();
      }, 850);
    } else {
      playAudioFeedback("wrong");
      setFeedbackStatus("wrong");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (studyMode !== "drill") return;
      if (e.key === " " && document.activeElement !== inputRef.current) {
        e.preventDefault();
        speakItem();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [studyMode, speakItem]);

  const totalAllItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const learnedTotal = learnedIds.size;
  const progressPercent = totalAllItems > 0 ? Math.round((learnedTotal / totalAllItems) * 100) : 0;

  const filteredListItems = currentItems.filter((item) => {
    const isLearned = learnedIds.has(item.id);
    if (filterType === "learned") return isLearned;
    if (filterType === "unlearned") return !isLearned;
    return true;
  });

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải dữ liệu IELTS Listening...</p>
      </div>
    );
  }

  return (
    <main className="container">
      <SectionNav />

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">IELTS • Part 1 &amp; 2 Listening Trainer</span>
          <h1>IELTS Listening Part 1 &amp; 2 Trainer</h1>
          <p className="hero-subtitle">
            Luyện phản xạ nghe và gõ phím bắt chuẩn Tên riêng, Mã bưu điện, Bẫy chính tả và Số đếm trong đề thi IELTS
          </p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tiến trình đã thuộc (Toàn bộ 3 bài)</span>
            <span className="stat-value">
              {learnedTotal}/{totalAllItems} mục ({progressPercent}%)
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-actions">
            <button type="button" onClick={resetProgress} className="btn-reset" title="Đặt lại toàn bộ tiến trình học">
              <RotateCcwIcon size={14} />
              <span>Reset tiến trình</span>
            </button>
          </div>
        </div>
      </header>

      <section className="categories-nav">
        {categories.map((cat) => {
          const catLearned = cat.items.filter((it) => learnedIds.has(it.id)).length;
          const isActive = activeCatId === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => {
                setActiveCatId(cat.id);
                setCurrentIndex(0);
                setUserInput("");
                setFeedbackStatus(null);
                setShowAnswer(false);
              }}
              className={`category-pill ${isActive ? "active" : ""}`}
            >
              <span>{cat.name}</span>
              <span className="cat-count">
                {catLearned}/{cat.items.length}
              </span>
            </button>
          );
        })}
      </section>

      <div className="mode-toggle-strip" role="tablist" aria-label="Chế độ luyện tập">
        <button
          type="button"
          className={`mode-toggle-btn ${studyMode === "drill" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("drill");
            if (inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
          }}
        >
          <ZapIcon size={15} />
          <span>Luyện phản xạ gõ phím (Flash Drill)</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${studyMode === "list" ? "active" : ""}`}
          onClick={() => setStudyMode("list")}
        >
          <ListIcon size={15} />
          <span>Danh sách &amp; Bẫy cần lưu ý</span>
        </button>
      </div>

      {studyMode === "drill" && currentItem && (
        <section className="ielts-drill-wrapper">
          <div className="ielts-drill-card">
            <div className="drill-top-row">
              <span className="drill-question-number">
                Câu {currentIndex + 1} / {currentItems.length}
              </span>
              <span className="drill-cat-badge">{currentCategory.name.split(":")[0]}</span>
              <label className="checkbox-container drill-top-checkbox">
                <input
                  type="checkbox"
                  checked={learnedIds.has(currentItem.id)}
                  onChange={() => toggleLearned(currentItem.id)}
                />
                <span className="checkmark" />
                <span className="checkbox-label">
                  {learnedIds.has(currentItem.id) ? (
                    <span className="learned-label-inline">
                      <CheckIcon size={14} /> Đã thuộc
                    </span>
                  ) : (
                    "Đánh dấu đã thuộc"
                  )}
                </span>
              </label>
            </div>

            <div className="drill-audio-center">
              <button
                type="button"
                className={`listen-big-btn ${isPlaying ? "playing" : ""}`}
                onClick={() => speakItem(currentItem)}
                aria-label="Nghe lại phát âm"
                title="Bấm hoặc nhấn Spacebar để nghe lại"
              >
                <Volume2Icon size={30} />
              </button>
              <div className="audio-label-group">
                <span className="listen-btn-label" onClick={() => speakItem(currentItem)}>
                  Nghe lại phát âm
                </span>
                <span className="listen-shortcut-hint">
                  Nhấn <b>Space</b> để nghe lại (ngoài ô gõ), gõ đáp án rồi nhấn <b>Enter</b> để nộp
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="drill-form">
              <div className="drill-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  className={`drill-text-input ${feedbackStatus === "correct" ? "input-correct" : ""} ${
                    feedbackStatus === "wrong" ? "input-wrong" : ""
                  }`}
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

              {feedbackStatus === "correct" && (
                <div className="feedback-message feedback-success">
                  <CheckIcon size={16} />
                  <span>
                    Chính xác! Đáp án: <b>{currentItem.target}</b>
                  </span>
                </div>
              )}
              {feedbackStatus === "wrong" && (
                <div className="feedback-message feedback-danger">
                  <AlertTriangleIcon size={16} />
                  <span>Chưa chính xác, hãy nghe lại hoặc bấm &quot;Xem đáp án&quot; bên dưới.</span>
                </div>
              )}
            </form>

            {showAnswer && (
              <div className="drill-revealed-box">
                <div className="revealed-header">
                  <span className="revealed-title">Đáp án chính xác:</span>
                  <span className="revealed-target">{currentItem.target}</span>
                </div>
                <p className="revealed-meaning">Giải thích: {currentItem.meaning_vi}</p>
                {currentItem.trap_note && (
                  <p className="revealed-trap">
                    <AlertTriangleIcon size={15} />
                    <span>Bẫy IELTS cần nhớ: {currentItem.trap_note}</span>
                  </p>
                )}
              </div>
            )}

            <div className="drill-actions-bottom">
              <button type="button" className="btn-drill-secondary" onClick={() => setShowAnswer(true)}>
                <EyeIcon size={15} />
                <span>Xem đáp án</span>
              </button>

              <div className="drill-nav-right">
                <button
                  type="button"
                  className="btn-drill-nav"
                  onClick={() => nextQuestion(currentIndex - 1 >= 0 ? currentIndex - 1 : currentItems.length - 1)}
                >
                  <ArrowLeftIcon size={14} />
                  <span>Câu trước</span>
                </button>
                <button
                  type="button"
                  className="btn-drill-nav btn-drill-next"
                  onClick={() => nextQuestion(currentIndex + 1)}
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {studyMode === "list" && (
        <section className="ielts-list-wrapper">
          <div className="filter-tabs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`filter-tab ${filterType === "all" ? "active" : ""}`}
            >
              Tất cả ({currentItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("unlearned")}
              className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
            >
              Chưa thuộc ({currentItems.filter((it) => !learnedIds.has(it.id)).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("learned")}
              className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
            >
              Đã thuộc ({currentItems.filter((it) => learnedIds.has(it.id)).length})
            </button>
          </div>

          <div className="ielts-study-items">
            {filteredListItems.map((item, idx) => {
              const isLearned = learnedIds.has(item.id);
              return (
                <article key={item.id} className={`sentence-card ${isLearned ? "learned" : ""}`}>
                  <div className="card-top">
                    <span className="card-index">#{idx + 1}</span>
                    {item.type && <span className="card-category card-category--capitalize">{item.type}</span>}
                  </div>

                  <div className="card-body">
                    <div className="english-wrapper">
                      <h2 className="english-text english-text--listening">{item.display || item.target}</h2>
                      <button
                        type="button"
                        className="play-button"
                        onClick={() => speakItem(item)}
                        aria-label="Nghe câu hoàn chỉnh"
                        title="Nghe câu phát âm mẫu"
                      >
                        <Volume2Icon size={18} />
                      </button>
                    </div>

                    <p className="vietnamese-text vietnamese-text--listening">{item.meaning_vi}</p>

                    {item.trap_note && (
                      <div className="reply-box reply-box-trap">
                        <span className="reply-label">Bẫy IELTS</span>
                        <span className="reply-text">{item.trap_note}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <label className="checkbox-container">
                      <input type="checkbox" checked={isLearned} onChange={() => toggleLearned(item.id)} />
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
                  </div>
                </article>
              );
            })}

            {filteredListItems.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">
                  <InboxIcon size={36} />
                </span>
                <p>Không có mục nào trong danh sách lọc này.</p>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>
            Tip IELTS: Trong Part 1, tên riêng thường được đánh vần từng chữ cái. Chú ý bẫy tự sửa (self-correction) và các cặp âm dễ nhầm như A–E–I, G–J, B–P.
          </span>
        </p>
      </footer>
    </main>
  );
}
