"use client";

import { useState, useEffect } from "react";

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
  const totalLessons = Math.ceil(items.length / lessonSize);

  // Restore lesson from localStorage
  const [currentLesson, setCurrentLesson] = useState(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = parseInt(localStorage.getItem(`${storageKey}_lesson`) || "1", 10);
      return isNaN(saved) || saved < 1 ? 1 : Math.min(saved, Math.max(1, totalLessons));
    }
    return 1;
  });

  // Persist lesson to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && storageKey) {
      localStorage.setItem(`${storageKey}_lesson`, currentLesson.toString());
    }
  }, [currentLesson, storageKey]);

  const lesson = Math.min(Math.max(1, currentLesson), Math.max(1, totalLessons));
  const startIdx = (lesson - 1) * lessonSize;
  const lessonItems = items.slice(startIdx, startIdx + lessonSize);

  const learnedInLesson = lessonItems.filter((item) => learnedIds.has(item.id)).length;
  const lessonProgress = lessonItems.length > 0 ? Math.round((learnedInLesson / lessonItems.length) * 100) : 0;

  const goToLesson = (n) => {
    const clamped = Math.max(1, Math.min(n, totalLessons));
    setCurrentLesson(clamped);
    // Scroll to top of lesson content
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

  return (
    <div className="lesson-mode-wrapper">
      {/* Lesson Header */}
      <div className="lesson-header">
        <div className="lesson-title-row">
          <span className="lesson-title">
            📖 Bài {lesson} / {totalLessons}
          </span>
          <span className="lesson-range">
            (#{startIdx + 1} – #{Math.min(startIdx + lessonSize, items.length)})
          </span>
          <span className="lesson-done-badge">
            {learnedInLesson}/{lessonItems.length} đã thuộc
          </span>
        </div>

        {/* Lesson progress bar */}
        <div className="lesson-progress-bar-container">
          <div
            className="lesson-progress-bar"
            style={{ width: `${lessonProgress}%` }}
          />
        </div>

        {/* Navigation buttons */}
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

          {/* Lesson picker */}
          <select
            className="lesson-select"
            value={lesson}
            onChange={(e) => goToLesson(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: totalLessons }, (_, i) => {
              const bStart = i * lessonSize + 1;
              const bEnd = Math.min((i + 1) * lessonSize, items.length);
              return (
                <option key={i + 1} value={i + 1}>
                  Bài {i + 1} (#{bStart}–#{bEnd})
                </option>
              );
            })}
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
        </div>
      </div>

      {/* Lesson Content */}
      <div id="lesson-content-top" className="lesson-items">
        {lessonItems.map((item, idx) => renderItem(item, startIdx + idx))}
      </div>

      {/* Bottom navigation (repeat for convenience) */}
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
        </span>

        <button
          className="lesson-nav-btn lesson-nav-btn--large"
          onClick={() => goToLesson(lesson + 1)}
          disabled={lesson >= totalLessons}
        >
          Bài {lesson + 1} →
        </button>
      </div>
    </div>
  );
}

