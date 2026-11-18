"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionNav from "../components/SectionNav";
import {
  Volume2Icon,
  SlidersIcon,
  EyeIcon,
  KeyboardIcon,
  XIcon,
  RotateCcwIcon,
} from "../components/Icons";

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

function playAudioFeedback(type) {
  if (typeof window === "undefined" || window.__ETP_AUDIO_MUTED__) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "correct") {
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
  } catch (e) {}
}

export default function ListenDrillPage() {
  const [drillType, setDrillType] = useState("alphabet");
  const [caseType, setCaseType] = useState("lower");
  const [numberRange, setNumberRange] = useState("1-20");
  const [speechRate, setSpeechRate] = useState(0.85);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voices, setVoices] = useState([]);

  const [currentTarget, setCurrentTarget] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [hasAttemptedCurrent, setHasAttemptedCurrent] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("");

  const targetRef = useRef(currentTarget);
  targetRef.current = currentTarget;
  const bufferRef = useRef("");
  const bufferTimeoutRef = useRef(null);

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

  const nextTarget = useCallback(
    (customType, customCase, customRange) => {
      const type = customType || drillType;
      const caseMode = customCase || caseType;
      const range = customRange || numberRange;

      let pool = [];
      if (type === "alphabet") {
        pool = ALPHABET_LOWER.flat().map((ch) => (caseMode === "upper" ? ch.toUpperCase() : ch));
      } else {
        const preset = NUMBER_PRESETS[range] || NUMBER_PRESETS["1-20"];
        pool = Array.isArray(preset[0]) ? preset.flat() : preset;
      }

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

      setTimeout(() => {
        speakTarget(randomItem);
      }, 150);
    },
    [drillType, caseType, numberRange, speakTarget]
  );

  useEffect(() => {
    nextTarget();
  }, [drillType, caseType, numberRange]);

  const handleSelect = (key) => {
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSettingsModal) return;

      const key = e.key;

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

      if (key === "Backspace" && drillType === "number" && bufferRef.current) {
        e.preventDefault();
        const trimmed = bufferRef.current.slice(0, -1);
        bufferRef.current = trimmed;
        setInputBuffer(trimmed);
        if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
        return;
      }

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
        if (/^[0-9]$/.test(key)) {
          e.preventDefault();
          const currentBuf = bufferRef.current;
          const nextVal = currentBuf + key;
          const targetStr = (targetRef.current || "").toString();

          if (bufferTimeoutRef.current) {
            clearTimeout(bufferTimeoutRef.current);
            bufferTimeoutRef.current = null;
          }

          if (nextVal === targetStr) {
            bufferRef.current = "";
            setInputBuffer("");
            handleSelect(nextVal);
            return;
          }

          if (targetStr.startsWith(nextVal) && nextVal.length < targetStr.length) {
            bufferRef.current = nextVal;
            setInputBuffer(nextVal);

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

          bufferRef.current = "";
          setInputBuffer("");
          handleSelect(nextVal);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSettingsModal, drillType, caseType, currentTarget, hasAttemptedCurrent, showingAnswer, speakTarget]);

  const resetStats = () => {
    if (confirm("Bạn có muốn đặt lại toàn bộ điểm số Found và First Try không?")) {
      setFoundCount(0);
      setFirstTryCount(0);
      localStorage.removeItem("listen_drill_found");
      localStorage.removeItem("listen_drill_first_try");
    }
  };

  const keyboardRows =
    drillType === "alphabet"
      ? ALPHABET_LOWER.map((row) => row.map((ch) => (caseType === "upper" ? ch.toUpperCase() : ch)))
      : Array.isArray(NUMBER_PRESETS[numberRange][0])
      ? NUMBER_PRESETS[numberRange]
      : [NUMBER_PRESETS[numberRange]];

  return (
    <main className="container">
      <SectionNav />

      <section className="listen-drill-container">
        <div className="listen-header-row">
          <div className="listen-title-group">
            <button type="button" className="listen-icon-badge" onClick={() => speakTarget()} title="Bấm để nghe" aria-label="Nghe lại">
              <Volume2Icon size={22} />
            </button>
            <div>
              <h1 className="listen-main-title">Listen &amp; Find</h1>
              <p className="listen-sub-title">
                {drillType === "alphabet" ? "Nghe chữ cái và chọn nhanh ký tự đúng." : "Nghe số đếm và chọn nhanh số đúng."}
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
            type="button"
            className="btn-listen-change"
            onClick={() => setShowSettingsModal(true)}
            title="Đổi bài học & Cài đặt"
          >
            <SlidersIcon size={15} />
            <span>Cài đặt</span>
          </button>
        </div>

        <div className="listen-player-card">
          <button
            type="button"
            className={`listen-big-btn ${isPlaying ? "playing" : ""}`}
            onClick={() => speakTarget()}
            aria-label="Nghe lại"
          >
            <Volume2Icon size={32} />
          </button>
          <span className="listen-btn-label" onClick={() => speakTarget()}>
            Nghe lại
          </span>
          <span className="listen-shortcut-hint">
            Nhấn <b>Space</b> hoặc <b>Enter</b> trên bàn phím để nghe lại
          </span>
        </div>

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
                const isTarget = item.toString().toLowerCase() === currentTarget.toString().toLowerCase();
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
                    type="button"
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

        <div className="listen-bottom-bar">
          <button
            type="button"
            className={`btn-show-me ${showingAnswer ? "active" : ""}`}
            onClick={() => {
              setShowingAnswer(true);
              setHasAttemptedCurrent(true);
            }}
          >
            <EyeIcon size={15} />
            <span>Xem đáp án</span>
          </button>

          <span className="listen-keyboard-tip">
            <KeyboardIcon size={15} />
            <span>Gõ trực tiếp chữ hoặc số trên bàn phím máy tính để trả lời nhanh.</span>
          </span>
        </div>
      </section>

      {showSettingsModal && (
        <div className="drill-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="drill-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="drill-modal-header">
              <h2>
                <SlidersIcon size={18} />
                <span>Cài Đặt Bài Luyện Phản Xạ</span>
              </h2>
              <button
                type="button"
                className="drill-modal-close"
                onClick={() => setShowSettingsModal(false)}
                aria-label="Đóng"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="drill-modal-body">
              <div className="drill-setting-group">
                <label className="drill-setting-label">Loại bài học</label>
                <div className="drill-option-pills">
                  <button
                    type="button"
                    className={`drill-pill-btn ${drillType === "alphabet" ? "active" : ""}`}
                    onClick={() => {
                      setDrillType("alphabet");
                      localStorage.setItem("listen_drill_type", "alphabet");
                    }}
                  >
                    Alphabet (A–Z)
                  </button>
                  <button
                    type="button"
                    className={`drill-pill-btn ${drillType === "number" ? "active" : ""}`}
                    onClick={() => {
                      setDrillType("number");
                      localStorage.setItem("listen_drill_type", "number");
                    }}
                  >
                    Numbers (Số đếm)
                  </button>
                </div>
              </div>

              {drillType === "alphabet" && (
                <div className="drill-setting-group">
                  <label className="drill-setting-label">Kiểu chữ cái</label>
                  <div className="drill-option-pills">
                    <button
                      type="button"
                      className={`drill-pill-btn ${caseType === "lower" ? "active" : ""}`}
                      onClick={() => {
                        setCaseType("lower");
                        localStorage.setItem("listen_drill_case", "lower");
                      }}
                    >
                      abc (Chữ thường)
                    </button>
                    <button
                      type="button"
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

              {drillType === "number" && (
                <div className="drill-setting-group">
                  <label className="drill-setting-label">Phạm vi số</label>
                  <div className="drill-option-pills">
                    <button
                      type="button"
                      className={`drill-pill-btn ${numberRange === "0-9" ? "active" : ""}`}
                      onClick={() => {
                        setNumberRange("0-9");
                        localStorage.setItem("listen_drill_range", "0-9");
                      }}
                    >
                      0 – 9
                    </button>
                    <button
                      type="button"
                      className={`drill-pill-btn ${numberRange === "1-20" ? "active" : ""}`}
                      onClick={() => {
                        setNumberRange("1-20");
                        localStorage.setItem("listen_drill_range", "1-20");
                      }}
                    >
                      1 – 20
                    </button>
                    <button
                      type="button"
                      className={`drill-pill-btn ${numberRange === "0-20" ? "active" : ""}`}
                      onClick={() => {
                        setNumberRange("0-20");
                        localStorage.setItem("listen_drill_range", "0-20");
                      }}
                    >
                      0 – 20
                    </button>
                  </div>
                </div>
              )}

              <div className="drill-setting-group">
                <label className="drill-setting-label">Giọng đọc tiếng Anh</label>
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
                  className="drill-range-input"
                />
              </div>

              <div className="drill-reset-row">
                <button type="button" className="btn-reset btn-reset--danger" onClick={resetStats}>
                  <RotateCcwIcon size={14} />
                  <span>Đặt lại điểm số Found &amp; First Try</span>
                </button>
              </div>
            </div>

            <div className="drill-modal-footer">
              <button
                type="button"
                className="drill-btn-done"
                onClick={() => {
                  setShowSettingsModal(false);
                  nextTarget();
                }}
              >
                Hoàn tất &amp; Bắt đầu luyện
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
