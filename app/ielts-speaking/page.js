"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import SectionNav from "../components/SectionNav";
import {
  RotateCcwIcon,
  ClockIcon,
  MicIcon,
  LayersIcon,
  LightbulbIcon,
} from "../components/Icons";
import { playAudioFeedback } from "../lib/uiUtils";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import {
  StudyLoading,
  StudyModeStrip,
  StudyFooterTip,
} from "../components/study/StudyLayoutParts";
import {
  SpeakingPlanTab,
  SpeakingChunksTab,
  SpeakingToolkitTab,
} from "../components/study/IeltsSpeakingViews";
import rawData from "../../ielts_speaking_30_days.json";

const DEFAULT_RUBRIC = {
  "Fluency (Độ trôi chảy)": 4,
  "Coherence (Tính mạch lạc)": 4,
  "Vocabulary / Chunks (Từ vựng)": 4,
  "Grammar Accuracy (Ngữ pháp)": 4,
  "Pronunciation (Phát âm & Nhịp điệu)": 4,
  "Confidence (Sự tự tin)": 4,
};

function IeltsSpeakingContent() {
  const [activeTab, setActiveTab] = useState("plan");
  const [selectedDayNum, setSelectedDayNum] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [completedDays, setCompletedDays] = useState(new Set());
  const [learnedChunkIds, setLearnedChunkIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [chunkFilter, setChunkFilter] = useState("all");
  const [studyCounts, setStudyCounts] = useState({});
  const [rubricScores, setRubricScores] = useState(DEFAULT_RUBRIC);
  const [isLoaded, setIsLoaded] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timerType, setTimerType] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    playingId,
    playSpeech,
  } = useSpeechSynthesis({ lang: "en-US", defaultRate: 0.9 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedDays = localStorage.getItem("ielts_speaking_completed_days");
        if (storedDays) setCompletedDays(new Set(JSON.parse(storedDays)));

        const storedChunks = localStorage.getItem("ielts_speaking_learned_chunks");
        if (storedChunks) setLearnedChunkIds(new Set(JSON.parse(storedChunks)));

        const storedCounts = localStorage.getItem("ielts_speaking_study_counts");
        if (storedCounts) setStudyCounts(JSON.parse(storedCounts));

        const storedDayNum = localStorage.getItem("ielts_speaking_current_day");
        if (storedDayNum) {
          const d = parseInt(storedDayNum, 10);
          if (d >= 1 && d <= 30) setSelectedDayNum(d);
        }

        const storedScores = localStorage.getItem("ielts_speaking_rubric_scores");
        if (storedScores) setRubricScores(JSON.parse(storedScores));
      } catch (e) {}
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      playAudioFeedback("timer");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (seconds, type) => {
    setTimerSeconds(seconds);
    setTimerType(type);
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(null);
    setTimerType(null);
  };

  const toggleDayCompletion = (dayNum) => {
    const next = new Set(completedDays);
    if (next.has(dayNum)) next.delete(dayNum);
    else next.add(dayNum);
    setCompletedDays(next);
    localStorage.setItem("ielts_speaking_completed_days", JSON.stringify(Array.from(next)));
  };

  const toggleChunkLearned = (chunkId) => {
    const next = new Set(learnedChunkIds);
    if (next.has(chunkId)) next.delete(chunkId);
    else next.add(chunkId);
    setLearnedChunkIds(next);
    localStorage.setItem("ielts_speaking_learned_chunks", JSON.stringify(Array.from(next)));
  };

  const incrementStudyCount = (id) => {
    setStudyCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      try {
        localStorage.setItem("ielts_speaking_study_counts", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const selectDay = (dayNum) => {
    setSelectedDayNum(dayNum);
    localStorage.setItem("ielts_speaking_current_day", dayNum.toString());
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const handleScoreChange = (skill, score) => {
    const next = { ...rubricScores, [skill]: score };
    setRubricScores(next);
    localStorage.setItem("ielts_speaking_rubric_scores", JSON.stringify(next));
  };

  const resetAllProgress = () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình học và số lần luyện tập IELTS Speaking 30 ngày không?"
      )
    ) {
      setCompletedDays(new Set());
      setLearnedChunkIds(new Set());
      setStudyCounts({});
      setSelectedDayNum(1);
      localStorage.removeItem("ielts_speaking_completed_days");
      localStorage.removeItem("ielts_speaking_learned_chunks");
      localStorage.removeItem("ielts_speaking_study_counts");
      localStorage.removeItem("ielts_speaking_current_day");
      localStorage.removeItem("ielts_speaking_rubric_scores");
    }
  };

  const filteredDays = useMemo(() => {
    if (selectedWeek === "all") return rawData.days;
    return rawData.days.filter((d) => d.week === parseInt(selectedWeek, 10));
  }, [selectedWeek]);

  const currentDay = useMemo(() => {
    return rawData.days.find((d) => d.day === selectedDayNum) || rawData.days[0];
  }, [selectedDayNum]);

  const allChunksList = useMemo(() => {
    const list = [];
    rawData.days.forEach((d) => {
      if (d.chunks) {
        d.chunks.forEach((c, cIdx) => {
          list.push({
            id: `d${d.day}_c${cIdx}`,
            day: d.day,
            dayTitle: d.title_en,
            week: d.week,
            chunk: c.chunk,
            meaning_vi: c.meaning_vi,
            example: c.example,
          });
        });
      }
    });
    return list;
  }, []);

  const searchedChunks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allChunksList.filter((item) => {
      const isLearned = learnedChunkIds.has(item.id);
      const matchesFilter =
        chunkFilter === "all" ||
        (chunkFilter === "learned" && isLearned) ||
        (chunkFilter === "unlearned" && !isLearned);
      const matchesSearch =
        q === "" ||
        item.chunk.toLowerCase().includes(q) ||
        item.meaning_vi.toLowerCase().includes(q) ||
        (item.example && item.example.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [allChunksList, chunkFilter, searchQuery, learnedChunkIds]);

  const totalDays = rawData.days.length;
  const daysCompletedCount = completedDays.size;
  const daysPercent = Math.round((daysCompletedCount / totalDays) * 100);

  const totalChunksCount = allChunksList.length;
  const chunksLearnedCount = learnedChunkIds.size;
  const chunksPercent = Math.round((chunksLearnedCount / totalChunksCount) * 100);

  if (!isLoaded) return <StudyLoading message="Đang tải giáo trình IELTS Speaking 30 ngày..." />;

  const speakingTabs = [
    { id: "plan", label: `Lộ trình 30 ngày (${daysCompletedCount}/30)`, icon: <MicIcon size={15} /> },
    {
      id: "chunks",
      label: `Kho 260 Chunks (${chunksLearnedCount}/${totalChunksCount})`,
      icon: <LayersIcon size={15} />,
    },
    { id: "toolkit", label: "Phương pháp & Lỗi sai", icon: <LightbulbIcon size={15} /> },
  ];

  return (
    <main className="container">
      <SectionNav />

      <StudyModeStrip mode={activeTab} onChange={setActiveTab} tabs={speakingTabs} ariaLabel="Phân mục IELTS Speaking" />

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">IELTS • 30-Day Chunking Plan</span>
          <h1>IELTS Speaking — 30-Day Mastery</h1>
          <p className="hero-subtitle">
            Lộ trình 30 ngày phản xạ Chunking &amp; phương pháp A-R-D hướng tới Band 7.0 – 8.0+
          </p>
        </div>

        <div className="progress-card">
          <div className="speaking-dual-progress">
            <div>
              <div className="progress-stats">
                <span className="stat-label">Tiến độ 30 ngày học</span>
                <span className="stat-value">
                  {daysCompletedCount}/30 ngày ({daysPercent}%)
                </span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${daysPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="progress-stats">
                <span className="stat-label">Chunks phản xạ đã thuộc</span>
                <span className="stat-value">
                  {chunksLearnedCount}/{totalChunksCount} cụm ({chunksPercent}%)
                </span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${chunksPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="progress-actions">
            <button type="button" onClick={resetAllProgress} className="btn-reset" title="Đặt lại toàn bộ tiến trình học">
              <RotateCcwIcon size={14} />
              <span>Reset tiến trình</span>
            </button>
          </div>
        </div>
      </header>

      <section className="control-panel">
        <div className="tts-controls speaking-tts-bar">
          <div className="control-group">
            <label htmlFor="voice-select">Giọng đọc IELTS bản xứ</label>
            <select id="voice-select" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option value="">Mặc định hệ thống</option>}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="rate-range">Tốc độ phát âm ({speechRate}x)</label>
            <input
              id="rate-range"
              type="range"
              min="0.6"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            />
          </div>

          {timerSeconds !== null && (
            <div className="speaking-active-timer">
              <ClockIcon size={16} />
              <span className="speaking-timer-label">
                {timerType === "prep" ? "Chuẩn bị (1p):" : "Nói liên tục (2p):"}{" "}
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
              </span>
              <button type="button" onClick={stopTimer} className="speaking-timer-stop-btn">
                Dừng
              </button>
            </div>
          )}
        </div>
      </section>

      {activeTab === "plan" && (
        <SpeakingPlanTab
          weeks={rawData.weeks}
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
          filteredDays={filteredDays}
          selectedDayNum={selectedDayNum}
          onSelectDay={selectDay}
          completedDays={completedDays}
          onToggleDayCompletion={toggleDayCompletion}
          currentDay={currentDay}
          learnedChunkIds={learnedChunkIds}
          onToggleChunkLearned={toggleChunkLearned}
          playingId={playingId}
          onPlaySpeech={playSpeech}
          studyCounts={studyCounts}
          onIncrementCount={incrementStudyCount}
          onStartTimer={startTimer}
          rubricScores={rubricScores}
          onScoreChange={handleScoreChange}
        />
      )}

      {activeTab === "chunks" && (
        <SpeakingChunksTab
          allChunksList={allChunksList}
          searchedChunks={searchedChunks}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          chunkFilter={chunkFilter}
          onChunkFilterChange={setChunkFilter}
          learnedChunkIds={learnedChunkIds}
          onToggleChunkLearned={toggleChunkLearned}
          playingId={playingId}
          onPlaySpeech={playSpeech}
          studyCounts={studyCounts}
          onIncrementCount={incrementStudyCount}
        />
      )}

      {activeTab === "toolkit" && (
        <SpeakingToolkitTab
          overview={rawData.overview}
          toolkits={rawData.toolkits}
          onPlaySpeech={playSpeech}
          studyCounts={studyCounts}
          onIncrementCount={incrementStudyCount}
        />
      )}

      <StudyFooterTip text="Tip: Nói to thành tiếng mỗi ngày 15–20 phút và ghi âm lại để kiểm tra ngữ điệu và độ trôi chảy." />
    </main>
  );
}

export default function IeltsSpeakingPage() {
  return (
    <Suspense fallback={<StudyLoading message="Đang tải dữ liệu IELTS Speaking..." />}>
      <IeltsSpeakingContent />
    </Suspense>
  );
}
