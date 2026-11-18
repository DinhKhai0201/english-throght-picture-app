"use client";

import { useState, useMemo } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import {
  Volume2Icon,
  BookOpenIcon,
  ListIcon,
  EyeIcon,
  MessageSquareIcon,
  LayersIcon,
  MicIcon,
} from "../components/Icons";
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
import {
  CommRoleplayView,
  CommPatternsView,
  JapanesePronunciationView,
} from "../components/study/CommExtraViews";
import rawData from "../../japanese_communication_chunks.json";
import {
  getJaTier,
  JA_PRONUNCIATION,
  JA_EXTRA_CHUNKS,
  JA_ENRICH_MAP,
  JA_PATTERN_BUILDERS,
  JA_ROLEPLAYS,
} from "../lib/japaneseCommModules";

const REGISTER_MAP = {
  all: "Mọi sắc thái",
  polite: "Lịch sự (です/ます)",
  casual: "Thân mật (Bạn bè)",
  formal: "Kính ngữ (Công sở)",
};

const TIER_LABELS = {
  all: "Tất cả",
  basic: "Cơ bản (N5–N4)",
  intermediate: "Trung cấp (N4–N3)",
  advanced: "Nâng cao (N3–N2)",
};

const VALID_MODES = ["browse", "lesson", "roleplay", "patterns", "pronunciation"];

export default function JapanesePage() {
  const chunks = useMemo(
    () =>
      [...(rawData.chunks || []), ...JA_EXTRA_CHUNKS].map((c) => ({
        ...c,
        tier: getJaTier(c),
        extra_note: c.extra_note || JA_ENRICH_MAP[c.id] || null,
      })),
    []
  );

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState("all");
  const [activeRegister, setActiveRegister] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [recallHideScript, setRecallHideScript] = useState(false);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [hideRoleB, setHideRoleB] = useState(false);

  const {
    learnedIds,
    studyCounts,
    studyMode: viewMode,
    switchStudyMode: switchView,
    isLoaded,
    toggleLearned,
    incrementStudyCount,
    resetProgress,
  } = useStudyProgress("japanese_chunks", {
    defaultMode: "browse",
    validModes: VALID_MODES,
    resetConfirmMsg: "Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học tiếng Nhật không?",
  });

  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    playingId,
    playSpeech,
  } = useSpeechSynthesis({ lang: "ja-JP", defaultRate: 0.9 });

  const toggleRevealCard = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredChunks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return chunks.filter((c) => {
      const matchesCategory = activeCategory === "all" || c.category === activeCategory;
      const matchesTier = activeTier === "all" || c.tier === activeTier;
      const matchesRegister = activeRegister === "all" || c.register === activeRegister;
      const isLearned = learnedIds.has(c.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);
      const matchesSearch =
        q === "" ||
        c.japanese.toLowerCase().includes(q) ||
        (c.kana && c.kana.toLowerCase().includes(q)) ||
        (c.romaji && c.romaji.toLowerCase().includes(q)) ||
        c.meaning_vi.toLowerCase().includes(q);
      return matchesCategory && matchesTier && matchesRegister && matchesFilterType && matchesSearch;
    });
  }, [chunks, activeCategory, activeTier, activeRegister, filterType, searchQuery, learnedIds]);

  const categoriesList = useMemo(() => Array.from(new Set(chunks.map((c) => c.category))), [chunks]);

  if (!isLoaded) return <StudyLoading message="Đang tải dữ liệu học tiếng Nhật..." />;

  const renderJapaneseCard = (c) => {
    const isLearned = learnedIds.has(c.id);
    const isPlaying = playingId === c.id;
    const hasKanaDifferent = c.kana && c.kana !== c.japanese;
    const isMasked = recallHideScript && !revealedIds.has(c.id);
    const hasExample = c.example_use && c.example_use !== c.japanese;

    return (
      <article key={c.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{c.id}</span>
          <span className="card-category">{c.category}</span>
          {c.register && <span className="register-badge">{REGISTER_MAP[c.register] || c.register}</span>}
          {c.level && <span className="card-level">{c.level}</span>}
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            if (isMasked) toggleRevealCard(c.id);
            playSpeech(c.japanese, c.id);
            incrementStudyCount(c.id);
          }}
        >
          <div className="english-wrapper">
            <div className={isMasked ? "comm-masked-script" : ""}>
              <h2 className="japanese-text">{c.japanese}</h2>
              <div className="kana-romaji-text">
                {hasKanaDifferent && <span className="kana-badge">{c.kana}</span>}
                {c.romaji && (
                  <span className="romaji-badge">{hasKanaDifferent ? `• ${c.romaji}` : c.romaji}</span>
                )}
              </div>
            </div>
            <button type="button" className="play-button" aria-label="Nghe phát âm">
              <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
            </button>
          </div>
          <p className="vietnamese-text">{c.meaning_vi}</p>

          {hasExample ? (
            <div
              className="reply-box reply-box-interactive"
              onClick={(e) => {
                e.stopPropagation();
                if (isTextSelected()) return;
                playSpeech(c.example_use, `ex-${c.id}`);
                incrementStudyCount(c.id);
              }}
            >
              <span className="reply-label">Ví dụ</span>
              <span className="reply-text">
                {c.example_use} {c.example_translation ? `— ${c.example_translation}` : ""}
              </span>
              <Volume2Icon size={14} className="reply-audio-icon" />
            </div>
          ) : c.extra_note ? (
            <div className="reply-box">
              <span className="reply-label">Gợi ý</span>
              <span className="reply-text">{c.extra_note}</span>
            </div>
          ) : null}
        </div>

        <StudyCardFooter
          isLearned={isLearned}
          onToggleLearned={() => toggleLearned(c.id)}
          studyCount={studyCounts[c.id] || 0}
        />
      </article>
    );
  };

  const modeTabs = [
    { id: "browse", label: `Duyệt (${chunks.length} câu)`, icon: <ListIcon size={15} /> },
    { id: "lesson", label: "Học theo bài (41 bài)", icon: <BookOpenIcon size={15} /> },
    { id: "roleplay", label: "15 Hội thoại (N5→N2)", icon: <MessageSquareIcon size={15} /> },
    { id: "patterns", label: "12 Mẫu ghép câu", icon: <LayersIcon size={15} /> },
    { id: "pronunciation", label: "Phát âm nền tảng", icon: <MicIcon size={15} /> },
  ];

  const extraRecallControls = (
    <>
      {(viewMode === "browse" || viewMode === "lesson") && (
        <button
          type="button"
          className={`comm-recall-btn ${recallHideScript ? "is-active" : ""}`}
          onClick={() => {
            setRecallHideScript(!recallHideScript);
            setRevealedIds(new Set());
          }}
        >
          <EyeIcon size={15} />
          <span>{recallHideScript ? "Đang che chữ" : "Che chữ tự nói"}</span>
        </button>
      )}
      {viewMode === "roleplay" && (
        <button
          type="button"
          className={`comm-recall-btn ${hideRoleB ? "is-active" : ""}`}
          onClick={() => setHideRoleB(!hideRoleB)}
        >
          <EyeIcon size={15} />
          <span>{hideRoleB ? "Đang che vai B" : "Che vai B tự đáp"}</span>
        </button>
      )}
    </>
  );

  return (
    <main className="container">
      <SectionNav />

      <StudyModeStrip mode={viewMode} onChange={switchView} tabs={modeTabs} ariaLabel="Chế độ học tiếng Nhật" />

      <StudyHeroHeader
        eyebrow="JA • 401 Chunks • 15 Hội Thoại • 12 Mẫu Câu"
        title="400+ Chunks & Hội Thoại Tiếng Nhật"
        subtitle="Tự học giao tiếp từ N5 đến N2: Đủ 3 sắc thái (Bạn bè, Lịch sự, Kính ngữ công sở), 15 bài hội thoại và 12 mẫu câu"
        statLabel="Tiến trình học tiếng Nhật"
        learnedCount={learnedIds.size}
        totalCount={chunks.length}
        unitLabel="chunks"
        onReset={resetProgress}
      />

      <StudyControlPanel
        searchQuery={searchQuery}
        onSearchChange={viewMode === "browse" ? setSearchQuery : undefined}
        searchPlaceholder="Tìm theo chữ Nhật, Kana, Romaji hoặc nghĩa tiếng Việt..."
        leftSummary={
          viewMode !== "browse"
            ? "Bấm vào bất kỳ câu tiếng Nhật nào để nghe phát âm và tăng lượt đọc."
            : undefined
        }
        extraControls={extraRecallControls}
        voices={voices}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        defaultVoiceLabel="Mặc định ja-JP"
        speechRate={speechRate}
        onRateChange={setSpeechRate}
      />

      {viewMode === "browse" && (
        <>
          <section className="categories-nav">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              Tất cả ({chunks.length})
            </button>
            {categoriesList.map((catName) => {
              const count = chunks.filter((c) => c.category === catName).length;
              const completed = chunks.filter((c) => c.category === catName && learnedIds.has(c.id)).length;
              return (
                <button
                  type="button"
                  key={catName}
                  onClick={() => setActiveCategory(catName)}
                  className={`category-pill ${activeCategory === catName ? "active" : ""}`}
                >
                  <span>{catName}</span>
                  <span className="cat-count">
                    {completed}/{count}
                  </span>
                </button>
              );
            })}
          </section>

          <div className="filter-difficulty-row">
            <StudyFilterTabs
              filterType={filterType}
              onFilterChange={setFilterType}
              allCount={filteredChunks.length}
              unlearnedCount={chunks.filter((c) => !learnedIds.has(c.id)).length}
              learnedCount={learnedIds.size}
              inline
            />

            <div className="difficulty-filter-group">
              {Object.entries(TIER_LABELS).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTier(key)}
                  className={`difficulty-filter-btn ${activeTier === key ? "active" : ""}`}
                >
                  {label}
                </button>
              ))}
              <select
                value={activeRegister}
                onChange={(e) => setActiveRegister(e.target.value)}
                className="lesson-select"
                style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                aria-label="Chọn sắc thái"
              >
                {Object.entries(REGISTER_MAP).map(([k, lbl]) => (
                  <option key={k} value={k}>
                    {lbl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <section className="sentences-list">
            {filteredChunks.map(renderJapaneseCard)}
            {filteredChunks.length === 0 && (
              <StudyEmptyState message="Không tìm thấy câu nào phù hợp với bộ lọc hiện tại." />
            )}
          </section>
        </>
      )}

      {viewMode === "lesson" && (
        <LessonMode items={chunks} storageKey="japanese_chunks" learnedIds={learnedIds} renderItem={renderJapaneseCard} />
      )}

      {viewMode === "roleplay" && (
        <CommRoleplayView
          roleplays={JA_ROLEPLAYS}
          hideRoleB={hideRoleB}
          revealedIds={revealedIds}
          onToggleReveal={toggleRevealCard}
          playingId={playingId}
          onPlaySpeech={playSpeech}
          studyCounts={studyCounts}
          onIncrementCount={incrementStudyCount}
        />
      )}

      {viewMode === "patterns" && (
        <CommPatternsView
          patterns={JA_PATTERN_BUILDERS}
          playingId={playingId}
          onPlaySpeech={playSpeech}
          studyCounts={studyCounts}
          onIncrementCount={incrementStudyCount}
        />
      )}

      {viewMode === "pronunciation" && (
        <JapanesePronunciationView data={JA_PRONUNCIATION} playingId={playingId} onPlaySpeech={playSpeech} />
      )}

      <StudyFooterTip text='Tip: Dùng "Che chữ tự nói" hoặc tab "15 Hội thoại" để luyện đủ 3 sắc thái Bạn bè, Lịch sự và Kính ngữ.' />
    </main>
  );
}
