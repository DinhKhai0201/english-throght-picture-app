"use client";

import { useState, useEffect } from "react";
import { ClockIcon } from "./Icons";

const IDLE_TIMEOUT_MS = 25_000; // Pause counting after 25s without interaction

function getTodayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatStudyTime(totalSec, showSeconds = true) {
  const sec = Math.max(0, Math.floor(totalSec || 0));
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remSec = sec % 60;

  if (hours > 0) {
    return `${hours}h ${String(mins).padStart(2, "0")}p`;
  }
  if (!showSeconds) {
    return `${mins}p`;
  }
  return `${mins}p ${String(remSec).padStart(2, "0")}s`;
}

export default function StudyTimer() {
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showTotal, setShowTotal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    // Initialize last active timestamp
    if (!window.__ETP_LAST_ACTIVE__) {
      window.__ETP_LAST_ACTIVE__ = Date.now();
    }

    const loadStored = () => {
      try {
        const todayKey = getTodayKey();
        const savedDate = localStorage.getItem("etp_study_date");
        let todayVal = parseInt(localStorage.getItem("etp_study_seconds_today") || "0", 10);
        const totalVal = parseInt(localStorage.getItem("etp_study_seconds_total") || "0", 10);

        if (savedDate !== todayKey) {
          todayVal = 0;
          localStorage.setItem("etp_study_date", todayKey);
          localStorage.setItem("etp_study_seconds_today", "0");
        }

        setTodaySeconds(isNaN(todayVal) ? 0 : todayVal);
        setTotalSeconds(isNaN(totalVal) ? 0 : totalVal);
      } catch (e) {}
    };

    loadStored();

    const markActive = () => {
      window.__ETP_LAST_ACTIVE__ = Date.now();
      if (document.visibilityState === "visible") {
        setIsActive(true);
      }
    };

    const events = ["pointerdown", "keydown", "touchstart", "scroll", "wheel", "click"];
    events.forEach((ev) => window.addEventListener(ev, markActive, { passive: true }));

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        setIsActive(false);
      } else {
        markActive();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", () => setIsActive(false));
    window.addEventListener("focus", markActive);

    const interval = setInterval(() => {
      const isTabVisible = document.visibilityState === "visible" && document.hasFocus();
      const isSpeaking = Boolean(window.speechSynthesis && window.speechSynthesis.speaking);
      if (isSpeaking) {
        window.__ETP_LAST_ACTIVE__ = Date.now();
      }

      const elapsedIdle = Date.now() - (window.__ETP_LAST_ACTIVE__ || 0);
      const currentlyStudying = isTabVisible && (elapsedIdle < IDLE_TIMEOUT_MS || isSpeaking);

      setIsActive(currentlyStudying);

      if (currentlyStudying) {
        try {
          const todayKey = getTodayKey();
          const savedDate = localStorage.getItem("etp_study_date");
          let nextToday = parseInt(localStorage.getItem("etp_study_seconds_today") || "0", 10);
          let nextTotal = parseInt(localStorage.getItem("etp_study_seconds_total") || "0", 10);

          if (savedDate !== todayKey) {
            nextToday = 0;
            localStorage.setItem("etp_study_date", todayKey);
          }

          nextToday = (isNaN(nextToday) ? 0 : nextToday) + 1;
          nextTotal = (isNaN(nextTotal) ? 0 : nextTotal) + 1;

          localStorage.setItem("etp_study_seconds_today", String(nextToday));
          localStorage.setItem("etp_study_seconds_total", String(nextTotal));

          setTodaySeconds(nextToday);
          setTotalSeconds(nextTotal);
        } catch (e) {}
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      events.forEach((ev) => window.removeEventListener(ev, markActive));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="study-timer-pill" aria-label="Thời gian học">
        <span className="study-timer-dot" />
        <ClockIcon size={14} />
        <span className="study-timer-value">0p 00s</span>
      </div>
    );
  }

  const displayedSeconds = showTotal ? totalSeconds : todaySeconds;

  return (
    <button
      type="button"
      onClick={() => setShowTotal(!showTotal)}
      className={`study-timer-pill ${isActive ? "is-active" : "is-idle"}`}
      title={
        isActive
          ? "Đang tính giờ học (Tự tạm dừng khi bạn để yên 25 giây hoặc rời tab). Bấm để đổi Hôm nay / Tổng."
          : "Đang tạm dừng vì không có thao tác. Chạm, cuộn hoặc bấm nghe để tính tiếp."
      }
      aria-label="Thời gian học tập thực tế"
    >
      <span className={`study-timer-dot ${isActive ? "dot-active" : "dot-idle"}`} />
      <ClockIcon size={14} />
      <span className="study-timer-label">{showTotal ? "Tổng:" : "Hôm nay:"}</span>
      <span className="study-timer-value">{formatStudyTime(displayedSeconds, true)}</span>
    </button>
  );
}

