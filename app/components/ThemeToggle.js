"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read current theme
    const currentTheme =
      document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    try {
      localStorage.setItem("etp_theme", nextTheme);
    } catch (e) {}

    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <button className={`theme-toggle-btn ${className}`} aria-label="Toggle theme">
        <span className="theme-toggle-icon">🌙</span>
        <span className="theme-toggle-text">Chế độ</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${isDark ? "theme-toggle-btn--dark" : ""} ${className}`}
      title={isDark ? "Chuyển sang Giao diện Sáng (Light Mode)" : "Chuyển sang Giao diện Tối (Dark Mode)"}
      aria-label="Toggle dark mode"
    >
      <span className="theme-toggle-icon">{isDark ? "☀️" : "🌙"}</span>
      <span className="theme-toggle-text">{isDark ? "Giao diện Sáng" : "Giao diện Tối"}</span>
    </button>
  );
}

