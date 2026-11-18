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
import rawData from "../../interview_500_qa.json";

const ITEMS_PER_PAGE = 15;

function InterviewQAContent() {
  const searchParams = useSearchParams();

  const allQuestions = useMemo(() => {
    const list = [];
    if (rawData.parts) {
      rawData.parts.forEach((p) => {
        if (p.questions) list.push(...p.questions);
      });
    }
    return list;
  }, []);

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

  const {
    learnedIds,
    studyCounts,
    studyMode,
    switchStudyMode,
    isLoaded,
    toggleLearned,
    incrementStudyCount,
    resetProgress,
  } = useStudyProgress("interview_qa", {
    resetConfirmMsg: "Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học phỏng vấn không?",
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

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allQuestions.filter((item) => {
      const matchesPart =
        activePart === "all" ||
        (activePart === "1" && item.part === 1) ||
        (activePart === "2" && item.part === 2);

      const isLearned = learnedIds.has(item.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);

      const matchesSearch =
        query === "" ||
        item.question_en.toLowerCase().includes(query) ||
        item.question_vi.toLowerCase().includes(query) ||
        (item.answers &&
          item.answers.some(
            (a) => a.answer_en.toLowerCase().includes(query) || a.answer_vi.toLowerCase().includes(query)
          ));

      return matchesPart && matchesFilterType && matchesSearch;
    });
  }, [allQuestions, activePart, filterType, searchQuery, learnedIds]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE) || 1;

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

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  if (!isLoaded) return <StudyLoading message="Đang tải dữ liệu phỏng vấn tiếng Anh..." />;

  const renderQuestionCard = (q) => {
    const isLearned = learnedIds.has(q.id);
    const isPlayingQ = playingId === q.id;
    return (
      <article key={q.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlayingQ ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">
            {q.part === 1 ? `Phần 1 • Câu ${q.question_number}` : `Phần 2 • Câu ${q.question_number}`}
          </span>
          <span className="card-category">{q.part === 1 ? "Nhà tuyển dụng hỏi" : "Ứng viên hỏi"}</span>
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            playSpeech(q.question_en, q.id);
            incrementStudyCount(q.id);
          }}
        >
          <div className="english-wrapper">
            <h2 className="english-text english-text--question">{q.question_en}</h2>
            <button type="button" className="play-button" aria-label="Nghe câu hỏi">
              <Volume2Icon size={18} className={isPlayingQ ? "playing-animation" : ""} />
            </button>
          </div>
          <p className="vietnamese-text vietnamese-text--question">{q.question_vi}</p>
        </div>

        {q.answers && q.answers.length > 0 && (
          <div className="interview-answers-section">
            <div className="interview-answers-heading">
              {q.answers.length > 1
                ? `Các phương án trả lời gợi ý (${q.answers.length})`
                : "Câu trả lời mẫu (Web Developer)"}
            </div>
            <div className="interview-answers-list">
              {q.answers.map((ans, aIdx) => {
                const isPlayingA = playingId === `${q.id}_ans_${aIdx}`;
                return (
                  <div key={aIdx} className="interview-answer-item">
                    <div className="interview-answer-head">
                      <span className="interview-option-badge">
                        {q.answers.length > 1 ? `Phương án ${aIdx + 1}` : "Web Developer Answer"}
                      </span>
                      <button
                        type="button"
                        className={`play-button play-button--sm ${isPlayingA ? "playing" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          playSpeech(ans.answer_en, `${q.id}_ans_${aIdx}`);
                          incrementStudyCount(q.id);
                        }}
                        aria-label="Nghe câu trả lời này"
                      >
                        <Volume2Icon size={15} className={isPlayingA ? "playing-animation" : ""} />
                      </button>
                    </div>
                    <p
                      className="interview-answer-en"
                      onClick={() => {
                        if (isTextSelected()) return;
                        playSpeech(ans.answer_en, `${q.id}_ans_${aIdx}`);
                        incrementStudyCount(q.id);
                      }}
                    >
                      {ans.answer_en}
                    </p>
                    <p className="interview-answer-vi">{ans.answer_vi}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <StudyCardFooter
          isLearned={isLearned}
          onToggleLearned={() => toggleLearned(q.id)}
          studyCount={studyCounts[q.id] || 0}
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
        lessonLabel="Học theo bài (10 câu/bài)"
      />

      <StudyHeroHeader
        eyebrow="DEV • Technical & Behavioral Q&A"
        title="Phỏng Vấn Web Developer"
        subtitle="Câu hỏi phỏng vấn tiếng Anh thực chiến kèm phương án trả lời mẫu cho Web Developer"
        statLabel="Tiến trình học phỏng vấn"
        learnedCount={learnedIds.size}
        totalCount={allQuestions.length}
        unitLabel="câu hỏi"
        onReset={resetProgress}
      />

      {studyMode !== "lesson" && (
        <>
          <StudyControlPanel
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo câu hỏi, câu trả lời tiếng Anh hoặc tiếng Việt..."
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            voiceLabel="Giọng đọc tiếng Anh"
            speechRate={speechRate}
            onRateChange={setSpeechRate}
          />

          <section className="categories-nav">
            <button
              type="button"
              onClick={() => handlePartChange("all")}
              className={`category-pill ${activePart === "all" ? "active" : ""}`}
            >
              Tất cả ({allQuestions.length} câu hỏi)
            </button>
            <button
              type="button"
              onClick={() => handlePartChange("1")}
              className={`category-pill ${activePart === "1" ? "active" : ""}`}
            >
              Phần I: Nhà tuyển dụng hỏi ({rawData.parts[0]?.questions.length || 128})
            </button>
            <button
              type="button"
              onClick={() => handlePartChange("2")}
              className={`category-pill ${activePart === "2" ? "active" : ""}`}
            >
              Phần II: Ứng viên hỏi ({rawData.parts[1]?.questions.length || 27})
            </button>
          </section>

          <StudyFilterTabs
            filterType={filterType}
            onFilterChange={handleFilterChange}
            allCount={filteredQuestions.length}
            unlearnedCount={allQuestions.filter((q) => !learnedIds.has(q.id)).length}
            learnedCount={learnedIds.size}
          />
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode items={allQuestions} storageKey="interview_qa" learnedIds={learnedIds} renderItem={renderQuestionCard} />
      ) : (
        <section className="sentences-list">
          {paginatedQuestions.map(renderQuestionCard)}
          {filteredQuestions.length === 0 && (
            <StudyEmptyState message="Không tìm thấy câu hỏi phỏng vấn nào phù hợp với bộ lọc hiện tại." />
          )}
        </section>
      )}

      {studyMode !== "lesson" && (
        <StudyPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredQuestions.length}
          unitLabel="câu"
          pageInput={pageInput}
          setPageInput={setPageInput}
          onChangePage={changePage}
        />
      )}

      <StudyFooterTip text="Tip: Bấm vào câu hỏi hoặc câu trả lời mẫu để nghe phát âm và ngữ điệu trả lời tự nhiên." />
    </main>
  );
}

export default function InterviewQAPage() {
  return (
    <Suspense fallback={<StudyLoading message="Đang tải dữ liệu phỏng vấn tiếng Anh..." />}>
      <InterviewQAContent />
    </Suspense>
  );
}
