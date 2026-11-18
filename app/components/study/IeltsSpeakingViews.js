"use client";

import {
  Volume2Icon,
  SearchIcon,
  XIcon,
  CheckIcon,
  ClockIcon,
  MicIcon,
  LayersIcon,
  LightbulbIcon,
  TargetIcon,
  AwardIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
} from "../Icons";
import { isTextSelected } from "../../lib/uiUtils";
import { StudyFilterTabs, StudyEmptyState } from "./StudyLayoutParts";

function getDayTypeLabel(type) {
  if (type === "checkpoint") return "Bài kiểm tra tuần";
  if (type === "cue_cards") return "Luyện Cue Cards Part 2";
  if (type === "mock_test") return "Thi thử Full 3 Part";
  if (type === "assessment") return "Đánh giá 30 ngày";
  return "Bài học Chunks";
}

function renderDayIcon(type, isDone) {
  if (isDone) return <CheckIcon size={15} />;
  if (type === "checkpoint") return <TargetIcon size={15} />;
  if (type === "cue_cards") return <BookOpenIcon size={15} />;
  if (type === "mock_test") return <AwardIcon size={15} />;
  return <MicIcon size={15} />;
}

export function SpeakingPlanTab({
  weeks,
  selectedWeek,
  onSelectWeek,
  filteredDays,
  selectedDayNum,
  onSelectDay,
  completedDays,
  onToggleDayCompletion,
  currentDay,
  learnedChunkIds,
  onToggleChunkLearned,
  playingId,
  onPlaySpeech,
  studyCounts,
  onIncrementCount,
  onStartTimer,
  rubricScores,
  onScoreChange,
}) {
  return (
    <section>
      <div className="categories-nav">
        <button
          type="button"
          onClick={() => onSelectWeek("all")}
          className={`category-pill ${selectedWeek === "all" ? "active" : ""}`}
        >
          Tất cả (30 ngày)
        </button>
        {weeks.map((w) => (
          <button
            type="button"
            key={w.week_number}
            onClick={() => onSelectWeek(w.week_number.toString())}
            className={`category-pill ${selectedWeek === w.week_number.toString() ? "active" : ""}`}
          >
            Tuần {w.week_number}: {w.title_vi} ({w.day_range})
          </button>
        ))}
      </div>

      <div className="speaking-day-picker">
        {filteredDays.map((d) => {
          const isSelected = d.day === selectedDayNum;
          const isDone = completedDays.has(d.day);
          return (
            <button
              type="button"
              key={d.day}
              onClick={() => onSelectDay(d.day)}
              className={`speaking-day-btn ${isSelected ? "is-selected" : ""} ${isDone ? "is-done" : ""}`}
            >
              <span className="speaking-day-num">Ngày {d.day}</span>
              <span className="speaking-day-icon">{renderDayIcon(d.type, isDone)}</span>
            </button>
          );
        })}
      </div>

      <article className="sentence-card speaking-detail-card">
        <div className="speaking-detail-header">
          <div>
            <div className="speaking-detail-meta">
              <span className="speaking-header-badge">
                Tuần {currentDay.week} • Ngày {currentDay.day}/30
              </span>
              <span className="speaking-day-type">{getDayTypeLabel(currentDay.type)}</span>
            </div>
            <h2 className="speaking-day-title">{currentDay.title_en}</h2>
            <p className="speaking-day-subtitle">{currentDay.title_vi}</p>
          </div>

          <button
            type="button"
            onClick={() => onToggleDayCompletion(currentDay.day)}
            className={`speaking-complete-btn ${completedDays.has(currentDay.day) ? "is-completed" : ""}`}
          >
            <CheckIcon size={15} />
            <span>{completedDays.has(currentDay.day) ? "Đã hoàn thành ngày này" : "Đánh dấu hoàn thành"}</span>
          </button>
        </div>

        {currentDay.chunks && currentDay.chunks.length > 0 && (
          <div className="speaking-section">
            <div className="speaking-section-head">
              <h3 className="speaking-section-title">
                <LayersIcon size={16} />
                <span>Các cụm từ chìa khóa (Language Chunks) hôm nay</span>
              </h3>
              <span className="speaking-section-count">{currentDay.chunks.length} cụm từ</span>
            </div>

            <div className="speaking-chunks-grid">
              {currentDay.chunks.map((c, cIdx) => {
                const chunkId = `d${currentDay.day}_c${cIdx}`;
                const isLearned = learnedChunkIds.has(chunkId);
                const isPlaying = playingId === chunkId;
                const isPlayingEx = playingId === `${chunkId}_ex`;

                return (
                  <div key={cIdx} className={`speaking-chunk-item ${isLearned ? "is-learned" : ""}`}>
                    <div className="speaking-chunk-top">
                      <span
                        onClick={() => {
                          if (isTextSelected()) return;
                          onPlaySpeech(c.chunk, chunkId);
                          onIncrementCount(chunkId);
                        }}
                        className="speaking-chunk-phrase"
                        title="Bấm để nghe phát âm"
                      >
                        {c.chunk}
                      </span>

                      <div className="speaking-chunk-actions">
                        <button
                          type="button"
                          onClick={() => {
                            onPlaySpeech(c.chunk, chunkId);
                            onIncrementCount(chunkId);
                          }}
                          className={`play-button play-button--sm ${isPlaying ? "playing" : ""}`}
                          title="Nghe phát âm chunk"
                          aria-label="Nghe phát âm chunk"
                        >
                          <Volume2Icon size={14} className={isPlaying ? "playing-animation" : ""} />
                        </button>
                        <input
                          type="checkbox"
                          checked={isLearned}
                          onChange={() => onToggleChunkLearned(chunkId)}
                          title="Đánh dấu đã thuộc"
                          className="speaking-native-check"
                          aria-label="Đánh dấu đã thuộc"
                        />
                        <div className="study-counter study-counter--sm" title="Số lần bấm luyện tập">
                          <span className="counter-num">{studyCounts[chunkId] || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="speaking-chunk-meaning">{c.meaning_vi}</div>

                    {c.example && (
                      <div
                        onClick={() => {
                          if (isTextSelected()) return;
                          onPlaySpeech(c.example, `${chunkId}_ex`);
                          onIncrementCount(chunkId);
                        }}
                        className="speaking-chunk-example"
                        title="Bấm để nghe câu ví dụ hoàn chỉnh"
                      >
                        <span className="speaking-ex-label">Ex:</span>
                        <span>{c.example}</span>
                        {isPlayingEx && <Volume2Icon size={13} className="speaking-ex-playing" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentDay.model_en && (
          <div className="speaking-box speaking-tint-green">
            <div className="speaking-box-head">
              <h3 className="speaking-box-title">
                <LightbulbIcon size={16} />
                <span>Bài nói mẫu kết hợp Chunks (Model Answer)</span>
              </h3>
              <div className="speaking-chunk-actions">
                <div className="study-counter study-counter--sm" title="Số lần bấm luyện nghe bài mẫu">
                  <span className="counter-num">{studyCounts[`d${currentDay.day}_model`] || 0}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onPlaySpeech(currentDay.model_en, `d${currentDay.day}_model`);
                    onIncrementCount(`d${currentDay.day}_model`);
                  }}
                  className={`play-button play-button--sm ${
                    playingId === `d${currentDay.day}_model` ? "playing" : ""
                  }`}
                  title="Nghe toàn bộ bài nói mẫu"
                  aria-label="Nghe bài nói mẫu"
                >
                  <Volume2Icon size={15} />
                </button>
              </div>
            </div>
            <p
              onClick={() => {
                if (isTextSelected()) return;
                onPlaySpeech(currentDay.model_en, `d${currentDay.day}_model`);
                onIncrementCount(`d${currentDay.day}_model`);
              }}
              className="speaking-model-en"
            >
              &quot;{currentDay.model_en}&quot;
            </p>
            <p className="speaking-model-vi">{currentDay.model_vi}</p>
          </div>
        )}

        {currentDay.questions && currentDay.questions.length > 0 && (
          <div className="speaking-box speaking-box--neutral">
            <h3 className="speaking-box-title">
              <MicIcon size={16} />
              <span>Câu hỏi tự luyện nói thành tiếng (Áp dụng A-R-D)</span>
            </h3>
            <div className="speaking-questions-list">
              {currentDay.questions.map((q, qIdx) => {
                const qKey = `d${currentDay.day}_q_${qIdx}`;
                const isPlayingQ = playingId === qKey;
                return (
                  <div
                    key={qIdx}
                    onClick={() => {
                      if (isTextSelected()) return;
                      onPlaySpeech(q, qKey);
                      onIncrementCount(qKey);
                    }}
                    className="speaking-question-row"
                    title="Bấm để nghe câu hỏi"
                  >
                    <span className="speaking-question-text">
                      {qIdx + 1}. {q}
                    </span>
                    <div className="speaking-chunk-actions">
                      <div className="study-counter study-counter--sm" title="Số lần bấm luyện câu hỏi">
                        <span className="counter-num">{studyCounts[qKey] || 0}</span>
                      </div>
                      <button
                        type="button"
                        className={`play-button play-button--sm ${isPlayingQ ? "playing" : ""}`}
                        aria-label="Nghe câu hỏi"
                      >
                        <Volume2Icon size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentDay.cue_card_method && (
          <div className="speaking-box speaking-tint-blue">
            <h3 className="speaking-box-title">{currentDay.cue_card_method.title}</h3>
            <div className="speaking-steps-grid">
              {currentDay.cue_card_method.steps.map((st) => (
                <div key={st.step} className="speaking-subcard">
                  <div className="speaking-subcard-title">
                    Bước {st.step}: {st.name} ({st.prompt})
                  </div>
                  <div className="speaking-subcard-meta">
                    Ví dụ ghi chú: <code className="speaking-note-code">{st.note}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentDay.cue_cards && (
          <div className="speaking-section">
            <h3 className="speaking-section-title">5 Đề Cue Cards thực chiến</h3>
            <div className="speaking-cuecards-list">
              {currentDay.cue_cards.map((cc, ccIdx) => (
                <div key={cc.id} className="speaking-box speaking-box--neutral">
                  <div className="speaking-cuecard-head">
                    <div>
                      <span className="speaking-chunk-badge">Cue Card #{ccIdx + 1}</span>
                      <h4 className="speaking-cuecard-topic">{cc.topic}</h4>
                    </div>
                    <div className="speaking-timer-actions">
                      <button
                        type="button"
                        onClick={() => onStartTimer(60, "prep")}
                        className="speaking-timer-btn speaking-timer-btn-prep"
                      >
                        <ClockIcon size={14} />
                        <span>1 phút chuẩn bị</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onStartTimer(120, "speak")}
                        className="speaking-timer-btn speaking-timer-btn-speak"
                      >
                        <MicIcon size={14} />
                        <span>2 phút nói</span>
                      </button>
                    </div>
                  </div>
                  <div className="speaking-subcard">
                    <p className="speaking-prompts-label">You should say:</p>
                    <ul className="speaking-prompts-list">
                      {cc.prompts.map((p, pIdx) => (
                        <li key={pIdx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentDay.part3_framework && (
          <div className="speaking-box speaking-tint-purple">
            <h3 className="speaking-box-title">
              Công thức triển khai Part 3: {currentDay.part3_framework.formula}
            </h3>
            <div className="speaking-steps-grid">
              {currentDay.part3_framework.steps.map((st) => (
                <div key={st.code} className="speaking-subcard">
                  <span className="speaking-formula-code">{st.code}</span> — {st.name}
                  <p className="speaking-subcard-meta">{st.desc}</p>
                </div>
              ))}
            </div>
            <div className="speaking-subcard">
              <div className="speaking-subcard-title">Câu hỏi mẫu: {currentDay.part3_framework.sample_q}</div>
              <p className="speaking-subcard-body">{currentDay.part3_framework.sample_a}</p>
            </div>
          </div>
        )}

        {currentDay.mock_test_flow && (
          <div className="speaking-box speaking-tint-amber">
            <h3 className="speaking-box-title">
              <AwardIcon size={16} />
              <span>Full Mock Test Simulation (11 – 14 phút)</span>
            </h3>
            <div className="speaking-cuecards-list">
              <div className="speaking-subcard">
                <div className="speaking-subcard-title">
                  Part 1: Phỏng vấn mở đầu ({currentDay.mock_test_flow.part1.time})
                </div>
                <ul className="speaking-mock-list">
                  {currentDay.mock_test_flow.part1.questions.map((q, idx) => (
                    <li
                      key={idx}
                      className="speaking-mock-item"
                      onClick={() => {
                        onPlaySpeech(q, `mock_p1_${idx}`);
                        onIncrementCount(`mock_p1_${idx}`);
                      }}
                    >
                      <span>{q}</span>
                      <span className="speaking-mock-meta">
                        <Volume2Icon size={13} />
                        {studyCounts[`mock_p1_${idx}`] ? `(${studyCounts[`mock_p1_${idx}`]})` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="speaking-subcard">
                <div className="speaking-cuecard-head">
                  <span className="speaking-subcard-title">
                    Part 2: Độc thoại Cue Card ({currentDay.mock_test_flow.part2.time})
                  </span>
                  <div className="speaking-timer-actions">
                    <button
                      type="button"
                      onClick={() => onStartTimer(60, "prep")}
                      className="speaking-timer-btn speaking-timer-btn-prep"
                    >
                      1p Prep
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartTimer(120, "speak")}
                      className="speaking-timer-btn speaking-timer-btn-speak"
                    >
                      2p Speak
                    </button>
                  </div>
                </div>
                <p className="speaking-mock-cue">{currentDay.mock_test_flow.part2.cue_card}</p>
                <ul className="speaking-prompts-list">
                  {currentDay.mock_test_flow.part2.prompts.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="speaking-subcard">
                <div className="speaking-subcard-title">
                  Part 3: Thảo luận sâu ({currentDay.mock_test_flow.part3.time})
                </div>
                <ul className="speaking-mock-list">
                  {currentDay.mock_test_flow.part3.questions.map((q, idx) => (
                    <li
                      key={idx}
                      className="speaking-mock-item"
                      onClick={() => {
                        onPlaySpeech(q, `mock_p3_${idx}`);
                        onIncrementCount(`mock_p3_${idx}`);
                      }}
                    >
                      <span>{q}</span>
                      <span className="speaking-mock-meta">
                        <Volume2Icon size={13} />
                        {studyCounts[`mock_p3_${idx}`] ? `(${studyCounts[`mock_p3_${idx}`]})` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentDay.rubric && (
          <div className="speaking-box speaking-tint-green">
            <h3 className="speaking-box-title">Bảng đánh giá năng lực 6 tiêu chí (Band 7.0 – 8.0+)</h3>
            <div className="speaking-rubric-list">
              {currentDay.rubric.map((r, rIdx) => (
                <div key={rIdx} className="speaking-rubric-row">
                  <div>
                    <span className="speaking-subcard-title">{r.skill}</span>
                    <div className="speaking-subcard-meta">Mục tiêu: {r.target}</div>
                  </div>
                  <div className="speaking-score-group">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => onScoreChange(r.skill, val)}
                        className={`speaking-score-btn ${(rubricScores[r.skill] || 4) >= val ? "is-active" : ""}`}
                      >
                        {val}
                      </button>
                    ))}
                    <span className="speaking-score-value">{rubricScores[r.skill] || 4}/5</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="speaking-subcard">
              <h4 className="speaking-subcard-title">Kế hoạch tiếp theo (Next Steps)</h4>
              <ul className="speaking-prompts-list">
                {currentDay.next_steps.map((st, idx) => (
                  <li key={idx}>{st}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {currentDay.checkpoint_task && (
          <div className="speaking-box speaking-tint-amber">
            <h3 className="speaking-box-title">
              <TargetIcon size={16} />
              <span>Nhiệm vụ ghi âm &amp; tự đánh giá</span>
            </h3>
            <p className="speaking-checkpoint-desc">{currentDay.checkpoint_task.instructions}</p>
            <div className="speaking-subcard">
              <span className="speaking-subcard-title">Các câu hỏi luyện nói:</span>
              <ul className="speaking-mock-list">
                {currentDay.checkpoint_task.questions.map((q, idx) => (
                  <li
                    key={idx}
                    className="speaking-mock-item"
                    onClick={() => {
                      onPlaySpeech(q, `chk_q_${idx}`);
                      onIncrementCount(`chk_q_${idx}`);
                    }}
                  >
                    <span>{q}</span>
                    <span className="speaking-mock-meta">
                      <Volume2Icon size={13} />
                      {studyCounts[`chk_q_${idx}`] ? `(${studyCounts[`chk_q_${idx}`]})` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="speaking-subcard">
              <span className="speaking-subcard-title">Bảng kiểm tra lỗi (Self-audit Checklist):</span>
              <ul className="speaking-prompts-list">
                {currentDay.checkpoint_task.checklist.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="speaking-bottom-nav">
          <button
            type="button"
            disabled={currentDay.day <= 1}
            onClick={() => onSelectDay(currentDay.day - 1)}
            className="pagination-btn"
          >
            <ArrowLeftIcon size={14} />
            <span>Ngày {currentDay.day - 1}</span>
          </button>

          <span className="speaking-bottom-counter">Ngày {currentDay.day} / 30</span>

          <button
            type="button"
            disabled={currentDay.day >= 30}
            onClick={() => onSelectDay(currentDay.day + 1)}
            className="pagination-btn"
          >
            <span>Ngày {currentDay.day + 1}</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </article>
    </section>
  );
}

export function SpeakingChunksTab({
  allChunksList,
  searchedChunks,
  searchQuery,
  onSearchChange,
  chunkFilter,
  onChunkFilterChange,
  learnedChunkIds,
  onToggleChunkLearned,
  playingId,
  onPlaySpeech,
  studyCounts,
  onIncrementCount,
}) {
  return (
    <section>
      <div className="control-panel">
        <div className="search-box">
          <span className="search-icon">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm cụm từ tiếng Anh, nghĩa tiếng Việt hoặc câu ví dụ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button type="button" onClick={() => onSearchChange("")} className="clear-search" aria-label="Xóa tìm kiếm">
              <XIcon size={15} />
            </button>
          )}
        </div>
      </div>

      <StudyFilterTabs
        filterType={chunkFilter}
        onFilterChange={onChunkFilterChange}
        allCount={allChunksList.length}
        unlearnedCount={allChunksList.filter((c) => !learnedChunkIds.has(c.id)).length}
        learnedCount={learnedChunkIds.size}
        unlearnedLabel="Chưa thuộc"
        learnedLabel="Đã thuộc"
      />

      <div className="speaking-chunks-grid">
        {searchedChunks.map((c) => {
          const isLearned = learnedChunkIds.has(c.id);
          const isPlaying = playingId === c.id;
          const isPlayingEx = playingId === `${c.id}_ex`;

          return (
            <article key={c.id} className={`sentence-card speaking-chunk-card ${isLearned ? "learned" : ""}`}>
              <div className="speaking-chunk-card-top">
                <span className="speaking-chunk-badge">
                  Ngày {c.day} • {c.dayTitle}
                </span>
                <div className="speaking-chunk-actions">
                  <label className="checkbox-container checkbox-container--compact">
                    <input type="checkbox" checked={isLearned} onChange={() => onToggleChunkLearned(c.id)} />
                    <span className="checkmark" />
                    <span className="checkbox-label">{isLearned ? "Đã thuộc" : "Chưa thuộc"}</span>
                  </label>
                  <div className="study-counter study-counter--sm" title="Số lần bấm luyện tập">
                    <span className="counter-num">{studyCounts[c.id] || 0}</span>
                  </div>
                </div>
              </div>

              <div className="speaking-chunk-top">
                <h3
                  onClick={() => {
                    if (isTextSelected()) return;
                    onPlaySpeech(c.chunk, c.id);
                    onIncrementCount(c.id);
                  }}
                  className="speaking-chunk-phrase"
                >
                  {c.chunk}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onPlaySpeech(c.chunk, c.id);
                    onIncrementCount(c.id);
                  }}
                  className={`play-button play-button--sm ${isPlaying ? "playing" : ""}`}
                  title="Nghe phát âm chunk"
                  aria-label="Nghe phát âm"
                >
                  <Volume2Icon size={14} />
                </button>
              </div>

              <p className="speaking-chunk-meaning">{c.meaning_vi}</p>

              {c.example && (
                <div
                  onClick={() => {
                    if (isTextSelected()) return;
                    onPlaySpeech(c.example, `${c.id}_ex`);
                    onIncrementCount(c.id);
                  }}
                  className="speaking-chunk-example"
                  title="Bấm để nghe ví dụ"
                >
                  <span className="speaking-ex-label">Ex:</span>
                  <span>{c.example}</span>
                  {isPlayingEx && <Volume2Icon size={13} className="speaking-ex-playing" />}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {searchedChunks.length === 0 && (
        <StudyEmptyState message="Không tìm thấy cụm từ nào phù hợp với bộ lọc hiện tại." />
      )}
    </section>
  );
}

export function SpeakingToolkitTab({ overview, toolkits, onPlaySpeech, studyCounts, onIncrementCount }) {
  return (
    <section className="speaking-toolkit-stack">
      <div className="sentence-card speaking-detail-card">
        <h3 className="speaking-toolkit-title">
          <AwardIcon size={17} />
          <span>4 Tiêu chí chấm điểm IELTS Speaking</span>
        </h3>
        <div className="speaking-steps-grid">
          {overview.four_criteria.map((cr, idx) => (
            <div key={idx} className="speaking-subcard">
              <div className="speaking-subcard-title">
                {idx + 1}. {cr.name}
              </div>
              <div className="speaking-chunk-badge">{cr.vi}</div>
              <p className="speaking-subcard-meta">{cr.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sentence-card speaking-detail-card">
        <h3 className="speaking-toolkit-title speaking-toolkit-title--danger">
          <AlertTriangleIcon size={17} />
          <span>Top 10 lỗi sai phổ biến của người Việt &amp; cách sửa</span>
        </h3>
        <div className="speaking-mistakes-list">
          {toolkits.common_mistakes.map((m, idx) => (
            <div key={idx} className="speaking-mistake-row">
              <div className="speaking-mistake-wrong">{m.wrong}</div>
              <div className="speaking-mistake-correct">{m.correct}</div>
              <div className="speaking-mistake-reason">{m.reason}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sentence-card speaking-detail-card">
        <h3 className="speaking-toolkit-title">
          <ClockIcon size={17} />
          <span>Cụm từ &quot;câu giờ&quot; tự nhiên (Hesitation Devices)</span>
        </h3>
        <div className="speaking-chunks-grid">
          {toolkits.hesitation_fillers.map((f, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (isTextSelected()) return;
                onPlaySpeech(f.en, `filler_${idx}`);
                onIncrementCount(`filler_${idx}`);
              }}
              className="speaking-filler-card"
              title="Bấm để nghe phát âm"
            >
              <div>
                <div className="speaking-filler-en">
                  <Volume2Icon size={14} />
                  <span>{f.en}</span>
                </div>
                <div className="speaking-subcard-meta">{f.vi}</div>
              </div>
              <div className="speaking-filler-foot">
                <div className="study-counter study-counter--sm" title="Số lần luyện tập">
                  <span className="counter-num">{studyCounts[`filler_${idx}`] || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sentence-card speaking-detail-card">
        <h3 className="speaking-toolkit-title">
          <LayersIcon size={17} />
          <span>5 Cấu trúc câu thiết yếu trong khẩu ngữ</span>
        </h3>
        <div className="speaking-steps-grid">
          {toolkits.grammar_patterns.map((gp, idx) => (
            <div key={idx} className="speaking-subcard">
              <div className="speaking-subcard-title">
                Mẫu {idx + 1}: {gp.pattern}
              </div>
              <div className="speaking-subcard-body">&quot;{gp.example}&quot;</div>
              <div className="speaking-subcard-meta">{gp.vi}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

