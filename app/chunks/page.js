"use client";

import { useState, useMemo } from "react";
import rawData from "../../english_chunks_1000.json";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import { Volume2Icon, LightbulbIcon } from "../components/Icons";
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

const TOPIC_MAP = {
  topic_01: "Core Chunks",
  topic_02: "Society & Education",
  topic_03: "Technology & Environment",
  topic_04: "Work & Career",
  topic_05: "Health & Lifestyle",
  topic_06: "People & Relationships",
  topic_07: "Travel & Places",
  topic_08: "Communication & Media",
  topic_09: "Economy & Public Life",
  topic_10: "Personal Development",
};

export default function ChunksPage() {
  const chunks = rawData.chunks || [];
  const [activeTopic, setActiveTopic] = useState("all");
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
  } = useStudyProgress("chunks_1000");

  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    playingId,
    playSpeech,
  } = useSpeechSynthesis({ lang: "en-US", defaultRate: 0.9 });

  const filteredChunks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return chunks.filter((c) => {
      const matchesTopic = activeTopic === "all" || c.topic_id === activeTopic;
      const isLearned = learnedIds.has(c.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);
      const matchesSearch =
        q === "" ||
        c.chunk.toLowerCase().includes(q) ||
        c.meaning_vi.toLowerCase().includes(q) ||
        (c.pattern && c.pattern.toLowerCase().includes(q)) ||
        (c.example_en && c.example_en.toLowerCase().includes(q));
      return matchesTopic && matchesFilterType && matchesSearch;
    });
  }, [chunks, activeTopic, learnedIds, filterType, searchQuery]);

  if (!isLoaded) return <StudyLoading />;

  const renderChunkCard = (c) => {
    const isLearned = learnedIds.has(c.id);
    const isPlaying = playingId === c.id;
    return (
      <article key={c.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{c.id}</span>
          <span className="card-category">{TOPIC_MAP[c.topic_id] || c.topic_id}</span>
          {c.level && <span className="card-level">{c.level}</span>}
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            playSpeech(c.chunk, c.id);
            incrementStudyCount(c.id);
          }}
        >
          <div className="english-wrapper">
            <h2 className="english-text">{c.chunk}</h2>
            <button type="button" className="play-button" aria-label="Nghe phát âm">
              <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
            </button>
          </div>
          <p className="vietnamese-text">{c.meaning_vi}</p>
          {c.pattern && (
            <div className="reply-box">
              <span className="reply-label">Pattern</span>
              <span className="reply-text">{c.pattern}</span>
            </div>
          )}
        </div>

        <div className="card-details-stack">
          {c.example_en && (
            <div
              className="reply-box reply-box-interactive"
              onClick={() => {
                if (isTextSelected()) return;
                playSpeech(c.example_en, `ex-${c.id}`);
                incrementStudyCount(c.id);
              }}
            >
              <span className="reply-label">Ví dụ</span>
              <span className="reply-text">{c.example_en}</span>
              <Volume2Icon size={14} className="reply-audio-icon" />
            </div>
          )}
          {c.example_vi && <p className="card-sub-translation">→ {c.example_vi}</p>}
          {c.usage_note_vi && (
            <p className="card-usage-note">
              <LightbulbIcon size={14} />
              <span>{c.usage_note_vi}</span>
            </p>
          )}
        </div>

        <StudyCardFooter
          isLearned={isLearned}
          onToggleLearned={() => toggleLearned(c.id)}
          studyCount={studyCounts[c.id] || 0}
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
        lessonLabel="Học theo bài (10 chunks/bài)"
      />

      <StudyHeroHeader
        eyebrow="EN • Chunking Collocations"
        title="1000 English Chunks"
        subtitle="Cụm từ tự nhiên theo 10 chủ đề IELTS & giao tiếp kèm cấu trúc và ví dụ"
        statLabel="Tiến trình học 1000 Chunks"
        learnedCount={learnedIds.size}
        totalCount={chunks.length}
        unitLabel="chunks"
        onReset={resetProgress}
      />

      {studyMode !== "lesson" && (
        <>
          <StudyControlPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Tìm kiếm chunk, pattern hoặc ví dụ..."
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
              onClick={() => setActiveTopic("all")}
              className={`category-pill ${activeTopic === "all" ? "active" : ""}`}
            >
              Tất cả ({chunks.length})
            </button>
            {Object.entries(TOPIC_MAP).map(([key, label]) => {
              const count = chunks.filter((c) => c.topic_id === key).length;
              const completed = chunks.filter((c) => c.topic_id === key && learnedIds.has(c.id)).length;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTopic(key)}
                  className={`category-pill ${activeTopic === key ? "active" : ""}`}
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
            allCount={filteredChunks.length}
            unlearnedCount={chunks.filter((c) => !learnedIds.has(c.id)).length}
            learnedCount={learnedIds.size}
          />
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode items={chunks} storageKey="chunks_1000" learnedIds={learnedIds} renderItem={renderChunkCard} />
      ) : (
        <section className="sentences-list">
          {filteredChunks.map(renderChunkCard)}
          {filteredChunks.length === 0 && (
            <StudyEmptyState message="Không tìm thấy chunk nào phù hợp với bộ lọc hiện tại." />
          )}
        </section>
      )}

      <StudyFooterTip text="Tip: Bấm vào chunk hoặc câu ví dụ để nghe phát âm và tăng lượt ôn tập." />
    </main>
  );
}
