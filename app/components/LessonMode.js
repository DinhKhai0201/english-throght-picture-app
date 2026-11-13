"use client";

import { useState, useEffect, useMemo } from "react";

const LESSON_SIZE = 10;

/**
 * LessonMode — a reusable lesson navigator component.
 *
 * Props:
 *  - items: Array — full list of items to paginate into lessons
 *  - storageKey: string — prefix for localStorage keys (e.g. "english_300")
 *  - learnedIds: Set — set of learned item ids
 *  - renderItem: (item, index) => JSX — render a single item card
 *  - lessonSize: number (default 10) — items per lesson
 */
export default function LessonMode({
  items = [],
  storageKey,
  learnedIds = new Set(),
  renderItem,
  lessonSize = LESSON_SIZE,
}) {
  const totalLessons = Math.ceil(items.length / lessonSize) || 1;

  // Restore lesson from localStorage
  const [currentLesson, setCurrentLesson] = useState(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = parseInt(localStorage.getItem(`${storageKey}_lesson`) || "1", 10);
      return isNaN(saved) || saved < 1 ? 1 : Math.min(saved, Math.max(1, totalLessons));
    }
    return 1;
  });

  // View mode: "lesson" (normal lesson) or "unlearned" (list of unlearned items)
  const [viewUnlearned, setViewUnlearned] = useState(false);
  // Unlearned scope: "up_to_current" (from Lesson 1 to currentLesson) or "all"
  const [unlearnedScope, setUnlearnedScope] = useState("up_to_current");

  // Persist lesson to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && storageKey) {
      localStorage.setItem(`${storageKey}_lesson`, currentLesson.toString());
    }
  }, [currentLesson, storageKey]);

  const lesson = Math.min(Math.max(1, currentLesson), Math.max(1, totalLessons));
  const startIdx = (lesson - 1) * lessonSize;
  const lessonItems = useMemo(() => {
    return items.slice(startIdx, startIdx + lessonSize);
  }, [items, startIdx, lessonSize]);

  // Statistics for all lessons
  const lessonStats = useMemo(() => {
    return Array.from({ length: totalLessons }, (_, i) => {
      const bStart = i * lessonSize;
      const bItems = items.slice(bStart, bStart + lessonSize);
      const learnedCount = bItems.filter((it) => learnedIds.has(it.id)).length;
      const totalCount = bItems.length;
      const unlearnedCount = totalCount - learnedCount;
      const isCompleted = totalCount > 0 && learnedCount === totalCount;
      return {
        lessonNum: i + 1,
        bStart: bStart + 1,
        bEnd: Math.min(bStart + lessonSize, items.length),
        learnedCount,
        totalCount,
        unlearnedCount,
        isCompleted,
      };
    });
  }, [items, totalLessons, lessonSize, learnedIds]);

  const currentLessonStat = lessonStats[lesson - 1] || {
    learnedCount: 0,
    totalCount: lessonItems.length,
    unlearnedCount: lessonItems.length,
    isCompleted: false,
  };

  const learnedInLesson = currentLessonStat.learnedCount;
  const lessonProgress = lessonItems.length > 0 ? Math.round((learnedInLesson / lessonItems.length) * 100) : 0;

  // Unlearned items up to current lesson (Lesson 1 to currentLesson)
  const unlearnedUpToCurrent = useMemo(() => {
    const sliceEnd = Math.min(lesson * lessonSize, items.length);
    const subset = items.slice(0, sliceEnd);
    return subset
      .map((item, idx) => ({ item, originalIndex: idx, lessonNum: Math.floor(idx / lessonSize) + 1 }))
      .filter(({ item }) => !learnedIds.has(item.id));
  }, [items, lesson, lessonSize, learnedIds]);

  // All unlearned items
  const allUnlearned = useMemo(() => {
    return items
      .map((item, idx) => ({ item, originalIndex: idx, lessonNum: Math.floor(idx / lessonSize) + 1 }))
      .filter(({ item }) => !learnedIds.has(item.id));
  }, [items, lessonSize, learnedIds]);

  // Next incomplete lesson
  const nextIncompleteLesson = useMemo(() => {
    const found = lessonStats.find((s) => !s.isCompleted && s.lessonNum !== lesson);
    return found ? found.lessonNum : null;
  }, [lessonStats, lesson]);

  const goToLesson = (n) => {
    const clamped = Math.max(1, Math.min(n, totalLessons));
    setCurrentLesson(clamped);
    setViewUnlearned(false);
    if (typeof window !== "undefined") {
      const el = document.getElementById("lesson-content-top");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📚</span>
        <p>Không có dữ liệu để học.</p>
      </div>
    );
  }

  const displayedUnlearnedItems = unlearnedScope === "up_to_current" ? unlearnedUpToCurrent : allUnlearned;

  return (
    <div className="lesson-mode-wrapper">
      {/* Lesson Header Box */}
      <div className="lesson-header">
        <div className="lesson-title-row">
          <span className="lesson-title">
            📖 Bài {lesson} / {totalLessons}
          </span>
          <span className="lesson-range">
            (#{startIdx + 1} – #{Math.min(startIdx + lessonSize, items.length)})
          </span>

          <span className={`lesson-done-badge ${currentLessonStat.isCompleted ? "completed" : ""}`}>
            {currentLessonStat.isCompleted ? "🎉 Đã hoàn thành 100%" : `${learnedInLesson}/${lessonItems.length} đã thuộc`}
          </span>
        </div>

        {/* Lesson progress bar */}
        <div className="lesson-progress-bar-container">
          <div
            className="lesson-progress-bar"
            style={{ width: `${lessonProgress}%` }}
          />
        </div>

        {/* Navigation & Action Controls */}
        <div className="lesson-nav-controls">
          <button
            className="lesson-nav-btn"
            onClick={() => goToLesson(1)}
            disabled={lesson <= 1}
            title="Bài đầu tiên"
          >
            ⏮
          </button>
          <button
            className="lesson-nav-btn"
            onClick={() => goToLesson(lesson - 1)}
            disabled={lesson <= 1}
          >
            ← Bài trước
          </button>

          {/* Lesson picker with completion status in each option */}
          <select
            className="lesson-select"
            value={lesson}
            onChange={(e) => goToLesson(parseInt(e.target.value, 10))}
          >
            {lessonStats.map((st) => (
              <option key={st.lessonNum} value={st.lessonNum}>
                Bài {st.lessonNum} ({st.isCompleted ? `✅ Đã xong 10/${st.totalCount}` : `${st.learnedCount}/${st.totalCount} • Còn ${st.unlearnedCount}`})
              </option>
            ))}
          </select>

          <button
            className="lesson-nav-btn"
            onClick={() => goToLesson(lesson + 1)}
            disabled={lesson >= totalLessons}
          >
            Bài sau →
          </button>
          <button
            className="lesson-nav-btn"
            onClick={() => goToLesson(totalLessons)}
            disabled={lesson >= totalLessons}
            title="Bài cuối cùng"
          >
            ⏭
          </button>

          {/* Button to jump to next incomplete lesson if available */}
          {nextIncompleteLesson && (
            <button
              className="lesson-jump-incomplete-btn"
              onClick={() => goToLesson(nextIncompleteLesson)}
              title={`Nhảy tới Bài ${nextIncompleteLesson} còn mục chưa thuộc`}
            >
              ⚡ Tới bài chưa xong: Bài {nextIncompleteLesson}
            </button>
          )}
        </div>

        {/* Unlearned Quick Filter Bar */}
        <div className="lesson-unlearned-toolbar">
          <button
            className={`btn-toggle-unlearned ${viewUnlearned ? "active" : ""}`}
            onClick={() => setViewUnlearned(!viewUnlearned)}
          >
            {viewUnlearned ? "📖 Xem lại bài đang học" : `⚠️ Xem từ/câu chưa thuộc (${unlearnedUpToCurrent.length})`}
          </button>

          {viewUnlearned && (
            <div className="unlearned-scope-selector">
              <span className="scope-label">Phạm vi:</span>
              <button
                className={`scope-pill ${unlearnedScope === "up_to_current" ? "active" : ""}`}
                onClick={() => setUnlearnedScope("up_to_current")}
              >
                Bài 1 → Bài {lesson} ({unlearnedUpToCurrent.length})
              </button>
              <button
                className={`scope-pill ${unlearnedScope === "all" ? "active" : ""}`}
                onClick={() => setUnlearnedScope("all")}
              >
                Tất cả các bài ({allUnlearned.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div id="lesson-content-top" className="lesson-items">
        {viewUnlearned ? (
          <div>
            <div className="unlearned-view-header">
              <h3>
                ⚠️ Danh sách câu/từ chưa thuộc {unlearnedScope === "up_to_current" ? `(từ Bài 1 đến Bài ${lesson})` : "(Toàn bộ)"}: {displayedUnlearnedItems.length} mục
              </h3>
              <p>Bạn có thể nghe và bấm &quot;Đã thuộc 🎉&quot; trực tiếp tại đây để hoàn thiện bài học.</p>
            </div>

            {displayedUnlearnedItems.length === 0 ? (
              <div className="empty-state" style={{ marginTop: "16px" }}>
                <span className="empty-icon">🎉</span>
                <p>Tuyệt vời! Bạn đã thuộc toàn bộ câu/từ trong phạm vi này!</p>
                <button className="lesson-nav-btn lesson-nav-btn--large" onClick={() => setViewUnlearned(false)} style={{ marginTop: "12px" }}>
                  ← Quay lại Bài {lesson}
                </button>
              </div>
            ) : (
              <div className="lesson-items" style={{ marginTop: "14px" }}>
                {displayedUnlearnedItems.map(({ item, originalIndex, lessonNum }) => (
                  <div key={item.id} className="unlearned-item-container">
                    <div className="unlearned-item-lesson-tag">
                      <span className="badge-lesson">Thuộc Bài {lessonNum}</span>
                      <button
                        className="btn-link-lesson"
                        onClick={() => goToLesson(lessonNum)}
                        title={`Mở Bài ${lessonNum}`}
                      >
                        Đến bài này ↗
                      </button>
                    </div>
                    {renderItem(item, originalIndex)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          lessonItems.map((item, idx) => renderItem(item, startIdx + idx))
        )}
      </div>

      {/* Bottom navigation */}
      {!viewUnlearned && (
        <div className="lesson-bottom-nav">
          <button
            className="lesson-nav-btn lesson-nav-btn--large"
            onClick={() => goToLesson(lesson - 1)}
            disabled={lesson <= 1}
          >
            ← Bài {lesson - 1}
          </button>

          <span className="lesson-bottom-info">
            Bài {lesson} / {totalLessons}
            {lessonProgress === 100 && (
              <span className="lesson-complete-badge">🎉 Hoàn thành!</span>
            )}
            {currentLessonStat.unlearnedCount > 0 && (
              <span className="lesson-remaining-badge">
                Còn {currentLessonStat.unlearnedCount} chưa thuộc
              </span>
            )}
          </span>

          <button
            className="lesson-nav-btn lesson-nav-btn--large"
            onClick={() => goToLesson(lesson + 1)}
            disabled={lesson >= totalLessons}
          >
            Bài {lesson + 1} →
          </button>
        </div>
      )}
    </div>
  );
}
