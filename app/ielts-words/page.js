"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import { useSearchParams } from "next/navigation";
import { Volume2Icon } from "../components/Icons";
import { isTextSelected } from "../lib/uiUtils";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useStudyProgress } from "../hooks/useStudyProgress";
import {
  StudyLoading,
  StudyModeStrip,
  StudyHeroHeader,
  StudyControlPanel,
  StudyFilterTabs,
  StudyCardFooter,
  StudyEmptyState,
  StudyFooterTip,
  StudyPagination,
} from "../components/study/StudyLayoutParts";
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

  const {
    learnedIds,
    studyCounts,
    studyMode,
    switchStudyMode,
    isLoaded,
    toggleLearned,
    incrementStudyCount,
    resetProgress,
  } = useStudyProgress("ielts_words", {
    resetConfirmMsg: "Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học từ vựng IELTS không?",
  });

  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    playingId,
    playSpeech,
  } = useSpeechSynthesis({ lang: "en-US", defaultRate: 0.9 });

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

  const filteredWords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
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
    if (currentPage > totalPages && totalPages > 0) {
      changePage(1, totalPages);
    }
  }, [totalPages]);

  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredWords, currentPage]);

  if (!isLoaded) return <StudyLoading message="Đang tải dữ liệu từ vựng IELTS..." />;

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

        <StudyCardFooter
          isLearned={isLearned}
          onToggleLearned={() => toggleLearned(item.id)}
          studyCount={studyCounts[item.id] || 0}
        />
      </article>
    );
  };

  return (
    <main className="container">
      <SectionNav />

      <StudyModeStrip
        mode={studyMode}
        onChange={switchStudyMode}
        browseLabel="Duyệt tất cả"
        lessonLabel="Học theo bài (10 từ/bài)"
      />

      <StudyHeroHeader
        eyebrow="IELTS • 3,500+ Academic Words"
        title="IELTS Word Trainer"
        subtitle="Từ vựng IELTS học thuật phân loại theo chủ đề, cấp độ, phiên âm IPA, ví dụ và từ đồng/trái nghĩa"
        statLabel="Tiến trình học từ vựng IELTS"
        learnedCount={learnedIds.size}
        totalCount={rawData.length}
        unitLabel="từ"
        onReset={resetProgress}
      />

      {studyMode !== "lesson" && (
        <>
          <StudyControlPanel
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo từ, phiên âm IPA, định nghĩa hoặc ví dụ..."
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            voiceLabel="Giọng đọc tiếng Anh"
            speechRate={speechRate}
            onRateChange={setSpeechRate}
          />

          <section className="categories-nav">
            {POPULAR_TOPICS.map((topicName) => {
              const label = topicName === "all" ? `Tất cả (${rawData.length})` : topicName;
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
            <StudyFilterTabs
              filterType={filterType}
              onFilterChange={handleFilterChange}
              allCount={filteredWords.length}
              unlearnedCount={rawData.filter((w) => !learnedIds.has(w.id)).length}
              learnedCount={learnedIds.size}
              inline
            />

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
            <StudyEmptyState message="Không tìm thấy từ vựng IELTS nào phù hợp với bộ lọc hiện tại." />
          )}
        </section>
      )}

      {studyMode !== "lesson" && (
        <StudyPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredWords.length}
          unitLabel="từ"
          pageInput={pageInput}
          setPageInput={setPageInput}
          onChangePage={changePage}
        />
      )}

      <StudyFooterTip text="Tip: Bấm vào từ vựng hoặc câu ví dụ để nghe phát âm và tăng lượt ôn tập." />
    </main>
  );
}

export default function IeltsWordsPage() {
  return (
    <Suspense fallback={<StudyLoading message="Đang tải dữ liệu từ vựng IELTS..." />}>
      <IeltsWordsContent />
    </Suspense>
  );
}
