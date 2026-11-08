"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import rawData from "../../ielts_vocabulary.json";

const POPULAR_TOPICS = [
  "all",
  "General English",
  "Science",
  "Business",
  "Education",
  "Law",
  "Society",
  "Work",
  "Character",
  "Health",
  "Economics",
  "Arts",
  "Psychology",
  "Technology",
  "Communication",
  "Nature",
  "History",
  "Geography",
  "Environment",
  "Culture"
];

const ITEMS_PER_PAGE = 40;

function IeltsWordsContent() {
  const searchParams = useSearchParams();

  // Read initial states from URL query params
  const initialTopic = searchParams.get("topic") || "all";
  const initialDifficulty = searchParams.get("level") || "all";
  const initialFilter = searchParams.get("filter") || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialPage = useMemo(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const [activeTopic, setActiveTopic] = useState(initialTopic);
  const [activeDifficulty, setActiveDifficulty] = useState(initialDifficulty);
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

  // Helper to sync all filter states to URL query params
  const updateUrl = (overrides = {}) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    const topic = overrides.topic !== undefined ? overrides.topic : activeTopic;
    const level = overrides.level !== undefined ? overrides.level : activeDifficulty;
    const filter = overrides.filter !== undefined ? overrides.filter : filterType;
    const q = overrides.q !== undefined ? overrides.q : searchQuery;
    const page = overrides.page !== undefined ? overrides.page : currentPage;

    if (!topic || topic === "all") url.searchParams.delete("topic");
    else url.searchParams.set("topic", topic);

    if (!level || level === "all") url.searchParams.delete("level");
    else url.searchParams.set("level", level);

    if (!filter || filter === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", filter);

    if (!q || !q.trim()) url.searchParams.delete("q");
    else url.searchParams.set("q", q.trim());

    if (!page || page <= 1) url.searchParams.delete("page");
    else url.searchParams.set("page", page.toString());

    window.history.replaceState(null, "", url.toString());
  };

  // Synchronize state when user clicks browser Back/Forward
  useEffect(() => {
    const t = searchParams.get("topic") || "all";
    const lvl = searchParams.get("level") || "all";
    const f = searchParams.get("filter") || "all";
    const q = searchParams.get("q") || "";
    const p = parseInt(searchParams.get("page") || "1", 10);
    const validP = isNaN(p) || p < 1 ? 1 : p;

    setActiveTopic(t);
    setActiveDifficulty(lvl);
    setFilterType(f);
    setSearchQuery(q);
    setCurrentPage(validP);
    setPageInput(validP.toString());
  }, [searchParams]);

  // Handlers that update state and synchronize URL
  const handleTopicChange = (topic) => {
    setActiveTopic(topic);
    setCurrentPage(1);
    setPageInput("1");
    updateUrl({ topic, page: 1 });
  };

  const handleDifficultyChange = (level) => {
    setActiveDifficulty(level);
    setCurrentPage(1);
    setPageInput("1");
    updateUrl({ level, page: 1 });
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
      const stored = localStorage.getItem("ielts_words_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {
          console.error("Error loading ielts progress", e);
        }
      }

      const storedCounts = localStorage.getItem("ielts_words_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {
          console.error("Error loading ielts study counts", e);
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
    localStorage.setItem("ielts_words_progress", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("ielts_words_study_counts", JSON.stringify(next));
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học từ vựng IELTS không?")) {
      setLearnedIds(new Set());
      setStudyCounts({});
      localStorage.removeItem("ielts_words_progress");
      localStorage.removeItem("ielts_words_study_counts");
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

  // Filter words
  const filteredWords = useMemo(() => {
    return rawData.filter((item) => {
      // Filter topic
      const matchesTopic =
        activeTopic === "all" ||
        (item.topics && item.topics.some((t) => t.name.toLowerCase() === activeTopic.toLowerCase()));

      // Filter difficulty
      const matchesDifficulty =
        activeDifficulty === "all" ||
        (item.difficulty && item.difficulty.toLowerCase() === activeDifficulty.toLowerCase());

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
        item.word.toLowerCase().includes(query) ||
        (item.ipa && item.ipa.toLowerCase().includes(query)) ||
        (item.meaning && item.meaning.toLowerCase().includes(query)) ||
        (item.synonyms && item.synonyms.some((s) => s.toLowerCase().includes(query))) ||
        (item.exampleSentence && item.exampleSentence.toLowerCase().includes(query));

      return matchesTopic && matchesDifficulty && matchesFilterType && matchesSearch;
    });
  }, [activeTopic, activeDifficulty, filterType, searchQuery, learnedIds]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE) || 1;

  // If current page exceeds totalPages due to filters, adjust
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      changePage(1, totalPages);
    }
  }, [totalPages]);

  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredWords, currentPage]);

  const totalCount = rawData.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu từ vựng IELTS...</p>
      </div>
    );
  }

  return (
    <main className="container">
      {/* Multi-Section Navigation Bar */}
      <nav className="section-nav-bar">
        <Link href="/" className="section-nav-link">
          🏠 Trang chủ
        </Link>
        <Link href="/english-300" className="section-nav-link">
          ⚡ 300 Câu Giao Tiếp
        </Link>
        <Link href="/chunks" className="section-nav-link">
          🧩 1000 Chunks Tiếng Anh
        </Link>
        <Link href="/ielts-words" className="section-nav-link active-ielts">
          🎯 IELTS Word Trainer
        </Link>
        <Link href="/chinese" className="section-nav-link">
          🇨🇳 500 Chunks Tiếng Trung
        </Link>
        <Link href="/japanese" className="section-nav-link">
          🇯🇵 300 Chunks Tiếng Nhật
        </Link>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1 style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🎯 IELTS Word Trainer (3,500+ Words)
          </h1>
          <p className="hero-subtitle">
            Bộ từ vựng IELTS học thuật phân loại theo chủ đề, cấp độ, phiên âm IPA, câu ví dụ và từ đồng/trái nghĩa
          </p>
        </div>

        {/* Progress Card */}
        <div className="progress-card" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3)" }}>
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học từ vựng IELTS</span>
            <span className="stat-value">{learnedCount}/{totalCount} từ ({progressPercent}%)</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: "#fef3c7" }}></div>
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
            placeholder="Tìm theo từ, phiên âm IPA, định nghĩa hoặc ví dụ..."
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

      {/* Topic Filters */}
      <section className="categories-nav">
        {POPULAR_TOPICS.map((topicName) => {
          const label = topicName === "all" ? `📂 Tất cả (${totalCount})` : topicName;
          return (
            <button
              key={topicName}
              onClick={() => handleTopicChange(topicName)}
              className={`category-pill ${activeTopic === topicName ? "active" : ""}`}
              style={activeTopic === topicName ? { backgroundColor: "#f59e0b", borderColor: "#f59e0b" } : {}}
            >
              {label}
            </button>
          );
        })}
      </section>

      {/* Filter Tabs & Difficulty Selector */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div className="filter-tabs" style={{ marginBottom: "0", borderBottom: "none" }}>
          <button
            onClick={() => handleFilterChange("all")}
            className={`filter-tab ${filterType === "all" ? "active" : ""}`}
            style={filterType === "all" ? { color: "#d97706" } : {}}
          >
            🎯 Tất cả ({filteredWords.length})
          </button>
          <button
            onClick={() => handleFilterChange("unlearned")}
            className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
            style={filterType === "unlearned" ? { color: "#d97706" } : {}}
          >
            📖 Chưa học ({rawData.filter((w) => !learnedIds.has(w.id)).length})
          </button>
          <button
            onClick={() => handleFilterChange("learned")}
            className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
            style={filterType === "learned" ? { color: "#d97706" } : {}}
          >
            ✅ Đã thuộc ({learnedIds.size})
          </button>
        </div>

        {/* Difficulty filter buttons */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-muted)" }}>Cấp độ:</span>
          {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleDifficultyChange(lvl)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: activeDifficulty === lvl ? "1px solid #d97706" : "1px solid var(--color-border)",
                backgroundColor: activeDifficulty === lvl ? "#fef3c7" : "var(--color-card-bg)",
                color: activeDifficulty === lvl ? "#b45309" : "var(--color-text-muted)",
                fontWeight: "700",
                fontSize: "0.8rem",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {lvl === "all" ? "Tất cả" : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Words List */}
      <section className="sentences-list">
        {paginatedWords.map((item) => {
          const isLearned = learnedIds.has(item.id);
          const isPlaying = playingId === item.id;
          const topicNames = item.topics ? item.topics.map((t) => t.name).join(", ") : "";

          return (
            <article
              key={item.id}
              className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}
              style={isPlaying ? { borderColor: "#f59e0b" } : {}}
            >
              <div className="card-top">
                <span className="card-index" style={{ color: "#d97706", backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
                  {item.partOfSpeech || "word"}
                </span>
                {topicNames && (
                  <span className="card-category" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {topicNames}
                  </span>
                )}
                {item.difficulty && (
                  <span className={`difficulty-badge difficulty-${item.difficulty.toLowerCase()}`}>
                    {item.difficulty}
                  </span>
                )}
              </div>

              <div
                className="card-body"
                onClick={() => {
                  playSpeech(item.word, item.id);
                  incrementStudyCount(item.id);
                }}
              >
                <div className="english-wrapper">
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                      <h2 className="english-text" style={{ fontSize: "1.7rem" }}>{item.word}</h2>
                      {item.ipa && (
                        <span style={{ fontSize: "1.1rem", color: "#d97706", fontWeight: "600", letterSpacing: "0.02em" }}>
                          {item.ipa}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="play-button" aria-label="Nghe phát âm">
                    {isPlaying ? (
                      <span className="playing-animation">🔊</span>
                    ) : (
                      <span className="play-icon">🗣️</span>
                    )}
                  </button>
                </div>

                <p className="vietnamese-text" style={{ color: "#334155", fontWeight: "600", fontSize: "1.05rem" }}>
                  {item.meaning}
                </p>

                {/* Example sentence */}
                {item.exampleSentence && (
                  <div
                    className="reply-box"
                    style={{ cursor: "pointer", borderLeftColor: "#f59e0b" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playSpeech(item.exampleSentence, `ex-${item.id}`);
                      incrementStudyCount(item.id);
                    }}
                  >
                    <span className="reply-label" style={{ color: "#b45309" }}>Ví dụ:</span>
                    <span className="reply-text" style={{ color: "#92400e" }}>
                      &quot;{item.exampleSentence}&quot; 🗣️
                    </span>
                  </div>
                )}

                {/* Synonyms & Antonyms */}
                {(item.synonyms && item.synonyms.length > 0) || (item.antonyms && item.antonyms.length > 0) ? (
                  <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {item.synonyms && item.synonyms.length > 0 && (
                      <div className="synonyms-box">
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>Đồng nghĩa:</span>
                        {item.synonyms.map((s, idx) => (
                          <span key={idx} className="synonym-tag">{s}</span>
                        ))}
                      </div>
                    )}
                    {item.antonyms && item.antonyms.length > 0 && (
                      <div className="synonyms-box">
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>Trái nghĩa:</span>
                        {item.antonyms.map((a, idx) => (
                          <span key={idx} className="antonym-tag">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="card-footer">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isLearned}
                    onChange={() => toggleLearned(item.id)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">{isLearned ? "Đã thuộc 🎉" : "Đánh dấu đã thuộc"}</span>
                </label>

                <div className="study-counter" style={{ color: "#d97706", backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
                  <span className="counter-num">{studyCounts[item.id] || 0}</span>
                </div>
              </div>
            </article>
          );
        })}

        {filteredWords.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🏜️</span>
            <p>Không tìm thấy từ vựng IELTS nào phù hợp với bộ lọc hiện tại.</p>
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
            <span className="pagination-info">/ {totalPages} ({filteredWords.length} từ)</span>
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
        <p>💡 Tip: Bấm vào từ vựng để nghe phát âm, bấm vào câu ví dụ để nghe ngữ điệu hoàn chỉnh.</p>
      </footer>
    </main>
  );
}

export default function IeltsWordsPage() {
  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu từ vựng IELTS...</p>
      </div>
    }>
      <IeltsWordsContent />
    </Suspense>
  );
}
