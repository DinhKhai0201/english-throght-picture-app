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

export function playAudioFeedback(type) {
  if (typeof window === "undefined" || isAudioMuted()) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === "correct") {
      [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.09 },
        { freq: 783.99, time: 0.18 },
      ].forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.18, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.32);
      });
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(155, now);
      osc.frequency.linearRampToValueAtTime(115, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "timer") {
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.start();
      osc.stop(now + 0.3);
    }
  } catch (e) {}
}
