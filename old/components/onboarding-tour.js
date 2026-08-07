"use client";

import { useEffect, useState, useRef } from "react";

export default function OnboardingTour({ active, onClose, currentPageNumber }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef(null);
  const spotlightRef = useRef(null);

  // Steps definition
  const steps = [
    {
      title: "🔊 Listen to Pronunciation",
      text: "Click or tap on any text region on the page to hear it pronounced clearly.",
      buttonText: "Next →",
    },
    {
      title: "📖 View Phonetic Script (IPA)",
      text: isMobile 
        ? "Double-tap on any text region to open the detailed IPA phonetic lookup."
        : "Long-press on any text region to open the detailed IPA phonetic lookup.",
      buttonText: "Finish ✓",
    }
  ];

  // Detect coarse pointer or mobile viewport
  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768);
  }, []);

  // Update target bounding box dynamically
  useEffect(() => {
    if (!active) return;

    const updatePosition = () => {
      // Find the first visible word region in the currently active page section
      const activePage = document.querySelector(".page-section.is-current");
      if (!activePage) return;

      const firstRegion = activePage.querySelector(".region");
      if (firstRegion) {
        const rect = firstRegion.getBoundingClientRect();
        // Check if rect has dimensions (is visible)
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          });
          return;
        }
      }
      
      // Fallback: If no region found yet, center spotlight in the viewport
      setTargetRect(null);
    };

    // Run initially and set a small timeout to let page render
    updatePosition();
    const timer = setTimeout(updatePosition, 300);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [active, stepIndex, currentPageNumber]);

  if (!active) return null;

  const currentStep = steps[stepIndex];

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    try {
      window.localStorage.setItem("english-through-pictures:tour-completed", "true");
    } catch (e) {}
    onClose();
  };

  // Helper styles for absolute placement next to the highlighted element
  const getTooltipStyle = () => {
    if (!targetRect) {
      // Centered fallback
      return {
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(400px, 90vw)",
      };
    }

    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);
    const spaceAbove = targetRect.top;
    
    // Position below by default, or above if screen space below is tight
    const placeBelow = spaceBelow > 220 || spaceBelow > spaceAbove;
    
    return {
      position: "fixed",
      left: `${Math.max(16, Math.min(window.innerWidth - 346, targetRect.left + targetRect.width / 2 - 165))}px`,
      top: placeBelow 
        ? `${targetRect.top + targetRect.height + 16}px`
        : `${targetRect.top - 180}px`,
      width: "330px",
    };
  };

  return (
    <div className="tour-overlay">
      {/* Dynamic Spotlight */}
      {targetRect ? (
        <div
          ref={spotlightRef}
          className="tour-spotlight"
          style={{
            left: `${targetRect.left - 6}px`,
            top: `${targetRect.top - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        />
      ) : (
        // Full screen dark overlay when no target is present
        <div className="tour-backdrop-fallback" onClick={handleComplete} />
      )}

      {/* Floating Onboarding Card */}
      <div 
        ref={tooltipRef} 
        className="tour-tooltip-card" 
        style={getTooltipStyle()}
      >
        {/* Step indicator */}
        <div className="tour-progress">
          <div className="tour-dots">
            {steps.map((_, idx) => (
              <span 
                key={idx} 
                className={`tour-dot ${idx === stepIndex ? "active" : ""}`}
              />
            ))}
          </div>
          <span className="tour-step-text">Step {stepIndex + 1}/{steps.length}</span>
        </div>

        <h3 className="tour-title">{currentStep.title}</h3>
        <p className="tour-text">{currentStep.text}</p>

        <div className="tour-actions">
          <button 
            type="button" 
            className="tour-skip-btn" 
            onClick={handleComplete}
          >
            Skip
          </button>
          <button 
            type="button" 
            className="tour-next-btn" 
            onClick={handleNext}
          >
            {currentStep.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
