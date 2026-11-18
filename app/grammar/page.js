"use client";

import { useState, useMemo } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import { Volume2Icon, LightbulbIcon, AlertTriangleIcon, AwardIcon } from "../components/Icons";
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
import rawData from "../../english_grammar_ielts8.json";

const LEVEL_MAP = {
  all: "Tất cả trình độ",
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
      <article key={item.id} className={`sentence-card grammar-card ${isLearned ? "learned" : ""}`}>
        <div className="card-top">
          <span className="card-index">#{displayNum}</span>
          <span className="card-category">{categoryNameMap[item.category] || item.category}</span>
          <span className={`grammar-level-badge grammar-level-${item.level}`}>{item.band}</span>
        </div>

        <div className="grammar-header-block">
          <h2 className="grammar-title">{item.title}</h2>
          <div className="grammar-formula-box">
            <span className="grammar-formula-label">Cấu trúc</span>
            <code className="grammar-formula-code">{item.formula}</code>
          </div>
          <p className="grammar-explanation">{item.explanation_vi}</p>
        </div>

        {item.examples && item.examples.length > 0 && (
          <div className="grammar-examples-block">
            <div className="grammar-sub-heading">Ví dụ thực tế (Bấm để nghe &amp; tăng lượt đọc)</div>
            <div className="grammar-examples-list">
              {item.examples.map((ex, exIdx) => {
                const exPlayId = `${item.id}_ex_${exIdx}`;
                const isPlayingEx = playingId === exPlayId;
                return (
                  <div
                    key={exIdx}
                    className={`grammar-example-row ${isPlayingEx ? "is-playing" : ""}`}
                    onClick={() => {
                      if (isTextSelected()) return;
                      playSpeech(ex.en, exPlayId);
                      incrementStudyCount(item.id);
                    }}
                    title="Bấm để nghe ví dụ và tăng lượt đọc"
                  >
                    <div className="grammar-example-text">
                      <p className="grammar-example-en">{ex.en}</p>
                      <p className="grammar-example-vi">→ {ex.vi}</p>
                    </div>
                    <button
                      type="button"
                      className={`play-button play-button--sm ${isPlayingEx ? "playing" : ""}`}
                      aria-label="Nghe câu ví dụ"
                    >
                      <Volume2Icon size={15} className={isPlayingEx ? "playing-animation" : ""} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {item.common_mistake && (
          <div className="grammar-mistake-box">
            <div className="grammar-mistake-head">
              <AlertTriangleIcon size={14} />
              <span>Lỗi hay gặp &amp; Cách sửa chuẩn</span>
            </div>
            <div className="grammar-mistake-pair">
              <span className="grammar-wrong">{item.common_mistake.wrong}</span>
              <span className="grammar-correct">{item.common_mistake.correct}</span>
            </div>
          </div>
        )}

        {item.ielts_tip_vi && (
          <div className="grammar-tip-box">
            <LightbulbIcon size={15} />
            <span>{item.ielts_tip_vi}</span>
          </div>
        )}

        <StudyCardFooter
          isLearned={isLearned}
          onToggleLearned={() => toggleLearned(item.id)}
          studyCount={studyCounts[item.id] || 0}
          learnedLabel="Đã nắm vững"
          unlearnedLabel="Đánh dấu đã nắm vững"
          counterTitle="Số lần bấm đọc ví dụ"
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
        browseLabel="Duyệt theo dạng bài"
        lessonLabel="Học theo bài (10 chủ điểm/bài)"
        ariaLabel="Chế độ học Grammar"
      />

      <StudyHeroHeader
        eyebrow="EN • Grammar Mastery (Basic → IELTS 8.0+)"
        title="Ngữ Pháp Tiếng Anh Từ Cơ Bản Đến IELTS 8.0"
        subtitle="Tổng hợp đầy đủ 10 nhóm dạng bài ngữ pháp trọng tâm kèm công thức, ví dụ phát âm chuẩn, mẹo IELTS và lưu lượt đọc"
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
            searchPlaceholder="Tìm theo tên ngữ pháp, công thức, ví dụ hoặc mẹo IELTS..."
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

            <div className="difficulty-filter-group">
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
