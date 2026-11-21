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
const ITEMS_PER_PAGE = 25;

function HskGrammarContent() {
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

  // Flatten Grammar Cards from hsk_3_0_curriculum.json
  const allGrammar = useMemo(() => {
    const list = [];
    (hskCurriculum.levels || []).forEach((lvl) => {
      const lvlName = lvl.levelName;
      const lvlId = lvl.id;
      (lvl.grammarLessons || []).forEach((gles) => {
        (gles.cards || []).forEach((c, idx) => {
          list.push({
            id: c.id || `${lvlId}-g-${gles.lessonId}-${idx}`,
            title: c.grammar_zh || gles.title_zh,
            pinyin: c.pinyin || "",
            meaning: c.meaning_vi || "",
            partOfSpeech: "Ngữ pháp",
            formula: (c.formula_tokens || []).join(" "),
            formula_tokens: c.formula_tokens || [],
            explanation: c.usage_short_vi || "",
            level: lvlName,
            levelId: lvlId,
            lessonId: gles.lessonId,
            lessonTitle: `${gles.title_zh} (${gles.title_vi})`,
            imageUrl: c.imageUrl || "",
            examples: c.examples || [],
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
  } = useStudyProgress("hsk_grammar", {
    resetConfirmMsg: "Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học ngữ pháp HSK không?",
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

  const [localPlayingId, setLocalPlayingId] = useState(null);
  const activePlayingId = playingId || localPlayingId;
  const setPlayingId = setLocalPlayingId;

  const playAudioOrSpeech = (url, text, id) => {
    if (isAudioMuted()) return;
    playMediaAudio(url, text, id, playSpeech, setPlayingId);
  };

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

  const filteredGrammar = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allGrammar.filter((item) => {
      const matchesLevel = activeLevel === "all" || item.level === activeLevel;
      const isLearned = learnedIds.has(item.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);

      const matchesSearch =
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.pinyin.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.formula.toLowerCase().includes(query) ||
        item.explanation.toLowerCase().includes(query) ||
        (item.examples &&
          item.examples.some(
            (ex) => ex.zh.toLowerCase().includes(query) || ex.vi.toLowerCase().includes(query)
          ));

      return matchesLevel && matchesFilterType && matchesSearch;
    });
  }, [allGrammar, activeLevel, filterType, searchQuery, learnedIds]);

  const totalPages = Math.ceil(filteredGrammar.length / ITEMS_PER_PAGE) || 1;

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

  const paginatedGrammar = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGrammar.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGrammar, currentPage]);

  if (!isLoaded) return <StudyLoading message="Đang tải ngữ pháp HSK 3.0..." />;

  const renderGrammarCard = (item) => {
    const isLearned = learnedIds.has(item.id);
    const isPlaying = activePlayingId === item.id;
    const firstEx = item.examples && item.examples.length > 0 ? item.examples[0] : null;

    return (
      <article
        key={item.id}
        className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}
      >
        <div className="card-top">
          <span className="card-index">Ngữ pháp</span>
          <span className="card-category card-category--truncate">
            Bài {item.lessonId}: {item.lessonTitle}
          </span>
          <span className="difficulty-badge difficulty-advanced">{item.level}</span>
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            if (firstEx) playAudioOrSpeech(firstEx.audioUrl, firstEx.zh, item.id);
            else playSpeech(item.title, item.id);
            incrementStudyCount(item.id);
          }}
        >
          <div className="word-card-main-row">
            <div className="word-text-col">
              <div className="english-wrapper">
                <div className="word-title-row">
                  <h2 className="english-text english-text--word" style={{ color: "#dc2626" }}>
                    {item.title}
                  </h2>
                  {item.pinyin && <span className="word-ipa">{item.pinyin}</span>}
                </div>
                <button type="button" className="play-button" aria-label="Nghe phát âm">
                  <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
                </button>
              </div>

              {item.meaning && (
                <p className="vietnamese-text vietnamese-text--word" style={{ fontWeight: 700 }}>
                  {item.meaning}
                </p>
              )}
            </div>

            {item.imageUrl && (
              <div className="word-thumb-wrap">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="word-thumb-img"
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {item.formula && (
            <div
              style={{
                margin: "10px 0 8px",
                padding: "8px 12px",
                backgroundColor: "var(--color-subtle-bg)",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--color-text-faint)",
                }}
              >
                Cấu trúc:
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--color-text-main)" }}>
                {item.formula}
              </span>
            </div>
          )}

          {item.explanation && (
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.5,
                margin: "6px 0 10px",
              }}
            >
              {item.explanation}
            </p>
          )}

          {firstEx && (
            <div
              className="reply-box reply-box-interactive"
              onClick={(e) => {
                e.stopPropagation();
                if (isTextSelected()) return;
                playAudioOrSpeech(firstEx.audioUrl, firstEx.zh, `ex-${item.id}`);
                incrementStudyCount(item.id);
              }}
            >
              <span className="reply-label">Ví dụ</span>
              <span className="reply-text">&quot;{firstEx.zh}&quot;</span>
              {firstEx.pinyin && (
                <span
                  style={{
                    color: "#dc2626",
                    fontSize: "0.82rem",
                    display: "block",
                    marginTop: "2px",
                    fontWeight: 600,
                  }}
                >
                  {firstEx.pinyin}
                </span>
              )}
              {firstEx.vi && (
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.82rem",
                    display: "block",
                    marginTop: "1px",
                  }}
                >
                  {firstEx.vi}
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
        lessonLabel="Học theo bài (10 điểm/bài)"
      />

      <StudyHeroHeader
        eyebrow="HSK 3.0 • 125 Bài Học & 714 Cấu Trúc Ngữ Pháp"
        title="HSK Grammar Mastery (HSK 1 - 5)"
        subtitle="125 bài học ngữ pháp HSK 1 đến HSK 5 với công thức cấu trúc câu, phân tích cách dùng, ví dụ thực tế và audio phát âm chuẩn."
        statLabel="Tiến trình học ngữ pháp HSK"
        learnedCount={learnedIds.size}
        totalCount={allGrammar.length}
        unitLabel="điểm"
        onReset={resetProgress}
      />

      {studyMode !== "lesson" && (
        <>
          <StudyControlPanel
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên ngữ pháp, cấu trúc, ý nghĩa hoặc ví dụ..."
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
                  ? `Tất cả (${allGrammar.length})`
                  : `${lvl} (${allGrammar.filter((g) => g.level === lvl).length})`;
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
              allCount={filteredGrammar.length}
              unlearnedCount={allGrammar.filter((g) => !learnedIds.has(g.id)).length}
              learnedCount={learnedIds.size}
              inline
            />
          </div>
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode
          items={filteredGrammar}
          storageKey="hsk_grammar"
          learnedIds={learnedIds}
          renderItem={renderGrammarCard}
          lessonSize={10}
        />
      ) : (
        <section className="sentences-list">
          {paginatedGrammar.map(renderGrammarCard)}
          {filteredGrammar.length === 0 && (
            <StudyEmptyState message="Không tìm thấy cấu trúc ngữ pháp HSK nào phù hợp với bộ lọc hiện tại." />
          )}
        </section>
      )}

      {studyMode !== "lesson" && (
        <StudyPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredGrammar.length}
          unitLabel="điểm"
          pageInput={pageInput}
          setPageInput={setPageInput}
          onChangePage={changePage}
        />
      )}

      <StudyFooterTip text="Tip: Bấm vào cấu trúc ngữ pháp hoặc câu ví dụ để nghe phát âm và tăng lượt ôn tập." />
    </main>
  );
}

export default function HskGrammarPage() {
  return (
    <Suspense fallback={<StudyLoading message="Đang tải ngữ pháp HSK 3.0..." />}>
      <HskGrammarContent />
    </Suspense>
  );
}
