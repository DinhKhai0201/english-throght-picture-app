"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Volume2Icon,
  VolumeXIcon,
  ArrowUpIcon,
} from "./Icons";
import { isAudioMuted } from "../lib/uiUtils";

export default function FloatingControls() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    try {
      const savedMute = localStorage.getItem("etp_audio_muted") === "true";
      setIsMuted(savedMute);
      window.__ETP_AUDIO_MUTED__ = savedMute;
    } catch (e) {}

    if (typeof window !== "undefined" && window.speechSynthesis && !window.__SPEECH_SYNTHESIS_PATCHED__) {
      try {
        const proto =
          typeof SpeechSynthesis !== "undefined" && SpeechSynthesis.prototype
            ? SpeechSynthesis.prototype
            : Object.getPrototypeOf(window.speechSynthesis);
        const origSpeak = (proto && proto.speak) || window.speechSynthesis.speak;

        if (origSpeak) {
          const wrappedSpeak = function (utterance) {
            if (isAudioMuted()) {
              if (utterance) utterance.volume = 0;
              try {
                window.speechSynthesis.cancel();
              } catch (e) {}
              return;
            }
            return origSpeak.call(window.speechSynthesis, utterance);
          };

          try {
            if (proto && proto.speak) {
              proto.speak = wrappedSpeak;
            }
          } catch (e) {}

          try {
            window.speechSynthesis.speak = wrappedSpeak;
          } catch (e) {}
        }
      } catch (e) {}
      window.__SPEECH_SYNTHESIS_PATCHED__ = true;
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };

    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    window.__ETP_AUDIO_MUTED__ = nextMuted;

    try {
      localStorage.setItem("etp_audio_muted", String(nextMuted));
    } catch (e) {}

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("etp-audio-mute-change", { detail: { isMuted: nextMuted } })
      );
    }

    if (nextMuted && typeof window !== "undefined") {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (window.__ETP_CURRENT_AUDIO__) {
        try {
          window.__ETP_CURRENT_AUDIO__.pause();
          window.__ETP_CURRENT_AUDIO__.currentTime = 0;
        } catch (e) {}
        window.__ETP_CURRENT_AUDIO__ = null;
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!mounted) return null;

  return (
    <>
      <aside
        ref={drawerRef}
        className={`audio-side-drawer ${isDrawerOpen ? "is-open" : ""}`}
        aria-label="Audio control drawer"
      >
        <button
          type="button"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`drawer-tab-btn ${isMuted ? "tab-is-muted" : "tab-is-active"}`}
          title={isDrawerOpen ? "Thu gọn" : "Mở điều khiển âm thanh"}
          aria-label="Toggle audio drawer"
          aria-expanded={isDrawerOpen}
        >
          <span className="drawer-arrow-icon">
            {isDrawerOpen ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
          </span>
        </button>

        <div className="drawer-body">
          <button
            type="button"
            onClick={toggleMute}
            className={`drawer-audio-icon-btn ${isMuted ? "toggle-muted" : "toggle-active"}`}
            title={isMuted ? "Đang tắt âm — Bấm để bật âm" : "Đang bật âm — Bấm để tắt âm (chỉ tăng lượt đếm)"}
            aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeXIcon size={18} /> : <Volume2Icon size={18} />}
          </button>
        </div>
      </aside>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          title="Cuộn lên đầu trang"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon size={18} />
        </button>
      )}
    </>
  );
}
