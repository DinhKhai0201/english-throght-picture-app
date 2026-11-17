"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import SectionNav from "../components/SectionNav";
import rawData from "../../ielts_speaking_30_days.json";

function IeltsSpeakingContent() {
  const [activeTab, setActiveTab] = useState("plan"); // "plan" | "chunks" | "toolkit"
  const [selectedDayNum, setSelectedDayNum] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState("all"); // "all" | 1 | 2 | 3 | 4
  const [completedDays, setCompletedDays] = useState(new Set());
  const [learnedChunkIds, setLearnedChunkIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [chunkFilter, setChunkFilter] = useState("all"); // "all" | "unlearned" | "learned"
  const [studyCounts, setStudyCounts] = useState({});

  // TTS audio state
  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  // Timer states for Cue Card practice (Day 21 & Day 20)
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timerType, setTimerType] = useState(null); // "prep" (60s) | "speak" (120s)
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Rubric scores for Day 30
  const [rubricScores, setRubricScores] = useState({
    "Fluency (Độ trôi chảy)": 4,
    "Coherence (Tính mạch lạc)": 4,
    "Vocabulary / Chunks (Từ vựng)": 4,
    "Grammar Accuracy (Ngữ pháp)": 4,
    "Pronunciation (Phát âm & Nhịp điệu)": 4,
    "Confidence (Sự tự tin)": 4,
  });

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
      try {
        const storedDays = localStorage.getItem("ielts_speaking_completed_days");
        if (storedDays) {
          setCompletedDays(new Set(JSON.parse(storedDays)));
        }

        const storedChunks = localStorage.getItem("ielts_speaking_learned_chunks");
        if (storedChunks) {
          setLearnedChunkIds(new Set(JSON.parse(storedChunks)));
        }

        const storedCounts = localStorage.getItem("ielts_speaking_study_counts");
        if (storedCounts) {
          setStudyCounts(JSON.parse(storedCounts));
        }

        const storedDayNum = localStorage.getItem("ielts_speaking_current_day");
        if (storedDayNum) {
          const d = parseInt(storedDayNum, 10);
          if (d >= 1 && d <= 30) setSelectedDayNum(d);
        }

        const storedScores = localStorage.getItem("ielts_speaking_rubric_scores");
        if (storedScores) {
          setRubricScores(JSON.parse(storedScores));
        }
      } catch (e) {
        console.error("Error loading speaking progress", e);
      }
      setIsLoaded(true);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      // Play a quick browser beep if available
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
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

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speechRate;

    if (selectedVoice) {
      const voiceObj = voices.find((v) => v.name === selectedVoice);
      if (voiceObj) {
        utterance.voice = voiceObj;
      }
    }

    utterance.onstart = () => setPlayingId(id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const toggleDayCompletion = (dayNum) => {
    const next = new Set(completedDays);
    if (next.has(dayNum)) {
      next.delete(dayNum);
    } else {
      next.add(dayNum);
    }
    setCompletedDays(next);
    localStorage.setItem("ielts_speaking_completed_days", JSON.stringify(Array.from(next)));
  };

  const toggleChunkLearned = (chunkId) => {
    const next = new Set(learnedChunkIds);
    if (next.has(chunkId)) {
      next.delete(chunkId);
    } else {
      next.add(chunkId);
    }
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

  // Days list filtered by week
  const filteredDays = useMemo(() => {
    if (selectedWeek === "all") return rawData.days;
    return rawData.days.filter((d) => d.week === parseInt(selectedWeek, 10));
  }, [selectedWeek]);

  // Current selected day data
  const currentDay = useMemo(() => {
    return rawData.days.find((d) => d.day === selectedDayNum) || rawData.days[0];
  }, [selectedDayNum]);

  // Flatten all chunks for Tab 2
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

  // Filtered chunks for Tab 2
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

  const totalDays = rawData.days.length; // 30
  const daysCompletedCount = completedDays.size;
  const daysPercent = Math.round((daysCompletedCount / totalDays) * 100);

  const totalChunksCount = allChunksList.length; // 260
  const chunksLearnedCount = learnedChunkIds.size;
  const chunksPercent = Math.round((chunksLearnedCount / totalChunksCount) * 100);

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải giáo trình IELTS Speaking 30 ngày...</p>
      </div>
    );
  }

  return (
    <main className="container">
      {/* Multi-Section Navigation Bar */}
      <SectionNav />

      {/* Main Tab Switcher */}
      <div className="mode-toggle-strip" style={{ marginBottom: "20px" }}>
        <button
          className={`mode-toggle-btn ${activeTab === "plan" ? "active" : ""}`}
          onClick={() => setActiveTab("plan")}
        >
          📅 Lộ trình 30 ngày ({daysCompletedCount}/30 hoàn thành)
        </button>
        <button
          className={`mode-toggle-btn ${activeTab === "chunks" ? "active" : ""}`}
          onClick={() => setActiveTab("chunks")}
        >
          🧩 Kho 260 Chunks ({chunksLearnedCount}/{totalChunksCount} đã thuộc)
        </button>
        <button
          className={`mode-toggle-btn ${activeTab === "toolkit" ? "active" : ""}`}
          onClick={() => setActiveTab("toolkit")}
        >
          💡 Phương pháp & Lỗi sai kinh điển
        </button>
      </div>

      {/* Hero Header */}
      <header className="hero">
        <div className="hero-content">
          <h1 style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🎙️ IELTS Speaking — 30-Day Chunking Plan
          </h1>
          <p className="hero-subtitle">
            Lộ trình 30 ngày phản xạ Chunking & phương pháp A-R-D chinh phục IELTS Speaking Band 7.0 - 8.0+
          </p>
        </div>

        {/* Dual Progress Card */}
        <div className="progress-card" style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)", boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.35)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <div className="progress-stats">
                <span className="stat-label">Tiến độ 30 ngày học</span>
                <span className="stat-value">{daysCompletedCount}/30 ngày ({daysPercent}%)</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${daysPercent}%`, backgroundColor: "#a7f3d0" }}></div>
              </div>
            </div>
            <div>
              <div className="progress-stats">
                <span className="stat-label">Chunks phản xạ đã thuộc</span>
                <span className="stat-value">{chunksLearnedCount}/{totalChunksCount} cụm ({chunksPercent}%)</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${chunksPercent}%`, backgroundColor: "#fef08a" }}></div>
              </div>
            </div>
          </div>

          <div className="progress-actions" style={{ marginTop: "12px" }}>
            <button onClick={resetAllProgress} className="btn-reset" title="Đặt lại toàn bộ tiến trình học">
              🔄 Reset tiến trình
            </button>
          </div>
        </div>
      </header>

      {/* Global TTS Controls Panel */}
      <section className="control-panel" style={{ marginBottom: "20px" }}>
        <div className="tts-controls" style={{ width: "100%", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div className="control-group">
            <label htmlFor="voice-select">Giọng đọc IELTS bản xứ:</label>
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
              {voices.length === 0 && <option value="">Mặc định hệ thống</option>}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="rate-range">Tốc độ phát âm ({speechRate}x):</label>
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef3c7", padding: "6px 14px", borderRadius: "8px", border: "1px solid #f59e0b" }}>
              <span style={{ fontWeight: "700", color: "#b45309" }}>
                ⏱️ {timerType === "prep" ? "Thời gian chuẩn bị (1p):" : "Thời gian nói liên tục (2p):"} {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
              </span>
              <button onClick={stopTimer} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}>
                Dừng
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          TAB 1: LỘ TRÌNH 30 NGÀY (DAILY PLAN)
          ========================================================================= */}
      {activeTab === "plan" && (
        <section>
          {/* Week Filter Pills */}
          <div className="categories-nav" style={{ marginBottom: "16px" }}>
            <button
              onClick={() => setSelectedWeek("all")}
              className={`category-pill ${selectedWeek === "all" ? "active" : ""}`}
              style={selectedWeek === "all" ? { backgroundColor: "#059669", borderColor: "#059669" } : {}}
            >
              📅 Tất cả (30 ngày)
            </button>
            {rawData.weeks.map((w) => (
              <button
                key={w.week_number}
                onClick={() => setSelectedWeek(w.week_number.toString())}
                className={`category-pill ${selectedWeek === w.week_number.toString() ? "active" : ""}`}
                style={selectedWeek === w.week_number.toString() ? { backgroundColor: "#059669", borderColor: "#059669" } : {}}
              >
                Tuần {w.week_number}: {w.title_vi} ({w.day_range})
              </button>
            ))}
          </div>

          {/* 30 Days Horizontal Picker Carousel / Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
            gap: "8px",
            marginBottom: "24px",
            background: "#ffffff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}>
            {filteredDays.map((d) => {
              const isSelected = d.day === selectedDayNum;
              const isDone = completedDays.has(d.day);
              return (
                <button
                  key={d.day}
                  onClick={() => selectDay(d.day)}
                  style={{
                    padding: "10px 4px",
                    borderRadius: "8px",
                    border: isSelected ? "2px solid #059669" : "1px solid #e2e8f0",
                    background: isSelected ? "#ecfdf5" : isDone ? "#f0fdf4" : "#ffffff",
                    color: isSelected ? "#065f46" : "#334155",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 4px 10px rgba(5, 150, 105, 0.15)" : "none"
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>Ngày {d.day}</span>
                  <span style={{ fontSize: "1.1rem" }}>{isDone ? "✅" : d.type === "checkpoint" ? "🎯" : d.type === "cue_cards" ? "🗂️" : d.type === "mock_test" ? "🏆" : "🗣️"}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE DAY DETAIL VIEW */}
          <article className="sentence-card" style={{ borderLeft: "5px solid #059669", padding: "24px" }}>
            {/* Header: Day number, title, week badge, mark completed button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ background: "#ecfdf5", color: "#059669", fontWeight: "800", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", textTransform: "uppercase" }}>
                    Tuần {currentDay.week} • Ngày {currentDay.day}/30
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>
                    {currentDay.type === "checkpoint" ? "🎯 Bài kiểm tra tuần" : currentDay.type === "cue_cards" ? "🗂️ Luyện Cue Cards Part 2" : currentDay.type === "mock_test" ? "🏆 Thi thử Full 3 Part" : currentDay.type === "assessment" ? "📊 Đánh giá 30 ngày" : "🗣️ Bài học Chunks"}
                  </span>
                </div>
                <h2 style={{ fontSize: "1.6rem", color: "#0f172a", margin: "0 0 4px 0", fontWeight: "800" }}>
                  {currentDay.title_en}
                </h2>
                <p style={{ fontSize: "1.1rem", color: "#475569", margin: 0, fontWeight: "600" }}>
                  {currentDay.title_vi}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={() => toggleDayCompletion(currentDay.day)}
                  style={{
                    background: completedDays.has(currentDay.day) ? "#059669" : "#ffffff",
                    color: completedDays.has(currentDay.day) ? "#ffffff" : "#059669",
                    border: "2px solid #059669",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease"
                  }}
                >
                  {completedDays.has(currentDay.day) ? "✅ Đã hoàn thành ngày này" : "⭕ Đánh dấu hoàn thành"}
                </button>
              </div>
            </div>

            {/* Day Chunks Section */}
            {currentDay.chunks && currentDay.chunks.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.1rem", color: "#059669", fontWeight: "800", textTransform: "uppercase", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🧩</span> Các Cụm Từ Chìa Khóa (Language Chunks) Hôm Nay:
                  </h3>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>
                    {currentDay.chunks.length} cụm từ
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
                  {currentDay.chunks.map((c, cIdx) => {
                    const chunkId = `d${currentDay.day}_c${cIdx}`;
                    const isLearned = learnedChunkIds.has(chunkId);
                    const isPlaying = playingId === chunkId;
                    const isPlayingEx = playingId === `${chunkId}_ex`;

                    return (
                      <div
                        key={cIdx}
                        style={{
                          background: isLearned ? "#f0fdf4" : "#f8fafc",
                          border: isLearned ? "1px solid #86efac" : "1px solid #e2e8f0",
                          borderLeft: isLearned ? "4px solid #16a34a" : "4px solid #059669",
                          borderRadius: "8px",
                          padding: "14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <span
                            onClick={() => { playSpeech(c.chunk, chunkId); incrementStudyCount(chunkId); }}
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: "700",
                              color: "#0f172a",
                              cursor: "pointer"
                            }}
                            title="Bấm để nghe phát âm"
                          >
                            {c.chunk}
                          </span>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              onClick={() => { playSpeech(c.chunk, chunkId); incrementStudyCount(chunkId); }}
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                border: "1px solid #cbd5e1",
                                background: "#ffffff",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Nghe phát âm chunk"
                            >
                              {isPlaying ? "🔊" : "🗣️"}
                            </button>
                            <input
                              type="checkbox"
                              checked={isLearned}
                              onChange={() => toggleChunkLearned(chunkId)}
                              title="Đánh dấu đã thuộc"
                              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#16a34a" }}
                            />
                            <div
                              className="study-counter"
                              style={{
                                color: "#059669",
                                backgroundColor: "rgba(5, 150, 105, 0.1)",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontWeight: "700"
                              }}
                              title="Số lần bấm luyện tập"
                            >
                              <span className="counter-num" style={{ fontSize: "0.95rem" }}>{studyCounts[chunkId] || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: "0.95rem", color: "#059669", fontWeight: "600" }}>
                          👉 {c.meaning_vi}
                        </div>

                        {c.example && (
                          <div
                            onClick={() => { playSpeech(c.example, `${chunkId}_ex`); incrementStudyCount(chunkId); }}
                            style={{
                              background: "#ffffff",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px dashed #cbd5e1",
                              fontSize: "0.9rem",
                              color: "#334155",
                              lineHeight: "1.4",
                              cursor: "pointer"
                            }}
                            title="Bấm để nghe câu ví dụ hoàn chỉnh"
                          >
                            <span style={{ fontWeight: "700", color: "#64748b" }}>Ex: </span>
                            {c.example}
                            {isPlayingEx && <span style={{ marginLeft: "6px", color: "#059669" }}>🔊</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Model Answer Section */}
            {currentDay.model_en && (
              <div style={{ marginBottom: "28px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h3 style={{ fontSize: "1rem", color: "#059669", fontWeight: "800", textTransform: "uppercase", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>💡</span> Bài Nói Mẫu Kết Hợp Chunks (Model Answer):
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      className="study-counter"
                      style={{
                        color: "#059669",
                        backgroundColor: "#dcfce7",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontWeight: "700"
                      }}
                      title="Số lần bấm luyện nghe bài mẫu"
                    >
                      <span className="counter-num" style={{ fontSize: "0.95rem" }}>{studyCounts[`d${currentDay.day}_model`] || 0}</span>
                    </div>
                    <button
                      onClick={() => {
                        playSpeech(currentDay.model_en, `d${currentDay.day}_model`);
                        incrementStudyCount(`d${currentDay.day}_model`);
                      }}
                      className="play-button"
                      style={{ width: "34px", height: "34px", fontSize: "1rem", background: "#ffffff" }}
                      title="Nghe toàn bộ bài nói mẫu"
                    >
                      {playingId === `d${currentDay.day}_model` ? "🔊" : "🗣️"}
                    </button>
                  </div>
                </div>
                <p
                  onClick={() => {
                    playSpeech(currentDay.model_en, `d${currentDay.day}_model`);
                    incrementStudyCount(`d${currentDay.day}_model`);
                  }}
                  style={{ fontSize: "1.1rem", color: "#0f172a", lineHeight: "1.55", fontWeight: "500", margin: "0 0 10px 0", cursor: "pointer" }}
                >
                  "{currentDay.model_en}"
                </p>
                <p style={{ fontSize: "0.95rem", color: "#475569", margin: 0, lineHeight: "1.5", fontStyle: "italic" }}>
                  👉 {currentDay.model_vi}
                </p>
              </div>
            )}

            {/* Practice Questions Section */}
            {currentDay.questions && currentDay.questions.length > 0 && (
              <div style={{ marginBottom: "24px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px" }}>
                <h3 style={{ fontSize: "1rem", color: "#0f172a", fontWeight: "800", textTransform: "uppercase", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>❓</span> Câu Hỏi Tự Luyện Nói Thành Tiếng (Áp Dụng A-R-D):
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {currentDay.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      onClick={() => {
                        playSpeech(q, `d${currentDay.day}_q_${qIdx}`);
                        incrementStudyCount(`d${currentDay.day}_q_${qIdx}`);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        cursor: "pointer",
                        gap: "10px"
                      }}
                      title="Bấm để nghe câu hỏi"
                    >
                      <span style={{ fontSize: "1.05rem", fontWeight: "600", color: "#1e293b" }}>
                        {qIdx + 1}. {q}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <div
                          className="study-counter"
                          style={{
                            color: "#059669",
                            backgroundColor: "rgba(5, 150, 105, 0.1)",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontWeight: "700"
                          }}
                          title="Số lần bấm luyện câu hỏi"
                        >
                          <span className="counter-num" style={{ fontSize: "0.95rem" }}>{studyCounts[`d${currentDay.day}_q_${qIdx}`] || 0}</span>
                        </div>
                        <button
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            border: "none",
                            background: "#ecfdf5",
                            color: "#059669",
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          {playingId === `d${currentDay.day}_q_${qIdx}` ? "🔊" : "🗣️"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day 20: 1-Minute Preparation Method */}
            {currentDay.cue_card_method && (
              <div style={{ marginBottom: "24px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#0284c7", fontWeight: "800", margin: "0 0 12px 0" }}>
                  📝 {currentDay.cue_card_method.title}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                  {currentDay.cue_card_method.steps.map((st) => (
                    <div key={st.step} style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                      <div style={{ fontWeight: "700", color: "#0369a1", fontSize: "0.95rem", marginBottom: "4px" }}>
                        Bước {st.step}: {st.name} ({st.prompt})
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Ví dụ ghi chú: <code style={{ color: "#b91c1c", fontWeight: "700" }}>{st.note}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day 21: 5 Classic Cue Cards Practice with Timers */}
            {currentDay.cue_cards && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#059669", fontWeight: "800", textTransform: "uppercase", margin: "0 0 14px 0" }}>
                  🗂️ 5 Đề Cue Cards Thực Chiến:
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {currentDay.cue_cards.map((cc, ccIdx) => (
                    <div key={cc.id} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#059669", textTransform: "uppercase" }}>Cue Card #{ccIdx + 1}</span>
                          <h4 style={{ fontSize: "1.2rem", color: "#0f172a", margin: "4px 0 0 0", fontWeight: "700" }}>
                            {cc.topic}
                          </h4>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => startTimer(60, "prep")}
                            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #f59e0b", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}
                          >
                            ⏱️ 1 Phút Chuẩn Bị
                          </button>
                          <button
                            onClick={() => startTimer(120, "speak")}
                            style={{ background: "#dcfce7", color: "#166534", border: "1px solid #22c55e", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}
                          >
                            🎙️ 2 Phút Nói Liên Tục
                          </button>
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", fontWeight: "600", color: "#475569" }}>You should say:</p>
                        <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", fontSize: "0.95rem", lineHeight: "1.6" }}>
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

            {/* Day 28: Part 3 O-R-E-Q Framework */}
            {currentDay.part3_framework && (
              <div style={{ marginBottom: "24px", background: "#fdf4ff", border: "1px solid #f0abfc", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#86198f", fontWeight: "800", margin: "0 0 12px 0" }}>
                  🎯 Công Thức Triển Khai Part 3: {currentDay.part3_framework.formula}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                  {currentDay.part3_framework.steps.map((st) => (
                    <div key={st.code} style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e9d5ff" }}>
                      <span style={{ fontWeight: "800", color: "#9333ea", fontSize: "1rem" }}>{st.code}</span> - {st.name}
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>{st.desc}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #e9d5ff" }}>
                  <div style={{ fontWeight: "700", color: "#86198f", marginBottom: "6px" }}>
                    Câu hỏi mẫu: {currentDay.part3_framework.sample_q}
                  </div>
                  <p style={{ fontSize: "0.95rem", color: "#1e293b", lineHeight: "1.6", margin: 0 }}>
                    {currentDay.part3_framework.sample_a}
                  </p>
                </div>
              </div>
            )}

            {/* Day 29: Full Mock Test Simulator */}
            {currentDay.mock_test_flow && (
              <div style={{ marginBottom: "24px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "1.2rem", color: "#b45309", fontWeight: "800", margin: "0 0 16px 0" }}>
                  🏆 Full Mock Test Simulation (11 - 14 Phút):
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Part 1 */}
                  <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #fcd34d" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "800", color: "#b45309" }}>Part 1: Phỏng vấn mở đầu ({currentDay.mock_test_flow.part1.time})</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#1e293b", lineHeight: "1.6" }}>
                      {currentDay.mock_test_flow.part1.questions.map((q, idx) => (
                        <li
                          key={idx}
                          style={{ cursor: "pointer", marginBottom: "6px" }}
                          onClick={() => {
                            playSpeech(q, `mock_p1_${idx}`);
                            incrementStudyCount(`mock_p1_${idx}`);
                          }}
                        >
                          {q} 🗣️ {studyCounts[`mock_p1_${idx}`] ? `(Đã luyện: ${studyCounts[`mock_p1_${idx}`]})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Part 2 */}
                  <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #fcd34d" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "800", color: "#b45309" }}>Part 2: Độc thoại Cue Card ({currentDay.mock_test_flow.part2.time})</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => startTimer(60, "prep")} style={{ padding: "4px 8px", fontSize: "0.8rem", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "4px", cursor: "pointer" }}>1p Prep</button>
                        <button onClick={() => startTimer(120, "speak")} style={{ padding: "4px 8px", fontSize: "0.8rem", background: "#dcfce7", border: "1px solid #22c55e", borderRadius: "4px", cursor: "pointer" }}>2p Speak</button>
                      </div>
                    </div>
                    <p style={{ fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>{currentDay.mock_test_flow.part2.cue_card}</p>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569", lineHeight: "1.5" }}>
                      {currentDay.mock_test_flow.part2.prompts.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Part 3 */}
                  <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #fcd34d" }}>
                    <span style={{ fontWeight: "800", color: "#b45309", display: "block", marginBottom: "8px" }}>Part 3: Thảo luận sâu ({currentDay.mock_test_flow.part3.time})</span>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#1e293b", lineHeight: "1.6" }}>
                      {currentDay.mock_test_flow.part3.questions.map((q, idx) => (
                        <li
                          key={idx}
                          style={{ cursor: "pointer", marginBottom: "6px" }}
                          onClick={() => {
                            playSpeech(q, `mock_p3_${idx}`);
                            incrementStudyCount(`mock_p3_${idx}`);
                          }}
                        >
                          {q} 🗣️ {studyCounts[`mock_p3_${idx}`] ? `(Đã luyện: ${studyCounts[`mock_p3_${idx}`]})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Day 30: Self-Assessment Rubric */}
            {currentDay.rubric && (
              <div style={{ marginBottom: "24px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "1.2rem", color: "#15803d", fontWeight: "800", margin: "0 0 14px 0" }}>
                  📊 Bảng Đánh Giá Năng Lực 6 Tiêu Chí (Band 7.0 - 8.0+ Target):
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
                  {currentDay.rubric.map((r, rIdx) => (
                    <div key={rIdx} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <span style={{ fontWeight: "700", color: "#15803d" }}>{r.skill}</span>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Mục tiêu: {r.target}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleScoreChange(r.skill, val)}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: (rubricScores[r.skill] || 4) >= val ? "#16a34a" : "#f1f5f9",
                              color: (rubricScores[r.skill] || 4) >= val ? "#ffffff" : "#64748b",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            {val}
                          </button>
                        ))}
                        <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#15803d", marginLeft: "6px" }}>
                          {rubricScores[r.skill] || 4}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#15803d", fontSize: "1rem", fontWeight: "700" }}>🚀 Kế Hoạch Tiếp Theo (Next Steps):</h4>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    {currentDay.next_steps.map((st, idx) => (
                      <li key={idx}>{st}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Checkpoint Tasks (Day 7 & 14) */}
            {currentDay.checkpoint_task && (
              <div style={{ marginBottom: "24px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#b45309", fontWeight: "800", margin: "0 0 10px 0" }}>
                  🎯 Nhiệm Vụ Ghi Âm & Tự Đánh Giá:
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#78350f", lineHeight: "1.5", margin: "0 0 14px 0" }}>
                  {currentDay.checkpoint_task.instructions}
                </p>
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #fde68a", marginBottom: "14px" }}>
                  <span style={{ fontWeight: "700", color: "#92400e", display: "block", marginBottom: "8px" }}>Các câu hỏi luyện nói:</span>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#1e293b", lineHeight: "1.6" }}>
                    {currentDay.checkpoint_task.questions.map((q, idx) => (
                      <li
                        key={idx}
                        style={{ cursor: "pointer", marginBottom: "6px" }}
                        onClick={() => {
                          playSpeech(q, `chk_q_${idx}`);
                          incrementStudyCount(`chk_q_${idx}`);
                        }}
                      >
                        {q} 🗣️ {studyCounts[`chk_q_${idx}`] ? `(Đã luyện: ${studyCounts[`chk_q_${idx}`]})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                  <span style={{ fontWeight: "700", color: "#92400e", display: "block", marginBottom: "8px" }}>Bảng kiểm tra lỗi (Self-audit Checklist):</span>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569", lineHeight: "1.5" }}>
                    {currentDay.checkpoint_task.checklist.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Bottom Nav: Prev Day / Next Day */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "18px" }}>
              <button
                disabled={currentDay.day <= 1}
                onClick={() => selectDay(currentDay.day - 1)}
                className="pagination-btn"
                style={{ opacity: currentDay.day <= 1 ? 0.4 : 1 }}
              >
                ← Ngày {currentDay.day - 1}
              </button>

              <span style={{ fontWeight: "700", color: "#64748b", fontSize: "0.95rem" }}>
                Ngày {currentDay.day} / 30
              </span>

              <button
                disabled={currentDay.day >= 30}
                onClick={() => selectDay(currentDay.day + 1)}
                className="pagination-btn"
                style={{ opacity: currentDay.day >= 30 ? 0.4 : 1 }}
              >
                Ngày {currentDay.day + 1} →
              </button>
            </div>
          </article>
        </section>
      )}

      {/* =========================================================================
          TAB 2: KHO 260 CHUNKS (SEARCH & FLASHCARD)
          ========================================================================= */}
      {activeTab === "chunks" && (
        <section>
          {/* Search Box */}
          <div className="search-box" style={{ marginBottom: "16px" }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm cụm từ tiếng Anh, nghĩa tiếng Việt hoặc câu ví dụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="clear-search">✕</button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs" style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setChunkFilter("all")}
              className={`filter-tab ${chunkFilter === "all" ? "active" : ""}`}
              style={chunkFilter === "all" ? { color: "#059669" } : {}}
            >
              🎯 Tất cả ({allChunksList.length})
            </button>
            <button
              onClick={() => setChunkFilter("unlearned")}
              className={`filter-tab ${chunkFilter === "unlearned" ? "active" : ""}`}
              style={chunkFilter === "unlearned" ? { color: "#059669" } : {}}
            >
              📖 Chưa thuộc ({allChunksList.filter((c) => !learnedChunkIds.has(c.id)).length})
            </button>
            <button
              onClick={() => setChunkFilter("learned")}
              className={`filter-tab ${chunkFilter === "learned" ? "active" : ""}`}
              style={chunkFilter === "learned" ? { color: "#059669" } : {}}
            >
              ✅ Đã thuộc ({learnedChunkIds.size})
            </button>
          </div>

          {/* Chunks Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
            {searchedChunks.map((c) => {
              const isLearned = learnedChunkIds.has(c.id);
              const isPlaying = playingId === c.id;
              const isPlayingEx = playingId === `${c.id}_ex`;

              return (
                <article
                  key={c.id}
                  className={`sentence-card ${isLearned ? "learned" : ""}`}
                  style={{
                    padding: "16px",
                    borderLeft: isLearned ? "4px solid #16a34a" : "4px solid #059669"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.8rem", color: "#059669", fontWeight: "700" }}>
                      Ngày {c.day} • {c.dayTitle}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <label className="checkbox-container" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={isLearned}
                          onChange={() => toggleChunkLearned(c.id)}
                        />
                        <span className="checkmark" style={{ width: "18px", height: "18px" }}></span>
                        <span className="checkbox-label" style={{ fontSize: "0.8rem" }}>
                          {isLearned ? "Đã thuộc" : "Chưa thuộc"}
                        </span>
                      </label>
                      <div
                        className="study-counter"
                        style={{
                          color: "#059669",
                          backgroundColor: "rgba(5, 150, 105, 0.1)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: "700"
                        }}
                        title="Số lần bấm luyện tập"
                      >
                        <span className="counter-num" style={{ fontSize: "0.95rem" }}>{studyCounts[c.id] || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <h3
                      onClick={() => {
                        playSpeech(c.chunk, c.id);
                        incrementStudyCount(c.id);
                      }}
                      style={{
                        fontSize: "1.15rem",
                        color: "#0f172a",
                        margin: "0 0 6px 0",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {c.chunk}
                    </h3>
                    <button
                      onClick={() => {
                        playSpeech(c.chunk, c.id);
                        incrementStudyCount(c.id);
                      }}
                      className="play-button"
                      style={{ width: "32px", height: "32px", fontSize: "0.9rem", flexShrink: 0 }}
                      title="Nghe phát âm chunk"
                    >
                      {isPlaying ? "🔊" : "🗣️"}
                    </button>
                  </div>

                  <p style={{ fontSize: "0.95rem", color: "#059669", fontWeight: "600", margin: "0 0 10px 0" }}>
                    👉 {c.meaning_vi}
                  </p>

                  {c.example && (
                    <div
                      onClick={() => {
                        playSpeech(c.example, `${c.id}_ex`);
                        incrementStudyCount(c.id);
                      }}
                      style={{
                        background: "#f8fafc",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px dashed #cbd5e1",
                        fontSize: "0.9rem",
                        color: "#334155",
                        cursor: "pointer"
                      }}
                      title="Bấm để nghe ví dụ"
                    >
                      <span style={{ fontWeight: "700", color: "#64748b" }}>Ex: </span>
                      {c.example}
                      {isPlayingEx && <span style={{ marginLeft: "6px", color: "#059669" }}>🔊</span>}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {searchedChunks.length === 0 && (
            <div className="empty-state" style={{ marginTop: "30px" }}>
              <span className="empty-icon">🏜️</span>
              <p>Không tìm thấy cụm từ nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          TAB 3: PHƯƠNG PHÁP & LỖI SAI (TOOLKIT & GRAMMAR)
          ========================================================================= */}
      {activeTab === "toolkit" && (
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* 4 IELTS Speaking Criteria */}
          <div className="sentence-card" style={{ borderLeft: "5px solid #059669", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#059669", fontWeight: "800", textTransform: "uppercase", margin: "0 0 14px 0" }}>
              🏆 4 Tiêu Chí Chấm Điểm IELTS Speaking:
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
              {rawData.overview.four_criteria.map((cr, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "1rem" }}>{idx + 1}. {cr.name}</div>
                  <div style={{ fontWeight: "600", color: "#059669", fontSize: "0.85rem", marginBottom: "6px" }}>{cr.vi}</div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: "1.45" }}>{cr.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Common Mistakes */}
          <div className="sentence-card" style={{ borderLeft: "5px solid #dc2626", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#dc2626", fontWeight: "800", textTransform: "uppercase", margin: "0 0 14px 0" }}>
              ⚠️ Top 10 Lỗi Sai Phổ Biến Của Người Việt & Cách Sửa Chuẩn:
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {rawData.toolkits.common_mistakes.map((m, idx) => (
                <div key={idx} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fecaca", display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "10px", alignItems: "center" }}>
                  <div style={{ color: "#dc2626", fontWeight: "700", textDecoration: "line-through" }}>
                    ❌ {m.wrong}
                  </div>
                  <div style={{ color: "#16a34a", fontWeight: "700" }}>
                    ✅ {m.correct}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    👉 {m.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hesitation Fillers */}
          <div className="sentence-card" style={{ borderLeft: "5px solid #0284c7", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#0284c7", fontWeight: "800", textTransform: "uppercase", margin: "0 0 14px 0" }}>
              ⏳ Cụm Từ "Câu Giờ" Tự Nhiên Khi Cần Suy Nghĩ (Hesitation Devices):
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
              {rawData.toolkits.hesitation_fillers.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    playSpeech(f.en, `filler_${idx}`);
                    incrementStudyCount(`filler_${idx}`);
                  }}
                  style={{ background: "#f0f9ff", padding: "12px 14px", borderRadius: "8px", border: "1px solid #bae6fd", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                  title="Bấm để nghe phát âm"
                >
                  <div>
                    <div style={{ fontWeight: "700", color: "#0369a1", fontSize: "1rem", marginBottom: "4px" }}>
                      🗣️ {f.en}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      👉 {f.vi}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                    <div
                      className="study-counter"
                      style={{
                        color: "#0284c7",
                        backgroundColor: "rgba(2, 132, 199, 0.1)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: "700"
                      }}
                      title="Số lần luyện tập"
                    >
                      <span className="counter-num" style={{ fontSize: "0.85rem" }}>{studyCounts[`filler_${idx}`] || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5 Essential Sentence Patterns */}
          <div className="sentence-card" style={{ borderLeft: "5px solid #8b5cf6", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#7c3aed", fontWeight: "800", textTransform: "uppercase", margin: "0 0 14px 0" }}>
              📐 5 Cấu Trúc Câu Thiết Yếu Trong Khẩu Ngữ:
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
              {rawData.toolkits.grammar_patterns.map((gp, idx) => (
                <div key={idx} style={{ background: "#faf5ff", padding: "12px 14px", borderRadius: "8px", border: "1px solid #ddd6fe" }}>
                  <div style={{ fontWeight: "800", color: "#6d28d9", fontSize: "0.95rem", marginBottom: "4px" }}>
                    Mẫu {idx + 1}: {gp.pattern}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#1e293b", fontWeight: "600" }}>
                    "{gp.example}"
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    👉 {gp.vi}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer Tip */}
      <footer className="app-footer" style={{ marginTop: "36px" }}>
        <p>💡 Tip: Hãy nói to thành tiếng mỗi ngày ít nhất 15-20 phút và ghi âm lại để kiểm tra ngữ điệu cũng như độ trôi chảy.</p>
      </footer>
    </main>
  );
}

export default function IeltsSpeakingPage() {
  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu IELTS Speaking...</p>
      </div>
    }>
      <IeltsSpeakingContent />
    </Suspense>
  );
}

