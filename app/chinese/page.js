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

export default function ChinesePage() {
  // Single unified view mode: "browse" | "lesson" | "roleplay" | "patterns" | "pronunciation"
  const [viewMode, setViewMode] = useState("browse");
  const [chunks, setChunks] = useState([]);
  const [learnedIds, setLearnedIds] = useState(new Set());
  const [studyCounts, setStudyCounts] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.85);
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
        const zhVoices = availableVoices.filter((v) => v.lang.startsWith("zh"));
        setVoices(zhVoices);
        if (zhVoices.length > 0) {
          const defaultVoice =
            zhVoices.find(
              (v) =>
                v.lang.includes("zh-CN") ||
                v.name.includes("Chinese") ||
                v.name.includes("Ting-Ting") ||
                v.name.includes("Google 普通话")
            ) || zhVoices[0];
          setSelectedVoice(defaultVoice.name);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chinese_500_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {}
      }

      const storedCounts = localStorage.getItem("chinese_500_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {}
      }

      const combined = [...(rawData.chunks || []), ...ZH_EXTRA_CHUNKS].map((c) => ({
        ...c,
        tier: getZhTier(c),
        reply_line: c.reply_line || ZH_REPLY_MAP[c.id] || null,
      }));
      setChunks(combined);

      const savedMode = localStorage.getItem("chinese_500_study_mode");
      if (savedMode && ["browse", "lesson", "roleplay", "patterns", "pronunciation"].includes(savedMode)) {
        setViewMode(savedMode);
      }
      setIsLoaded(true);
    }
  }, []);

  const switchView = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("chinese_500_study_mode", mode);
    } catch (e) {}
  };

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLearnedIds(next);
    localStorage.setItem("chinese_500_progress", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("chinese_500_study_counts", JSON.stringify(next));
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học tiếng Trung không?")) {
      setLearnedIds(new Set());
      setStudyCounts({});
      localStorage.removeItem("chinese_500_progress");
      localStorage.removeItem("chinese_500_study_counts");
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
    utterance.lang = "zh-CN";
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

  const totalCount = chunks.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải dữ liệu học tiếng Trung...</p>
      </div>
    );
  }

  const availableCategories = Array.from(new Set(chunks.map((c) => c.category)));

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
      <div className="mode-toggle-strip" role="tablist" aria-label="Chế độ học tiếng Trung">
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
          <span>Học theo bài (60 bài)</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${viewMode === "roleplay" ? "active" : ""}`}
          onClick={() => switchView("roleplay")}
        >
          <MessageSquareIcon size={15} />
          <span>15 Hội thoại (HSK 1→6)</span>
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
          <span>Phát âm &amp; Thanh điệu</span>
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">ZH • 600 Chunks • 15 Hội Thoại • 12 Mẫu Câu</span>
          <h1>600 Chunks &amp; Hội Thoại Tiếng Trung</h1>
          <p className="hero-subtitle">
            Tự học giao tiếp từ HSK 1 đến HSK 6: Phát âm Pinyin, 60 bài Chunks, 15 kịch bản đối thoại và 12 mẫu câu ghép
          </p>
        </div>

        <div className="progress-card">
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học tiếng Trung</span>
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
              placeholder="Tìm theo chữ Hán, Pinyin hoặc nghĩa tiếng Việt..."
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
            <span>Bấm vào bất kỳ câu tiếng Trung nào để nghe phát âm chuẩn và tăng lượt đọc.</span>
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
              {voices.length === 0 && <option value="">Mặc định zh-CN</option>}
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
          MODE 2: LESSON MODE (60 LESSONS x 10 CHUNKS)
         ================================================================ */}
      {viewMode === "lesson" && (
        <LessonMode items={chunks} storageKey="chinese_500" learnedIds={learnedIds} renderItem={renderChineseCard} />
      )}

      {/* ================================================================
          MODE 3: 15 ROLEPLAY DIALOGUES
         ================================================================ */}
      {viewMode === "roleplay" && (
        <section className="comm-tab-stack">
          {ZH_ROLEPLAYS.map((rp) => (
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
                        playSpeech(ln.hanzi, lineId);
                        incrementStudyCount(rp.id);
                      }}
                    >
                      <span className="comm-role-badge">{ln.role}</span>
                      <div className="comm-dialogue-content">
                        <div className={isHidden ? "comm-masked-script" : ""}>
                          <div className="comm-dialogue-script">{ln.hanzi}</div>
                          <div className="pinyin-text">{ln.pinyin}</div>
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
          {ZH_PATTERN_BUILDERS.map((pb) => (
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
                        playSpeech(sl.hanzi, slotId);
                        incrementStudyCount(pb.id);
                      }}
                    >
                      <div className="grammar-example-text">
                        <p className="grammar-example-en">
                          {sl.hanzi} — <span className="pinyin-text">{sl.pinyin}</span>
                        </p>
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
          MODE 5: PRONUNCIATION & TONE SANDHI
         ================================================================ */}
      {viewMode === "pronunciation" && (
        <section className="comm-tab-stack">
          <div className="sentence-card">
            <h2 className="grammar-title">1. 4 Thanh điệu chuẩn &amp; Thanh nhẹ</h2>
            <div className="comm-grid-2">
              {ZH_PRONUNCIATION.tones.map((t) => (
                <div
                  key={t.id}
                  className={`comm-sound-card ${playingId === t.id ? "is-playing" : ""}`}
                  onClick={() => playSpeech(t.hanzi, t.id)}
                >
                  <div className="comm-sound-top">
                    <span className="badge-code">{t.mark}</span>
                    <button type="button" className="play-button play-button--sm" aria-label="Nghe thanh điệu">
                      <Volume2Icon size={15} />
                    </button>
                  </div>
                  <div className="comm-sound-main">
                    <span className="comm-big-script">{t.hanzi}</span>
                    <span className="pinyin-text">{t.pinyin}</span>
                    <span className="comm-sound-meaning">({t.meaning})</span>
                  </div>
                  <div className="comm-sound-name">{t.name}</div>
                  <p className="comm-sound-tip">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sentence-card">
            <h2 className="grammar-title">2. 3 Quy tắc Biến điệu bắt buộc</h2>
            <div className="grammar-examples-list">
              {ZH_PRONUNCIATION.sandhiRules.map((r) => (
                <div
                  key={r.id}
                  className={`grammar-example-row ${playingId === r.id ? "is-playing" : ""}`}
                  onClick={() => playSpeech(r.exampleHanzi, r.id)}
                >
                  <div className="grammar-example-text">
                    <div className="comm-sound-name">{r.rule}</div>
                    <p className="grammar-example-en">
                      {r.exampleHanzi} — <span className="pinyin-text">{r.examplePinyin}</span>
                    </p>
                    <p className="grammar-example-vi">→ {r.meaning}</p>
                    <p className="comm-sound-tip">{r.note}</p>
                  </div>
                  <button type="button" className="play-button play-button--sm" aria-label="Nghe ví dụ">
                    <Volume2Icon size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sentence-card">
            <h2 className="grammar-title">3. Cặp âm dễ nhầm</h2>
            <div className="grammar-examples-list">
              {ZH_PRONUNCIATION.soundPairs.map((sp) => (
                <div
                  key={sp.id}
                  className={`grammar-example-row ${playingId === sp.id ? "is-playing" : ""}`}
                  onClick={() => playSpeech(sp.sampleHanzi, sp.id)}
                >
                  <div className="grammar-example-text">
                    <div className="comm-sound-name">{sp.pair}</div>
                    <p className="grammar-example-en">
                      {sp.sampleHanzi} — <span className="pinyin-text">{sp.samplePinyin}</span>
                    </p>
                    <p className="grammar-example-vi">→ {sp.meaning}</p>
                    <p className="comm-sound-tip">{sp.tip}</p>
                  </div>
                  <button type="button" className="play-button play-button--sm" aria-label="Nghe cặp âm">
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
          <span>Tip: Dùng &quot;Che chữ tự nói&quot; hoặc tab &quot;15 Hội thoại&quot; để luyện phản xạ nói 2 chiều từ cơ bản tới nâng cao.</span>
        </p>
      </footer>
    </main>
  );
}
