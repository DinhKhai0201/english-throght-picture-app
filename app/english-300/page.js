"use client";

import { useState, useMemo } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
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
} from "../components/study/StudyLayoutParts";
import rawData from "../../300_cau_tieng_anh_giao_tiep.json";

const CATEGORY_MAP = {
  greetings: "Chào hỏi",
  introductions: "Giới thiệu bản thân",
  basic_responses: "Phản hồi cơ bản",
  clarification: "Hỏi lại & Làm rõ",
  daily_life: "Đời sống hàng ngày",
  work: "Công việc & Học tập",
  food: "Ăn uống & Nhà hàng",
  shopping: "Mua sắm",
  travel: "Đi lại & Du lịch",
  social: "Giao tiếp xã hội",
  phone_and_emergency: "Điện thoại & Khẩn cấp",
};

export default function English300Page() {
  const sentences = rawData.sentences || [];
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const {
    learnedIds,
    studyCounts,
    studyMode,
    switchStudyMode,
    isLoaded,
    toggleLearned,
    incrementStudyCount,
    resetProgress,
  } = useStudyProgress("english_300");

  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    playingId,
    playSpeech,
  } = useSpeechSynthesis({ lang: "en-US", defaultRate: 0.9 });

  const filteredSentences = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sentences.filter((s) => {
      const matchesCategory = activeCategory === "all" || s.category === activeCategory;
      const isLearned = learnedIds.has(s.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);
      const matchesSearch =
        q === "" ||
        s.english.toLowerCase().includes(q) ||
        s.vietnamese.toLowerCase().includes(q) ||
        (s.suggested_reply && s.suggested_reply.toLowerCase().includes(q));
      return matchesCategory && matchesFilterType && matchesSearch;
    });
  }, [sentences, activeCategory, learnedIds, filterType, searchQuery]);

  if (!isLoaded) return <StudyLoading />;

  const renderSentenceCard = (s) => {
    const isLearned = learnedIds.has(s.id);
    const isPlaying = playingId === s.id;
    return (
      <article key={s.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{s.id}</span>
          <span className="card-category">{CATEGORY_MAP[s.category] || s.category}</span>
          {s.level && <span className="card-level">{s.level}</span>}
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            playSpeech(s.english, s.id);
            incrementStudyCount(s.id);
          }}
        >
          <div className="english-wrapper">
            <h2 className="english-text">{s.english}</h2>
            <button type="button" className="play-button" aria-label="Nghe phát âm">
              <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
            </button>
          </div>
          <p className="vietnamese-text">{s.vietnamese}</p>
          {s.suggested_reply && (
            <div
              className="reply-box reply-box-interactive"
              onClick={(e) => {
                e.stopPropagation();
                if (isTextSelected()) return;
                playSpeech(s.suggested_reply, `reply-${s.id}`);
                incrementStudyCount(s.id);
              }}
            >
              <span className="reply-label">Gợi ý đáp</span>
              <span className="reply-text">{s.suggested_reply}</span>
              <Volume2Icon size={14} className="reply-audio-icon" />
            </div>
          )}
        </div>

        <StudyCardFooter
          isLearned={isLearned}
          onToggleLearned={() => toggleLearned(s.id)}
          studyCount={studyCounts[s.id] || 0}
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
        eyebrow="EN • Giao tiếp nền tảng"
        title="300 Câu Giao Tiếp Cốt Lõi"
        subtitle="Bấm vào câu tiếng Anh để nghe phát âm bản xứ và theo dõi lượt luyện tập"
        statLabel="Tiến trình học của bạn"
        learnedCount={learnedIds.size}
        totalCount={sentences.length}
        unitLabel="câu"
        onReset={resetProgress}
      />

      {studyMode !== "lesson" && (
        <>
          <StudyControlPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Tìm kiếm theo tiếng Anh hoặc tiếng Việt..."
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            speechRate={speechRate}
            onRateChange={setSpeechRate}
            rateStep={0.1}
          />

          <section className="categories-nav">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              Tất cả ({sentences.length})
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, label]) => {
              const count = sentences.filter((s) => s.category === key).length;
              const completed = sentences.filter((s) => s.category === key && learnedIds.has(s.id)).length;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`category-pill ${activeCategory === key ? "active" : ""}`}
                >
                  <span>{label}</span>
                  <span className="cat-count">
                    {completed}/{count}
                  </span>
                </button>
              );
            })}
          </section>

          <StudyFilterTabs
            filterType={filterType}
            onFilterChange={setFilterType}
            allCount={filteredSentences.length}
            unlearnedCount={sentences.filter((s) => !learnedIds.has(s.id)).length}
            learnedCount={learnedIds.size}
          />
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode
          items={sentences}
          storageKey="english_300"
          learnedIds={learnedIds}
          renderItem={renderSentenceCard}
        />
      ) : (
        <section className="sentences-list">
          {filteredSentences.map(renderSentenceCard)}
          {filteredSentences.length === 0 && (
            <StudyEmptyState message="Không tìm thấy câu nào phù hợp với bộ lọc hiện tại." />
          )}
        </section>
      )}

      <StudyFooterTip text="Tip: Chọn giọng đọc và tốc độ phù hợp ở phần trên, hoặc bật Tắt âm ở thanh bên phải để chỉ tăng lượt đếm." />
    </main>
  );
}
