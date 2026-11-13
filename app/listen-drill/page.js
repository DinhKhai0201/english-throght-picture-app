"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionNav from "../components/SectionNav";

const ALPHABET_LOWER = [
  ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"],
  ["n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
];

const VOWELS = new Set(["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]);

const NUMBER_PRESETS = {
  "0-9": Array.from({ length: 10 }, (_, i) => i.toString()),
  "1-20": [
    Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
    Array.from({ length: 10 }, (_, i) => (i + 11).toString()),
  ],
  "0-20": [
    Array.from({ length: 11 }, (_, i) => i.toString()),
    Array.from({ length: 10 }, (_, i) => (i + 11).toString()),
  ],
};

// Web Audio API Sound Effects generator (Instant, no network lag)
function playAudioFeedback(type) {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "correct") {
      // Cheerful chime (C5 -> E5 -> G5)
      const now = ctx.currentTime;
      [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.1 },
        { freq: 783.99, time: 0.2 },
      ].forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.18, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.35);
      });
    } else if (type === "wrong") {
      // Gentle buzz
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch (e) {
    // Ignore audio context errors
  }
}

export default function ListenDrillPage() {
  // Practice configuration
  const [drillType, setDrillType] = useState("alphabet"); // "alphabet" | "number"
  const [caseType, setCaseType] = useState("lower"); // "lower" | "upper"
  const [numberRange, setNumberRange] = useState("1-20"); // "0-9" | "1-20" | "0-20"
  const [speechRate, setSpeechRate] = useState(0.85);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voices, setVoices] = useState([]);

  // Game state
  const [currentTarget, setCurrentTarget] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [hasAttemptedCurrent, setHasAttemptedCurrent] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null); // { key, status: "correct" | "wrong" }
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("");

  const targetRef = useRef(currentTarget);
  targetRef.current = currentTarget;
  const bufferRef = useRef("");
  const bufferTimeoutRef = useRef(null);

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
                v.name.includes("Google US English") ||
                v.name.includes("Samantha") ||
                v.name.includes("Google UK English Male")
            ) || en[0];
          setSelectedVoice(pref.name);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  // Load stats from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedFound = parseInt(localStorage.getItem("listen_drill_found") || "0", 10);
        const savedFirstTry = parseInt(localStorage.getItem("listen_drill_first_try") || "0", 10);
        const savedDrill = localStorage.getItem("listen_drill_type");
        const savedCase = localStorage.getItem("listen_drill_case");
        const savedRange = localStorage.getItem("listen_drill_range");

        if (!isNaN(savedFound)) setFoundCount(savedFound);
        if (!isNaN(savedFirstTry)) setFirstTryCount(savedFirstTry);
        if (savedDrill === "alphabet" || savedDrill === "number") setDrillType(savedDrill);
        if (savedCase === "lower" || savedCase === "upper") setCaseType(savedCase);
        if (savedRange && NUMBER_PRESETS[savedRange]) setNumberRange(savedRange);
      } catch (e) {}
    }
  }, []);

  // Pronounce target
  const speakTarget = useCallback(
    (target) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const textToSpeak = target || targetRef.current;
      if (!textToSpeak) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "en-US";
      utterance.rate = speechRate;

      if (selectedVoice) {
        const v = voices.find((item) => item.name === selectedVoice);
        if (v) utterance.voice = v;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    },
    [speechRate, selectedVoice, voices]
  );

  // Generate new random target
  const nextTarget = useCallback(
    (customType, customCase, customRange) => {
      const type = customType || drillType;
      const caseMode = customCase || caseType;
      const range = customRange || numberRange;

      let pool = [];
      if (type === "alphabet") {
        pool = ALPHABET_LOWER.flat().map((ch) =>
          caseMode === "upper" ? ch.toUpperCase() : ch
        );
      } else {
        const preset = NUMBER_PRESETS[range] || NUMBER_PRESETS["1-20"];
        pool = Array.isArray(preset[0]) ? preset.flat() : preset;
      }

      // Avoid repeating the exact same target consecutively if pool > 1
      let randomItem = pool[Math.floor(Math.random() * pool.length)];
      if (pool.length > 1 && randomItem === targetRef.current) {
        const filtered = pool.filter((item) => item !== targetRef.current);
        randomItem = filtered[Math.floor(Math.random() * filtered.length)];
      }

      setCurrentTarget(randomItem);
      setHasAttemptedCurrent(false);
      setShowingAnswer(false);
      setLastFeedback(null);
      bufferRef.current = "";
      setInputBuffer("");
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);

      // Auto pronounce after short pause
      setTimeout(() => {
        speakTarget(randomItem);
      }, 150);
    },
    [drillType, caseType, numberRange, speakTarget]
  );

  // Start on initial mount
  useEffect(() => {
    nextTarget();
  }, [drillType, caseType, numberRange]); // re-roll when settings change

  // Handle User selection
  const handleSelect = (key) => {
    // Clear any pending keyboard buffer
    bufferRef.current = "";
    setInputBuffer("");
    if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);

    const isCorrect = key.toString().toLowerCase() === currentTarget.toString().toLowerCase();

    if (isCorrect) {
      playAudioFeedback("correct");
      setLastFeedback({ key, status: "correct" });

      const newFound = foundCount + 1;
      setFoundCount(newFound);
      localStorage.setItem("listen_drill_found", newFound.toString());

      if (!hasAttemptedCurrent && !showingAnswer) {
        const newFirstTry = firstTryCount + 1;
        setFirstTryCount(newFirstTry);
        localStorage.setItem("listen_drill_first_try", newFirstTry.toString());
      }

      // Transition to next target after brief celebration
      setTimeout(() => {
        nextTarget();
      }, 700);
    } else {
      playAudioFeedback("wrong");
      setHasAttemptedCurrent(true);
      setLastFeedback({ key, status: "wrong" });
      setTimeout(() => {
        setLastFeedback((prev) => (prev && prev.key === key ? null : prev));
      }, 500);
    }
  };

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture keyboard inside modal inputs
      if (showSettingsModal) return;

      const key = e.key;

      // Spacebar or Enter -> Repeat audio (or submit current buffer if non-empty)
      if (key === " " || key === "Enter") {
        e.preventDefault();
        if (bufferRef.current) {
          const pending = bufferRef.current;
          bufferRef.current = "";
          setInputBuffer("");
          if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
          handleSelect(pending);
        } else {
          speakTarget();
        }
        return;
      }

      // Backspace -> undo last typed digit in number mode
      if (key === "Backspace" && drillType === "number" && bufferRef.current) {
        e.preventDefault();
        const trimmed = bufferRef.current.slice(0, -1);
        bufferRef.current = trimmed;
        setInputBuffer(trimmed);
        if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
        return;
      }

      // 'Show me' shortcut (key '?' or '/')
      if (key === "?" || key === "/") {
        e.preventDefault();
        setShowingAnswer(true);
        return;
      }

      if (drillType === "alphabet") {
        if (/^[a-zA-Z]$/.test(key)) {
          e.preventDefault();
          const targetKey = caseType === "upper" ? key.toUpperCase() : key.toLowerCase();
          handleSelect(targetKey);
        }
      } else if (drillType === "number") {
        // Multi-digit aware number keyboard handler
        if (/^[0-9]$/.test(key)) {
          e.preventDefault();
          const currentBuf = bufferRef.current;
          const nextVal = currentBuf + key;
          const targetStr = (targetRef.current || "").toString();

          if (bufferTimeoutRef.current) {
            clearTimeout(bufferTimeoutRef.current);
            bufferTimeoutRef.current = null;
          }

          // Case 1: Exact match with target (e.g. gõ 1 rồi 8 khớp 18, hoặc gõ 5 khớp 5)
          if (nextVal === targetStr) {
            bufferRef.current = "";
            setInputBuffer("");
            handleSelect(nextVal);
            return;
          }

          // Case 2: Is it a valid prefix of the target?
          // (e.g. target is "18", nextVal is "1" -> wait for second digit)
          if (targetStr.startsWith(nextVal) && nextVal.length < targetStr.length) {
            bufferRef.current = nextVal;
            setInputBuffer(nextVal);

            // Set fallback timeout if user stops typing (1.2s)
            bufferTimeoutRef.current = setTimeout(() => {
              if (bufferRef.current) {
                const pending = bufferRef.current;
                bufferRef.current = "";
                setInputBuffer("");
                handleSelect(pending);
              }
            }, 1200);
            return;
          }

          // Case 3: Does not match prefix of target (e.g. target is "18", typed "2" or "15")
          bufferRef.current = "";
          setInputBuffer("");
          handleSelect(nextVal);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSettingsModal, drillType, caseType, currentTarget, hasAttemptedCurrent, showingAnswer, speakTarget]);

  // Reset statistics
  const resetStats = () => {
    if (confirm("Bạn có muốn đặt lại toàn bộ điểm số Found và First Try không?")) {
      setFoundCount(0);
      setFirstTryCount(0);
      localStorage.removeItem("listen_drill_found");
      localStorage.removeItem("listen_drill_first_try");
    }
  };

  // Keyboard Rows layout based on drillType
  const keyboardRows =
    drillType === "alphabet"
      ? ALPHABET_LOWER.map((row) =>
          row.map((ch) => (caseType === "upper" ? ch.toUpperCase() : ch))
        )
      : Array.isArray(NUMBER_PRESETS[numberRange][0])
      ? NUMBER_PRESETS[numberRange]
      : [NUMBER_PRESETS[numberRange]];

  return (
    <main className="container">
      {/* Section Navigation Bar */}
      <SectionNav />

      {/* Main Listen Drill Card */}
      <section className="listen-drill-container">
        {/* Header Bar */}
        <div className="listen-header-row">
          <div className="listen-title-group">
            <div className="listen-icon-badge" onClick={() => speakTarget()} title="Bấm để nghe">
              <span className="listen-speaker-emoji">🔊</span>
            </div>
            <div>
              <h1 className="listen-main-title">Listen</h1>
              <p className="listen-sub-title">
                {drillType === "alphabet"
                  ? "Hear a letter, then find it."
                  : "Hear a number, then find it."}
              </p>
            </div>
          </div>

          <div className="listen-stats-group">
            <div className="stat-pill">
              <span className="stat-label">FOUND</span>
              <span className="stat-number">{foundCount}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">FIRST TRY</span>
              <span className="stat-number">{firstTryCount}</span>
            </div>
          </div>

          <button
            className="btn-listen-change"
            onClick={() => setShowSettingsModal(true)}
            title="Đổi bài học & Cài đặt"
          >
            ⚙ Change
          </button>
        </div>

        {/* Player Card (Central listening bubble) */}
        <div className="listen-player-card">
          <button
            className={`listen-big-btn ${isPlaying ? "playing" : ""}`}
            onClick={() => speakTarget()}
            aria-label="Hear it again"
          >
            <svg
              className="speaker-svg-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </button>
          <span className="listen-btn-label" onClick={() => speakTarget()}>
            Hear it again
          </span>
          <span className="listen-shortcut-hint">
            (Bấm phím <b>Space</b> hoặc <b>Enter</b> trên bàn phím để nghe lại)
          </span>
        </div>

        {/* Keyboard Grid */}
        <div className="listen-keyboard-wrapper">
          {drillType === "number" && inputBuffer && (
            <div className="listen-typing-indicator">
              Đang gõ: <span className="typing-value">{inputBuffer}_</span>
            </div>
          )}

          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="listen-keyboard-row">
              {row.map((item) => {
                const isVowel = VOWELS.has(item);
                const isTarget =
                  item.toString().toLowerCase() === currentTarget.toString().toLowerCase();
                const isFeedback = lastFeedback && lastFeedback.key === item;
                const isHighlighted = showingAnswer && isTarget;

                let stateClass = "";
                if (isFeedback) {
                  stateClass = lastFeedback.status === "correct" ? "btn-correct" : "btn-wrong";
                } else if (isHighlighted) {
                  stateClass = "btn-highlighted";
                }

                return (
                  <button
                    key={item}
                    className={`listen-key-btn ${isVowel ? "is-vowel" : ""} ${stateClass}`}
                    onClick={() => handleSelect(item)}
                    aria-label={item}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions: Show me & Shortcut helper */}
        <div className="listen-bottom-bar">
          <button
            className={`btn-show-me ${showingAnswer ? "active" : ""}`}
            onClick={() => {
              setShowingAnswer(true);
              setHasAttemptedCurrent(true);
            }}
          >
            👁 Show me
          </button>

          <span className="listen-keyboard-tip">
            ⌨ Bạn có thể gõ trực tiếp chữ/số trên bàn phím máy tính để trả lời siêu nhanh!
          </span>
        </div>
      </section>

      {/* Settings Modal (Change Drill Dialog) */}
      {showSettingsModal && (
        <div className="drill-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="drill-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="drill-modal-header">
              <h2>⚙ Cài Đặt Bài Luyện Phản Xạ</h2>
              <button
                className="drill-modal-close"
                onClick={() => setShowSettingsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="drill-modal-body">
              {/* Type Selection */}
              <div className="drill-setting-group">
                <label className="drill-setting-label">Loại bài học:</label>
                <div className="drill-option-pills">
                  <button
                    className={`drill-pill-btn ${drillType === "alphabet" ? "active" : ""}`}
                    onClick={() => {
                      setDrillType("alphabet");
                      localStorage.setItem("listen_drill_type", "alphabet");
                    }}
                  >
                    🔤 Alphabet (Bảng chữ cái)
                  </button>
                  <button
                    className={`drill-pill-btn ${drillType === "number" ? "active" : ""}`}
                    onClick={() => {
                      setDrillType("number");
                      localStorage.setItem("listen_drill_type", "number");
                    }}
                  >
                    🔢 Numbers (Số đếm)
                  </button>
                </div>
              </div>

              {/* Alphabet Case */}
              {drillType === "alphabet" && (
                <div className="drill-setting-group">
                  <label className="drill-setting-label">Kiểu chữ cái:</label>
                  <div className="drill-option-pills">
                    <button
                      className={`drill-pill-btn ${caseType === "lower" ? "active" : ""}`}
                      onClick={() => {
                        setCaseType("lower");
                        localStorage.setItem("listen_drill_case", "lower");
                      }}
                    >
                      abc (Chữ thường)
                    </button>
                    <button
                      className={`drill-pill-btn ${caseType === "upper" ? "active" : ""}`}
                      onClick={() => {
                        setCaseType("upper");
                        localStorage.setItem("listen_drill_case", "upper");
                      }}
                    >
                      ABC (Chữ hoa)
                    </button>
                  </div>
                </div>
              )}

              {/* Number Range */}
              {drillType === "number" && (
                <div className="drill-setting-group">
                  <label className="drill-setting-label">Phạm vi số:</label>
                  <div className="drill-option-pills">
                    <button
                      className={`drill-pill-btn ${numberRange === "0-9" ? "active" : ""}`}
                      onClick={() => {
                        setNumberRange("0-9");
                        localStorage.setItem("listen_drill_range", "0-9");
                      }}
                    >
                      0 – 9 (10 số cơ bản)
                    </button>
                    <button
                      className={`drill-pill-btn ${numberRange === "1-20" ? "active" : ""}`}
                      onClick={() => {
                        setNumberRange("1-20");
                        localStorage.setItem("listen_drill_range", "1-20");
                      }}
                    >
                      1 – 20 (20 số)
                    </button>
                    <button
                      className={`drill-pill-btn ${numberRange === "0-20" ? "active" : ""}`}
                      onClick={() => {
                        setNumberRange("0-20");
                        localStorage.setItem("listen_drill_range", "0-20");
                      }}
                    >
                      0 – 20 (21 số)
                    </button>
                  </div>
                </div>
              )}

              {/* Speech Voice & Speed */}
              <div className="drill-setting-group">
                <label className="drill-setting-label">Giọng đọc tiếng Anh:</label>
                <select
                  className="drill-select"
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

              <div className="drill-setting-group">
                <label className="drill-setting-label">Tốc độ đọc: {speechRate}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.3"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-primary)" }}
                />
              </div>

              {/* Reset Stats */}
              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
                <button className="btn-reset" onClick={resetStats} style={{ width: "100%" }}>
                  🔄 Đặt lại điểm số (Reset Found & First Try)
                </button>
              </div>
            </div>

            <div className="drill-modal-footer">
              <button
                className="drill-btn-done"
                onClick={() => {
                  setShowSettingsModal(false);
                  nextTarget();
                }}
              >
                Hoàn tất & Bắt đầu luyện
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

