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
  ChinesePronunciationView,
} from "../components/study/CommExtraViews";
import rawData from "../../chinese_communication_chunks_v3_500plus.json";
import {
  getZhTier,
  ZH_PRONUNCIATION,
  ZH_EXTRA_CHUNKS,
  ZH_REPLY_MAP,
  ZH_PATTERN_BUILDERS,
  ZH_ROLEPLAYS,
} from "../lib/chineseCommModules";

const CHINESE_CATEGORY_MAP = {
  greetings_introductions: "Chào hỏi & Giới thiệu",
  politeness_replies: "Lịch sự & Cảm ơn",
  conversation_followups: "Nối tiếp hội thoại",
  daily_routine: "Sinh hoạt hàng ngày",
  questions_information: "Hỏi thông tin",
  food_drink: "Ăn uống & Món ăn",
  shopping_money: "Mua sắm & Tiền nong",
  transport_directions: "Đi lại & Chỉ đường",
  study_work: "Học tập & Làm việc",
  plans_invitations: "Kế hoạch & Hẹn gặp",
  feelings_opinions: "Cảm xúc & Ý kiến",
  phone_internet: "Điện thoại & Mạng",
  problems_help: "Khó khăn & Giúp đỡ",
  health_weather: "Sức khỏe & Thời tiết",
  travel_hotel: "Du lịch & Khách sạn",
  relationships_social: "Giao tiếp xã giao",
  reusable_patterns: "Mẫu câu ghép linh hoạt",
  small_talk: "Trò chuyện thường ngày",
  conversation_reactions: "Phản xạ đối đáp",
  making_requests: "Nhờ vả & Yêu cầu",
  clarifying_communication: "Làm rõ thông điệp",
  restaurant_advanced: "Nhà hàng & Ẩm thực",
  shopping_returns: "Mua sắm & Đổi trả",
  housing_renting: "Thuê nhà & Chỗ ở",
  banking_payments: "Ngân hàng & Thanh toán",
  workplace_meetings: "Công sở & Họp hành",
  job_interview: "Phỏng vấn xin việc",
  business_negotiation: "Đàm phán thương mại",
  opinions_discussion: "Thảo luận & Quan điểm",
  emotions_relationships: "Tình cảm & Thân mật",
  travel_airport: "Sân bay & Du lịch",
  hotel_service: "Dịch vụ phòng & Hotel",
  medical_pharmacy: "Nhà thuốc & Y tế",
  emergency_safety: "An toàn & Khẩn cấp",
  online_social_media: "Mạng xã hội & Mua online",
  problem_solving_complaints: "Xử lý sự cố & Khiếu nại",
  time_scheduling: "Thời gian & Lịch hẹn",
  natural_speech_fillers: "Khẩu ngữ & Từ đệm",
  farewells: "Tạm biệt",
  daily_errands: "Việc vặt mỗi ngày",
  food_preferences: "Sở thích ăn uống",
  transport_delivery: "Giao vận & Đặt xe",
  school_learning: "Thi cử & Trường học",
  work_communication: "Trao đổi công việc",
  money_and_services: "Dịch vụ tài chính",
  health_and_appointments: "Khám bệnh & Sức khỏe",
  conflict_and_boundaries: "Từ chối & Bất đồng",
  weather_and_plans: "Thời tiết & Dự định",
  phone_calls: "Gọi điện thoại",
  more_natural_patterns: "Mẫu khẩu ngữ tự nhiên",
  everyday_expansion: "Giao tiếp mở rộng",
};

const TIER_LABELS = {
  all: "Tất cả",
  basic: "Cơ bản (HSK 1–2)",
  intermediate: "Trung cấp (HSK 2–4)",
  advanced: "Nâng cao (HSK 4–6)",
};

const VALID_MODES = ["browse", "lesson", "roleplay", "patterns", "pronunciation"];

export default function ChinesePage() {
  const chunks = useMemo(
    () =>
      [...(rawData.chunks || []), ...ZH_EXTRA_CHUNKS].map((c) => ({
        ...c,
        tier: getZhTier(c),
        reply_line: c.reply_line || ZH_REPLY_MAP[c.id] || null,
      })),
    []
  );

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState("all");
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
  } = useStudyProgress("chinese_500", {
    defaultMode: "browse",
    validModes: VALID_MODES,
    resetConfirmMsg: "Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học tiếng Trung không?",
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
      const isLearned = learnedIds.has(c.id);
      const matchesFilterType =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);
      const matchesSearch =
        q === "" ||
        c.hanzi.toLowerCase().includes(q) ||
        c.pinyin.toLowerCase().includes(q) ||
        c.meaning_vi.toLowerCase().includes(q);
      return matchesCategory && matchesTier && matchesFilterType && matchesSearch;
    });
  }, [chunks, activeCategory, activeTier, filterType, searchQuery, learnedIds]);

  const availableCategories = useMemo(() => Array.from(new Set(chunks.map((c) => c.category))), [chunks]);

  if (!isLoaded) return <StudyLoading message="Đang tải dữ liệu học tiếng Trung..." />;

  const renderChineseCard = (c) => {
    const isLearned = learnedIds.has(c.id);
    const isPlaying = playingId === c.id;
    const isMasked = recallHideScript && !revealedIds.has(c.id);

    return (
      <article key={c.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{c.id}</span>
          <span className="card-category">{CHINESE_CATEGORY_MAP[c.category] || c.category}</span>
          {c.level && <span className="card-level">{c.level}</span>}
        </div>

        <div
          className="card-body"
          onClick={() => {
            if (isTextSelected()) return;
            if (isMasked) toggleRevealCard(c.id);
            playSpeech(c.hanzi, c.id);
            incrementStudyCount(c.id);
          }}
        >
          <div className="english-wrapper">
            <div className={isMasked ? "comm-masked-script" : ""}>
              <h2 className="hanzi-text">{c.hanzi}</h2>
              <p className="pinyin-text">{c.pinyin}</p>
            </div>
            <button type="button" className="play-button" aria-label="Nghe phát âm">
              <Volume2Icon size={18} className={isPlaying ? "playing-animation" : ""} />
            </button>
          </div>
          <p className="vietnamese-text">{c.meaning_vi}</p>

          {c.reply_line && (
            <div
              className="reply-box reply-box-interactive"
              onClick={(e) => {
                e.stopPropagation();
                if (isTextSelected()) return;
                const hanziOnly = c.reply_line.split("(")[0].trim();
                playSpeech(hanziOnly, `rep_${c.id}`);
                incrementStudyCount(c.id);
              }}
            >
              <span className="reply-label">Đáp lại</span>
              <span className="reply-text">{c.reply_line}</span>
              <Volume2Icon size={14} className="reply-audio-icon" />
            </div>
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

  const modeTabs = [
    { id: "browse", label: `Duyệt (${chunks.length} câu)`, icon: <ListIcon size={15} /> },
    { id: "lesson", label: "Học theo bài (60 bài)", icon: <BookOpenIcon size={15} /> },
    { id: "roleplay", label: "15 Hội thoại (HSK 1→6)", icon: <MessageSquareIcon size={15} /> },
    { id: "patterns", label: "12 Mẫu ghép câu", icon: <LayersIcon size={15} /> },
    { id: "pronunciation", label: "Phát âm & Thanh điệu", icon: <MicIcon size={15} /> },
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

      <StudyModeStrip mode={viewMode} onChange={switchView} tabs={modeTabs} ariaLabel="Chế độ học tiếng Trung" />

      <StudyHeroHeader
        eyebrow="ZH • 600 Chunks • 15 Hội Thoại • 12 Mẫu Câu"
        title="600 Chunks & Hội Thoại Tiếng Trung"
        subtitle="Tự học giao tiếp từ HSK 1 đến HSK 6: Phát âm Pinyin, 60 bài Chunks, 15 kịch bản đối thoại và 12 mẫu câu ghép"
        statLabel="Tiến trình học tiếng Trung"
        learnedCount={learnedIds.size}
        totalCount={chunks.length}
        unitLabel="chunks"
        onReset={resetProgress}
      />

      <StudyControlPanel
        searchQuery={searchQuery}
        onSearchChange={viewMode === "browse" ? setSearchQuery : undefined}
        searchPlaceholder="Tìm theo chữ Hán, Pinyin hoặc nghĩa tiếng Việt..."
        leftSummary={
          viewMode !== "browse"
            ? "Bấm vào bất kỳ câu tiếng Trung nào để nghe phát âm chuẩn và tăng lượt đọc."
            : undefined
        }
        extraControls={extraRecallControls}
        voices={voices}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        defaultVoiceLabel="Mặc định zh-CN"
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
            {availableCategories.map((catKey) => {
              const count = chunks.filter((c) => c.category === catKey).length;
              const completed = chunks.filter((c) => c.category === catKey && learnedIds.has(c.id)).length;
              const label = CHINESE_CATEGORY_MAP[catKey] || catKey;
              return (
                <button
                  type="button"
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className={`category-pill ${activeCategory === catKey ? "active" : ""}`}
                >
                  <span>{label}</span>
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
              <span className="difficulty-filter-label">Cấp độ:</span>
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
            </div>
          </div>

          <section className="sentences-list">
            {filteredChunks.map(renderChineseCard)}
            {filteredChunks.length === 0 && (
              <StudyEmptyState message="Không tìm thấy câu nào phù hợp với bộ lọc hiện tại." />
            )}
          </section>
        </>
      )}

      {viewMode === "lesson" && (
        <LessonMode items={chunks} storageKey="chinese_500" learnedIds={learnedIds} renderItem={renderChineseCard} />
      )}

      {viewMode === "roleplay" && (
        <CommRoleplayView
          roleplays={ZH_ROLEPLAYS}
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
          patterns={ZH_PATTERN_BUILDERS}
          playingId={playingId}
          onPlaySpeech={playSpeech}
          studyCounts={studyCounts}
          onIncrementCount={incrementStudyCount}
        />
      )}

      {viewMode === "pronunciation" && (
        <ChinesePronunciationView data={ZH_PRONUNCIATION} playingId={playingId} onPlaySpeech={playSpeech} />
      )}

      <StudyFooterTip text='Tip: Dùng "Che chữ tự nói" hoặc tab "15 Hội thoại" để luyện phản xạ nói 2 chiều từ cơ bản tới nâng cao.' />
    </main>
  );
}
