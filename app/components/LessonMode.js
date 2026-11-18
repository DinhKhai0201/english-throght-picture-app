"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpenIcon,
  CheckIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ZapIcon,
  AlertTriangleIcon,
  InboxIcon,
} from "./Icons";

const LESSON_SIZE = 10;

export default function LessonMode({
  items = [],
  storageKey,
  learnedIds = new Set(),
  renderItem,
  lessonSize = LESSON_SIZE,
}) {
  const totalLessons = Math.ceil(items.length / lessonSize) || 1;

  const [currentLesson, setCurrentLesson] = useState(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = parseInt(localStorage.getItem(`${storageKey}_lesson`) || "1", 10);
      return isNaN(saved) || saved < 1 ? 1 : Math.min(saved, Math.max(1, totalLessons));
    }
    return 1;
  });

  const [viewUnlearned, setViewUnlearned] = useState(false);
  const [unlearnedScope, setUnlearnedScope] = useState("up_to_current");

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

  const unlearnedUpToCurrent = useMemo(() => {
    const sliceEnd = Math.min(lesson * lessonSize, items.length);
    const subset = items.slice(0, sliceEnd);
    return subset
      .map((item, idx) => ({ item, originalIndex: idx, lessonNum: Math.floor(idx / lessonSize) + 1 }))
      .filter(({ item }) => !learnedIds.has(item.id));
  }, [items, lesson, lessonSize, learnedIds]);

  const allUnlearned = useMemo(() => {
    return items
      .map((item, idx) => ({ item, originalIndex: idx, lessonNum: Math.floor(idx / lessonSize) + 1 }))
      .filter(({ item }) => !learnedIds.has(item.id));
  }, [items, lessonSize, learnedIds]);

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
        <span className="empty-icon">
          <InboxIcon size={36} />
        </span>
        <p>Không có dữ liệu để học.</p>
      </div>
    );
  }

  const displayedUnlearnedItems = unlearnedScope === "up_to_current" ? unlearnedUpToCurrent : allUnlearned;

  return (
    <div className="lesson-mode-wrapper">
      <div className="lesson-header">
        <div className="lesson-title-row">
          <span className="lesson-title">
            <BookOpenIcon size={17} />
            Bài {lesson} / {totalLessons}
          </span>
          <span className="lesson-range">
            (#{startIdx + 1} – #{Math.min(startIdx + lessonSize, items.length)})
          </span>

          <span className={`lesson-done-badge ${currentLessonStat.isCompleted ? "completed" : ""}`}>
            {currentLessonStat.isCompleted ? (
              <>
                <CheckIcon size={14} /> Hoàn thành 100%
              </>
            ) : (
              `${learnedInLesson}/${lessonItems.length} đã thuộc`
            )}
          </span>
        </div>

        <div className="lesson-progress-bar-container">
          <div className="lesson-progress-bar" style={{ width: `${lessonProgress}%` }} />
        </div>

        <div className="lesson-nav-controls">
          <button
            type="button"
            className="lesson-nav-btn lesson-nav-btn--icon"
            onClick={() => goToLesson(1)}
            disabled={lesson <= 1}
            title="Bài đầu tiên"
            aria-label="Bài đầu tiên"
          >
            <ChevronsLeftIcon size={16} />
          </button>
          <button
            type="button"
            className="lesson-nav-btn"
            onClick={() => goToLesson(lesson - 1)}
            disabled={lesson <= 1}
          >
            <ArrowLeftIcon size={14} />
            <span>Bài trước</span>
          </button>

          <select
            className="lesson-select"
            value={lesson}
            onChange={(e) => goToLesson(parseInt(e.target.value, 10))}
            aria-label="Chọn bài học"
          >
            {lessonStats.map((st) => (
              <option key={st.lessonNum} value={st.lessonNum}>
                Bài {st.lessonNum} ({st.isCompleted ? `Xong ${st.totalCount}/${st.totalCount}` : `${st.learnedCount}/${st.totalCount} • Còn ${st.unlearnedCount}`})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="lesson-nav-btn"
            onClick={() => goToLesson(lesson + 1)}
            disabled={lesson >= totalLessons}
          >
            <span>Bài sau</span>
            <ArrowRightIcon size={14} />
          </button>
          <button
            type="button"
            className="lesson-nav-btn lesson-nav-btn--icon"
            onClick={() => goToLesson(totalLessons)}
            disabled={lesson >= totalLessons}
            title="Bài cuối cùng"
            aria-label="Bài cuối cùng"
          >
            <ChevronsRightIcon size={16} />
          </button>

          {nextIncompleteLesson && (
            <button
              type="button"
              className="lesson-jump-incomplete-btn"
              onClick={() => goToLesson(nextIncompleteLesson)}
              title={`Nhảy tới Bài ${nextIncompleteLesson} còn mục chưa thuộc`}
            >
              <ZapIcon size={14} />
              <span>Tới bài chưa xong: Bài {nextIncompleteLesson}</span>
            </button>
          )}
        </div>

        <div className="lesson-unlearned-toolbar">
          <button
            type="button"
            className={`btn-toggle-unlearned ${viewUnlearned ? "active" : ""}`}
            onClick={() => setViewUnlearned(!viewUnlearned)}
          >
            {viewUnlearned ? (
              <>
                <BookOpenIcon size={15} />
                <span>Xem lại bài đang học</span>
              </>
            ) : (
              <>
                <AlertTriangleIcon size={15} />
                <span>Xem từ/câu chưa thuộc ({unlearnedUpToCurrent.length})</span>
              </>
            )}
          </button>

          {viewUnlearned && (
            <div className="unlearned-scope-selector">
              <span className="scope-label">Phạm vi:</span>
              <button
                type="button"
                className={`scope-pill ${unlearnedScope === "up_to_current" ? "active" : ""}`}
                onClick={() => setUnlearnedScope("up_to_current")}
              >
                Bài 1 → Bài {lesson} ({unlearnedUpToCurrent.length})
              </button>
              <button
                type="button"
                className={`scope-pill ${unlearnedScope === "all" ? "active" : ""}`}
                onClick={() => setUnlearnedScope("all")}
              >
                Tất cả ({allUnlearned.length})
              </button>
            </div>
          )}
        </div>
      </div>

      <div id="lesson-content-top" className="lesson-items">
        {viewUnlearned ? (
          <div>
            <div className="unlearned-view-header">
              <h3>
                <AlertTriangleIcon size={16} />
                <span>
                  Danh sách chưa thuộc {unlearnedScope === "up_to_current" ? `(Bài 1 – Bài ${lesson})` : "(Toàn bộ)"}: {displayedUnlearnedItems.length} mục
                </span>
              </h3>
              <p>Nghe phát âm và đánh dấu &quot;Đã thuộc&quot; trực tiếp tại đây để hoàn tất bài học.</p>
            </div>

            {displayedUnlearnedItems.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <CheckIcon size={36} />
                </span>
                <p>Bạn đã thuộc toàn bộ mục trong phạm vi này.</p>
                <button
                  type="button"
                  className="lesson-nav-btn lesson-nav-btn--large"
                  onClick={() => setViewUnlearned(false)}
                >
                  <ArrowLeftIcon size={14} />
                  <span>Quay lại Bài {lesson}</span>
                </button>
              </div>
            ) : (
              <div className="lesson-items">
                {displayedUnlearnedItems.map(({ item, originalIndex, lessonNum }) => (
                  <div key={item.id} className="unlearned-item-container">
                    <div className="unlearned-item-lesson-tag">
                      <span className="badge-lesson">Thuộc Bài {lessonNum}</span>
                      <button
                        type="button"
                        className="btn-link-lesson"
                        onClick={() => goToLesson(lessonNum)}
                        title={`Mở Bài ${lessonNum}`}
                      >
                        Đến bài này
                        <ArrowRightIcon size={13} />
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

      {!viewUnlearned && (
        <div className="lesson-bottom-nav">
          <button
            type="button"
            className="lesson-nav-btn lesson-nav-btn--large"
            onClick={() => goToLesson(lesson - 1)}
            disabled={lesson <= 1}
          >
            <ArrowLeftIcon size={14} />
            <span>Bài {lesson - 1}</span>
          </button>

          <span className="lesson-bottom-info">
            Bài {lesson} / {totalLessons}
            {lessonProgress === 100 && (
              <span className="lesson-complete-badge">
                <CheckIcon size={13} /> Hoàn thành
              </span>
            )}
            {currentLessonStat.unlearnedCount > 0 && (
              <span className="lesson-remaining-badge">
                Còn {currentLessonStat.unlearnedCount} chưa thuộc
              </span>
            )}
          </span>

          <button
            type="button"
            className="lesson-nav-btn lesson-nav-btn--large"
            onClick={() => goToLesson(lesson + 1)}
            disabled={lesson >= totalLessons}
          >
            <span>Bài {lesson + 1}</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
