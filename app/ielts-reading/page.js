"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import SectionNav from "../components/SectionNav";
import {
  FileTextIcon,
  CheckIcon,
  XIcon,
  RotateCcwIcon,
  ClockIcon,
  AwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  SearchIcon,
} from "../components/Icons";
import readingData from "../../ielts_reading_tests.json";

// IELTS Academic Reading Band Score Table (out of 40)
function calculateBandScore(correctCount) {
  if (correctCount >= 39) return { band: "9.0", label: "Expert User", desc: "Năng lực xuất sắc, hiểu hoàn toàn văn bản học thuật." };
  if (correctCount >= 37) return { band: "8.5", label: "Very Good User", desc: "Năng lực rất tốt, xử lý hoàn hảo các văn bản phức tạp." };
  if (correctCount >= 35) return { band: "8.0", label: "Very Good User", desc: "Nắm vững lý lẽ và chi tiết tinh tế trong bài đọc." };
  if (correctCount >= 33) return { band: "7.5", label: "Good User", desc: "Nắm tốt thông tin chi tiết và lập luận học thuật." };
  if (correctCount >= 30) return { band: "7.0", label: "Good User", desc: "Đạt mục tiêu hầu hết các trường Đại học quốc tế." };
  if (correctCount >= 27) return { band: "6.5", label: "Competent User", desc: "Năng lực khá, làm chủ phần lớn các câu hỏi." };
  if (correctCount >= 23) return { band: "6.0", label: "Competent User", desc: "Nắm được ý chính và đại đa số các thông tin cơ bản." };
  if (correctCount >= 19) return { band: "5.5", label: "Modest User", desc: "Đã có nền tảng đọc hiểu nhưng cần trau dồi thêm từ vựng." };
  if (correctCount >= 15) return { band: "5.0", label: "Modest User", desc: "Hiểu ý bao quát, còn gặp khó với câu hỏi bẫy chi tiết." };
  if (correctCount >= 13) return { band: "4.5", label: "Limited User", desc: "Cần tăng tốc độ đọc và vốn từ học thuật Academic." };
  if (correctCount >= 10) return { band: "4.0", label: "Limited User", desc: "Cần luyện tập thêm các dạng bài cơ bản." };
  if (correctCount >= 8) return { band: "3.5", label: "Extremely Limited", desc: "Cần xây dựng lại vốn từ vựng nền tảng." };
  if (correctCount >= 5) return { band: "3.0", label: "Extremely Limited", desc: "Cần bổ sung ngữ pháp và từ vựng cơ bản." };
  return { band: "2.5", label: "Novice", desc: "Hãy kiên trì ôn luyện từ các đề cơ bản." };
}

// Clean and normalize answers for lenient comparison
function normalizeAnswer(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function checkUserAnswer(userAns, rawCorrectKey) {
  if (!userAns || !rawCorrectKey) return false;
  const uNorm = normalizeAnswer(userAns);
  const kNorm = normalizeAnswer(rawCorrectKey);

  // Exact match after normalization
  if (uNorm === kNorm) return true;

  // Check True / False / Not Given variations
  if (["true", "t"].includes(uNorm) && ["true", "t"].includes(kNorm)) return true;
  if (["false", "f"].includes(uNorm) && ["false", "f"].includes(kNorm)) return true;
  if (["not given", "ng"].includes(uNorm) && ["not given", "ng"].includes(kNorm)) return true;

  // Check Yes / No / Not Given variations
  if (["yes", "y"].includes(uNorm) && ["yes", "y"].includes(kNorm)) return true;
  if (["no", "n"].includes(uNorm) && ["no", "n"].includes(kNorm)) return true;

  // Check multiple slash or 'or' alternatives in answer key, e.g. "A / B", "two decades / 2 decades"
  const alternatives = rawCorrectKey.split(/\s*(?:\/|\bor\b)\s*/i).map(normalizeAnswer);
  if (alternatives.includes(uNorm)) return true;

  // Check bracketed optional words, e.g. "slow (turning)" -> matches "slow" or "slow turning"
  if (rawCorrectKey.includes("(") && rawCorrectKey.includes(")")) {
    const withoutParens = normalizeAnswer(rawCorrectKey.replace(/\([^)]*\)/g, ""));
    const withParensWords = normalizeAnswer(rawCorrectKey.replace(/[()]/g, ""));
    if (uNorm === withoutParens || uNorm === withParensWords) return true;
  }

  // Check Roman numerals (e.g. ii == 2)
  const romanMap = { i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6", vii: "7", viii: "8", ix: "9", x: "10" };
  if (romanMap[uNorm] && romanMap[uNorm] === romanMap[kNorm]) return true;

  return false;
}

const TOTAL_TIME = 60 * 60; // 60 minutes in seconds

export default function IeltsReadingPage() {
  const tests = useMemo(() => readingData.tests || [], []);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const currentTest = tests[selectedTestIndex] || tests[0];

  // Search/filter in test dropdown
  const [searchTerm, setSearchTerm] = useState("");

  // User answers keyed by question number: { "1": "yes", "2": "C", ... }
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [timerRunning, setTimerRunning] = useState(true);

  // Font size scale for reading passage (0.9 to 1.3)
  const [fontScale, setFontScale] = useState(1);

  // Mobile tab toggle: "passage" vs "sheet"
  const [mobileTab, setMobileTab] = useState("passage");

  // History & Progress stored in localStorage
  const [history, setHistory] = useState({});

  const questionSheetRef = useRef(null);

  // Load progress on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ielts_reading_progress");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // When test changes, load saved answers or reset state
  useEffect(() => {
    if (!currentTest) return;
    const testId = currentTest.id;
    if (history[testId]?.userAnswers) {
      setAnswers(history[testId].userAnswers);
      setIsSubmitted(!!history[testId].isSubmitted);
    } else {
      setAnswers({});
      setIsSubmitted(false);
    }
    setTimeLeft(TOTAL_TIME);
    setTimerRunning(true);
    setShowResultModal(false);
    setShowConfirmSubmit(false);
  }, [selectedTestIndex, history, currentTest]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerRunning || isSubmitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, isSubmitted, timeLeft]);

  // Answer change handler
  const handleAnswerChange = (qNum, val) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [String(qNum)]: val,
    }));
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Calculate results
  const scoreResult = useMemo(() => {
    if (!currentTest) return { correct: 0, total: 40, band: "0.0", details: {} };
    let correct = 0;
    const details = {};
    for (let i = 1; i <= 40; i++) {
      const qNum = String(i);
      const userAns = answers[qNum] || "";
      const correctAns = currentTest.answers?.[qNum] || "";
      const isCorrect = checkUserAnswer(userAns, correctAns);
      if (isCorrect) correct++;
      details[qNum] = { isCorrect, userAns, correctAns };
    }
    const bandInfo = calculateBandScore(correct);
    return {
      correct,
      total: 40,
      percent: Math.round((correct / 40) * 100),
      ...bandInfo,
      details,
    };
  }, [currentTest, answers]);

  // Answered count
  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((a) => a && a.trim() !== "").length;
  }, [answers]);

  // Filtered tests for dropdown
  const filteredTests = useMemo(() => {
    if (!searchTerm.trim()) return tests;
    const term = searchTerm.toLowerCase();
    return tests.filter(
      (t) =>
        String(t.testNum).includes(term) ||
        t.title?.toLowerCase().includes(term) ||
        t.passageTitles?.some((p) => p.toLowerCase().includes(term))
    );
  }, [tests, searchTerm]);

  // Submit test confirmation or immediate
  const handleSubmitClick = () => {
    if (answeredCount < 40) {
      setShowConfirmSubmit(true);
    } else {
      finalizeSubmit();
    }
  };

  const finalizeSubmit = () => {
    setIsSubmitted(true);
    setTimerRunning(false);
    setShowConfirmSubmit(false);
    setShowResultModal(true);

    if (currentTest) {
      const testId = currentTest.id;
      const newRecord = {
        testId,
        testNum: currentTest.testNum,
        score: scoreResult.correct,
        band: scoreResult.band,
        total: 40,
        timeSpentSeconds: TOTAL_TIME - timeLeft,
        completedAt: new Date().toISOString(),
        userAnswers: answers,
        isSubmitted: true,
      };
      setHistory((prev) => {
        const updated = { ...prev, [testId]: newRecord };
        try {
          localStorage.setItem("ielts_reading_progress", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  const handleAutoSubmit = () => {
    finalizeSubmit();
  };

  const handleRetakeTest = () => {
    setAnswers({});
    setIsSubmitted(false);
    setTimeLeft(TOTAL_TIME);
    setTimerRunning(true);
    setShowResultModal(false);
    setShowConfirmSubmit(false);
  };

  // Jump to specific question in answer sheet
  const scrollToQuestion = (qNum) => {
    setMobileTab("sheet");
    setTimeout(() => {
      const el = document.getElementById(`reading-q-${qNum}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("reading-q-highlight");
        setTimeout(() => el.classList.remove("reading-q-highlight"), 1200);
      }
    }, 100);
  };

  return (
    <div className="study-page reading-practice-page">
      <SectionNav />

      {/* Main Container */}
      <main className="reading-main-container">
        {/* Top Header & Test Bar */}
        <header className="reading-top-header">
          <div className="reading-header-content">
            <div className="reading-title-row">
              <div className="reading-title-badge">
                <FileTextIcon size={18} />
                <span>IELTS ACADEMIC READING • TRỌN BỘ {tests.length} ĐỀ</span>
              </div>
              <h1 className="reading-title">{currentTest?.title || "IELTS Reading Practice"}</h1>
            </div>

            {/* Test Selector Dropdown, Search, Prev/Next & Badges */}
            <div className="reading-toolbar-row">
              <div className="reading-test-selector-wrapper">
                <div className="reading-nav-buttons">
                  <button
                    className="reading-nav-arrow-btn"
                    disabled={selectedTestIndex === 0}
                    onClick={() => setSelectedTestIndex((i) => Math.max(0, i - 1))}
                    title="Đề trước"
                  >
                    <ChevronLeftIcon size={16} /> Trước
                  </button>
                  <button
                    className="reading-nav-arrow-btn"
                    disabled={selectedTestIndex === tests.length - 1}
                    onClick={() => setSelectedTestIndex((i) => Math.min(tests.length - 1, i + 1))}
                    title="Đề sau"
                  >
                    Sau <ChevronRightIcon size={16} />
                  </button>
                </div>

                <div className="reading-search-box">
                  <SearchIcon size={14} className="search-icon" />
                  <input
                    type="text"
                    className="reading-search-input"
                    placeholder="Tìm theo số đề hoặc tên bài..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="reading-search-clear" onClick={() => setSearchTerm("")}>
                      ×
                    </button>
                  )}
                </div>

                <select
                  id="test-select"
                  className="reading-test-select"
                  value={selectedTestIndex}
                  onChange={(e) => setSelectedTestIndex(Number(e.target.value))}
                >
                  {filteredTests.map((t) => {
                    const realIndex = tests.findIndex((item) => item.id === t.id);
                    const testHist = history[t.id];
                    return (
                      <option key={t.id} value={realIndex}>
                        Test {t.testNum}: {t.passageTitles?.[0] || t.title}{" "}
                        {testHist?.band ? `(Band ${testHist.band} - ${testHist.score}/40)` : ""}
                      </option>
                    );
                  })}
                </select>

                <span className="reading-test-count-badge">
                  Đề {selectedTestIndex + 1}/{tests.length}
                </span>
              </div>

              {/* Countdown Timer */}
              <div className={`reading-timer-box ${timeLeft < 300 ? "timer-urgent" : timeLeft < 600 ? "timer-warning" : ""}`}>
                <ClockIcon size={16} />
                <span className="reading-timer-text">{formatTime(timeLeft)}</span>
                {!isSubmitted && (
                  <button
                    className="reading-timer-toggle-btn"
                    onClick={() => setTimerRunning((r) => !r)}
                    title={timerRunning ? "Tạm dừng" : "Tiếp tục"}
                  >
                    {timerRunning ? "Tạm dừng" : "Tiếp tục"}
                  </button>
                )}
              </div>

              {/* Font Zoom Controls */}
              <div className="reading-font-controls" title="Cỡ chữ bài đọc">
                <button
                  className="font-zoom-btn"
                  onClick={() => setFontScale((s) => Math.max(0.85, s - 0.1))}
                  title="Thu nhỏ chữ bài đọc"
                >
                  A-
                </button>
                <button
                  className="font-zoom-btn font-zoom-reset"
                  onClick={() => setFontScale(1)}
                  title="Cỡ chữ mặc định"
                >
                  100%
                </button>
                <button
                  className="font-zoom-btn"
                  onClick={() => setFontScale((s) => Math.min(1.35, s + 0.1))}
                  title="Phóng to chữ bài đọc"
                >
                  A+
                </button>
              </div>

              {/* Reset / Retake Button */}
              {isSubmitted && (
                <button className="reading-retake-header-btn" onClick={handleRetakeTest}>
                  <RotateCcwIcon size={14} /> Làm lại đề này
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Switcher (Tabs between Passage and Sheet) */}
        <div className="reading-mobile-tabs">
          <button
            className={`reading-mobile-tab-btn ${mobileTab === "passage" ? "active" : ""}`}
            onClick={() => setMobileTab("passage")}
          >
            📖 Đề bài & Bài đọc
          </button>
          <button
            className={`reading-mobile-tab-btn ${mobileTab === "sheet" ? "active" : ""}`}
            onClick={() => setMobileTab("sheet")}
          >
            📝 Phiếu trả lời ({answeredCount}/40)
            {isSubmitted && ` • Band ${scoreResult.band}`}
          </button>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="reading-split-workspace">
          {/* Left Column: Passage Reading Content */}
          <section
            className={`reading-passage-pane ${mobileTab === "passage" ? "show-mobile" : "hide-mobile"}`}
            style={{ "--reading-font-scale": fontScale }}
          >
            <div className="reading-passage-inner">
              <div className="reading-passage-header-banner">
                <span className="reading-banner-pill">IELTS Academic Test Content</span>
                <span className="reading-banner-hint">Gợi ý: Dùng Ctrl+F (hoặc ⌘+F) để tìm nhanh từ khóa trong bài đọc</span>
              </div>

              {/* Rendered cleaned HTML from practicepteonline.com */}
              <div
                className="reading-passage-html-content"
                dangerouslySetInnerHTML={{ __html: currentTest?.contentHtml || "<p>Đang tải bài đọc...</p>" }}
              />
            </div>
          </section>

          {/* Right Column: Interactive Question Answer Sheet */}
          <section
            ref={questionSheetRef}
            className={`reading-sheet-pane ${mobileTab === "sheet" ? "show-mobile" : "hide-mobile"}`}
          >
            <div className="reading-sheet-inner">
              {/* Question Navigator Palette */}
              <div className="reading-palette-card">
                <div className="reading-palette-header">
                  <div className="reading-palette-title">
                    <span>Danh sách 40 câu hỏi</span>
                    <span className="reading-palette-progress">
                      Đã làm: <strong>{answeredCount}</strong> / 40
                    </span>
                  </div>
                  {isSubmitted && (
                    <div className="reading-palette-score-badge">
                      <AwardIcon size={14} /> Band {scoreResult.band} ({scoreResult.correct}/40 đúng)
                    </div>
                  )}
                </div>

                <div className="reading-palette-grid">
                  {(currentTest?.questions || Array.from({ length: 40 }, (_, i) => ({ num: i + 1 }))).map((q) => {
                    const qNum = String(q.num);
                    const isAnswered = !!answers[qNum] && answers[qNum].trim() !== "";
                    const review = scoreResult.details[qNum];

                    let statusClass = "";
                    if (isSubmitted) {
                      statusClass = review?.isCorrect ? "palette-correct" : "palette-incorrect";
                    } else if (isAnswered) {
                      statusClass = "palette-answered";
                    }

                    return (
                      <button
                        key={q.num}
                        type="button"
                        className={`reading-palette-item ${statusClass}`}
                        onClick={() => scrollToQuestion(q.num)}
                        title={`Câu ${q.num}: ${isSubmitted ? (review?.isCorrect ? "Đúng" : "Sai") : isAnswered ? "Đã trả lời" : "Chưa làm"}`}
                      >
                        {q.num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 40 Question Items */}
              <div className="reading-questions-list">
                {currentTest?.questions?.map((q) => {
                    const qNum = String(q.num);
                    const userAns = answers[qNum] || "";
                    const review = scoreResult.details[qNum];
                    const isCorrect = isSubmitted && review?.isCorrect;

                    return (
                      <div
                        key={q.num}
                        id={`reading-q-${q.num}`}
                        className={`reading-question-card ${
                          isSubmitted ? (isCorrect ? "q-card-correct" : "q-card-wrong") : ""
                        }`}
                      >
                        <div className="reading-q-header">
                          <span className="reading-q-badge">Câu {q.num}</span>
                          {isSubmitted && (
                            <span className={`reading-q-result-tag ${isCorrect ? "tag-correct" : "tag-wrong"}`}>
                              {isCorrect ? (
                                <>
                                  <CheckIcon size={13} /> Chính xác
                                </>
                              ) : (
                                <>
                                  <XIcon size={13} /> Chưa đúng
                                </>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Input based on type */}
                        <div className="reading-q-input-area">
                          {/* Type 1: True / False / Not Given */}
                          {q.type === "true_false_not_given" && (
                            <div className="reading-options-group">
                              {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={isSubmitted}
                                  className={`reading-option-pill ${
                                    userAns.toUpperCase() === opt ? "selected" : ""
                                  }`}
                                  onClick={() => handleAnswerChange(q.num, opt)}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Type 2: Yes / No / Not Given */}
                          {q.type === "yes_no_not_given" && (
                            <div className="reading-options-group">
                              {["YES", "NO", "NOT GIVEN"].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={isSubmitted}
                                  className={`reading-option-pill ${
                                    userAns.toUpperCase() === opt ? "selected" : ""
                                  }`}
                                  onClick={() => handleAnswerChange(q.num, opt)}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Type 3: Letter Choice (A, B, C, D...) */}
                          {q.type === "letter_choice" && (
                            <div className="reading-letter-group">
                              {q.options.map((letter) => (
                                <button
                                  key={letter}
                                  type="button"
                                  disabled={isSubmitted}
                                  className={`reading-letter-pill ${
                                    userAns.toUpperCase() === letter ? "selected" : ""
                                  }`}
                                  onClick={() => handleAnswerChange(q.num, letter)}
                                >
                                  {letter}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Type 4: Text Input (Fill in the blank / Roman numerals / Words) */}
                          {q.type === "text_input" && (
                            <div className="reading-text-input-group">
                              <input
                                type="text"
                                disabled={isSubmitted}
                                className="reading-text-field"
                                placeholder="Gõ đáp án vào đây..."
                                value={userAns}
                                onChange={(e) => handleAnswerChange(q.num, e.target.value)}
                              />

                              {/* Mini Roman Numeral Helper Pills */}
                              {!isSubmitted && (
                                <div className="reading-roman-helper">
                                  <span className="helper-label">Gợi ý gõ nhanh số La Mã:</span>
                                  {["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"].map((r) => (
                                    <button
                                      key={r}
                                      type="button"
                                      className="roman-pill"
                                      onClick={() => handleAnswerChange(q.num, r)}
                                    >
                                      {r}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Review details when submitted */}
                        {isSubmitted && (
                          <div className="reading-q-review-box">
                            <div className="review-row">
                              <span className="review-label">Bạn chọn:</span>
                              <span className={`review-user-ans ${isCorrect ? "text-green" : "text-red"}`}>
                                {userAns || "(Để trống)"}
                              </span>
                            </div>
                            <div className="review-row">
                              <span className="review-label">Đáp án đúng:</span>
                              <span className="review-correct-ans">{q.correctAnswer}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="reading-bottom-actions">
                <div className="reading-action-stats">
                  <span>
                    Đã làm: <strong>{answeredCount}</strong> / 40 câu
                  </span>
                </div>

                {!isSubmitted ? (
                  <button className="reading-submit-btn" type="button" onClick={handleSubmitClick}>
                    <CheckIcon size={16} /> Nộp bài & Chấm điểm
                  </button>
                ) : (
                  <div className="reading-submitted-action-row">
                    <button
                      className="reading-view-score-btn"
                      type="button"
                      onClick={() => setShowResultModal(true)}
                    >
                      <AwardIcon size={16} /> Bảng điểm
                    </button>
                    <button
                      className="reading-retake-action-btn"
                      type="button"
                      onClick={handleRetakeTest}
                    >
                      <RotateCcwIcon size={16} /> Làm lại
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Modal Confirm Incomplete Submission */}
        {showConfirmSubmit && (
          <div className="reading-modal-backdrop" onClick={() => setShowConfirmSubmit(false)}>
            <div className="reading-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon-warning">
                <AlertTriangleIcon size={32} />
              </div>
              <h3 className="modal-title">Bạn còn {40 - answeredCount} câu chưa làm</h3>
              <p className="modal-desc">
                Bạn đã trả lời {answeredCount}/40 câu hỏi. Bạn có chắc chắn muốn nộp bài để chấm điểm ngay bây giờ không?
              </p>
              <div className="modal-actions-row">
                <button
                  className="modal-btn-secondary"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Tiếp tục làm bài
                </button>
                <button
                  className="modal-btn-primary"
                  onClick={finalizeSubmit}
                >
                  Nộp bài luôn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Results & Band Score */}
        {showResultModal && (
          <div className="reading-modal-backdrop" onClick={() => setShowResultModal(false)}>
            <div className="reading-result-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-result-header">
                <div className="modal-award-badge">
                  <AwardIcon size={32} />
                </div>
                <h2 className="modal-result-title">Kết Quả IELTS Reading</h2>
                <p className="modal-result-test-name">{currentTest?.title || currentTestMeta?.title}</p>
              </div>

              {/* Band Score Circle */}
              <div className="modal-band-container">
                <div className="modal-band-score">Band {scoreResult.band}</div>
                <div className="modal-band-label">{scoreResult.label}</div>
                <div className="modal-band-desc">{scoreResult.desc}</div>
              </div>

              {/* Stats Grid */}
              <div className="modal-stats-grid">
                <div className="modal-stat-card">
                  <span className="stat-card-label">Số câu đúng</span>
                  <span className="stat-card-value text-green">
                    {scoreResult.correct} <span className="stat-total">/ 40</span>
                  </span>
                </div>
                <div className="modal-stat-card">
                  <span className="stat-card-label">Độ chính xác</span>
                  <span className="stat-card-value">{scoreResult.percent}%</span>
                </div>
                <div className="modal-stat-card">
                  <span className="stat-card-label">Thời gian làm bài</span>
                  <span className="stat-card-value">{formatTime(TOTAL_TIME - timeLeft)}</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="modal-actions-footer">
                <button
                  className="modal-btn-primary"
                  onClick={() => setShowResultModal(false)}
                >
                  Xem chi tiết đáp án từng câu
                </button>
                <button
                  className="modal-btn-secondary"
                  onClick={() => {
                    handleRetakeTest();
                  }}
                >
                  <RotateCcwIcon size={14} /> Làm lại đề này
                </button>
                {selectedTestIndex + 1 < tests.length && (
                  <button
                    className="modal-btn-accent"
                    onClick={() => {
                      setSelectedTestIndex((i) => i + 1);
                    }}
                  >
                    Làm Đề tiếp theo (Test {tests[selectedTestIndex + 1].testNum}) <ChevronRightIcon size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
