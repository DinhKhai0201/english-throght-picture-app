"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import { useSearchParams } from "next/navigation";
import {
  SearchIcon,
  XIcon,
  Volume2Icon,
  RotateCcwIcon,
  BookOpenIcon,
  ListIcon,
  InboxIcon,
  LightbulbIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "../components/Icons";
import { isTextSelected } from "../lib/uiUtils";
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
  "Culture",
];

const ITEMS_PER_PAGE = 40;

function IeltsWordsContent() {
  const searchParams = useSearchParams();

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
  const [studyMode, setStudyMode] = useState(() => {
    if (typeof window !== "undefined") {
      const m = localStorage.getItem("ielts_words_study_mode");
      return m === "lesson" ? "lesson" : "browse";
    }
    return "browse";
  });

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
      const stored = localStorage.getItem("ielts_words_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {}
      }

      const storedCounts = localStorage.getItem("ielts_words_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {}
      }

      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
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
      if (voiceObj) utterance.voice = voiceObj;
    }
    utterance.onstart = () => setPlayingId(id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const filteredWords = useMemo(() => {
    return rawData.filter((item) => {
      const matchesTopic =
        activeTopic === "all" ||
        (item.topics && item.topics.some((t) => t.name.toLowerCase() === activeTopic.toLowerCase()));
      const matchesDifficulty =
        activeDifficulty === "all" ||
        (item.difficulty && item.difficulty.toLowerCase() === activeDifficulty.toLowerCase());
      const isLearned = learnedIds.has(item.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);
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

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE) || 1;

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
        <div className="spinner" />
        <p>Đang tải dữ liệu từ vựng IELTS...</p>
      </div>
    );
  }

  const renderWordCard = (item) => {
    const isLearned = learnedIds.has(item.id);
    const isPlaying = playingId === item.id;
    const topicNames = item.topics ? item.topics.map((t) => t.name).join(", ") : "";

    return (
      <article key={item.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">{item.partOfSpeech || "word"}</span>
          {topicNames && <span className="card-category card-category--truncate">{topicNames}</span>}
          {item.difficulty && (
            <span className={`difficulty-badge difficulty-${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
          )}
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            playSpeech(item.word, item.id);
            incrementStudyCount(item.id);
          }}
        >
          <div className="english-wrapper">
            <div className="word-title-row">
              <h2 className="english-text english-text--word">{item.word}</h2>
              {item.ipa && <span className="word-ipa">{item.ipa}</span>}
            </div>
            <button type="button" className="play-button" aria-label="Nghe phát âm">
              <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
            </button>
          </div>

          <p className="vietnamese-text vietnamese-text--word">{item.meaning}</p>

          {item.exampleSentence && (
            <div
              className="reply-box reply-box-interactive"
              onClick={(e) => {
                e.stopPropagation();
                if (isTextSelected()) return;
                playSpeech(item.exampleSentence, `ex-${item.id}`);
                incrementStudyCount(item.id);
              }}
            >
              <span className="reply-label">Ví dụ</span>
              <span className="reply-text">&quot;{item.exampleSentence}&quot;</span>
              <Volume2Icon size={14} className="reply-audio-icon" />
            </div>
          )}

          {((item.synonyms && item.synonyms.length > 0) || (item.antonyms && item.antonyms.length > 0)) && (
            <div className="lexical-relations">
              {item.synonyms && item.synonyms.length > 0 && (
                <div className="synonyms-box">
                  <span className="relations-label">Đồng nghĩa:</span>
                  {item.synonyms.map((s, idx) => (
                    <span key={idx} className="synonym-tag">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {item.antonyms && item.antonyms.length > 0 && (
                <div className="synonyms-box">
                  <span className="relations-label">Trái nghĩa:</span>
                  {item.antonyms.map((a, idx) => (
                    <span key={idx} className="antonym-tag">
                      {a}
                    </span>
                  ))}
                </div>
              )}
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

          <div className="study-counter" title="Số lần luyện tập">
            <span className="counter-num">{studyCounts[item.id] || 0}</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="container">
      <SectionNav />

      <div className="mode-toggle-strip" role="tablist" aria-label="Chế độ học">
        <button
          type="button"
          className={`mode-toggle-btn ${studyMode === "browse" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("browse");
            localStorage.setItem("ielts_words_study_mode", "browse");
          }}
        >
          <ListIcon size={15} />
          <span>Duyệt tất cả</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${studyMode === "lesson" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("lesson");
            localStorage.setItem("ielts_words_study_mode", "lesson");
          }}
        >
          <BookOpenIcon size={15} />
          <span>Học theo bài (10 từ/bài)</span>
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">IELTS • 3,500+ Academic Words</span>
          <h1>IELTS Word Trainer</h1>
          <p className="hero-subtitle">
            Từ vựng IELTS học thuật phân loại theo chủ đề, cấp độ, phiên âm IPA, ví dụ và từ đồng/trái nghĩa
          </p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học từ vựng IELTS</span>
            <span className="stat-value">
              {learnedCount}/{totalCount} từ ({progressPercent}%)
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-actions">
            <button type="button" onClick={resetProgress} className="btn-reset" title="Xóa toàn bộ tiến trình học">
              <RotateCcwIcon size={14} />
              <span>Reset tiến trình</span>
            </button>
          </div>
        </div>
      </header>

      {studyMode !== "lesson" && (
        <>
          <section className="control-panel">
            <div className="search-box">
              <span className="search-icon">
                <SearchIcon size={16} />
              </span>
              <input
                type="text"
                placeholder="Tìm theo từ, phiên âm IPA, định nghĩa hoặc ví dụ..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => handleSearchChange("")} className="clear-search" aria-label="Xóa tìm kiếm">
                  <XIcon size={15} />
                </button>
              )}
            </div>

            <div className="tts-controls">
              <div className="control-group">
                <label htmlFor="voice-select">Giọng đọc tiếng Anh</label>
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
                <label htmlFor="rate-range">Tốc độ ({speechRate}x)</label>
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

          <section className="categories-nav">
            {POPULAR_TOPICS.map((topicName) => {
              const label = topicName === "all" ? `Tất cả (${totalCount})` : topicName;
              return (
                <button
                  type="button"
                  key={topicName}
                  onClick={() => handleTopicChange(topicName)}
                  className={`category-pill ${activeTopic === topicName ? "active" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </section>

          <div className="filter-difficulty-row">
            <div className="filter-tabs filter-tabs--inline">
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`filter-tab ${filterType === "all" ? "active" : ""}`}
              >
                Tất cả ({filteredWords.length})
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("unlearned")}
                className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
              >
                Chưa học ({rawData.filter((w) => !learnedIds.has(w.id)).length})
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("learned")}
                className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
              >
                Đã thuộc ({learnedIds.size})
              </button>
            </div>

            <div className="difficulty-filter-group">
              <span className="difficulty-filter-label">Cấp độ:</span>
              {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => handleDifficultyChange(lvl)}
                  className={`difficulty-filter-btn ${activeDifficulty === lvl ? "active" : ""}`}
                >
                  {lvl === "all" ? "Tất cả" : lvl}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode items={rawData} storageKey="ielts_words" learnedIds={learnedIds} renderItem={renderWordCard} />
      ) : (
        <section className="sentences-list">
          {paginatedWords.map(renderWordCard)}

          {filteredWords.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">
                <InboxIcon size={36} />
              </span>
              <p>Không tìm thấy từ vựng IELTS nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}
        </section>
      )}

      {totalPages > 1 && studyMode !== "lesson" && (
        <div className="pagination-controls">
          <button
            type="button"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pagination-btn"
          >
            <ArrowLeftIcon size={14} />
            <span>Trang trước</span>
          </button>

          <div className="pagination-jump">
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
              className="pagination-input"
              aria-label="Số trang"
            />
            <span className="pagination-info">
              / {totalPages} ({filteredWords.length} từ)
            </span>
          </div>

          <button
            type="button"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-btn"
          >
            <span>Trang sau</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      )}

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>Tip: Bấm vào từ vựng hoặc câu ví dụ để nghe phát âm và tăng lượt ôn tập.</span>
        </p>
      </footer>
    </main>
  );
}

export default function IeltsWordsPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-screen">
          <div className="spinner" />
          <p>Đang tải dữ liệu từ vựng IELTS...</p>
        </div>
      }
    >
      <IeltsWordsContent />
    </Suspense>
  );
}
