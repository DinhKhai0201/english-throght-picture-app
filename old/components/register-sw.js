"use client";

import { useEffect } from "react";

export default function RegisterSw() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        console.error("SW registration failed", error);
      }
    };

    register();
  }, []);

  return null;
}
