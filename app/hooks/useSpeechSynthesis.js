"use client";

import { useState, useEffect, useCallback } from "react";
import { isAudioMuted } from "../lib/uiUtils";

function pickPreferredVoice(filteredVoices, langPrefix, preferUk) {
  if (!filteredVoices || filteredVoices.length === 0) return null;

  if (langPrefix === "zh") {
    return (
      filteredVoices.find(
        (v) =>
          v.lang.includes("zh-CN") ||
          v.name.includes("Chinese") ||
          v.name.includes("Ting-Ting") ||
          v.name.includes("Google 普通话")
      ) || filteredVoices[0]
    );
  }

  if (langPrefix === "ja") {
    return (
      filteredVoices.find(
        (v) =>
          v.lang.includes("ja-JP") ||
          v.name.includes("Kyoko") ||
          v.name.includes("Otoya") ||
          v.name.includes("Google 日本語")
      ) || filteredVoices[0]
    );
  }

  if (preferUk) {
    return (
      filteredVoices.find(
        (v) =>
          v.name.includes("Google UK English Male") ||
          v.name.includes("Google UK English") ||
          v.name.includes("Google US English") ||
          v.name.includes("Samantha")
      ) || filteredVoices[0]
    );
  }

  return (
    filteredVoices.find(
      (v) =>
        v.name.includes("Google US English") ||
        v.name.includes("Google UK English Male") ||
        v.name.includes("Samantha")
    ) || filteredVoices[0]
  );
}

export function useSpeechSynthesis({ lang = "en-US", defaultRate = 0.9, preferUk = false } = {}) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [speechRate, setSpeechRate] = useState(defaultRate);
  const [playingId, setPlayingId] = useState(null);

  const langPrefix = lang.slice(0, 2).toLowerCase();

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      const filtered = available.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
      setVoices(filtered);
      if (filtered.length > 0) {
        setSelectedVoice((prev) => {
          if (prev && filtered.some((v) => v.name === prev)) return prev;
          const pref = pickPreferredVoice(filtered, langPrefix, preferUk);
          return pref ? pref.name : filtered[0].name;
        });
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    const handleMuteChange = (e) => {
      if (e.detail?.isMuted) {
        setPlayingId(null);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      }
    };
    window.addEventListener("etp-audio-mute-change", handleMuteChange);
    return () => {
      window.removeEventListener("etp-audio-mute-change", handleMuteChange);
    };
  }, [langPrefix, preferUk]);

  const playSpeech = useCallback(
    (text, id = "active", rateOverride) => {
      if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
      window.speechSynthesis.cancel();

      if (isAudioMuted()) {
        setPlayingId(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rateOverride || speechRate;

      if (selectedVoice) {
        const voiceObj = voices.find((v) => v.name === selectedVoice);
        if (voiceObj) utterance.voice = voiceObj;
      }

      utterance.onstart = () => setPlayingId(id);
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    },
    [lang, speechRate, selectedVoice, voices]
  );

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    playingId,
    setPlayingId,
    isPlaying: playingId !== null,
    playSpeech,
  };
}

