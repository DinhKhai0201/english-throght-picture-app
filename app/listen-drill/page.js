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
  CheckIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
} from "../components/Icons";
import { isAudioMuted } from "../lib/uiUtils";
import {
  NUMBER_RANGE_CONFIG,
  generateNumberPrompt,
  generatePhonePrompt,
  generateDatePrompt,
  generateNamePrompt,
  generateAddressPrompt,
  generateWordPrompt,
  checkDrillAnswer,
} from "../lib/ieltsTask1Drill";

const ALPHABET_LOWER = [
  ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"],
  ["n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
];

const VOWELS = new Set(["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]);

const GRID_0_20 = [
  Array.from({ length: 11 }, (_, i) => i.toString()),
  Array.from({ length: 10 }, (_, i) => (i + 11).toString()),
];

const DRILL_MODES = [
  { id: "alphabet", label: "Alphabet (A–Z)", desc: "Nghe và nhận diện chữ cái đánh vần" },
  { id: "number", label: "Numbers (0 → Triệu)", desc: "Số đếm từ 0–20, bẫy teen/ty đến hàng triệu & giá tiền" },
  { id: "phone", label: "Số điện thoại", desc: "Đọc oh, double, triple theo chuẩn IELTS Part 1" },
  { id: "date", label: "Date & Time", desc: "Ngày tháng năm (UK/US) và giờ giấc" },
  { id: "name", label: "Tên riêng", desc: "Đánh vần họ tên kinh điển trong đề IELTS" },
  { id: "address", label: "Địa chỉ & Postcode", desc: "Số nhà, tên đường và mã bưu điện UK" },
  { id: "word", label: "Word (Từ Part 1)", desc: "Từ vựng điền form hay gặp và bẫy chính tả" },
  { id: "mixed", label: "Tổng hợp Task 1", desc: "Trộn ngẫu nhiên tất cả các dạng Part 1" },
];

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
  const [numberRange, setNumberRange] = useState("0-20");
  const [speechRate, setSpeechRate] = useState(0.85);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voices, setVoices] = useState([]);

  // Current challenge state
  const [currentTarget, setCurrentTarget] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [currentResolvedMode, setCurrentResolvedMode] = useState("alphabet");
  const [isPlaying, setIsPlaying] = useState(false);

  // Stats
  const [foundCount, setFoundCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [hasAttemptedCurrent, setHasAttemptedCurrent] = useState(false);

  // Grid & Dictation feedback
  const [lastFeedback, setLastFeedback] = useState(null);
  const [dictationInput, setDictationInput] = useState("");
  const [dictationStatus, setDictationStatus] = useState(null); // "correct" | "wrong" | null
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("");

  const targetRef = useRef(currentTarget);
  targetRef.current = currentTarget;
  const promptRef = useRef(currentPrompt);
  promptRef.current = currentPrompt;
  const bufferRef = useRef("");
  const bufferTimeoutRef = useRef(null);
  const dictationInputRef = useRef(null);

  const isGridMode = drillType === "alphabet" || (drillType === "number" && numberRange === "0-20");

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
        const savedFound = parseInt(localStorage.getItem("listen_drill_found") || "0", 10);
        const savedFirstTry = parseInt(localStorage.getItem("listen_drill_first_try") || "0", 10);
        const savedDrill = localStorage.getItem("listen_drill_type");
        const savedCase = localStorage.getItem("listen_drill_case");
        const savedRange = localStorage.getItem("listen_drill_range");

        if (!isNaN(savedFound)) setFoundCount(savedFound);
        if (!isNaN(savedFirstTry)) setFirstTryCount(savedFirstTry);
        if (savedDrill && DRILL_MODES.some((m) => m.id === savedDrill)) setDrillType(savedDrill);
        if (savedCase === "lower" || savedCase === "upper") setCaseType(savedCase);
        if (savedRange && NUMBER_RANGE_CONFIG.some((r) => r.id === savedRange)) setNumberRange(savedRange);
      } catch (e) {}
    }
  }, []);

  const speakText = useCallback(
    (textToSpeak, rateOverride) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (!textToSpeak) return;

      window.speechSynthesis.cancel();
      if (isAudioMuted()) {
        setIsPlaying(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "en-GB";
      utterance.rate = rateOverride || speechRate;

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

  const speakCurrent = useCallback(
    (slow = false) => {
      const p = promptRef.current;
      if (p) {
        speakText(slow && p.slowTts ? p.slowTts : p.tts, slow ? Math.max(0.55, speechRate - 0.2) : speechRate);
      } else if (targetRef.current) {
        speakText(targetRef.current, slow ? Math.max(0.55, speechRate - 0.2) : speechRate);
      }
    },
    [speakText, speechRate]
  );

  const nextTarget = useCallback(
    (customType, customCase, customRange) => {
      const type = customType || drillType;
      const caseMode = customCase || caseType;
      const range = customRange || numberRange;

      setHasAttemptedCurrent(false);
      setShowingAnswer(false);
      setLastFeedback(null);
      setDictationInput("");
      setDictationStatus(null);
      bufferRef.current = "";
      setInputBuffer("");
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);

      const useGrid = type === "alphabet" || (type === "number" && range === "0-20");

      if (useGrid) {
        let pool = [];
        if (type === "alphabet") {
          pool = ALPHABET_LOWER.flat().map((ch) => (caseMode === "upper" ? ch.toUpperCase() : ch));
        } else {
          pool = GRID_0_20.flat();
        }
        let randomItem = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1 && randomItem === targetRef.current) {
          const filtered = pool.filter((item) => item !== targetRef.current);
          randomItem = filtered[Math.floor(Math.random() * filtered.length)];
        }
        setCurrentTarget(randomItem);
        setCurrentPrompt(null);
        setCurrentResolvedMode(type);
        setTimeout(() => speakText(randomItem), 150);
        return;
      }

      // Dictation / IELTS Part 1 modes
      let resolved = type;
      if (type === "mixed") {
        const poolModes = ["number", "phone", "date", "name", "address", "word"];
        resolved = poolModes[Math.floor(Math.random() * poolModes.length)];
      }
      setCurrentResolvedMode(resolved);

      let promptObj;
      if (resolved === "number") {
        const effectiveRange = range === "0-20" ? "mixed-scale" : range;
        promptObj = generateNumberPrompt(effectiveRange);
      } else if (resolved === "phone") {
        promptObj = generatePhonePrompt();
      } else if (resolved === "date") {
        promptObj = generateDatePrompt();
      } else if (resolved === "name") {
        promptObj = generateNamePrompt();
      } else if (resolved === "address") {
        promptObj = generateAddressPrompt();
      } else {
        promptObj = generateWordPrompt();
      }

      setCurrentPrompt(promptObj);
      setCurrentTarget(promptObj.target);

      setTimeout(() => {
        speakText(promptObj.tts);
        if (dictationInputRef.current) {
          dictationInputRef.current.focus();
        }
      }, 150);
    },
    [drillType, caseType, numberRange, speakText]
  );

  useEffect(() => {
    nextTarget();
  }, [drillType, caseType, numberRange]);

  const recordSuccess = () => {
    const newFound = foundCount + 1;
    setFoundCount(newFound);
    localStorage.setItem("listen_drill_found", newFound.toString());

    if (!hasAttemptedCurrent && !showingAnswer) {
      const newFirstTry = firstTryCount + 1;
      setFirstTryCount(newFirstTry);
      localStorage.setItem("listen_drill_first_try", newFirstTry.toString());
    }
  };

  const handleSelectGrid = (key) => {
    bufferRef.current = "";
    setInputBuffer("");
    if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);

    const isCorrect = key.toString().toLowerCase() === currentTarget.toString().toLowerCase();

    if (isCorrect) {
      playAudioFeedback("correct");
      setLastFeedback({ key, status: "correct" });
      recordSuccess();
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

  const handleDictationSubmit = (e) => {
    if (e) e.preventDefault();
    if (!currentPrompt) return;

    const isCorrect = checkDrillAnswer(dictationInput, currentPrompt, currentResolvedMode);
    if (isCorrect) {
      playAudioFeedback("correct");
      setDictationStatus("correct");
      recordSuccess();
      setTimeout(() => {
        nextTarget();
      }, 850);
    } else {
      playAudioFeedback("wrong");
      setHasAttemptedCurrent(true);
      setDictationStatus("wrong");
      if (dictationInputRef.current) dictationInputRef.current.focus();
    }
  };

  // Physical Keyboard Listener (Grid modes + global Space replay outside input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSettingsModal) return;

      const isTypingInDictation =
        dictationInputRef.current && document.activeElement === dictationInputRef.current;

      if (!isGridMode) {
        if (e.key === " " && !isTypingInDictation) {
          e.preventDefault();
          speakCurrent(false);
        }
        return;
      }

      const key = e.key;

      if (key === " " || key === "Enter") {
        e.preventDefault();
        if (bufferRef.current) {
          const pending = bufferRef.current;
          bufferRef.current = "";
          setInputBuffer("");
          if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
          handleSelectGrid(pending);
        } else {
          speakCurrent(false);
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
          handleSelectGrid(targetKey);
        }
      } else if (drillType === "number" && numberRange === "0-20") {
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
            handleSelectGrid(nextVal);
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
                handleSelectGrid(pending);
              }
            }, 1200);
            return;
          }

          bufferRef.current = "";
          setInputBuffer("");
          handleSelectGrid(nextVal);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showSettingsModal,
    isGridMode,
    drillType,
    caseType,
    numberRange,
    currentTarget,
    hasAttemptedCurrent,
    showingAnswer,
    speakCurrent,
  ]);

  const selectMode = (modeId) => {
    setDrillType(modeId);
    try {
      localStorage.setItem("listen_drill_type", modeId);
    } catch (e) {}
  };

  const selectNumberRange = (rangeId) => {
    setNumberRange(rangeId);
    try {
      localStorage.setItem("listen_drill_range", rangeId);
    } catch (e) {}
  };

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
      : GRID_0_20;

  const activeModeMeta = DRILL_MODES.find((m) => m.id === drillType) || DRILL_MODES[0];
  const accuracy = foundCount > 0 ? Math.round((firstTryCount / foundCount) * 100) : 0;

  return (
    <main className="container">
      <SectionNav />

      {/* Quick Category Pills for All IELTS Task 1 Formats */}
      <section className="categories-nav" aria-label="Chọn dạng bài Listening Part 1">
        {DRILL_MODES.map((m) => (
          <button
            type="button"
            key={m.id}
            onClick={() => selectMode(m.id)}
            className={`category-pill ${drillType === m.id ? "active" : ""}`}
          >
            {m.label}
          </button>
        ))}
      </section>

      {/* Contextual Sub-Options for Numbers / Alphabet */}
      {drillType === "number" && (
        <section className="drill-subbar" aria-label="Chọn phạm vi số">
          <span className="drill-subbar-label">Phạm vi số:</span>
          <div className="drill-subbar-pills">
            {NUMBER_RANGE_CONFIG.map((cfg) => (
              <button
                type="button"
                key={cfg.id}
                onClick={() => selectNumberRange(cfg.id)}
                className={`difficulty-filter-btn ${numberRange === cfg.id ? "active" : ""}`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {drillType === "alphabet" && (
        <section className="drill-subbar" aria-label="Chọn kiểu chữ cái">
          <span className="drill-subbar-label">Kiểu chữ:</span>
          <div className="drill-subbar-pills">
            <button
              type="button"
              onClick={() => {
                setCaseType("lower");
                localStorage.setItem("listen_drill_case", "lower");
              }}
              className={`difficulty-filter-btn ${caseType === "lower" ? "active" : ""}`}
            >
              abc (Chữ thường)
            </button>
            <button
              type="button"
              onClick={() => {
                setCaseType("upper");
                localStorage.setItem("listen_drill_case", "upper");
              }}
              className={`difficulty-filter-btn ${caseType === "upper" ? "active" : ""}`}
            >
              ABC (Chữ hoa)
            </button>
          </div>
        </section>
      )}

      <section className="listen-drill-container">
        <div className="listen-header-row">
          <div className="listen-title-group">
            <button
              type="button"
              className="listen-icon-badge"
              onClick={() => speakCurrent(false)}
              title="Bấm để nghe"
              aria-label="Nghe lại"
            >
              <Volume2Icon size={22} />
            </button>
            <div>
              <h1 className="listen-main-title">{activeModeMeta.label}</h1>
              <p className="listen-sub-title">{activeModeMeta.desc}</p>
            </div>
          </div>

          <div className="listen-stats-group">
            <div className="stat-pill">
              <span className="stat-label">FOUND</span>
              <span className="stat-number">{foundCount}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">FIRST TRY</span>
              <span className="stat-number">
                {firstTryCount} ({accuracy}%)
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-listen-change"
            onClick={() => setShowSettingsModal(true)}
            title="Giọng đọc, tốc độ & Đặt lại điểm"
          >
            <SlidersIcon size={15} />
            <span>Giọng &amp; Tốc độ</span>
          </button>
        </div>

        {/* Central Audio Bubble */}
        <div className="listen-player-card">
          {currentPrompt && (
            <span className="drill-cat-badge">{currentPrompt.label}</span>
          )}
          <button
            type="button"
            className={`listen-big-btn ${isPlaying ? "playing" : ""}`}
            onClick={() => speakCurrent(false)}
            aria-label="Nghe lại"
          >
            <Volume2Icon size={32} />
          </button>
          <div className="drill-audio-actions-inline">
            <button type="button" className="btn-drill-secondary" onClick={() => speakCurrent(false)}>
              <Volume2Icon size={14} />
              <span>Nghe lại</span>
            </button>
            {!isGridMode && (
              <button type="button" className="btn-drill-secondary" onClick={() => speakCurrent(true)}>
                <span>Đọc chậm / Đánh vần</span>
              </button>
            )}
          </div>
          <span className="listen-shortcut-hint">
            {isGridMode ? (
              <>
                Nhấn <b>Space</b> hoặc <b>Enter</b> để nghe lại • Gõ trực tiếp chữ/số trên bàn phím
              </>
            ) : (
              <>Gõ đáp án vào ô bên dưới rồi nhấn <b>Enter ↵</b> để kiểm tra</>
            )}
          </span>
        </div>

        {/* MODE A: Fast Grid (Alphabet / 0-20) */}
        {isGridMode ? (
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
                      onClick={() => handleSelectGrid(item)}
                      aria-label={item}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* MODE B: IELTS Task 1 Dictation Input (Millions, Phone, Date, Name, Address, Word) */
          <div className="drill-dictation-area">
            <form onSubmit={handleDictationSubmit} className="drill-form">
              <div className="drill-input-wrapper">
                <input
                  ref={dictationInputRef}
                  type="text"
                  className={`drill-text-input ${dictationStatus === "correct" ? "input-correct" : ""} ${
                    dictationStatus === "wrong" ? "input-wrong" : ""
                  }`}
                  placeholder={
                    currentResolvedMode === "phone"
                      ? "Nhập số điện thoại (VD: 07700 900412)..."
                      : currentResolvedMode === "number"
                      ? "Nhập con số nghe được (VD: 2450000 hoặc 2,450,000)..."
                      : currentResolvedMode === "date"
                      ? "Nhập ngày hoặc giờ (VD: 14 October, 14/10 hoặc 9:30)..."
                      : currentResolvedMode === "address"
                      ? "Nhập địa chỉ hoặc postcode..."
                      : currentResolvedMode === "name"
                      ? "Nhập tên riêng vừa nghe đánh vần..."
                      : "Nhập từ tiếng Anh vừa nghe..."
                  }
                  value={dictationInput}
                  onChange={(e) => {
                    setDictationInput(e.target.value);
                    if (dictationStatus) setDictationStatus(null);
                  }}
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                />
                <button type="submit" className="drill-submit-btn">
                  Kiểm tra ↵
                </button>
              </div>

              {dictationStatus === "correct" && currentPrompt && (
                <div className="feedback-message feedback-success">
                  <CheckIcon size={16} />
                  <span>
                    Chính xác! Đáp án: <b>{currentPrompt.display}</b>
                  </span>
                </div>
              )}

              {dictationStatus === "wrong" && (
                <div className="feedback-message feedback-danger">
                  <AlertTriangleIcon size={16} />
                  <span>Chưa khớp, hãy bấm &quot;Đọc chậm / Đánh vần&quot; hoặc &quot;Xem đáp án&quot;.</span>
                </div>
              )}
            </form>

            {showingAnswer && currentPrompt && (
              <div className="drill-revealed-box">
                <div className="revealed-header">
                  <span className="revealed-title">Đáp án chuẩn:</span>
                  <span className="revealed-target">{currentPrompt.display}</span>
                </div>
                <p className="revealed-meaning">{currentPrompt.hint}</p>
              </div>
            )}
          </div>
        )}

        <div className="listen-bottom-bar">
          <div className="drill-audio-actions-inline">
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

            <button
              type="button"
              className="btn-drill-nav btn-drill-next"
              onClick={() => nextTarget()}
            >
              <span>Câu mới</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          <span className="listen-keyboard-tip">
            <KeyboardIcon size={15} />
            <span>
              {isGridMode
                ? "Bấm ? để xem đáp án, hoặc gõ thẳng ký tự trên bàn phím."
                : "Đủ 7 dạng IELTS Part 1: Word, Number tới hàng triệu, Phone, Date, Name, Address."}
            </span>
          </span>
        </div>
      </section>

      {showSettingsModal && (
        <div className="drill-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="drill-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="drill-modal-header">
              <h2>
                <SlidersIcon size={18} />
                <span>Cài Đặt Giọng Đọc &amp; Thống Kê</span>
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
                <label className="drill-setting-label">Giọng đọc tiếng Anh (Ưu tiên UK cho IELTS)</label>
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
                onClick={() => setShowSettingsModal(false)}
              >
                Đóng &amp; Tiếp tục luyện
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
