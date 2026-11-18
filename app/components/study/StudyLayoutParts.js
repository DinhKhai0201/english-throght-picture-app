"use client";

import {
  SearchIcon,
  XIcon,
  RotateCcwIcon,
  BookOpenIcon,
  ListIcon,
  InboxIcon,
  LightbulbIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "../Icons";

export function StudyLoading({ message = "Đang tải dữ liệu học..." }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export function StudyModeStrip({
  mode,
  onChange,
  browseLabel = "Duyệt tất cả",
  lessonLabel = "Học theo bài (10 câu/bài)",
  tabs,
  ariaLabel = "Chế độ học",
}) {
  const resolvedTabs = tabs || [
    { id: "browse", label: browseLabel, icon: <ListIcon size={15} /> },
    { id: "lesson", label: lessonLabel, icon: <BookOpenIcon size={15} /> },
  ];

  return (
    <div className="mode-toggle-strip" role="tablist" aria-label={ariaLabel}>
      {resolvedTabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={`mode-toggle-btn ${mode === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export function StudyHeroHeader({
  eyebrow,
  title,
  subtitle,
  statLabel = "Tiến trình học của bạn",
  learnedCount = 0,
  totalCount = 0,
  unitLabel = "câu",
  onReset,
  resetTitle = "Xóa toàn bộ tiến trình học",
}) {
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  return (
    <header className="hero">
      <div className="hero-content">
        {eyebrow && <span className="hero-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
      </div>

      <div className="progress-card">
        <div className="progress-stats">
          <span className="stat-label">{statLabel}</span>
          <span className="stat-value">
            {learnedCount}/{totalCount} {unitLabel} ({progressPercent}%)
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
        {onReset && (
          <div className="progress-actions">
            <button type="button" onClick={onReset} className="btn-reset" title={resetTitle}>
              <RotateCcwIcon size={14} />
              <span>Reset tiến trình</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export function StudyControlPanel({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  leftSummary,
  extraControls,
  voices = [],
  selectedVoice = "",
  onVoiceChange,
  voiceLabel = "Giọng đọc",
  defaultVoiceLabel = "Mặc định hệ thống",
  speechRate = 0.9,
  onRateChange,
  rateMin = 0.5,
  rateMax = 1.5,
  rateStep = 0.05,
}) {
  return (
    <section className="control-panel">
      {leftSummary ? (
        <div className="comm-voice-summary">
          <span>{leftSummary}</span>
        </div>
      ) : (
        onSearchChange && (
          <div className="search-box">
            <span className="search-icon">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="clear-search"
                aria-label="Xóa tìm kiếm"
              >
                <XIcon size={15} />
              </button>
            )}
          </div>
        )
      )}

      <div className="tts-controls">
        {extraControls}

        <div className="control-group">
          <label htmlFor="voice-select">{voiceLabel}</label>
          <select id="voice-select" value={selectedVoice} onChange={(e) => onVoiceChange(e.target.value)}>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
            {voices.length === 0 && <option value="">{defaultVoiceLabel}</option>}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="rate-range">Tốc độ ({speechRate}x)</label>
          <input
            id="rate-range"
            type="range"
            min={rateMin}
            max={rateMax}
            step={rateStep}
            value={speechRate}
            onChange={(e) => onRateChange(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </section>
  );
}

export function StudyFilterTabs({
  filterType,
  onFilterChange,
  allCount,
  unlearnedCount,
  learnedCount,
  unlearnedLabel = "Chưa học",
  learnedLabel = "Đã thuộc",
  inline = false,
}) {
  return (
    <div className={`filter-tabs ${inline ? "filter-tabs--inline" : ""}`}>
      <button
        type="button"
        onClick={() => onFilterChange("all")}
        className={`filter-tab ${filterType === "all" ? "active" : ""}`}
      >
        Tất cả ({allCount})
      </button>
      <button
        type="button"
        onClick={() => onFilterChange("unlearned")}
        className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
      >
        {unlearnedLabel} ({unlearnedCount})
      </button>
      <button
        type="button"
        onClick={() => onFilterChange("learned")}
        className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
      >
        {learnedLabel} ({learnedCount})
      </button>
    </div>
  );
}

export function StudyCardFooter({
  isLearned,
  onToggleLearned,
  studyCount = 0,
  showCounter = true,
  learnedLabel = "Đã thuộc",
  unlearnedLabel = "Đánh dấu đã thuộc",
  counterTitle = "Số lần luyện tập",
}) {
  return (
    <div className="card-footer">
      <label className="checkbox-container">
        <input type="checkbox" checked={isLearned} onChange={onToggleLearned} />
        <span className="checkmark" />
        <span className="checkbox-label">
          {isLearned ? (
            <span className="learned-label-inline">
              <CheckIcon size={14} /> {learnedLabel}
            </span>
          ) : (
            unlearnedLabel
          )}
        </span>
      </label>
      {showCounter && (
        <div className="study-counter" title={counterTitle}>
          <span className="counter-num">{studyCount}</span>
        </div>
      )}
    </div>
  );
}

export function StudyEmptyState({ message = "Không tìm thấy mục nào phù hợp với bộ lọc hiện tại." }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <InboxIcon size={36} />
      </span>
      <p>{message}</p>
    </div>
  );
}

export function StudyFooterTip({ text }) {
  return (
    <footer className="app-footer">
      <p>
        <LightbulbIcon size={15} />
        <span>{text}</span>
      </p>
    </footer>
  );
}

export function StudyPagination({
  currentPage,
  totalPages,
  totalItems,
  unitLabel = "mục",
  pageInput,
  setPageInput,
  onChangePage,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls">
      <button
        type="button"
        onClick={() => onChangePage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="pagination-btn"
      >
        <ArrowLeftIcon size={14} />
        <span>Trang trước</span>
      </button>

      <div className="pagination-jump">
        <span className="pagination-info">Trang</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const p = parseInt(pageInput, 10);
              if (!isNaN(p)) onChangePage(p);
            }
          }}
          onBlur={() => {
            const p = parseInt(pageInput, 10);
            if (!isNaN(p)) onChangePage(p);
            else setPageInput(currentPage.toString());
          }}
          className="pagination-input"
          aria-label="Số trang"
        />
        <span className="pagination-info">
          / {totalPages} ({totalItems} {unitLabel})
        </span>
      </div>

      <button
        type="button"
        onClick={() => onChangePage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="pagination-btn"
      >
        <span>Trang sau</span>
        <ArrowRightIcon size={14} />
      </button>
    </div>
  );
}

