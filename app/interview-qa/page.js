"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import SectionNav from "../components/SectionNav";
import { useSearchParams } from "next/navigation";
import rawData from "../../interview_500_qa.json";

const ITEMS_PER_PAGE = 15;

function InterviewQAContent() {
  const searchParams = useSearchParams();

  // Flatten all questions
  const allQuestions = useMemo(() => {
    const list = [];
    if (rawData.parts) {
      rawData.parts.forEach((p) => {
        if (p.questions) {
          list.push(...p.questions);
        }
      });
    }
    return list;
  }, []);

  // Read initial states from URL query params
  const initialPart = searchParams.get("part") || "all";
  const initialFilter = searchParams.get("filter") || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialPage = useMemo(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const [activePart, setActivePart] = useState(initialPart);
  const [filterType, setFilterType] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(initialPage.toString());

  const [learnedIds, setLearnedIds] = useState(new Set());
  const [studyCounts, setStudyCounts] = useState({});
  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronize URL
  const updateUrl = (overrides = {}) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    const part = overrides.part !== undefined ? overrides.part : activePart;
    const filter = overrides.filter !== undefined ? overrides.filter : filterType;
    const q = overrides.q !== undefined ? overrides.q : searchQuery;
    const page = overrides.page !== undefined ? overrides.page : currentPage;

    if (!part || part === "all") url.searchParams.delete("part");
    else url.searchParams.set("part", part);

    if (!filter || filter === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", filter);

    if (!q || !q.trim()) url.searchParams.delete("q");
    else url.searchParams.set("q", q.trim());

    if (!page || page <= 1) url.searchParams.delete("page");
    else url.searchParams.set("page", page.toString());

    window.history.replaceState(null, "", url.toString());
  };

  // Sync state when browser Back/Forward is clicked
  useEffect(() => {
    const pPart = searchParams.get("part") || "all";
    const f = searchParams.get("filter") || "all";
    const q = searchParams.get("q") || "";
    const p = parseInt(searchParams.get("page") || "1", 10);
    const validP = isNaN(p) || p < 1 ? 1 : p;

    setActivePart(pPart);
    setFilterType(f);
    setSearchQuery(q);
    setCurrentPage(validP);
    setPageInput(validP.toString());
  }, [searchParams]);

  const handlePartChange = (part) => {
    setActivePart(part);
    setCurrentPage(1);
    setPageInput("1");
    updateUrl({ part, page: 1 });
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter);
    setCurrentPage(1);
    setPageInput("1");
    updateUrl({ filter, page: 1 });
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
    setPageInput("1");
    updateUrl({ q, page: 1 });
  };

  const changePage = (newPage, maxPages) => {
    const limit = maxPages || totalPages;
    const target = Math.max(1, Math.min(limit, newPage));
    setCurrentPage(target);
    setPageInput(target.toString());
    updateUrl({ page: target });

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
      const stored = localStorage.getItem("interview_qa_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {
          console.error("Error loading interview progress", e);
        }
      }

      const storedCounts = localStorage.getItem("interview_qa_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {
          console.error("Error loading interview study counts", e);
        }
      }

      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setLearnedIds(next);
    localStorage.setItem("interview_qa_progress", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("interview_qa_study_counts", JSON.stringify(next));
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học phỏng vấn không?")) {
      setLearnedIds(new Set());
      setStudyCounts({});
      localStorage.removeItem("interview_qa_progress");
      localStorage.removeItem("interview_qa_study_counts");
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
      if (voiceObj) {
        utterance.voice = voiceObj;
      }
    }

    utterance.onstart = () => setPlayingId(id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((item) => {
      // Filter part
      const matchesPart =
        activePart === "all" ||
        (activePart === "1" && item.part === 1) ||
        (activePart === "2" && item.part === 2);

      // Filter learned
      const isLearned = learnedIds.has(item.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);

      // Search query
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.question_en.toLowerCase().includes(query) ||
        item.question_vi.toLowerCase().includes(query) ||
        (item.answers &&
          item.answers.some(
            (a) =>
              a.answer_en.toLowerCase().includes(query) ||
              a.answer_vi.toLowerCase().includes(query)
          ));

      return matchesPart && matchesFilterType && matchesSearch;
    });
  }, [allQuestions, activePart, filterType, searchQuery, learnedIds]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      changePage(1, totalPages);
    }
  }, [totalPages]);

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const totalCount = allQuestions.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu phỏng vấn tiếng Anh...</p>
      </div>
    );
  }

  return (
    <main className="container">
      {/* Multi-Section Navigation Bar */}
      <SectionNav />

      <header className="hero">
        <div className="hero-content">
          <h1 style={{ background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            💼 500 Câu Hỏi & Trả Lời Phỏng Vấn Xin Việc
          </h1>
          <p className="hero-subtitle">
            Bộ câu hỏi phỏng vấn tiếng Anh thực chiến và các phương án trả lời mẫu ghi điểm với nhà tuyển dụng
          </p>
        </div>

        {/* Progress Card */}
        <div className="progress-card" style={{ background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.3)" }}>
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học phỏng vấn</span>
            <span className="stat-value">{learnedCount}/{totalCount} câu hỏi ({progressPercent}%)</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: "#bae6fd" }}></div>
          </div>
          <div className="progress-actions">
            <button onClick={resetProgress} className="btn-reset" title="Xóa toàn bộ tiến trình học">
              🔄 Reset tiến trình
            </button>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <section className="control-panel">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo câu hỏi, câu trả lời tiếng Anh hoặc tiếng Việt..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => handleSearchChange("")} className="clear-search">✕</button>
          )}
        </div>

        <div className="tts-controls">
          <div className="control-group">
            <label htmlFor="voice-select">Giọng đọc tiếng Anh:</label>
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
            <label htmlFor="rate-range">Tốc độ ({speechRate}x):</label>
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

      {/* Part Navigation */}
      <section className="categories-nav">
        <button
          onClick={() => handlePartChange("all")}
          className={`category-pill ${activePart === "all" ? "active" : ""}`}
          style={activePart === "all" ? { backgroundColor: "#0284c7", borderColor: "#0284c7" } : {}}
        >
          📂 Tất cả ({totalCount} câu hỏi)
        </button>
        <button
          onClick={() => handlePartChange("1")}
          className={`category-pill ${activePart === "1" ? "active" : ""}`}
          style={activePart === "1" ? { backgroundColor: "#0284c7", borderColor: "#0284c7" } : {}}
        >
          👔 Phần I: Nhà tuyển dụng hỏi ({rawData.parts[0]?.questions.length || 128} câu • 350 cách trả lời)
        </button>
        <button
          onClick={() => handlePartChange("2")}
          className={`category-pill ${activePart === "2" ? "active" : ""}`}
          style={activePart === "2" ? { backgroundColor: "#0284c7", borderColor: "#0284c7" } : {}}
        >
          🙋 Phần II: Ứng viên hỏi nhà tuyển dụng ({rawData.parts[1]?.questions.length || 27} câu hỏi hay)
        </button>
      </section>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          onClick={() => handleFilterChange("all")}
          className={`filter-tab ${filterType === "all" ? "active" : ""}`}
          style={filterType === "all" ? { color: "#0284c7" } : {}}
        >
          🎯 Tất cả ({filteredQuestions.length})
        </button>
        <button
          onClick={() => handleFilterChange("unlearned")}
          className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
          style={filterType === "unlearned" ? { color: "#0284c7" } : {}}
        >
          📖 Chưa học ({allQuestions.filter((q) => !learnedIds.has(q.id)).length})
        </button>
        <button
          onClick={() => handleFilterChange("learned")}
          className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
          style={filterType === "learned" ? { color: "#0284c7" } : {}}
        >
          ✅ Đã thuộc ({learnedIds.size})
        </button>
      </div>

      {/* Questions List */}
      <section className="sentences-list">
        {paginatedQuestions.map((q) => {
          const isLearned = learnedIds.has(q.id);
          const isPlayingQ = playingId === q.id;

          return (
            <article
              key={q.id}
              className={`sentence-card ${isLearned ? "learned" : ""} ${isPlayingQ ? "playing" : ""}`}
              style={isPlayingQ ? { borderColor: "#0284c7" } : {}}
            >
              <div className="card-top">
                <span className="card-index" style={{ color: "#0284c7", backgroundColor: "rgba(2, 132, 199, 0.1)" }}>
                  #{q.part === 1 ? `Phần 1 - Câu ${q.question_number}` : `Phần 2 - Câu ${q.question_number}`}
                </span>
                <span className="card-category">
                  {q.part === 1 ? "Nhà tuyển dụng hỏi" : "Ứng viên hỏi"}
                </span>
              </div>

              <div
                className="card-body"
                onClick={() => {
                  playSpeech(q.question_en, q.id);
                  incrementStudyCount(q.id);
                }}
              >
                <div className="english-wrapper">
                  <h2 className="english-text" style={{ fontSize: "1.45rem", color: "#0f172a" }}>
                    {q.question_en}
                  </h2>
                  <button className="play-button" aria-label="Nghe câu hỏi">
                    {isPlayingQ ? (
                      <span className="playing-animation">🔊</span>
                    ) : (
                      <span className="play-icon">🗣️</span>
                    )}
                  </button>
                </div>

                <p className="vietnamese-text" style={{ fontSize: "1.05rem", color: "#475569", fontWeight: "600" }}>
                  {q.question_vi}
                </p>
              </div>

              {/* Answers Section */}
              {q.answers && q.answers.length > 0 && (
                <div style={{ marginTop: "12px", borderTop: "1px dashed var(--color-border)", paddingTop: "12px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0284c7", textTransform: "uppercase", marginBottom: "8px" }}>
                    💡 Các phương án trả lời gợi ý ({q.answers.length}):
                  </div>
                  <div className="interview-answers-list">
                    {q.answers.map((ans, aIdx) => {
                      const isPlayingA = playingId === `${q.id}_ans_${aIdx}`;
                      return (
                        <div key={aIdx} className="interview-answer-item">
                          <div className="interview-answer-head">
                            <span className="interview-option-badge">
                              Phương án {aIdx + 1}
                            </span>
                            <button
                              className="play-button"
                              style={{ width: "32px", height: "32px", fontSize: "0.95rem" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                playSpeech(ans.answer_en, `${q.id}_ans_${aIdx}`);
                                incrementStudyCount(q.id);
                              }}
                              aria-label="Nghe phương án này"
                            >
                              {isPlayingA ? "🔊" : "🗣️"}
                            </button>
                          </div>

                          <p
                            className="interview-answer-en"
                            onClick={() => {
                              playSpeech(ans.answer_en, `${q.id}_ans_${aIdx}`);
                              incrementStudyCount(q.id);
                            }}
                          >
                            {ans.answer_en}
                          </p>
                          <p className="interview-answer-vi">
                            {ans.answer_vi}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="card-footer">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isLearned}
                    onChange={() => toggleLearned(q.id)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">{isLearned ? "Đã thuộc 🎉" : "Đánh dấu đã thuộc"}</span>
                </label>

                <div className="study-counter" style={{ color: "#0284c7", backgroundColor: "rgba(2, 132, 199, 0.1)" }}>
                  <span className="counter-num">{studyCounts[q.id] || 0}</span>
                </div>
              </div>
            </article>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🏜️</span>
            <p>Không tìm thấy câu hỏi phỏng vấn nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </section>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pagination-btn"
          >
            ← Trang trước
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="pagination-info">Trang</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const p = parseInt(pageInput, 10);
                  if (!isNaN(p)) changePage(p);
                }
              }}
              onBlur={() => {
                const p = parseInt(pageInput, 10);
                if (!isNaN(p)) changePage(p);
                else setPageInput(currentPage.toString());
              }}
              style={{
                width: "56px",
                textAlign: "center",
                padding: "6px 4px",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "0.9rem"
              }}
            />
            <span className="pagination-info">/ {totalPages} ({filteredQuestions.length} câu)</span>
          </div>

          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-btn"
          >
            Trang sau →
          </button>
        </div>
      )}

      <footer className="app-footer">
        <p>💡 Tip: Bấm vào câu hỏi hoặc từng phương án trả lời để nghe phát âm và ngữ điệu trả lời tự nhiên.</p>
      </footer>
    </main>
  );
}

export default function InterviewQAPage() {
  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu phỏng vấn tiếng Anh...</p>
      </div>
    }>
      <InterviewQAContent />
    </Suspense>
  );
}

