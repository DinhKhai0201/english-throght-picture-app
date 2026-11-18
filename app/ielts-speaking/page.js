"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import SectionNav from "../components/SectionNav";
import {
  Volume2Icon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
  CheckIcon,
  ClockIcon,
  MicIcon,
  LayersIcon,
  LightbulbIcon,
  TargetIcon,
  AwardIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  InboxIcon,
  BookOpenIcon,
} from "../components/Icons";
import { isTextSelected, isAudioMuted } from "../lib/uiUtils";
import rawData from "../../ielts_speaking_30_days.json";

function IeltsSpeakingContent() {
  const [activeTab, setActiveTab] = useState("plan");
  const [selectedDayNum, setSelectedDayNum] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [completedDays, setCompletedDays] = useState(new Set());
  const [learnedChunkIds, setLearnedChunkIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [chunkFilter, setChunkFilter] = useState("all");
  const [studyCounts, setStudyCounts] = useState({});

  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timerType, setTimerType] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [rubricScores, setRubricScores] = useState({
    "Fluency (Độ trôi chảy)": 4,
    "Coherence (Tính mạch lạc)": 4,
    "Vocabulary / Chunks (Từ vựng)": 4,
    "Grammar Accuracy (Ngữ pháp)": 4,
    "Pronunciation (Phát âm & Nhịp điệu)": 4,
    "Confidence (Sự tự tin)": 4,
  });

  const [isLoaded, setIsLoaded] = useState(false);

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
        const storedDays = localStorage.getItem("ielts_speaking_completed_days");
        if (storedDays) setCompletedDays(new Set(JSON.parse(storedDays)));

        const storedChunks = localStorage.getItem("ielts_speaking_learned_chunks");
        if (storedChunks) setLearnedChunkIds(new Set(JSON.parse(storedChunks)));

        const storedCounts = localStorage.getItem("ielts_speaking_study_counts");
        if (storedCounts) setStudyCounts(JSON.parse(storedCounts));

        const storedDayNum = localStorage.getItem("ielts_speaking_current_day");
        if (storedDayNum) {
          const d = parseInt(storedDayNum, 10);
          if (d >= 1 && d <= 30) setSelectedDayNum(d);
        }

        const storedScores = localStorage.getItem("ielts_speaking_rubric_scores");
        if (storedScores) setRubricScores(JSON.parse(storedScores));
      } catch (e) {}
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (!isAudioMuted()) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (seconds, type) => {
    setTimerSeconds(seconds);
    setTimerType(type);
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(null);
    setTimerType(null);
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

  const toggleDayCompletion = (dayNum) => {
    const next = new Set(completedDays);
    if (next.has(dayNum)) next.delete(dayNum);
    else next.add(dayNum);
    setCompletedDays(next);
    localStorage.setItem("ielts_speaking_completed_days", JSON.stringify(Array.from(next)));
  };

  const toggleChunkLearned = (chunkId) => {
    const next = new Set(learnedChunkIds);
    if (next.has(chunkId)) next.delete(chunkId);
    else next.add(chunkId);
    setLearnedChunkIds(next);
    localStorage.setItem("ielts_speaking_learned_chunks", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      try {
        localStorage.setItem("ielts_speaking_study_counts", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const selectDay = (dayNum) => {
    setSelectedDayNum(dayNum);
    localStorage.setItem("ielts_speaking_current_day", dayNum.toString());
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const handleScoreChange = (skill, score) => {
    const next = { ...rubricScores, [skill]: score };
    setRubricScores(next);
    localStorage.setItem("ielts_speaking_rubric_scores", JSON.stringify(next));
  };

  const resetAllProgress = () => {
    if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình học và số lần luyện tập IELTS Speaking 30 ngày không?")) {
      setCompletedDays(new Set());
      setLearnedChunkIds(new Set());
      setStudyCounts({});
      setSelectedDayNum(1);
      localStorage.removeItem("ielts_speaking_completed_days");
      localStorage.removeItem("ielts_speaking_learned_chunks");
      localStorage.removeItem("ielts_speaking_study_counts");
      localStorage.removeItem("ielts_speaking_current_day");
      localStorage.removeItem("ielts_speaking_rubric_scores");
    }
  };

  const filteredDays = useMemo(() => {
    if (selectedWeek === "all") return rawData.days;
    return rawData.days.filter((d) => d.week === parseInt(selectedWeek, 10));
  }, [selectedWeek]);

  const currentDay = useMemo(() => {
    return rawData.days.find((d) => d.day === selectedDayNum) || rawData.days[0];
  }, [selectedDayNum]);

  const allChunksList = useMemo(() => {
    const list = [];
    rawData.days.forEach((d) => {
      if (d.chunks) {
        d.chunks.forEach((c, cIdx) => {
          list.push({
            id: `d${d.day}_c${cIdx}`,
            day: d.day,
            dayTitle: d.title_en,
            week: d.week,
            chunk: c.chunk,
            meaning_vi: c.meaning_vi,
            example: c.example,
          });
        });
      }
    });
    return list;
  }, []);

  const searchedChunks = useMemo(() => {
    return allChunksList.filter((item) => {
      const isLearned = learnedChunkIds.has(item.id);
      const matchesFilter =
        chunkFilter === "all" ||
        (chunkFilter === "learned" && isLearned) ||
        (chunkFilter === "unlearned" && !isLearned);

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.chunk.toLowerCase().includes(q) ||
        item.meaning_vi.toLowerCase().includes(q) ||
        (item.example && item.example.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [allChunksList, chunkFilter, searchQuery, learnedChunkIds]);

  const totalDays = rawData.days.length;
  const daysCompletedCount = completedDays.size;
  const daysPercent = Math.round((daysCompletedCount / totalDays) * 100);

  const totalChunksCount = allChunksList.length;
  const chunksLearnedCount = learnedChunkIds.size;
  const chunksPercent = Math.round((chunksLearnedCount / totalChunksCount) * 100);

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải giáo trình IELTS Speaking 30 ngày...</p>
      </div>
    );
  }

  const getDayTypeLabel = (type) => {
    if (type === "checkpoint") return "Bài kiểm tra tuần";
    if (type === "cue_cards") return "Luyện Cue Cards Part 2";
    if (type === "mock_test") return "Thi thử Full 3 Part";
    if (type === "assessment") return "Đánh giá 30 ngày";
    return "Bài học Chunks";
  };

  const renderDayIcon = (type, isDone) => {
    if (isDone) return <CheckIcon size={15} />;
    if (type === "checkpoint") return <TargetIcon size={15} />;
    if (type === "cue_cards") return <BookOpenIcon size={15} />;
    if (type === "mock_test") return <AwardIcon size={15} />;
    return <MicIcon size={15} />;
  };

  return (
    <main className="container">
      <SectionNav />

      <div className="mode-toggle-strip" role="tablist" aria-label="Phân mục IELTS Speaking">
        <button
          type="button"
          className={`mode-toggle-btn ${activeTab === "plan" ? "active" : ""}`}
          onClick={() => setActiveTab("plan")}
        >
          <MicIcon size={15} />
          <span>Lộ trình 30 ngày ({daysCompletedCount}/30)</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${activeTab === "chunks" ? "active" : ""}`}
          onClick={() => setActiveTab("chunks")}
        >
          <LayersIcon size={15} />
          <span>Kho 260 Chunks ({chunksLearnedCount}/{totalChunksCount})</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${activeTab === "toolkit" ? "active" : ""}`}
          onClick={() => setActiveTab("toolkit")}
        >
          <LightbulbIcon size={15} />
          <span>Phương pháp &amp; Lỗi sai</span>
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">IELTS • 30-Day Chunking Plan</span>
          <h1>IELTS Speaking — 30-Day Mastery</h1>
          <p className="hero-subtitle">
            Lộ trình 30 ngày phản xạ Chunking &amp; phương pháp A-R-D hướng tới Band 7.0 – 8.0+
          </p>
        </div>

        <div className="progress-card">
          <div className="speaking-dual-progress">
            <div>
              <div className="progress-stats">
                <span className="stat-label">Tiến độ 30 ngày học</span>
                <span className="stat-value">
                  {daysCompletedCount}/30 ngày ({daysPercent}%)
                </span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${daysPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="progress-stats">
                <span className="stat-label">Chunks phản xạ đã thuộc</span>
                <span className="stat-value">
                  {chunksLearnedCount}/{totalChunksCount} cụm ({chunksPercent}%)
                </span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${chunksPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="progress-actions">
            <button type="button" onClick={resetAllProgress} className="btn-reset" title="Đặt lại toàn bộ tiến trình học">
              <RotateCcwIcon size={14} />
              <span>Reset tiến trình</span>
            </button>
          </div>
        </div>
      </header>

      <section className="control-panel">
        <div className="tts-controls speaking-tts-bar">
          <div className="control-group">
            <label htmlFor="voice-select">Giọng đọc IELTS bản xứ</label>
            <select id="voice-select" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option value="">Mặc định hệ thống</option>}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="rate-range">Tốc độ phát âm ({speechRate}x)</label>
            <input
              id="rate-range"
              type="range"
              min="0.6"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            />
          </div>

          {timerSeconds !== null && (
            <div className="speaking-active-timer">
              <ClockIcon size={16} />
              <span className="speaking-timer-label">
                {timerType === "prep" ? "Chuẩn bị (1p):" : "Nói liên tục (2p):"}{" "}
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
              </span>
              <button type="button" onClick={stopTimer} className="speaking-timer-stop-btn">
                Dừng
              </button>
            </div>
          )}
        </div>
      </section>

      {activeTab === "plan" && (
        <section>
          <div className="categories-nav">
            <button
              type="button"
              onClick={() => setSelectedWeek("all")}
              className={`category-pill ${selectedWeek === "all" ? "active" : ""}`}
            >
              Tất cả (30 ngày)
            </button>
            {rawData.weeks.map((w) => (
              <button
                type="button"
                key={w.week_number}
                onClick={() => setSelectedWeek(w.week_number.toString())}
                className={`category-pill ${selectedWeek === w.week_number.toString() ? "active" : ""}`}
              >
                Tuần {w.week_number}: {w.title_vi} ({w.day_range})
              </button>
            ))}
          </div>

          <div className="speaking-day-picker">
            {filteredDays.map((d) => {
              const isSelected = d.day === selectedDayNum;
              const isDone = completedDays.has(d.day);
              return (
                <button
                  type="button"
                  key={d.day}
                  onClick={() => selectDay(d.day)}
                  className={`speaking-day-btn ${isSelected ? "is-selected" : ""} ${isDone ? "is-done" : ""}`}
                >
                  <span className="speaking-day-num">Ngày {d.day}</span>
                  <span className="speaking-day-icon">{renderDayIcon(d.type, isDone)}</span>
                </button>
              );
            })}
          </div>

          <article className="sentence-card speaking-detail-card">
            <div className="speaking-detail-header">
              <div>
                <div className="speaking-detail-meta">
                  <span className="speaking-header-badge">
                    Tuần {currentDay.week} • Ngày {currentDay.day}/30
                  </span>
                  <span className="speaking-day-type">{getDayTypeLabel(currentDay.type)}</span>
                </div>
                <h2 className="speaking-day-title">{currentDay.title_en}</h2>
                <p className="speaking-day-subtitle">{currentDay.title_vi}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleDayCompletion(currentDay.day)}
                className={`speaking-complete-btn ${completedDays.has(currentDay.day) ? "is-completed" : ""}`}
              >
                <CheckIcon size={15} />
                <span>{completedDays.has(currentDay.day) ? "Đã hoàn thành ngày này" : "Đánh dấu hoàn thành"}</span>
              </button>
            </div>

            {currentDay.chunks && currentDay.chunks.length > 0 && (
              <div className="speaking-section">
                <div className="speaking-section-head">
                  <h3 className="speaking-section-title">
                    <LayersIcon size={16} />
                    <span>Các cụm từ chìa khóa (Language Chunks) hôm nay</span>
                  </h3>
                  <span className="speaking-section-count">{currentDay.chunks.length} cụm từ</span>
                </div>

                <div className="speaking-chunks-grid">
                  {currentDay.chunks.map((c, cIdx) => {
                    const chunkId = `d${currentDay.day}_c${cIdx}`;
                    const isLearned = learnedChunkIds.has(chunkId);
                    const isPlaying = playingId === chunkId;
                    const isPlayingEx = playingId === `${chunkId}_ex`;

                    return (
                      <div key={cIdx} className={`speaking-chunk-item ${isLearned ? "is-learned" : ""}`}>
                        <div className="speaking-chunk-top">
                          <span
                            onClick={() => {
                              if (isTextSelected()) return;
                              playSpeech(c.chunk, chunkId);
                              incrementStudyCount(chunkId);
                            }}
                            className="speaking-chunk-phrase"
                            title="Bấm để nghe phát âm"
                          >
                            {c.chunk}
                          </span>

                          <div className="speaking-chunk-actions">
                            <button
                              type="button"
                              onClick={() => {
                                playSpeech(c.chunk, chunkId);
                                incrementStudyCount(chunkId);
                              }}
                              className={`play-button play-button--sm ${isPlaying ? "playing" : ""}`}
                              title="Nghe phát âm chunk"
                              aria-label="Nghe phát âm chunk"
                            >
                              <Volume2Icon size={14} className={isPlaying ? "playing-animation" : ""} />
                            </button>
                            <input
                              type="checkbox"
                              checked={isLearned}
                              onChange={() => toggleChunkLearned(chunkId)}
                              title="Đánh dấu đã thuộc"
                              className="speaking-native-check"
                              aria-label="Đánh dấu đã thuộc"
                            />
                            <div className="study-counter study-counter--sm" title="Số lần bấm luyện tập">
                              <span className="counter-num">{studyCounts[chunkId] || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="speaking-chunk-meaning">{c.meaning_vi}</div>

                        {c.example && (
                          <div
                            onClick={() => {
                              if (isTextSelected()) return;
                              playSpeech(c.example, `${chunkId}_ex`);
                              incrementStudyCount(chunkId);
                            }}
                            className="speaking-chunk-example"
                            title="Bấm để nghe câu ví dụ hoàn chỉnh"
                          >
                            <span className="speaking-ex-label">Ex:</span>
                            <span>{c.example}</span>
                            {isPlayingEx && <Volume2Icon size={13} className="speaking-ex-playing" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentDay.model_en && (
              <div className="speaking-box speaking-tint-green">
                <div className="speaking-box-head">
                  <h3 className="speaking-box-title">
                    <LightbulbIcon size={16} />
                    <span>Bài nói mẫu kết hợp Chunks (Model Answer)</span>
                  </h3>
                  <div className="speaking-chunk-actions">
                    <div className="study-counter study-counter--sm" title="Số lần bấm luyện nghe bài mẫu">
                      <span className="counter-num">{studyCounts[`d${currentDay.day}_model`] || 0}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playSpeech(currentDay.model_en, `d${currentDay.day}_model`);
                        incrementStudyCount(`d${currentDay.day}_model`);
                      }}
                      className={`play-button play-button--sm ${playingId === `d${currentDay.day}_model` ? "playing" : ""}`}
                      title="Nghe toàn bộ bài nói mẫu"
                      aria-label="Nghe bài nói mẫu"
                    >
                      <Volume2Icon size={15} />
                    </button>
                  </div>
                </div>
                <p
                  onClick={() => {
                    if (isTextSelected()) return;
                    playSpeech(currentDay.model_en, `d${currentDay.day}_model`);
                    incrementStudyCount(`d${currentDay.day}_model`);
                  }}
                  className="speaking-model-en"
                >
                  &quot;{currentDay.model_en}&quot;
                </p>
                <p className="speaking-model-vi">{currentDay.model_vi}</p>
              </div>
            )}

            {currentDay.questions && currentDay.questions.length > 0 && (
              <div className="speaking-box speaking-box--neutral">
                <h3 className="speaking-box-title">
                  <MicIcon size={16} />
                  <span>Câu hỏi tự luyện nói thành tiếng (Áp dụng A-R-D)</span>
                </h3>
                <div className="speaking-questions-list">
                  {currentDay.questions.map((q, qIdx) => {
                    const qKey = `d${currentDay.day}_q_${qIdx}`;
                    const isPlayingQ = playingId === qKey;
                    return (
                      <div
                        key={qIdx}
                        onClick={() => {
                          if (isTextSelected()) return;
                          playSpeech(q, qKey);
                          incrementStudyCount(qKey);
                        }}
                        className="speaking-question-row"
                        title="Bấm để nghe câu hỏi"
                      >
                        <span className="speaking-question-text">
                          {qIdx + 1}. {q}
                        </span>
                        <div className="speaking-chunk-actions">
                          <div className="study-counter study-counter--sm" title="Số lần bấm luyện câu hỏi">
                            <span className="counter-num">{studyCounts[qKey] || 0}</span>
                          </div>
                          <button type="button" className={`play-button play-button--sm ${isPlayingQ ? "playing" : ""}`} aria-label="Nghe câu hỏi">
                            <Volume2Icon size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentDay.cue_card_method && (
              <div className="speaking-box speaking-tint-blue">
                <h3 className="speaking-box-title">{currentDay.cue_card_method.title}</h3>
                <div className="speaking-steps-grid">
                  {currentDay.cue_card_method.steps.map((st) => (
                    <div key={st.step} className="speaking-subcard">
                      <div className="speaking-subcard-title">
                        Bước {st.step}: {st.name} ({st.prompt})
                      </div>
                      <div className="speaking-subcard-meta">
                        Ví dụ ghi chú: <code className="speaking-note-code">{st.note}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentDay.cue_cards && (
              <div className="speaking-section">
                <h3 className="speaking-section-title">5 Đề Cue Cards thực chiến</h3>
                <div className="speaking-cuecards-list">
                  {currentDay.cue_cards.map((cc, ccIdx) => (
                    <div key={cc.id} className="speaking-box speaking-box--neutral">
                      <div className="speaking-cuecard-head">
                        <div>
                          <span className="speaking-chunk-badge">Cue Card #{ccIdx + 1}</span>
                          <h4 className="speaking-cuecard-topic">{cc.topic}</h4>
                        </div>
                        <div className="speaking-timer-actions">
                          <button type="button" onClick={() => startTimer(60, "prep")} className="speaking-timer-btn speaking-timer-btn-prep">
                            <ClockIcon size={14} />
                            <span>1 phút chuẩn bị</span>
                          </button>
                          <button type="button" onClick={() => startTimer(120, "speak")} className="speaking-timer-btn speaking-timer-btn-speak">
                            <MicIcon size={14} />
                            <span>2 phút nói</span>
                          </button>
                        </div>
                      </div>
                      <div className="speaking-subcard">
                        <p className="speaking-prompts-label">You should say:</p>
                        <ul className="speaking-prompts-list">
                          {cc.prompts.map((p, pIdx) => (
                            <li key={pIdx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentDay.part3_framework && (
              <div className="speaking-box speaking-tint-purple">
                <h3 className="speaking-box-title">
                  Công thức triển khai Part 3: {currentDay.part3_framework.formula}
                </h3>
                <div className="speaking-steps-grid">
                  {currentDay.part3_framework.steps.map((st) => (
                    <div key={st.code} className="speaking-subcard">
                      <span className="speaking-formula-code">{st.code}</span> — {st.name}
                      <p className="speaking-subcard-meta">{st.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="speaking-subcard">
                  <div className="speaking-subcard-title">Câu hỏi mẫu: {currentDay.part3_framework.sample_q}</div>
                  <p className="speaking-subcard-body">{currentDay.part3_framework.sample_a}</p>
                </div>
              </div>
            )}

            {currentDay.mock_test_flow && (
              <div className="speaking-box speaking-tint-amber">
                <h3 className="speaking-box-title">
                  <AwardIcon size={16} />
                  <span>Full Mock Test Simulation (11 – 14 phút)</span>
                </h3>
                <div className="speaking-cuecards-list">
                  <div className="speaking-subcard">
                    <div className="speaking-subcard-title">
                      Part 1: Phỏng vấn mở đầu ({currentDay.mock_test_flow.part1.time})
                    </div>
                    <ul className="speaking-mock-list">
                      {currentDay.mock_test_flow.part1.questions.map((q, idx) => (
                        <li
                          key={idx}
                          className="speaking-mock-item"
                          onClick={() => {
                            playSpeech(q, `mock_p1_${idx}`);
                            incrementStudyCount(`mock_p1_${idx}`);
                          }}
                        >
                          <span>{q}</span>
                          <span className="speaking-mock-meta">
                            <Volume2Icon size={13} />
                            {studyCounts[`mock_p1_${idx}`] ? `(${studyCounts[`mock_p1_${idx}`]})` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="speaking-subcard">
                    <div className="speaking-cuecard-head">
                      <span className="speaking-subcard-title">
                        Part 2: Độc thoại Cue Card ({currentDay.mock_test_flow.part2.time})
                      </span>
                      <div className="speaking-timer-actions">
                        <button type="button" onClick={() => startTimer(60, "prep")} className="speaking-timer-btn speaking-timer-btn-prep">
                          1p Prep
                        </button>
                        <button type="button" onClick={() => startTimer(120, "speak")} className="speaking-timer-btn speaking-timer-btn-speak">
                          2p Speak
                        </button>
                      </div>
                    </div>
                    <p className="speaking-mock-cue">{currentDay.mock_test_flow.part2.cue_card}</p>
                    <ul className="speaking-prompts-list">
                      {currentDay.mock_test_flow.part2.prompts.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="speaking-subcard">
                    <div className="speaking-subcard-title">
                      Part 3: Thảo luận sâu ({currentDay.mock_test_flow.part3.time})
                    </div>
                    <ul className="speaking-mock-list">
                      {currentDay.mock_test_flow.part3.questions.map((q, idx) => (
                        <li
                          key={idx}
                          className="speaking-mock-item"
                          onClick={() => {
                            playSpeech(q, `mock_p3_${idx}`);
                            incrementStudyCount(`mock_p3_${idx}`);
                          }}
                        >
                          <span>{q}</span>
                          <span className="speaking-mock-meta">
                            <Volume2Icon size={13} />
                            {studyCounts[`mock_p3_${idx}`] ? `(${studyCounts[`mock_p3_${idx}`]})` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentDay.rubric && (
              <div className="speaking-box speaking-tint-green">
                <h3 className="speaking-box-title">Bảng đánh giá năng lực 6 tiêu chí (Band 7.0 – 8.0+)</h3>
                <div className="speaking-rubric-list">
                  {currentDay.rubric.map((r, rIdx) => (
                    <div key={rIdx} className="speaking-rubric-row">
                      <div>
                        <span className="speaking-subcard-title">{r.skill}</span>
                        <div className="speaking-subcard-meta">Mục tiêu: {r.target}</div>
                      </div>
                      <div className="speaking-score-group">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => handleScoreChange(r.skill, val)}
                            className={`speaking-score-btn ${(rubricScores[r.skill] || 4) >= val ? "is-active" : ""}`}
                          >
                            {val}
                          </button>
                        ))}
                        <span className="speaking-score-value">{rubricScores[r.skill] || 4}/5</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="speaking-subcard">
                  <h4 className="speaking-subcard-title">Kế hoạch tiếp theo (Next Steps)</h4>
                  <ul className="speaking-prompts-list">
                    {currentDay.next_steps.map((st, idx) => (
                      <li key={idx}>{st}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {currentDay.checkpoint_task && (
              <div className="speaking-box speaking-tint-amber">
                <h3 className="speaking-box-title">
                  <TargetIcon size={16} />
                  <span>Nhiệm vụ ghi âm &amp; tự đánh giá</span>
                </h3>
                <p className="speaking-checkpoint-desc">{currentDay.checkpoint_task.instructions}</p>
                <div className="speaking-subcard">
                  <span className="speaking-subcard-title">Các câu hỏi luyện nói:</span>
                  <ul className="speaking-mock-list">
                    {currentDay.checkpoint_task.questions.map((q, idx) => (
                      <li
                        key={idx}
                        className="speaking-mock-item"
                        onClick={() => {
                          playSpeech(q, `chk_q_${idx}`);
                          incrementStudyCount(`chk_q_${idx}`);
                        }}
                      >
                        <span>{q}</span>
                        <span className="speaking-mock-meta">
                          <Volume2Icon size={13} />
                          {studyCounts[`chk_q_${idx}`] ? `(${studyCounts[`chk_q_${idx}`]})` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="speaking-subcard">
                  <span className="speaking-subcard-title">Bảng kiểm tra lỗi (Self-audit Checklist):</span>
                  <ul className="speaking-prompts-list">
                    {currentDay.checkpoint_task.checklist.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="speaking-bottom-nav">
              <button
                type="button"
                disabled={currentDay.day <= 1}
                onClick={() => selectDay(currentDay.day - 1)}
                className="pagination-btn"
              >
                <ArrowLeftIcon size={14} />
                <span>Ngày {currentDay.day - 1}</span>
              </button>

              <span className="speaking-bottom-counter">Ngày {currentDay.day} / 30</span>

              <button
                type="button"
                disabled={currentDay.day >= 30}
                onClick={() => selectDay(currentDay.day + 1)}
                className="pagination-btn"
              >
                <span>Ngày {currentDay.day + 1}</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </article>
        </section>
      )}

      {activeTab === "chunks" && (
        <section>
          <div className="control-panel">
            <div className="search-box">
              <span className="search-icon">
                <SearchIcon size={16} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm cụm từ tiếng Anh, nghĩa tiếng Việt hoặc câu ví dụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="clear-search" aria-label="Xóa tìm kiếm">
                  <XIcon size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="filter-tabs">
            <button
              type="button"
              onClick={() => setChunkFilter("all")}
              className={`filter-tab ${chunkFilter === "all" ? "active" : ""}`}
            >
              Tất cả ({allChunksList.length})
            </button>
            <button
              type="button"
              onClick={() => setChunkFilter("unlearned")}
              className={`filter-tab ${chunkFilter === "unlearned" ? "active" : ""}`}
            >
              Chưa thuộc ({allChunksList.filter((c) => !learnedChunkIds.has(c.id)).length})
            </button>
            <button
              type="button"
              onClick={() => setChunkFilter("learned")}
              className={`filter-tab ${chunkFilter === "learned" ? "active" : ""}`}
            >
              Đã thuộc ({learnedChunkIds.size})
            </button>
          </div>

          <div className="speaking-chunks-grid">
            {searchedChunks.map((c) => {
              const isLearned = learnedChunkIds.has(c.id);
              const isPlaying = playingId === c.id;
              const isPlayingEx = playingId === `${c.id}_ex`;

              return (
                <article key={c.id} className={`sentence-card speaking-chunk-card ${isLearned ? "learned" : ""}`}>
                  <div className="speaking-chunk-card-top">
                    <span className="speaking-chunk-badge">
                      Ngày {c.day} • {c.dayTitle}
                    </span>
                    <div className="speaking-chunk-actions">
                      <label className="checkbox-container checkbox-container--compact">
                        <input type="checkbox" checked={isLearned} onChange={() => toggleChunkLearned(c.id)} />
                        <span className="checkmark" />
                        <span className="checkbox-label">{isLearned ? "Đã thuộc" : "Chưa thuộc"}</span>
                      </label>
                      <div className="study-counter study-counter--sm" title="Số lần bấm luyện tập">
                        <span className="counter-num">{studyCounts[c.id] || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="speaking-chunk-top">
                    <h3
                      onClick={() => {
                        if (isTextSelected()) return;
                        playSpeech(c.chunk, c.id);
                        incrementStudyCount(c.id);
                      }}
                      className="speaking-chunk-phrase"
                    >
                      {c.chunk}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        playSpeech(c.chunk, c.id);
                        incrementStudyCount(c.id);
                      }}
                      className={`play-button play-button--sm ${isPlaying ? "playing" : ""}`}
                      title="Nghe phát âm chunk"
                      aria-label="Nghe phát âm"
                    >
                      <Volume2Icon size={14} />
                    </button>
                  </div>

                  <p className="speaking-chunk-meaning">{c.meaning_vi}</p>

                  {c.example && (
                    <div
                      onClick={() => {
                        if (isTextSelected()) return;
                        playSpeech(c.example, `${c.id}_ex`);
                        incrementStudyCount(c.id);
                      }}
                      className="speaking-chunk-example"
                      title="Bấm để nghe ví dụ"
                    >
                      <span className="speaking-ex-label">Ex:</span>
                      <span>{c.example}</span>
                      {isPlayingEx && <Volume2Icon size={13} className="speaking-ex-playing" />}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {searchedChunks.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">
                <InboxIcon size={36} />
              </span>
              <p>Không tìm thấy cụm từ nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === "toolkit" && (
        <section className="speaking-toolkit-stack">
          <div className="sentence-card speaking-detail-card">
            <h3 className="speaking-toolkit-title">
              <AwardIcon size={17} />
              <span>4 Tiêu chí chấm điểm IELTS Speaking</span>
            </h3>
            <div className="speaking-steps-grid">
              {rawData.overview.four_criteria.map((cr, idx) => (
                <div key={idx} className="speaking-subcard">
                  <div className="speaking-subcard-title">
                    {idx + 1}. {cr.name}
                  </div>
                  <div className="speaking-chunk-badge">{cr.vi}</div>
                  <p className="speaking-subcard-meta">{cr.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sentence-card speaking-detail-card">
            <h3 className="speaking-toolkit-title speaking-toolkit-title--danger">
              <AlertTriangleIcon size={17} />
              <span>Top 10 lỗi sai phổ biến của người Việt &amp; cách sửa</span>
            </h3>
            <div className="speaking-mistakes-list">
              {rawData.toolkits.common_mistakes.map((m, idx) => (
                <div key={idx} className="speaking-mistake-row">
                  <div className="speaking-mistake-wrong">{m.wrong}</div>
                  <div className="speaking-mistake-correct">{m.correct}</div>
                  <div className="speaking-mistake-reason">{m.reason}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sentence-card speaking-detail-card">
            <h3 className="speaking-toolkit-title">
              <ClockIcon size={17} />
              <span>Cụm từ &quot;câu giờ&quot; tự nhiên (Hesitation Devices)</span>
            </h3>
            <div className="speaking-chunks-grid">
              {rawData.toolkits.hesitation_fillers.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (isTextSelected()) return;
                    playSpeech(f.en, `filler_${idx}`);
                    incrementStudyCount(`filler_${idx}`);
                  }}
                  className="speaking-filler-card"
                  title="Bấm để nghe phát âm"
                >
                  <div>
                    <div className="speaking-filler-en">
                      <Volume2Icon size={14} />
                      <span>{f.en}</span>
                    </div>
                    <div className="speaking-subcard-meta">{f.vi}</div>
                  </div>
                  <div className="speaking-filler-foot">
                    <div className="study-counter study-counter--sm" title="Số lần luyện tập">
                      <span className="counter-num">{studyCounts[`filler_${idx}`] || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sentence-card speaking-detail-card">
            <h3 className="speaking-toolkit-title">
              <LayersIcon size={17} />
              <span>5 Cấu trúc câu thiết yếu trong khẩu ngữ</span>
            </h3>
            <div className="speaking-steps-grid">
              {rawData.toolkits.grammar_patterns.map((gp, idx) => (
                <div key={idx} className="speaking-subcard">
                  <div className="speaking-subcard-title">
                    Mẫu {idx + 1}: {gp.pattern}
                  </div>
                  <div className="speaking-subcard-body">&quot;{gp.example}&quot;</div>
                  <div className="speaking-subcard-meta">{gp.vi}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>Tip: Nói to thành tiếng mỗi ngày 15–20 phút và ghi âm lại để kiểm tra ngữ điệu và độ trôi chảy.</span>
        </p>
      </footer>
    </main>
  );
}

export default function IeltsSpeakingPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-screen">
          <div className="spinner" />
          <p>Đang tải dữ liệu IELTS Speaking...</p>
        </div>
      }
    >
      <IeltsSpeakingContent />
    </Suspense>
  );
}
