"use client";

import { useState } from "react";
import {
  Volume2Icon,
  LightbulbIcon,
  AlertTriangleIcon,
  BookOpenIcon,
  ZapIcon,
  ListIcon,
  CheckIcon,
} from "../Icons";
import { isTextSelected } from "../../lib/uiUtils";
import { StudyCardFooter } from "./StudyLayoutParts";

export default function GrammarCardItem({
  item,
  displayNum,
  categoryName,
  isLearned,
  onToggleLearned,
  studyCount,
  onIncrementStudyCount,
  playingId,
  onPlaySpeech,
}) {
  const [activeTab, setActiveTab] = useState("theory"); // 'theory' | 'special' | 'examples' | 'all'

  const hasDetailedFormulas = item.detailed_formulas && item.detailed_formulas.length > 0;
  const hasUsageNotes = item.usage_notes && item.usage_notes.length > 0;
  const hasSpecialCases = item.special_cases && item.special_cases.length > 0;
  const hasSignals = item.signals && item.signals.length > 0;
  const hasExamples = item.examples && item.examples.length > 0;

  const showTheory = activeTab === "theory" || activeTab === "all";
  const showSpecial = (activeTab === "special" || activeTab === "all") && hasSpecialCases;
  const showExamples = activeTab === "examples" || activeTab === "all";

  return (
    <article className={`sentence-card grammar-card ${isLearned ? "learned" : ""}`}>
      {/* Top badges */}
      <div className="card-top">
        <span className="card-index">#{displayNum}</span>
        <span className="card-category">{categoryName || item.category}</span>
        <span className={`grammar-level-badge grammar-level-${item.level}`}>{item.band}</span>
      </div>

      {/* Header & Basic Formula */}
      <div className="grammar-header-block">
        <h2 className="grammar-title">{item.title}</h2>
        <div className="grammar-formula-box">
          <span className="grammar-formula-label">Cấu trúc cốt lõi</span>
          <code className="grammar-formula-code">{item.formula}</code>
        </div>
        <p className="grammar-explanation">{item.explanation_vi}</p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grammar-tabs-bar" role="tablist" aria-label="Chế độ xem chi tiết ngữ pháp">
        <button
          type="button"
          className={`grammar-tab-btn ${activeTab === "theory" ? "active" : ""}`}
          onClick={() => setActiveTab("theory")}
          role="tab"
          aria-selected={activeTab === "theory"}
        >
          <BookOpenIcon size={14} />
          <span>Cấu trúc &amp; Bảng thì</span>
          {hasDetailedFormulas && (
            <span className="grammar-tab-badge">{item.detailed_formulas.length}</span>
          )}
        </button>

        {hasSpecialCases && (
          <button
            type="button"
            className={`grammar-tab-btn ${activeTab === "special" ? "active" : ""}`}
            onClick={() => setActiveTab("special")}
            role="tab"
            aria-selected={activeTab === "special"}
          >
            <ZapIcon size={14} />
            <span>Trường hợp đặc biệt</span>
            <span className="grammar-tab-badge">{item.special_cases.length}</span>
          </button>
        )}

        <button
          type="button"
          className={`grammar-tab-btn ${activeTab === "examples" ? "active" : ""}`}
          onClick={() => setActiveTab("examples")}
          role="tab"
          aria-selected={activeTab === "examples"}
        >
          <Volume2Icon size={14} />
          <span>Ví dụ &amp; Mẹo IELTS</span>
          {hasExamples && <span className="grammar-tab-badge">{item.examples.length}</span>}
        </button>

        <button
          type="button"
          className={`grammar-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
          role="tab"
          aria-selected={activeTab === "all"}
          title="Hiển thị đồng thời toàn bộ lý thuyết, trường hợp đặc biệt và ví dụ"
        >
          <ListIcon size={14} />
          <span>Xem tất cả</span>
        </button>
      </div>

      {/* 1. THEORY SECTION: Signals + Detailed Formulas + Usage Notes */}
      {showTheory && (
        <div className="grammar-section-block">
          {/* Signals */}
          {hasSignals && (
            <div className="grammar-signals-row">
              <span className="grammar-signal-label">Dấu hiệu nhận biết:</span>
              {item.signals.map((sig, sIdx) => (
                <span key={sIdx} className="grammar-signal-pill">
                  {sig}
                </span>
              ))}
            </div>
          )}

          {/* Detailed formulas table */}
          {hasDetailedFormulas && (
            <div className="grammar-table-wrap">
              <table className="grammar-formula-table">
                <thead>
                  <tr>
                    <th className="th-form">Thì / Trường hợp</th>
                    <th className="th-struct">Công thức chi tiết</th>
                    <th className="th-ex">Ví dụ minh họa</th>
                  </tr>
                </thead>
                <tbody>
                  {item.detailed_formulas.map((df, dfIdx) => (
                    <tr key={dfIdx}>
                      <td className="grammar-table-form">
                        {df.form || df.meaning || `Dạng ${dfIdx + 1}`}
                      </td>
                      <td>
                        <code className="grammar-table-code">{df.structure || df.nouns || df.usage}</code>
                      </td>
                      <td className="grammar-table-ex">{df.example || df.usage || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Usage notes */}
          {hasUsageNotes && (
            <div className="grammar-notes-list">
              <div className="grammar-section-title">
                <CheckIcon size={14} />
                <span>Quy tắc &amp; Lưu ý sống còn</span>
              </div>
              {item.usage_notes.map((note, nIdx) => (
                <div key={nIdx} className="grammar-note-item">
                  <CheckIcon size={14} />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. SPECIAL CASES SECTION */}
      {showSpecial && (
        <div className="grammar-section-block">
          <div className="grammar-section-title">
            <ZapIcon size={15} />
            <span>Trường hợp đặc biệt &amp; Bẫy thi cử nâng cao ({item.special_cases.length})</span>
          </div>
          <div className="grammar-specials-list">
            {item.special_cases.map((sc, scIdx) => (
              <div key={scIdx} className="grammar-special-card">
                <div className="grammar-special-title">
                  <ZapIcon size={13} />
                  <span>{sc.title}</span>
                </div>
                <div className="grammar-special-formula">{sc.formula}</div>
                <p className="grammar-special-desc">{sc.explanation}</p>
                {sc.example && (
                  <div className="grammar-special-example">
                    <span className="label">Ví dụ:</span> {sc.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EXAMPLES & IELTS TIPS SECTION */}
      {showExamples && (
        <div className="grammar-section-block">
          {hasExamples && (
            <div className="grammar-examples-block">
              <div className="grammar-sub-heading">
                Ví dụ thực tế ({item.examples.length} câu • Bấm để nghe phát âm &amp; tăng lượt đọc)
              </div>
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
                        onPlaySpeech(ex.en, exPlayId);
                        onIncrementStudyCount(item.id);
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

          {/* Common Mistake */}
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

          {/* IELTS Tip */}
          {item.ielts_tip_vi && (
            <div className="grammar-tip-box">
              <LightbulbIcon size={15} />
              <span>{item.ielts_tip_vi}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer Counter & Learned Status */}
      <StudyCardFooter
        isLearned={isLearned}
        onToggleLearned={() => onToggleLearned(item.id)}
        studyCount={studyCount || 0}
        learnedLabel="Đã nắm vững"
        unlearnedLabel="Đánh dấu đã nắm vững"
        counterTitle="Số lần bấm đọc ví dụ"
      />
    </article>
  );
}
