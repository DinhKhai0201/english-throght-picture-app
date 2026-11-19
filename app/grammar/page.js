"use client";

import { useState, useMemo } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import { AwardIcon } from "../components/Icons";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useStudyProgress } from "../hooks/useStudyProgress";
import GrammarCardItem from "../components/study/GrammarCardItem";
import {
  StudyLoading,
  StudyModeStrip,
  StudyHeroHeader,
  StudyControlPanel,
  StudyFilterTabs,
  StudyEmptyState,
  StudyFooterTip,
} from "../components/study/StudyLayoutParts";
import rawData from "../../english_grammar_ielts8.json";

const LEVEL_MAP = {
  all: "Tất cả",
  basic: "Cơ bản (A1–A2)",
  intermediate: "Trung cấp (B1–B2)",
  advanced: "IELTS 7.0–8.0+",
};

export default function GrammarPage() {
  const categories = rawData.categories || [];
  const items = rawData.items || [];

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    learnedIds,
    studyCounts,
    studyMode,
    switchStudyMode,
    isLoaded,
    toggleLearned,
    incrementStudyCount,
    resetProgress,
  } = useStudyProgress("english_grammar", {
    resetConfirmMsg: "Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình học và số lần đọc Grammar không?",
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

  const categoryNameMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCat = activeCategory === "all" || item.category === activeCategory;
      const matchesLevel = activeLevel === "all" || item.level === activeLevel;
      const isLearned = learnedIds.has(item.id);
      const matchesFilter =
        filterType === "all" ||
        (filterType === "learned" && isLearned) ||
        (filterType === "unlearned" && !isLearned);
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        item.explanation_vi.toLowerCase().includes(q) ||
        (item.ielts_tip_vi && item.ielts_tip_vi.toLowerCase().includes(q)) ||
        (item.signals && item.signals.some((s) => s.toLowerCase().includes(q))) ||
        (item.usage_notes && item.usage_notes.some((un) => un.toLowerCase().includes(q))) ||
        (item.special_cases &&
          item.special_cases.some(
            (sc) =>
              sc.title.toLowerCase().includes(q) ||
              sc.formula.toLowerCase().includes(q) ||
              sc.explanation.toLowerCase().includes(q) ||
              (sc.example && sc.example.toLowerCase().includes(q))
          )) ||
        (item.detailed_formulas &&
          item.detailed_formulas.some(
            (df) =>
              (df.form && df.form.toLowerCase().includes(q)) ||
              (df.structure && df.structure.toLowerCase().includes(q)) ||
              (df.example && df.example.toLowerCase().includes(q))
          )) ||
        (item.examples &&
          item.examples.some((ex) => ex.en.toLowerCase().includes(q) || ex.vi.toLowerCase().includes(q)));
      return matchesCat && matchesLevel && matchesFilter && matchesSearch;
    });
  }, [items, activeCategory, activeLevel, filterType, searchQuery, learnedIds]);

  if (!isLoaded) return <StudyLoading message="Đang tải giáo trình English Grammar..." />;

  const renderGrammarCard = (item, idx) => {
    const isLearned = learnedIds.has(item.id);
    const displayNum = idx !== undefined ? idx + 1 : item.id.replace("gr_", "");

    return (
      <GrammarCardItem
        key={item.id}
        item={item}
        displayNum={displayNum}
        categoryName={categoryNameMap[item.category] || item.category}
        isLearned={isLearned}
        onToggleLearned={toggleLearned}
        studyCount={studyCounts[item.id] || 0}
        onIncrementStudyCount={incrementStudyCount}
        playingId={playingId}
        onPlaySpeech={playSpeech}
      />
    );
  };

  return (
    <main className="container">
      <SectionNav />

      <StudyModeStrip
        mode={studyMode}
        onChange={switchStudyMode}
        browseLabel="Duyệt theo dạng bài"
        lessonLabel="Học theo bài (10 chủ điểm/bài)"
        ariaLabel="Chế độ học Grammar"
      />

      <StudyHeroHeader
        eyebrow="EN • Grammar Mastery (Basic → IELTS 8.0+)"
        title="Ngữ Pháp Tiếng Anh Từ Cơ Bản Đến IELTS 8.0"
        subtitle="Tổng hợp đầy đủ 45 chủ điểm ngữ pháp trọng tâm kèm bảng chia thì chi tiết, nguyên tắc sống còn, trường hợp đặc biệt & bẫy thi cử, audio phát âm và mẹo IELTS 8.0+"
        statLabel="Tiến trình làm chủ Grammar"
        learnedCount={learnedIds.size}
        totalCount={items.length}
        unitLabel="chủ điểm"
        onReset={resetProgress}
      />

      {studyMode !== "lesson" && (
        <>
          <StudyControlPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Tìm theo tên ngữ pháp, thì, công thức, trường hợp đặc biệt, bẫy thi cử hoặc từ khóa..."
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            speechRate={speechRate}
            onRateChange={setSpeechRate}
          />

          <section className="categories-nav">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              Tất cả ({items.length})
            </button>
            {categories.map((cat) => {
              const catItems = items.filter((it) => it.category === cat.id);
              const completed = catItems.filter((it) => learnedIds.has(it.id)).length;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
                >
                  <span>{cat.name}</span>
                  <span className="cat-count">
                    {completed}/{catItems.length}
                  </span>
                </button>
              );
            })}
          </section>

          <div className="filter-difficulty-row">
            <StudyFilterTabs
              filterType={filterType}
              onFilterChange={setFilterType}
              allCount={filteredItems.length}
              unlearnedCount={items.filter((i) => !learnedIds.has(i.id)).length}
              learnedCount={learnedIds.size}
              unlearnedLabel="Chưa nắm"
              learnedLabel="Đã nắm vững"
              inline
            />

            <div className="difficulty-filter-group" role="group" aria-label="Lọc theo trình độ">
              <span className="difficulty-filter-label">
                <AwardIcon size={13} /> Trình độ:
              </span>
              {Object.entries(LEVEL_MAP).map(([lvlKey, lvlLabel]) => (
                <button
                  type="button"
                  key={lvlKey}
                  onClick={() => setActiveLevel(lvlKey)}
                  className={`difficulty-filter-btn ${activeLevel === lvlKey ? "active" : ""}`}
                >
                  {lvlLabel}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {studyMode === "lesson" ? (
        <LessonMode
          items={items}
          storageKey="english_grammar"
          learnedIds={learnedIds}
          renderItem={(item, idx) => renderGrammarCard(item, idx)}
        />
      ) : (
        <section className="sentences-list">
          {filteredItems.map((item, idx) => renderGrammarCard(item, idx))}
          {filteredItems.length === 0 && (
            <StudyEmptyState message="Không tìm thấy điểm ngữ pháp nào phù hợp với bộ lọc hiện tại." />
          )}
        </section>
      )}

      <StudyFooterTip text="Tip: Bấm vào từng câu ví dụ để nghe phát âm và tăng lượt đọc, hoặc bật tắt âm bên phải để đếm nhanh khi tự nhẩm." />
    </main>
  );
}
