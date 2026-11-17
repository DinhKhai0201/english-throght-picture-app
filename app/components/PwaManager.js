"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function PwaManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasRestoredRef = useRef(false);

  // 1. Register Service Worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // SW registered successfully
        })
        .catch((err) => {
          console.warn("SW registration error:", err);
        });
    }
  }, []);

  // 2. Track current route for PWA restoration
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Do not save non-page routes
    if (fullPath && !fullPath.startsWith("/_") && !fullPath.startsWith("/api")) {
      try {
        localStorage.setItem("pwa_last_active_route", fullPath);
        localStorage.setItem("pwa_last_active_time", Date.now().toString());
      } catch (e) {}
    }
  }, [pathname, searchParams]);

  // 3. Restore last route when launching in Standalone PWA mode from Home
  useEffect(() => {
    if (typeof window === "undefined" || hasRestoredRef.current) return;

    // Check if running as PWA (iOS standalone or Android/Desktop display-mode: standalone)
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches;

    if (isStandalone && pathname === "/") {
      try {
        const lastRoute = localStorage.getItem("pwa_last_active_route");
        const lastTime = parseInt(localStorage.getItem("pwa_last_active_time") || "0", 10);
        const now = Date.now();

        // Restore if visited within the last 12 hours and route is not "/"
        if (lastRoute && lastRoute !== "/" && now - lastTime < 12 * 60 * 60 * 1000) {
          hasRestoredRef.current = true;
          router.replace(lastRoute);
        }
      } catch (e) {}
    }
  }, [pathname, router]);

  // 4. Save scroll position on pagehide / visibilitychange
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        try {
          const scrollKey = `scroll_${window.location.pathname}`;
          sessionStorage.setItem(scrollKey, window.scrollY.toString());
        } catch (e) {}
      } else if (document.visibilityState === "visible") {
        // Try restoring scroll
        try {
          const scrollKey = `scroll_${window.location.pathname}`;
          const savedScroll = sessionStorage.getItem(scrollKey);
          if (savedScroll) {
            window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
          }
        } catch (e) {}
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleVisibilityChange);
    };
  }, []);

  return null;
}

