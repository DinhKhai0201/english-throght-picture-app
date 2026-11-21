"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import { useSearchParams } from "next/navigation";
import { Volume2Icon } from "../components/Icons";
import { isTextSelected, isAudioMuted, playMediaAudio } from "../lib/uiUtils";
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
import hskCurriculum from "../../hsk_3_0_curriculum.json";

const HSK_LEVELS = ["all", "HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5"];
const ITEMS_PER_PAGE = 30;

function HskWordsContent() {
  const searchParams = useSearchParams();

  const initialLevel = searchParams.get("level") || "all";
  const initialFilter = searchParams.get("filter") || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialPage = useMemo(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const [activeLevel, setActiveLevel] = useState(initialLevel);
  const [filterType, setFilterType] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(initialPage.toString());

  // Flatten Vocab from hsk_3_0_curriculum.json
  const allWords = useMemo(() => {
    const list = [];
    (hskCurriculum.levels || []).forEach((lvl) => {
      const lvlName = lvl.levelName;
      const lvlId = lvl.id;
      (lvl.vocabLessons || []).forEach((vles) => {
        (vles.words || []).forEach((w) => {
          list.push({
            id: w.id,
            word: w.word,
            pinyin: w.pinyin,
            meaning: w.meaning,
            partOfSpeech: w.partOfSpeech || "Từ vựng",
            level: lvlName,
            levelId: lvlId,
            lessonId: vles.lessonId,
            lessonTitle: vles.title_vi,
            exampleSentence: w.example || "",
            examplePinyin: w.examplePinyin || "",
            exampleTranslation: w.exampleTranslation || "",
            audioUrl: w.audioUrl || "",
            exampleAudioUrl: w.exampleAudioUrl || "",
            imageUrl: w.imageUrl || "",
          });
        });
      });
    });
    return list;
  }, []);

  const {
    learnedIds,
    studyCounts,
    studyMode,
    switchStudyMode,
    isLoaded,
    toggleLearned,
    incrementStudyCount,
    resetProgress,
  } = useStudyProgress("hsk_words", {
    resetConfirmMsg: "Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học từ vựng HSK không?",
  });

  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    playingId,
    playSpeech,
  } = useSpeechSynthesis({ lang: "zh-CN", defaultRate: 0.85 });

  const playWordAudio = (url, text, id) => {
    if (isAudioMuted()) return;
    playMediaAudio(url, text, id, playSpeech, setPlayingId);
  };

  const [localPlayingId, setLocalPlayingId] = useState(null);
  const activePlayingId = playingId || localPlayingId;
  const setPlayingId = setLocalPlayingId;

  const updateUrl = (overrides = {}) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    const level = overrides.level !== undefined ? overrides.level : activeLevel;
    const filter = overrides.filter !== undefined ? overrides.filter : filterType;
    const q = overrides.q !== undefined ? overrides.q : searchQuery;
    const page = overrides.page !== undefined ? overrides.page : currentPage;

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
    const lvl = searchParams.get("level") || "all";
    const f = searchParams.get("filter") || "all";
    const q = searchParams.get("q") || "";
    const p = parseInt(searchParams.get("page") || "1", 10);
    const validP = isNaN(p) || p < 1 ? 1 : p;

    setActiveLevel(lvl);
    setFilterType(f);
    setSearchQuery(q);
    setCurrentPage(validP);
    setPageInput(validP.toString());
  }, [searchParams]);

  const handleLevelChange = (level) => {
    setActiveLevel(level);
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
    return allWords.filter((item) => {
      const matchesLevel = activeLevel === "all" || item.level === activeLevel;
      const isLearned = learnedIds.has(item.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);

      const matchesSearch =
        query === "" ||
        item.word.toLowerCase().includes(query) ||
        item.pinyin.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.exampleSentence.toLowerCase().includes(query);

      return matchesLevel && matchesFilterType && matchesSearch;
    });
  }, [allWords, activeLevel, filterType, searchQuery, learnedIds]);

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

  if (!isLoaded) return <StudyLoading message="Đang tải từ vựng HSK 3.0..." />;

  const renderWordCard = (item) => {
    const isLearned = learnedIds.has(item.id);
    const isPlaying = activePlayingId === item.id;

    return (
      <article
        key={item.id}
        className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}
      >
        <div className="card-top">
          <span className="card-index">{item.partOfSpeech || "Từ vựng"}</span>
          <span className="card-category card-category--truncate">
            Bài {item.lessonId}: {item.lessonTitle}
          </span>
          <span className="difficulty-badge difficulty-intermediate">{item.level}</span>
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            playWordAudio(item.audioUrl, item.word, item.id);
            incrementStudyCount(item.id);
          }}
        >
          <div className="word-card-main-row">
            <div className="word-text-col">
              <div className="english-wrapper">
                <div className="word-title-row">
                  <h2 className="english-text english-text--word">{item.word}</h2>
                  {item.pinyin && <span className="word-ipa">{item.pinyin}</span>}
                </div>
                <button type="button" className="play-button" aria-label="Nghe phát âm">
                  <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
                </button>
              </div>

              <p className="vietnamese-text vietnamese-text--word">{item.meaning}</p>
            </div>

            {item.imageUrl && (
              <div className="word-thumb-wrap">
                <img
                  src={item.imageUrl}
                  alt={item.word}
                  loading="lazy"
                  className="word-thumb-img"
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {item.exampleSentence && (
            <div
              className="reply-box reply-box-interactive"
              onClick={(e) => {
                e.stopPropagation();
                if (isTextSelected()) return;
                playWordAudio(item.exampleAudioUrl, item.exampleSentence, `ex-${item.id}`);
                incrementStudyCount(item.id);
              }}
            >
              <span className="reply-label">Ví dụ</span>
              <span className="reply-text">&quot;{item.exampleSentence}&quot;</span>
              {item.examplePinyin && (
                <span className="example-pinyin-line">
                  {item.examplePinyin}
                </span>
              )}
              {item.exampleTranslation && (
                <span className="example-trans-line">
                  {item.exampleTranslation}
                </span>
              )}
              <Volume2Icon size={14} className="reply-audio-icon" />
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
        lessonLabel="Học theo bài (15 từ/bài)"
      />

      <StudyHeroHeader
        eyebrow="HSK 3.0 • 3,600+ Từ Vựng HSK 1 - 5"
        title="HSK Word Trainer (HSK 1 - 5)"
        subtitle="3.600 từ vựng HSK 1 đến HSK 5 phân loại theo bài học chuyên đề, chữ Hán, Pinyin, nghĩa tiếng Việt, ví dụ và phát âm audio bản xứ."
        statLabel="Tiến trình học từ vựng HSK"
        learnedCount={learnedIds.size}
        totalCount={allWords.length}
        unitLabel="từ"
        onReset={resetProgress}
      />

      {studyMode !== "lesson" && (
        <>
          <StudyControlPanel
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo chữ Hán, Pinyin, nghĩa tiếng Việt hoặc ví dụ..."
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            voiceLabel="Giọng đọc tiếng Trung"
            speechRate={speechRate}
            onRateChange={setSpeechRate}
          />

          <section className="categories-nav">
            {HSK_LEVELS.map((lvl) => {
              const label =
                lvl === "all"
                  ? `Tất cả (${allWords.length})`
                  : `${lvl} (${allWords.filter((w) => w.level === lvl).length})`;
              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`category-pill ${activeLevel === lvl ? "active" : ""}`}
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
              unlearnedCount={allWords.filter((w) => !learnedIds.has(w.id)).length}
              learnedCount={learnedIds.size}
              inline
            />
          </div>
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode
          items={filteredWords}
          storageKey="hsk_words"
          learnedIds={learnedIds}
          renderItem={renderWordCard}
          lessonSize={15}
        />
      ) : (
        <section className="sentences-list">
          {paginatedWords.map(renderWordCard)}
          {filteredWords.length === 0 && (
            <StudyEmptyState message="Không tìm thấy từ vựng HSK nào phù hợp với bộ lọc hiện tại." />
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

      <StudyFooterTip text="Tip: Bấm vào chữ Hán hoặc câu ví dụ để nghe phát âm và tăng lượt ôn tập." />
    </main>
  );
}

export default function HskWordsPage() {
  return (
    <Suspense fallback={<StudyLoading message="Đang tải từ vựng HSK 3.0..." />}>
      <HskWordsContent />
    </Suspense>
  );
}
