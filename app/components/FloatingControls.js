"use client";

import { useState, useEffect, useRef } from "react";

export default function FloatingControls() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // Read saved audio mute state
    try {
      const savedMute = localStorage.getItem("etp_audio_muted") === "true";
      setIsMuted(savedMute);
      window.__ETP_AUDIO_MUTED__ = savedMute;
    } catch (e) {}

    // Global patch for speechSynthesis.speak once
    if (typeof window !== "undefined" && window.speechSynthesis && !window.__SPEECH_SYNTHESIS_PATCHED__) {
      const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
      window.speechSynthesis.speak = function (utterance) {
        if (window.__ETP_AUDIO_MUTED__) {
          // Trigger onstart and onend so UI states (playingId, animations) reset cleanly without playing audio
          if (utterance.onstart) {
            try {
              utterance.onstart(new Event("start"));
            } catch (e) {}
          }
          setTimeout(() => {
            if (utterance.onend) {
              try {
                utterance.onend(new Event("end"));
              } catch (e) {}
            }
          }, 80);
          return;
        }
        return originalSpeak(utterance);
      };
      window.__SPEECH_SYNTHESIS_PATCHED__ = true;
    }

    // Scroll listener for Scroll to Top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };

    // Click outside listener to auto-close drawer
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

    // Cancel any current speaking speech when muting
    if (nextMuted && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
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
      {/* SIDE DRAWER: AUDIO MUTE / UNMUTE */}
      <aside
        ref={drawerRef}
        className={`audio-side-drawer ${isDrawerOpen ? "is-open" : ""}`}
        aria-label="Audio control drawer"
      >
        {/* Docked Arrow Tab Label */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`drawer-tab-btn ${isMuted ? "tab-is-muted" : "tab-is-active"}`}
          title={isDrawerOpen ? "Bấm để thu gọn thanh phát âm" : "Bấm mũi tên để mở thanh phát âm"}
          aria-label="Toggle audio drawer"
        >
          <span className="drawer-arrow-icon">{isDrawerOpen ? "▶" : "◀"}</span>
          <span className="drawer-tab-icon">{isMuted ? "🔇" : "🔊"}</span>
        </button>

        {/* Drawer Sliding Body */}
        <div className="drawer-body">
          <button
            onClick={toggleMute}
            className={`drawer-audio-toggle ${isMuted ? "toggle-muted" : "toggle-active"}`}
            title={isMuted ? "Bấm để BẬT lại phát âm" : "Bấm để TẮT âm (bấm câu chỉ tăng số đếm)"}
          >
            <div className="drawer-toggle-icon-wrap">
              <span className="drawer-toggle-main-icon">{isMuted ? "🔇" : "🔊"}</span>
            </div>
            <div className="drawer-toggle-info">
              <span className="drawer-toggle-title">
                {isMuted ? "Đang Tắt Âm" : "Đang Bật Âm"}
              </span>
              <span className="drawer-toggle-desc">
                {isMuted ? "Chỉ tăng lượt đếm" : "Phát âm thanh chuẩn"}
              </span>
            </div>
            <div className={`drawer-switch-pill ${isMuted ? "is-off" : "is-on"}`}>
              <div className="drawer-switch-knob"></div>
            </div>
          </button>
        </div>
      </aside>

      {/* FLOATING SCROLL TO TOP */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          title="Cuộn lên đầu trang (Scroll to Top)"
          aria-label="Scroll to top"
        >
          <span className="scroll-top-icon">▲</span>
        </button>
      )}
    </>
  );
}
