"use client";

import { useState, useEffect, useCallback } from "react";

export function useStudyProgress(
  storagePrefix,
  {
    defaultMode = "browse",
    validModes = ["browse", "lesson"],
    resetConfirmMsg = "Bạn có chắc chắn muốn thiết lập lại toàn bộ tiến trình học và số lần đọc không?",
  } = {}
) {
  const [learnedIds, setLearnedIds] = useState(new Set());
  const [studyCounts, setStudyCounts] = useState({});
  const [studyMode, setStudyMode] = useState(defaultMode);
  const [isLoaded, setIsLoaded] = useState(false);

  const progressKey = `${storagePrefix}_progress`;
  const countsKey = `${storagePrefix}_study_counts`;
  const modeKey = `${storagePrefix}_study_mode`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(progressKey);
      if (stored) setLearnedIds(new Set(JSON.parse(stored)));
    } catch (e) {}

    try {
      const storedCounts = localStorage.getItem(countsKey);
      if (storedCounts) setStudyCounts(JSON.parse(storedCounts));
    } catch (e) {}

    try {
      const savedMode = localStorage.getItem(modeKey);
      if (savedMode && validModes.includes(savedMode)) {
        setStudyMode(savedMode);
      }
    } catch (e) {}

    setIsLoaded(true);
  }, [progressKey, countsKey, modeKey]);

  const switchStudyMode = useCallback(
    (mode) => {
      setStudyMode(mode);
      try {
        localStorage.setItem(modeKey, mode);
      } catch (e) {}
    },
    [modeKey]
  );

  const toggleLearned = useCallback(
    (id) => {
      setLearnedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          localStorage.setItem(progressKey, JSON.stringify(Array.from(next)));
        } catch (e) {}
        return next;
      });
    },
    [progressKey]
  );

  const incrementStudyCount = useCallback(
    (id) => {
      setStudyCounts((prev) => {
        const next = { ...prev, [id]: (prev[id] || 0) + 1 };
        try {
          localStorage.setItem(countsKey, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    },
    [countsKey]
  );

  const resetProgress = useCallback(() => {
    if (confirm(resetConfirmMsg)) {
      setLearnedIds(new Set());
      setStudyCounts({});
      try {
        localStorage.removeItem(progressKey);
        localStorage.removeItem(countsKey);
      } catch (e) {}
    }
  }, [resetConfirmMsg, progressKey, countsKey]);

  return {
    learnedIds,
    setLearnedIds,
    studyCounts,
    setStudyCounts,
    studyMode,
    switchStudyMode,
    isLoaded,
    toggleLearned,
    incrementStudyCount,
    resetProgress,
  };
}

