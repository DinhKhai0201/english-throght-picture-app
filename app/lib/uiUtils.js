"use client";

export function isTextSelected() {
  if (typeof window === "undefined") return false;
  const sel = window.getSelection();
  return Boolean(sel && sel.toString().trim().length > 0);
}

export function isAudioMuted() {
  if (typeof window === "undefined") return false;
  if (window.__ETP_AUDIO_MUTED__ === true) return true;
  try {
    return localStorage.getItem("etp_audio_muted") === "true";
  } catch (e) {
    return false;
  }
}


