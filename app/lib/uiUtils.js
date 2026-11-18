"use client";

export function isTextSelected() {
  if (typeof window === "undefined") return false;
  const sel = window.getSelection();
  return Boolean(sel && sel.toString().trim().length > 0);
}

