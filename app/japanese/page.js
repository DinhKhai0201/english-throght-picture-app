"use client";

import { useState, useEffect, useMemo } from "react";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import {
  SearchIcon,
  XIcon,
  Volume2Icon,
  RotateCcwIcon,
  BookOpenIcon,
  ListIcon,
  InboxIcon,
  LightbulbIcon,
  CheckIcon,
  EyeIcon,
  MessageSquareIcon,
  LayersIcon,
  MicIcon,
} from "../components/Icons";
import { isTextSelected, isAudioMuted } from "../lib/uiUtils";
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

export default function JapanesePage() {
  // Single unified view mode: "browse" | "lesson" | "roleplay" | "patterns" | "pronunciation"
  const [viewMode, setViewMode] = useState("browse");
  const [chunks, setChunks] = useState([]);
  const [learnedIds, setLearnedIds] = useState(new Set());
  const [studyCounts, setStudyCounts] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState("all");
  const [activeRegister, setActiveRegister] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const [recallHideScript, setRecallHideScript] = useState(false);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [hideRoleB, setHideRoleB] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const jaVoices = availableVoices.filter((v) => v.lang.startsWith("ja"));
        setVoices(jaVoices);
        if (jaVoices.length > 0) {
          const defaultVoice =
            jaVoices.find(
              (v) =>
                v.lang.includes("ja-JP") ||
                v.name.includes("Kyoko") ||
                v.name.includes("Otoya") ||
                v.name.includes("Google 日本語")
            ) || jaVoices[0];
          setSelectedVoice(defaultVoice.name);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("japanese_chunks_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {}
      }

      const storedCounts = localStorage.getItem("japanese_chunks_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {}
      }

      const combined = [...(rawData.chunks || []), ...JA_EXTRA_CHUNKS].map((c) => ({
        ...c,
        tier: getJaTier(c),
        extra_note: c.extra_note || JA_ENRICH_MAP[c.id] || null,
      }));
      setChunks(combined);

      const savedMode = localStorage.getItem("japanese_chunks_study_mode");
      if (savedMode && ["browse", "lesson", "roleplay", "patterns", "pronunciation"].includes(savedMode)) {
        setViewMode(savedMode);
      }
      setIsLoaded(true);
    }
  }, []);

  const switchView = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("japanese_chunks_study_mode", mode);
    } catch (e) {}
  };

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLearnedIds(next);
    localStorage.setItem("japanese_chunks_progress", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("japanese_chunks_study_counts", JSON.stringify(next));
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học tiếng Nhật không?")) {
      setLearnedIds(new Set());
      setStudyCounts({});
      localStorage.removeItem("japanese_chunks_progress");
      localStorage.removeItem("japanese_chunks_study_counts");
    }
  };

  const playSpeech = (text, id) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (isAudioMuted()) {
      setPlayingId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = speechRate;
    if (selectedVoice) {
      const voiceObj = voices.find((v) => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }
    utterance.onstart = () => setPlayingId(id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
  };

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

  const totalCount = chunks.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải dữ liệu học tiếng Nhật...</p>
      </div>
    );
  }

  const categoriesList = Array.from(new Set(chunks.map((c) => c.category)));

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

          {/* Single clean secondary line (either example or register/reply note) */}
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

        <div className="card-footer">
          <label className="checkbox-container">
            <input type="checkbox" checked={isLearned} onChange={() => toggleLearned(c.id)} />
            <span className="checkmark" />
            <span className="checkbox-label">
              {isLearned ? (
                <span className="learned-label-inline">
                  <CheckIcon size={14} /> Đã thuộc
                </span>
              ) : (
                "Đánh dấu đã thuộc"
              )}
            </span>
          </label>
          <div className="study-counter" title="Số lần luyện tập">
            <span className="counter-num">{studyCounts[c.id] || 0}</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="container">
      <SectionNav />

      {/* ONE Single Mode Bar */}
      <div className="mode-toggle-strip" role="tablist" aria-label="Chế độ học tiếng Nhật">
        <button
          type="button"
          className={`mode-toggle-btn ${viewMode === "browse" ? "active" : ""}`}
          onClick={() => switchView("browse")}
        >
          <ListIcon size={15} />
          <span>Duyệt ({totalCount} câu)</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${viewMode === "lesson" ? "active" : ""}`}
          onClick={() => switchView("lesson")}
        >
          <BookOpenIcon size={15} />
          <span>Học theo bài (41 bài)</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${viewMode === "roleplay" ? "active" : ""}`}
          onClick={() => switchView("roleplay")}
        >
          <MessageSquareIcon size={15} />
          <span>15 Hội thoại (N5→N2)</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${viewMode === "patterns" ? "active" : ""}`}
          onClick={() => switchView("patterns")}
        >
          <LayersIcon size={15} />
          <span>12 Mẫu ghép câu</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${viewMode === "pronunciation" ? "active" : ""}`}
          onClick={() => switchView("pronunciation")}
        >
          <MicIcon size={15} />
          <span>Phát âm nền tảng</span>
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">JA • 401 Chunks • 15 Hội Thoại • 12 Mẫu Câu</span>
          <h1>400+ Chunks &amp; Hội Thoại Tiếng Nhật</h1>
          <p className="hero-subtitle">
            Tự học giao tiếp từ N5 đến N2: Đủ 3 sắc thái (Bạn bè, Lịch sự, Kính ngữ công sở), 15 bài hội thoại và 12 mẫu câu
          </p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học tiếng Nhật</span>
            <span className="stat-value">
              {learnedCount}/{totalCount} chunks ({progressPercent}%)
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-actions">
            <button type="button" onClick={resetProgress} className="btn-reset" title="Xóa toàn bộ tiến trình học">
              <RotateCcwIcon size={14} />
              <span>Reset tiến trình</span>
            </button>
          </div>
        </div>
      </header>

      <section className="control-panel">
        {viewMode === "browse" ? (
          <div className="search-box">
            <span className="search-icon">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Tìm theo chữ Nhật, Kana, Romaji hoặc nghĩa tiếng Việt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="clear-search" aria-label="Xóa tìm kiếm">
                <XIcon size={15} />
              </button>
            )}
          </div>
        ) : (
          <div className="comm-voice-summary">
            <span>Bấm vào bất kỳ câu tiếng Nhật nào để nghe phát âm và tăng lượt đọc.</span>
          </div>
        )}

        <div className="tts-controls">
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

          <div className="control-group">
            <label htmlFor="voice-select">Giọng đọc</label>
            <select id="voice-select" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option value="">Mặc định ja-JP</option>}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="rate-range">Tốc độ ({speechRate}x)</label>
            <input
              id="rate-range"
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          MODE 1: BROWSE CHUNKS
         ================================================================ */}
      {viewMode === "browse" && (
        <>
          <section className="categories-nav">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              Tất cả ({totalCount})
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
            <div className="filter-tabs filter-tabs--inline">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`filter-tab ${filterType === "all" ? "active" : ""}`}
              >
                Tất cả ({filteredChunks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("unlearned")}
                className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
              >
                Chưa học ({chunks.filter((c) => !learnedIds.has(c.id)).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("learned")}
                className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
              >
                Đã thuộc ({learnedIds.size})
              </button>
            </div>

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
              <div className="empty-state">
                <span className="empty-icon">
                  <InboxIcon size={36} />
                </span>
                <p>Không tìm thấy câu nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* ================================================================
          MODE 2: LESSON MODE (41 LESSONS)
         ================================================================ */}
      {viewMode === "lesson" && (
        <LessonMode items={chunks} storageKey="japanese_chunks" learnedIds={learnedIds} renderItem={renderJapaneseCard} />
      )}

      {/* ================================================================
          MODE 3: 15 ROLEPLAY DIALOGUES
         ================================================================ */}
      {viewMode === "roleplay" && (
        <section className="comm-tab-stack">
          {JA_ROLEPLAYS.map((rp) => (
            <article key={rp.id} className="sentence-card">
              <div className="card-top">
                <span className="card-index">{rp.level}</span>
                <span className="card-category">{rp.situation}</span>
              </div>
              <h2 className="grammar-title">{rp.title}</h2>
              <div className="comm-dialogue-list">
                {rp.lines.map((ln, idx) => {
                  const lineId = `${rp.id}_${idx}`;
                  const isHidden = hideRoleB && ln.role === "B" && !revealedIds.has(lineId);
                  const isPlayingLine = playingId === lineId;

                  return (
                    <div
                      key={idx}
                      className={`comm-dialogue-line ${ln.role === "B" ? "is-role-b" : ""} ${
                        isPlayingLine ? "is-playing" : ""
                      }`}
                      onClick={() => {
                        if (isTextSelected()) return;
                        if (isHidden) toggleRevealCard(lineId);
                        playSpeech(ln.japanese, lineId);
                        incrementStudyCount(rp.id);
                      }}
                    >
                      <span className="comm-role-badge">{ln.role}</span>
                      <div className="comm-dialogue-content">
                        <div className={isHidden ? "comm-masked-script" : ""}>
                          <div className="comm-dialogue-script">{ln.japanese}</div>
                          <div className="kana-romaji-text">
                            {ln.kana !== ln.japanese && <span className="kana-badge">{ln.kana}</span>}
                            <span className="romaji-badge">{ln.romaji}</span>
                          </div>
                        </div>
                        <div className="comm-dialogue-vi">{ln.vi}</div>
                      </div>
                      <button type="button" className="play-button play-button--sm" aria-label="Nghe câu thoại">
                        <Volume2Icon size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="card-footer">
                <span className="comm-voice-summary">Bấm từng câu để nghe &amp; tăng lượt luyện hội thoại</span>
                <div className="study-counter" title="Số lượt luyện hội thoại này">
                  <span className="counter-num">{studyCounts[rp.id] || 0}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ================================================================
          MODE 4: 12 PATTERN SUBSTITUTION BUILDERS
         ================================================================ */}
      {viewMode === "patterns" && (
        <section className="comm-tab-stack">
          {JA_PATTERN_BUILDERS.map((pb) => (
            <article key={pb.id} className="sentence-card">
              <div className="card-top">
                <span className="card-index">{pb.level}</span>
                <span className="card-category">Mẫu câu ghép phản xạ</span>
              </div>
              <h2 className="grammar-title">{pb.title}</h2>
              <div className="grammar-formula-box">
                <span className="grammar-formula-label">Khung</span>
                <code className="grammar-formula-code">{pb.pattern}</code>
              </div>
              <p className="grammar-explanation">{pb.note}</p>

              <div className="grammar-examples-list">
                {pb.slots.map((sl, sIdx) => {
                  const slotId = `${pb.id}_${sIdx}`;
                  return (
                    <div
                      key={sIdx}
                      className={`grammar-example-row ${playingId === slotId ? "is-playing" : ""}`}
                      onClick={() => {
                        if (isTextSelected()) return;
                        playSpeech(sl.japanese, slotId);
                        incrementStudyCount(pb.id);
                      }}
                    >
                      <div className="grammar-example-text">
                        <p className="grammar-example-en">{sl.japanese}</p>
                        <div className="kana-romaji-text">
                          {sl.kana && sl.kana !== sl.japanese && <span className="kana-badge">{sl.kana}</span>}
                          <span className="romaji-badge">{sl.romaji}</span>
                        </div>
                        <p className="grammar-example-vi">→ {sl.vi}</p>
                      </div>
                      <button type="button" className="play-button play-button--sm" aria-label="Nghe câu ghép">
                        <Volume2Icon size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="card-footer">
                <span className="comm-voice-summary">Bấm vào câu ví dụ để nghe &amp; tăng lượt đọc</span>
                <div className="study-counter" title="Số lần luyện khung mẫu này">
                  <span className="counter-num">{studyCounts[pb.id] || 0}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ================================================================
          MODE 5: PRONUNCIATION FOUNDATION
         ================================================================ */}
      {viewMode === "pronunciation" && (
        <section className="comm-tab-stack">
          <div className="sentence-card">
            <h2 className="grammar-title">1. 3 Quy tắc phát âm sống còn</h2>
            <div className="grammar-examples-list">
              {JA_PRONUNCIATION.coreRules.map((r) => (
                <div
                  key={r.id}
                  className={`grammar-example-row ${playingId === r.id ? "is-playing" : ""}`}
                  onClick={() => playSpeech(r.japanese, r.id)}
                >
                  <div className="grammar-example-text">
                    <div className="comm-sound-name">{r.rule}</div>
                    <p className="grammar-example-en">
                      {r.japanese} — <span className="kana-badge">{r.kana}</span>
                    </p>
                    <p className="romaji-badge">{r.romaji}</p>
                    <p className="grammar-example-vi">→ {r.meaning}</p>
                    <p className="comm-sound-tip">{r.tip}</p>
                  </div>
                  <button type="button" className="play-button play-button--sm" aria-label="Nghe quy tắc">
                    <Volume2Icon size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sentence-card">
            <h2 className="grammar-title">2. Âm đục, Âm ghép &amp; Âm mũi 「ん」</h2>
            <div className="grammar-examples-list">
              {JA_PRONUNCIATION.soundGroups.map((sg) => (
                <div
                  key={sg.id}
                  className={`grammar-example-row ${playingId === sg.id ? "is-playing" : ""}`}
                  onClick={() => playSpeech(sg.japanese, sg.id)}
                >
                  <div className="grammar-example-text">
                    <div className="comm-sound-name">{sg.title}</div>
                    <p className="grammar-example-en">{sg.japanese}</p>
                    <p className="romaji-badge">{sg.romaji}</p>
                    <p className="grammar-example-vi">→ {sg.meaning}</p>
                    <p className="comm-sound-tip">{sg.tip}</p>
                  </div>
                  <button type="button" className="play-button play-button--sm" aria-label="Nghe nhóm âm">
                    <Volume2Icon size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="app-footer">
        <p>
          <LightbulbIcon size={15} />
          <span>Tip: Dùng &quot;Che chữ tự nói&quot; hoặc tab &quot;15 Hội thoại&quot; để luyện đủ 3 sắc thái Bạn bè, Lịch sự và Kính ngữ.</span>
        </p>
      </footer>
    </main>
  );
}
