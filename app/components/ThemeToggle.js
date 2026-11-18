"use client";

import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      <button className={`theme-toggle-btn ${className}`} aria-label="Toggle theme" type="button">
        <span className="theme-toggle-icon">
          <MoonIcon size={16} />
        </span>
        <span className="theme-toggle-text">Chế độ</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${isDark ? "theme-toggle-btn--dark" : ""} ${className}`}
      title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
      aria-label="Toggle dark mode"
    >
      <span className="theme-toggle-icon">
        {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      </span>
      <span className="theme-toggle-text">{isDark ? "Sáng" : "Tối"}</span>
    </button>
  );
}
