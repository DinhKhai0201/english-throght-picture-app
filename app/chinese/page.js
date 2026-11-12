"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SectionNav from "../components/SectionNav";
import LessonMode from "../components/LessonMode";
import rawData from "../../chinese_communication_chunks_v3_500plus.json";

const CHINESE_CATEGORY_MAP = {
  greetings_introductions: "👋 Chào hỏi & Giới thiệu",
  politeness_replies: "🙏 Lịch sự & Cảm ơn",
  conversation_followups: "💬 Nối tiếp hội thoại",
  daily_routine: "🏡 Sinh hoạt hàng ngày",
  questions_information: "❓ Hỏi thông tin",
  food_drink: "🍜 Ăn uống & Món ăn",
  shopping_money: "🛍️ Mua sắm & Tiền nong",
  transport_directions: "🚗 Đi lại & Chỉ đường",
  study_work: "📚 Học tập & Làm việc",
  plans_invitations: "📅 Kế hoạch & Hẹn gặp",
  feelings_opinions: "💡 Cảm xúc & Ý kiến",
  phone_internet: "📱 Điện thoại & Mạng",
  problems_help: "🆘 Khó khăn & Giúp đỡ",
  health_weather: "⛅ Sức khỏe & Thời tiết",
  travel_hotel: "🏨 Du lịch & Khách sạn",
  relationships_social: "👥 Giao tiếp xã giao",
  reusable_patterns: "🧩 Mẫu câu ghép linh hoạt",
  small_talk: "☕ Trò chuyện thường ngày",
  conversation_reactions: "😮 Phản xạ đối đáp",
  making_requests: "🙋 Nhờ vả & Yêu cầu",
  clarifying_communication: "🔄 Làm rõ thông điệp",
  restaurant_advanced: "🥢 Nhà hàng & Ẩm thực",
  shopping_returns: "🏷️ Mua sắm & Đổi trả",
  housing_renting: "🏠 Thuê nhà & Chỗ ở",
  banking_payments: "💳 Ngân hàng & Thanh toán",
  workplace_meetings: "💼 Công sở & Họp hành",
  job_interview: "👔 Phỏng vấn xin việc",
  business_negotiation: "🤝 Đàm phán thương mại",
  opinions_discussion: "🗣️ Thảo luận & Quan điểm",
  emotions_relationships: "❤️ Tình cảm & Thân mật",
  travel_airport: "✈️ Sân bay & Du lịch",
  hotel_service: "🛎️ Dịch vụ phòng & Hotel",
  medical_pharmacy: "💊 Nhà thuốc & Y tế",
  emergency_safety: "🚨 An toàn & Khẩn cấp",
  online_social_media: "🌐 Mạng xã hội & Mua online",
  problem_solving_complaints: "⚠️ Xử lý sự cố & Khiếu nại",
  time_scheduling: "⏰ Thời gian & Lịch hẹn",
  natural_speech_fillers: "🗣️ Khẩu ngữ & Từ đệm",
  farewells: "👋 Tạm biệt",
  daily_errands: "🏃 Việc vặt mỗi ngày",
  food_preferences: "🍲 Sở thích ăn uống",
  transport_delivery: "📦 Giao vận & Đặt xe",
  school_learning: "🎓 Thi cử & Trường học",
  work_communication: "🏢 Trao đổi công việc",
  money_and_services: "💰 Dịch vụ tài chính",
  health_and_appointments: "🩺 Khám bệnh & Sức khỏe",
  conflict_and_boundaries: "✋ Từ chối & Bất đồng",
  weather_and_plans: "🌦️ Thời tiết & Dự định",
  phone_calls: "📞 Gọi điện thoại",
  more_natural_patterns: "✨ Mẫu khẩu ngữ tự nhiên",
  everyday_expansion: "🌟 Giao tiếp mở rộng"
};

export default function ChinesePage() {
  const [chunks, setChunks] = useState([]);
  const [learnedIds, setLearnedIds] = useState(new Set());
  const [studyCounts, setStudyCounts] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [playingId, setPlayingId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.85);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [studyMode, setStudyMode] = useState("browse");

  // Initialize Speech Voices for Chinese (zh-CN, zh)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const zhVoices = availableVoices.filter(v => v.lang.startsWith("zh"));
        setVoices(zhVoices);
        if (zhVoices.length > 0) {
          const defaultVoice = zhVoices.find(v => v.lang.includes("zh-CN") || v.name.includes("Chinese") || v.name.includes("Ting-Ting") || v.name.includes("Google 普通话")) || zhVoices[0];
          setSelectedVoice(defaultVoice.name);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chinese_500_progress");
      if (stored) {
        try {
          setLearnedIds(new Set(JSON.parse(stored)));
        } catch (e) {
          console.error("Error loading chinese progress", e);
        }
      }

      const storedCounts = localStorage.getItem("chinese_500_study_counts");
      if (storedCounts) {
        try {
          setStudyCounts(JSON.parse(storedCounts));
        } catch (e) {
          console.error("Error loading chinese study counts", e);
        }
      }

      setChunks(rawData.chunks || []);
      const savedMode = localStorage.getItem("chinese_500_study_mode");
      if (savedMode === "lesson" || savedMode === "browse") setStudyMode(savedMode);
      setIsLoaded(true);
    }
  }, []);

  const toggleLearned = (id) => {
    const next = new Set(learnedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
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

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = speechRate;

    if (selectedVoice) {
      const voiceObj = voices.find(v => v.name === selectedVoice);
      if (voiceObj) {
        utterance.voice = voiceObj;
      }
    }

    utterance.onstart = () => setPlayingId(id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const filteredChunks = chunks.filter((c) => {
    const matchesCategory = activeCategory === "all" || c.category === activeCategory;
    const isLearned = learnedIds.has(c.id);
    const matchesFilterType =
      filterType === "all" ||
      (filterType === "learned" && isLearned) ||
      (filterType === "unlearned" && !isLearned);

    const matchesSearch =
      searchQuery.trim() === "" ||
      c.hanzi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.meaning_vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.learning_tip_vi && c.learning_tip_vi.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesFilterType && matchesSearch;
  });

  const totalCount = chunks.length;
  const learnedCount = learnedIds.size;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu học tiếng Trung...</p>
      </div>
    );
  }

  // Get distinct categories present in data
  const availableCategories = Array.from(new Set(chunks.map(c => c.category)));

  return (
    <main className="container">
      {/* Multi-Section Navigation Bar */}
      <SectionNav />

      {/* Study Mode Toggle */}
      <div className="mode-toggle-strip">
        <button
          className={`mode-toggle-btn ${studyMode === "browse" ? "active" : ""}`}
          onClick={() => { setStudyMode("browse"); localStorage.setItem("chinese_500_study_mode", "browse"); }}
        >
          🔍 Duyệt tất cả
        </button>
        <button
          className={`mode-toggle-btn ${studyMode === "lesson" ? "active" : ""}`}
          onClick={() => { setStudyMode("lesson"); localStorage.setItem("chinese_500_study_mode", "lesson"); }}
        >
          📚 Học theo bài (10 chunks/bài)
        </button>
      </div>

      <header className="hero">
        <div className="hero-content">
          <h1 style={{ background: "linear-gradient(135deg, #e11d48 0%, #f97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🇨🇳 500 Chunks Tiếng Trung Giao Tiếp
          </h1>
          <p className="hero-subtitle">Bấm vào chữ Hán để nghe phát âm chuẩn giọng bản xứ (kèm Pinyin & Mẹo nhớ)</p>
        </div>

        {/* Progress Card */}
        <div className="progress-card" style={{ background: "linear-gradient(135deg, #e11d48 0%, #f97316 100%)", boxShadow: "0 10px 25px -5px rgba(225, 29, 72, 0.3)" }}>
          <div className="progress-stats">
            <span className="stat-label">Tiến trình học tiếng Trung</span>
            <span className="stat-value">{learnedCount}/{totalCount} chunks ({progressPercent}%)</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: "#fef08a" }}></div>
          </div>
          <div className="progress-actions">
            <button onClick={resetProgress} className="btn-reset" title="Xóa toàn bộ tiến trình học">
              🔄 Reset tiến trình
            </button>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <section className="control-panel" style={{ display: studyMode === "lesson" ? "none" : undefined }}>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo chữ Hán, Pinyin hoặc nghĩa tiếng Việt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="clear-search">✕</button>
          )}
        </div>

        <div className="tts-controls">
          <div className="control-group">
            <label htmlFor="voice-select">Giọng đọc tiếng Trung:</label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option value="">Mặc định zh-CN (Hệ thống)</option>}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="rate-range">Tốc độ ({speechRate}x):</label>
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

      {/* Category Navigation */}
      <section className="categories-nav" style={{ display: studyMode === "lesson" ? "none" : undefined }}>
        <button
          onClick={() => setActiveCategory("all")}
          className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
        >
          📂 Tất cả ({totalCount})
        </button>
        {availableCategories.map((catKey) => {
          const count = chunks.filter((c) => c.category === catKey).length;
          const completed = chunks.filter((c) => c.category === catKey && learnedIds.has(c.id)).length;
          const label = CHINESE_CATEGORY_MAP[catKey] || catKey;
          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`category-pill ${activeCategory === catKey ? "active" : ""}`}
            >
              {label} <span className="cat-count">({completed}/{count})</span>
            </button>
          );
        })}
      </section>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ display: studyMode === "lesson" ? "none" : undefined }}>
        <button
          onClick={() => setFilterType("all")}
          className={`filter-tab ${filterType === "all" ? "active" : ""}`}
        >
          🎯 Tất cả ({filteredChunks.length})
        </button>
        <button
          onClick={() => setFilterType("unlearned")}
          className={`filter-tab ${filterType === "unlearned" ? "active" : ""}`}
        >
          📖 Chưa học ({chunks.filter((c) => !learnedIds.has(c.id)).length})
        </button>
        <button
          onClick={() => setFilterType("learned")}
          className={`filter-tab ${filterType === "learned" ? "active" : ""}`}
        >
          ✅ Đã thuộc ({learnedIds.size})
        </button>
      </div>

      {/* Chunks List */}
      {studyMode === "lesson" ? (
        <LessonMode
          items={chunks}
          storageKey="chinese_500"
          learnedIds={learnedIds}
          renderItem={(c) => {
            const isLearned = learnedIds.has(c.id);
            const isPlaying = playingId === c.id;
            return (
              <article key={c.id} className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}>
                <div className="card-top">
                  <span className="card-index" style={{ color: "#e11d48", backgroundColor: "rgba(225, 29, 72, 0.08)" }}>#{c.id}</span>
                  <span className="card-category">{CHINESE_CATEGORY_MAP[c.category] || c.category}</span>
                  {c.level && <span className="card-level">{c.level}</span>}
                </div>
                <div className="card-body" onClick={() => { playSpeech(c.hanzi, c.id); incrementStudyCount(c.id); }}>
                  <div className="english-wrapper">
                    <div>
                      <h2 className="hanzi-text">{c.hanzi}</h2>
                      <p className="pinyin-text">{c.pinyin}</p>
                    </div>
                    <button className="play-button" aria-label="Nghe phát âm">
                      {isPlaying ? <span className="playing-animation">🔊</span> : <span className="play-icon">🗣️</span>}
                    </button>
                  </div>
                  <p className="vietnamese-text" style={{ marginTop: "4px" }}>{c.meaning_vi}</p>
                </div>
                <div className="card-footer">
                  <label className="checkbox-container">
                    <input type="checkbox" checked={isLearned} onChange={() => toggleLearned(c.id)} />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{isLearned ? "Đã thuộc 🎉" : "Đánh dấu đã thuộc"}</span>
                  </label>
                  <div className="study-counter" style={{ color: "#e11d48", backgroundColor: "rgba(225, 29, 72, 0.08)" }}>
                    <span className="counter-num">{studyCounts[c.id] || 0}</span>
                  </div>
                </div>
              </article>
            );
          }}
        />
      ) : (
      <section className="sentences-list">
        {filteredChunks.map((c) => {
          const isLearned = learnedIds.has(c.id);
          const isPlaying = playingId === c.id;

          return (
            <article
              key={c.id}
              className={`sentence-card ${isLearned ? "learned" : ""} ${isPlaying ? "playing" : ""}`}
            >
              <div className="card-top">
                <span className="card-index" style={{ color: "#e11d48", backgroundColor: "rgba(225, 29, 72, 0.08)" }}>
                  #{c.id}
                </span>
                <span className="card-category">
                  {CHINESE_CATEGORY_MAP[c.category] || c.category}
                </span>
                {c.level && <span className="card-level">{c.level}</span>}
              </div>

              <div
                className="card-body"
                onClick={() => {
                  playSpeech(c.hanzi, c.id);
                  incrementStudyCount(c.id);
                }}
              >
                <div className="english-wrapper">
                  <div>
                    <h2 className="hanzi-text">{c.hanzi}</h2>
                    <p className="pinyin-text">{c.pinyin}</p>
                  </div>
                  <button className="play-button" aria-label="Nghe phát âm">
                    {isPlaying ? (
                      <span className="playing-animation">🔊</span>
                    ) : (
                      <span className="play-icon">🗣️</span>
                    )}
                  </button>
                </div>

                <p className="vietnamese-text" style={{ marginTop: "4px" }}>
                  {c.meaning_vi}
                </p>
              </div>

              <div className="card-footer">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isLearned}
                    onChange={() => toggleLearned(c.id)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">{isLearned ? "Đã thuộc 🎉" : "Đánh dấu đã thuộc"}</span>
                </label>

                <div className="study-counter" style={{ color: "#e11d48", backgroundColor: "rgba(225, 29, 72, 0.08)" }}>
                  <span className="counter-num">{studyCounts[c.id] || 0}</span>
                </div>
              </div>
            </article>
          );
        })}

        {filteredChunks.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🏜️</span>
            <p>Không tìm thấy chunk tiếng Trung nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </section>
      )}

      <footer className="app-footer">
        <p>💡 Tip: Bấm vào chữ Hán để nghe phát âm tiếng Trung chuẩn giọng bản xứ.</p>
      </footer>
    </main>
  );
}

