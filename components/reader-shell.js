"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import OnboardingTour from "./onboarding-tour";

const LAST_PAGE_KEY = "english-through-pictures:last-page";
const SETTINGS_KEY = "english-through-pictures:settings";
const CHUNK_SIZE = 50;
const defaultStatus = "Idle";
const LONG_PRESS_MS = 420;
const MOBILE_DOUBLE_TAP_MS = 1200;
const VIRTUAL_WINDOW = 2;
const PRELOAD_AHEAD = 3;
const DEFAULT_IMAGE_WIDTH = 1180;
const DEFAULT_IMAGE_HEIGHT = 1875;

export default function ReaderShell({ manifest, initialPage, initialPageNumber, queryPageNumber }) {
  const manifestPages = manifest.pages;
  const initialIndex = Math.max(
    0,
    manifestPages.findIndex((entry) => entry.page === initialPageNumber),
  );
  const initialChunkIndex = chunkIndexFromPageIndex(initialIndex);

  const [pageDataMap, setPageDataMap] = useState(() => new Map([[initialPage.page, initialPage]]));
  const [currentPageNumber, setCurrentPageNumber] = useState(initialPage.page);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(initialChunkIndex);
  const [mountedChunkIndexes, setMountedChunkIndexes] = useState([initialChunkIndex]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [status, setStatus] = useState(defaultStatus);
  const [showBoxes, setShowBoxes] = useState(true);
  const [rate, setRate] = useState(0.9);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savedPageNumber, setSavedPageNumber] = useState(initialPage.page);
  const [voices, setVoices] = useState([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [pronunciationCard, setPronunciationCard] = useState(null);
  const [showScrollAnchor, setShowScrollAnchor] = useState(false);
  const [pageLoadRevision, setPageLoadRevision] = useState(0);
  const [tourActive, setTourActive] = useState(false);
  const [imageReadyPages, setImageReadyPages] = useState(() => new Set());
  const [editMode, setEditMode] = useState(false);
  const dragInteractionRef = useRef(null);

  const synthRef = useRef(null);
  const pageNodesRef = useRef(new Map());
  const hydratedTargetRef = useRef(null);
  const bootstrappedFromStorageRef = useRef(false);
  const loadingRef = useRef(new Set());
  const voiceUriRef = useRef("");
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const lastTapRef = useRef({ regionKey: "", timestamp: 0 });
  const hideScrollAnchorTimerRef = useRef(null);
  const scrollSyncRafRef = useRef(null);
  const lastHistoryUpdateRef = useRef(0);
  const currentPageNumberRef = useRef(initialPageNumber);
  const audioUrlRef = useRef(null);
  const retryTimerRef = useRef(null);
  const audioRef = useRef(null);

  const totalChunks = Math.ceil(manifestPages.length / CHUNK_SIZE);
  const visibleEntries = useMemo(
    () => mountedChunkIndexes.flatMap((chunkIndex) => getChunkEntries(manifestPages, chunkIndex)),
    [manifestPages, mountedChunkIndexes],
  );
  const windowCenterPage = currentPageNumber;
  const currentVisibleIndex = Math.max(0, visibleEntries.findIndex((entry) => entry.page === windowCenterPage));
  const mountedPageNumbers = useMemo(
    () => new Set(
      visibleEntries
        .filter((_, index) => Math.abs(index - currentVisibleIndex) <= VIRTUAL_WINDOW)
        .map((entry) => entry.page),
    ),
    [currentVisibleIndex, visibleEntries],
  );
  const preloadPageNumbers = useMemo(
    () => visibleEntries
      .slice(currentVisibleIndex, currentVisibleIndex + PRELOAD_AHEAD + 1)
      .map((entry) => entry.page),
    [currentVisibleIndex, visibleEntries],
  );

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    setHydrated(true);

    try {
      const savedSettings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "null");
      if (savedSettings && typeof savedSettings === "object") {
        if (typeof savedSettings.showBoxes === "boolean") setShowBoxes(savedSettings.showBoxes);
        if (typeof savedSettings.rate === "number") setRate(savedSettings.rate);
        if (typeof savedSettings.voiceUri === "string") {
          voiceUriRef.current = savedSettings.voiceUri;
          setVoiceUri(savedSettings.voiceUri);
        }
      }
    } catch { }

    if (!queryPageNumber) {
      const savedPage = Number(window.localStorage.getItem(LAST_PAGE_KEY));
      if (savedPage && savedPage !== initialPage.page) {
        setSavedPageNumber(savedPage);
        const savedIndex = manifestPages.findIndex((entry) => entry.page === savedPage);
        if (savedIndex >= 0) {
          const savedChunkIndex = chunkIndexFromPageIndex(savedIndex);
          bootstrappedFromStorageRef.current = true;
          hydratedTargetRef.current = savedPage;
          setCurrentPageNumber(savedPage);
          setCurrentChunkIndex(savedChunkIndex);
          setMountedChunkIndexes([savedChunkIndex]);
        }
      }
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [initialPage.page, manifestPages, queryPageNumber]);

  useEffect(() => {
    const syncVoices = () => {
      const availableVoices = window.speechSynthesis
        .getVoices()
        .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
        .sort((a, b) => a.name.localeCompare(b.name));
      setVoices(availableVoices);
      const currentSelected = availableVoices.find((voice) => voice.voiceURI === voiceUriRef.current);
      const preferred = chooseBestDefaultVoice(availableVoices);

      if (!preferred) return;

      if (!currentSelected || isLikelyMaleVoice(currentSelected)) {
        voiceUriRef.current = preferred.voiceURI;
        setVoiceUri(preferred.voiceURI);
      }
    };

    syncVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", syncVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", syncVoices);
    };
  }, []);

  useEffect(() => {
    voiceUriRef.current = voiceUri;
  }, [voiceUri]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const tourCompleted = window.localStorage.getItem("english-through-pictures:tour-completed");
      if (!tourCompleted) {
        setTourActive(true);
      }
    } catch (e) {}
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        showBoxes,
        rate,
        voiceUri,
      }),
    );
  }, [hydrated, rate, showBoxes, voiceUri]);

  useEffect(() => {
    const neededPages = [...new Set([...mountedPageNumbers, ...preloadPageNumbers])];
    const missing = neededPages
      .filter((pageNumber) => !pageDataMap.has(pageNumber) && !loadingRef.current.has(pageNumber))
      .map((pageNumber) => ({ page: pageNumber }));
    if (!missing.length) return;

    missing.forEach((entry) => loadingRef.current.add(entry.page));

    Promise.allSettled(
      missing.map(async (entry) => {
        const response = await fetch(`/api/pages/${entry.page}`);
        if (!response.ok) {
          throw new Error(`Failed to load page ${entry.page}`);
        }
        return response.json();
      }),
    )
      .then((results) => {
        const allowedPages = new Set(neededPages);
        const pages = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
        const failures = results
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason?.message || "Page load failed");

        setPageDataMap((current) => {
          const next = new Map();
          for (const [pageNumber, page] of current.entries()) {
            if (allowedPages.has(pageNumber)) {
              next.set(pageNumber, page);
            }
          }
          pages.forEach((page) => next.set(page.page, page));
          return next;
        });

        if (failures.length) {
          console.error(failures);
          setStatus(failures[0]);
          if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
          }
          retryTimerRef.current = setTimeout(() => {
            setPageLoadRevision((value) => value + 1);
          }, 600);
        }
      })
      .finally(() => {
        missing.forEach((entry) => loadingRef.current.delete(entry.page));
      });
  }, [mountedPageNumbers, pageDataMap, pageLoadRevision, preloadPageNumbers]);

  useEffect(() => {
    if (!hydrated) return;

    preloadPageNumbers.forEach((pageNumber, index) => {
      if (index === 0) return;
      const page = pageDataMap.get(pageNumber);
      const imagePath = page?.imageApiPath || `/api/books/${encodeURIComponent(`page ${pageNumber}.png`)}`;
      const image = new window.Image();
      image.decoding = "async";
      image.src = imagePath;
    });
  }, [hydrated, pageDataMap, preloadPageNumbers]);

  useEffect(() => {
    setImageReadyPages((current) => {
      const allowedPages = new Set(visibleEntries.map((entry) => entry.page));
      const next = new Set();
      current.forEach((pageNumber) => {
        if (allowedPages.has(pageNumber)) {
          next.add(pageNumber);
        }
      });
      return next;
    });
  }, [visibleEntries]);

  useEffect(() => {
    currentPageNumberRef.current = currentPageNumber;
  }, [currentPageNumber]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const candidates = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = candidates[0];
        if (!top) return;
        const pageNumber = Number(top.target.getAttribute("data-page"));
        if (!pageNumber || pageNumber === currentPageNumberRef.current) return;
        
        setCurrentPageNumber(pageNumber);
        setSelectedRegion(null);
        setPronunciationCard(null);
      },
      {
        threshold: [0.35, 0.6, 0.85],
        rootMargin: "-10% 0px -35% 0px",
      },
    );

    for (const node of pageNodesRef.current.values()) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [visibleEntries]);

  useEffect(() => {
    if (!hydrated || !currentPageNumber) return;

    // Throttle history and storage updates to prevent iOS SecurityError (Rate Limiting)
    const now = Date.now();
    if (now - lastHistoryUpdateRef.current > 500) {
      try {
        window.localStorage.setItem(LAST_PAGE_KEY, String(currentPageNumber));
        window.history.replaceState({}, "", `/?page=${currentPageNumber}`);
        lastHistoryUpdateRef.current = now;
      } catch (e) {
        console.warn("Silent history update failure:", e);
      }
    }

    setSavedPageNumber(currentPageNumber);

    const currentIndex = manifestPages.findIndex((entry) => entry.page === currentPageNumber);
    if (currentIndex >= 0) {
      const nextChunkIndex = chunkIndexFromPageIndex(currentIndex);
      if (nextChunkIndex !== currentChunkIndex) {
        setCurrentChunkIndex(nextChunkIndex);
      }

      setMountedChunkIndexes((current) => (current[0] === nextChunkIndex && current.length === 1 ? current : [nextChunkIndex]));
    }
  }, [currentChunkIndex, currentPageNumber, hydrated, manifestPages]);

  useEffect(() => {
    if (!hydrated) return;

    const showWithTimeout = () => {
      setShowScrollAnchor(true);
      if (scrollSyncRafRef.current) {
        cancelAnimationFrame(scrollSyncRafRef.current);
      }
      scrollSyncRafRef.current = requestAnimationFrame(() => {
        let bestPage = null;
        let bestDistance = Number.POSITIVE_INFINITY;
        const viewportAnchor = window.innerHeight * 0.22;

        for (const [pageNumber, node] of pageNodesRef.current.entries()) {
          const rect = node.getBoundingClientRect();
          const distance = Math.abs(rect.top - viewportAnchor);
          if (rect.bottom > 0 && rect.top < window.innerHeight && distance < bestDistance) {
            bestPage = pageNumber;
            bestDistance = distance;
          }
        }

        if (bestPage && bestPage !== currentPageNumberRef.current) {
          setCurrentPageNumber(bestPage);
          setSelectedRegion(null);
          setPronunciationCard(null);
        }
      });
      if (hideScrollAnchorTimerRef.current) {
        clearTimeout(hideScrollAnchorTimerRef.current);
      }
      hideScrollAnchorTimerRef.current = setTimeout(() => {
        setShowScrollAnchor(false);
      }, 2000);
    };

    window.addEventListener("scroll", showWithTimeout, { passive: true });
    return () => {
      window.removeEventListener("scroll", showWithTimeout);
      if (hideScrollAnchorTimerRef.current) {
        clearTimeout(hideScrollAnchorTimerRef.current);
      }
      if (scrollSyncRafRef.current) {
        cancelAnimationFrame(scrollSyncRafRef.current);
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [currentPageNumber, hydrated]);

  useEffect(() => {
    const targetPage = hydratedTargetRef.current;
    if (!targetPage) return;
    const node = pageNodesRef.current.get(targetPage);
    if (!node) return;

    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: bootstrappedFromStorageRef.current ? "auto" : "smooth", block: "start" });
      bootstrappedFromStorageRef.current = false;
      hydratedTargetRef.current = null;
    });
  }, [pageDataMap, mountedChunkIndexes]);

  const currentIndex = Math.max(
    0,
    manifestPages.findIndex((entry) => entry.page === currentPageNumber),
  );
  const currentChunkEntries = getChunkEntries(manifestPages, currentChunkIndex);
  const currentChunkStartPage = currentChunkEntries[0]?.page;
  const currentChunkEndPage = currentChunkEntries.at(-1)?.page;
  const scrubberDisplayPage = currentPageNumber;
  const scrubberDisplayIndex = Math.max(
    0,
    currentChunkEntries.findIndex((entry) => entry.page === scrubberDisplayPage),
  );
  const scrubberProgress = currentChunkEntries.length <= 1
    ? 0
    : scrubberDisplayIndex / (currentChunkEntries.length - 1);

  function chooseVoice() {
    const availableVoices = voices.length ? voices : synthRef.current?.getVoices?.() || [];
    if (voiceUri) {
      const selected = availableVoices.find((voice) => voice.voiceURI === voiceUri);
      if (selected) return selected;
    }
    return (
      chooseBestDefaultVoice(availableVoices) ||
      availableVoices.find((voice) => voice.lang === "en-US") ||
      availableVoices[0] ||
      null
    );
  }

  function speakText(text, regionKey) {
    void playText(text, {
      regionKey,
      pageNumber: Number(regionKey.split(":")[0]),
      statusLabel: `Speaking: ${text.slice(0, 48)}${text.length > 48 ? "..." : ""}`,
    });
  }

  async function playText(text, { regionKey, pageNumber, statusLabel }) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (!synthRef.current) return;
    setPronunciationCard(null);
    synthRef.current.cancel();

    try {
      const response = await fetch(`/api/tts?lang=en&text=${encodeURIComponent(text)}`);
      if (!response.ok) {
        throw new Error("Remote TTS unavailable");
      }
      const audioBlob = await response.blob();
      const objectUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = objectUrl;

      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.preload = "auto";
      audio.playbackRate = Math.max(0.6, Math.min(1.4, rate));
      await new Promise((resolve, reject) => {
        audio.onplay = () => {
          if (pageNumber) setCurrentPageNumber(pageNumber);
          setSelectedRegion(regionKey);
          setStatus(statusLabel);
        };
        audio.onended = () => {
          setStatus(defaultStatus);
          setSelectedRegion(null);
          audioRef.current = null;
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
          resolve();
        };
        audio.onerror = () => {
          audioRef.current = null;
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
          reject(new Error("Remote audio failed"));
        };
        audio.play().catch(reject);
      });
      return;
    } catch {
      await playWithBrowserTts(text, regionKey, statusLabel, pageNumber);
    }
  }

  async function playPage(page) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    for (const region of page.regions) {
      const regionKey = `${page.page}:${region.id}`;
      // eslint-disable-next-line no-await-in-loop
      await playText(region.text, {
        regionKey,
        pageNumber: page.page,
        statusLabel: `Playing page ${page.page}`,
      });
    }

    setStatus(defaultStatus);
    setSelectedRegion(null);
  }

  function stopPlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    synthRef.current?.cancel();
    setStatus("Stopped");
    setSelectedRegion(null);
  }

  function playWithBrowserTts(text, regionKey, statusLabel, pageNumber) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      const voice = chooseVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        if (pageNumber) setCurrentPageNumber(pageNumber);
        setSelectedRegion(regionKey);
        setStatus(statusLabel);
      };
      utterance.onend = () => {
        setStatus(defaultStatus);
        setSelectedRegion(null);
        resolve();
      };
      utterance.onerror = () => {
        setStatus("TTS failed");
        setSelectedRegion(null);
        resolve();
      };
      synthRef.current.speak(utterance);
    });
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function updateRegionLocally(pageNumber, regionId, updates) {
    setPageDataMap((current) => {
      const next = new Map(current);
      const pageData = next.get(pageNumber);
      if (!pageData) return current;

      const nextRegions = pageData.regions.map((r) => {
        if (r.id === regionId) {
          return { ...r, ...updates };
        }
        return r;
      });

      next.set(pageNumber, {
        ...pageData,
        regions: nextRegions,
      });
      return next;
    });
  }

  async function saveRegionsToServer(pageNumber, regions) {
    try {
      const response = await fetch(`/api/pages/${pageNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ regions }),
      });
      if (!response.ok) {
        throw new Error("Failed to save coordinates");
      }
      const data = await response.json();
      if (data.success && data.page) {
        setPageDataMap((current) => {
          const next = new Map(current);
          next.set(pageNumber, data.page);
          return next;
        });
      }
    } catch (error) {
      console.error("Error saving coordinates:", error);
      setStatus("Failed to save coordinates");
    }
  }

  function handleEditPointerDown(event, type, region, pageNumber) {
    event.stopPropagation();
    event.preventDefault();

    const canvas = event.currentTarget.closest(".page-canvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (e) {}

    dragInteractionRef.current = {
      type,
      pageNumber,
      regionId: region.id,
      startX: event.clientX,
      startY: event.clientY,
      initialX: region.x,
      initialY: region.y,
      initialW: region.w,
      initialH: region.h,
      rect,
    };
  }

  function handleEditPointerMove(event, regionId, pageNumber) {
    const interaction = dragInteractionRef.current;
    if (!interaction || interaction.regionId !== regionId || interaction.pageNumber !== pageNumber) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    const dx = event.clientX - interaction.startX;
    const dy = event.clientY - interaction.startY;
    const dnx = dx / interaction.rect.width;
    const dny = dy / interaction.rect.height;

    if (interaction.type === "move") {
      const nextX = Math.max(0, Math.min(1 - interaction.initialW, interaction.initialX + dnx));
      const nextY = Math.max(0, Math.min(1 - interaction.initialH, interaction.initialY + dny));
      updateRegionLocally(pageNumber, regionId, { x: Number(nextX.toFixed(4)), y: Number(nextY.toFixed(4)) });
    } else if (interaction.type === "resize") {
      const nextW = Math.max(0.01, Math.min(1 - interaction.initialX, interaction.initialW + dnx));
      const nextH = Math.max(0.01, Math.min(1 - interaction.initialY, interaction.initialH + dny));
      updateRegionLocally(pageNumber, regionId, { w: Number(nextW.toFixed(4)), h: Number(nextH.toFixed(4)) });
    }
  }

  function handleEditPointerUp(event, regionId, pageNumber) {
    const interaction = dragInteractionRef.current;
    if (!interaction || interaction.regionId !== regionId || interaction.pageNumber !== pageNumber) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (e) {}

    dragInteractionRef.current = null;

    const pageData = pageDataMap.get(pageNumber);
    if (pageData) {
      void saveRegionsToServer(pageNumber, pageData.regions);
    }
  }

  function handleDeleteRegion(event, region, pageNumber) {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(`Delete text box "${region.text}"?`);
    if (!confirmed) return;

    const pageData = pageDataMap.get(pageNumber);
    if (!pageData) return;

    const nextRegions = pageData.regions.filter((r) => r.id !== region.id);

    setPageDataMap((current) => {
      const next = new Map(current);
      next.set(pageNumber, {
        ...pageData,
        regions: nextRegions,
      });
      return next;
    });

    void saveRegionsToServer(pageNumber, nextRegions);
  }

  function handleTextEdit(event, region, pageNumber) {
    event.stopPropagation();
    event.preventDefault();

    const newText = window.prompt("Edit text box content:", region.text);
    if (newText === null) return; // User cancelled

    const trimmed = newText.trim();
    if (!trimmed) {
      alert("Text cannot be empty. Right-click the box if you want to delete it.");
      return;
    }

    const pageData = pageDataMap.get(pageNumber);
    if (!pageData) return;

    const nextRegions = pageData.regions.map((r) => {
      if (r.id === region.id) {
        return {
          ...r,
          text: trimmed,
          words: trimmed.split(/\s+/).filter(Boolean),
        };
      }
      return r;
    });

    setPageDataMap((current) => {
      const next = new Map(current);
      next.set(pageNumber, {
        ...pageData,
        regions: nextRegions,
      });
      return next;
    });

    void saveRegionsToServer(pageNumber, nextRegions);
  }

  function handleAddBox(pageNumber) {
    const text = window.prompt("Enter text for the new box:", "New text");
    if (text === null) return; // User cancelled

    const trimmed = text.trim();
    if (!trimmed) return;

    const pageData = pageDataMap.get(pageNumber);
    if (!pageData) return;

    const newRegion = {
      id: `r${pageData.regions.length + 1}`,
      order: pageData.regions.length,
      text: trimmed,
      x: 0.35,
      y: 0.35,
      w: 0.30,
      h: 0.05,
      words: trimmed.split(/\s+/).filter(Boolean),
    };

    const nextRegions = [...pageData.regions, newRegion];

    setPageDataMap((current) => {
      const next = new Map(current);
      next.set(pageNumber, {
        ...pageData,
        regions: nextRegions,
      });
      return next;
    });

    void saveRegionsToServer(pageNumber, nextRegions);
  }

  function handleRegionPointerDown(event, region, pageNumber) {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
    const rect = event.currentTarget.getBoundingClientRect();
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setSelectedRegion(`${pageNumber}:${region.id}`);
      openPronunciationCard(region.text, rect);
    }, LONG_PRESS_MS);
  }

  function handleRegionPointerUp() {
    clearLongPressTimer();
    if (longPressTriggeredRef.current) {
      setPronunciationCard(null);
      setSelectedRegion(null);
    }
  }

  function handleRegionPointerLeave() {
    clearLongPressTimer();
    if (longPressTriggeredRef.current) {
      setPronunciationCard(null);
      setSelectedRegion(null);
    }
  }

  async function openPronunciationCard(text, rect) {
    const x = Math.min(window.innerWidth - 20, Math.max(20, rect.left + rect.width / 2));
    const y = Math.max(72, rect.top - 10);
    setPronunciationCard({
      text,
      x,
      y,
      loading: true,
      data: null,
      error: null,
    });

    try {
      const response = await fetch(`/api/pronounce?word=${encodeURIComponent(text)}`);
      const data = await response.json();
      setPronunciationCard({
        text,
        x,
        y,
        loading: false,
        data,
        error: response.ok ? null : data.error || "Failed to load pronunciation",
      });
    } catch (error) {
      setPronunciationCard({
        text,
        x,
        y,
        loading: false,
        data: null,
        error: error.message,
      });
    }
  }

  function jumpToPage(pageNumber) {
    const targetIndex = manifestPages.findIndex((entry) => entry.page === pageNumber);
    if (targetIndex < 0) return;
    const targetChunkIndex = chunkIndexFromPageIndex(targetIndex);
    hydratedTargetRef.current = pageNumber;
    setCurrentPageNumber(pageNumber);
    setCurrentChunkIndex(targetChunkIndex);
    setMountedChunkIndexes([targetChunkIndex]);
    setPronunciationCard(null);
    setSelectedRegion(null);
  }

  function goToChunk(chunkIndex) {
    const clamped = Math.max(0, Math.min(totalChunks - 1, chunkIndex));
    const chunkEntries = getChunkEntries(manifestPages, clamped);
    const targetPage = chunkEntries[0]?.page;
    if (!targetPage) return;
    hydratedTargetRef.current = targetPage;
    setCurrentChunkIndex(clamped);
    setMountedChunkIndexes([clamped]);
    setCurrentPageNumber(targetPage);
    setPronunciationCard(null);
    setSelectedRegion(null);
  }

  function rememberPageNode(pageNumber, node) {
    if (!node) {
      pageNodesRef.current.delete(pageNumber);
      return;
    }
    pageNodesRef.current.set(pageNumber, node);
  }

  function markImageReady(pageNumber) {
    setImageReadyPages((current) => {
      if (current.has(pageNumber)) return current;
      const next = new Set(current);
      next.add(pageNumber);
      return next;
    });
  }

  return (
    <div className="reader-layout">
      <header className="topbar">
        <div className="topbar-actions">
          <button
            type="button"
            className={["ghost-button", editMode ? "edit-mode-active" : ""].filter(Boolean).join(" ")}
            onClick={() => setEditMode((active) => !active)}
          >
            {editMode ? "Exit Edit Mode ✏️" : "Edit Mode ✏️"}
          </button>
          <button type="button" className="ghost-button" onClick={() => setSettingsOpen((open) => !open)}>
            {settingsOpen ? "Close Settings" : "Open Settings"}
          </button>
        </div>
      </header>

      <div className="chunk-toolbar">
        <button type="button" className="ghost-button" onClick={() => goToChunk(currentChunkIndex - 1)} disabled={currentChunkIndex === 0}>
          Previous Chunk
        </button>
        <div className="chunk-summary">
          <strong>Chunk {currentChunkIndex + 1}</strong>
          <span>Pages {currentChunkStartPage} - {currentChunkEndPage}</span>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={() => goToChunk(currentChunkIndex + 1)}
          disabled={currentChunkIndex >= totalChunks - 1}
        >
          Next Chunk
        </button>
      </div>

      <main className="continuous-reader">
        {visibleEntries.map((entry) => {
          const page = pageDataMap.get(entry.page);
          const shouldRenderPage = mountedPageNumbers.has(entry.page);
          const isImageReady = imageReadyPages.has(entry.page);
          const imageWidth = page?.stats?.imageWidth || DEFAULT_IMAGE_WIDTH;
          const imageHeight = page?.stats?.imageHeight || DEFAULT_IMAGE_HEIGHT;
          const aspectRatio = `${imageWidth} / ${imageHeight}`;
          return (
            <article
              key={entry.page}
              data-page={entry.page}
              ref={(node) => rememberPageNode(entry.page, node)}
              className={[
                "page-section",
                currentPageNumber === entry.page ? "is-current" : "",
                isImageReady ? "is-image-ready" : "is-image-pending",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="page-stage">
                {page && shouldRenderPage ? (
                  <div className={["page-canvas", isImageReady ? "is-image-ready" : ""].filter(Boolean).join(" ")}>
                    {!isImageReady ? (
                      <div className="page-image-shell" aria-hidden="true">
                        <div className="page-image-skeleton">
                          <span>Loading page {page.page}…</span>
                        </div>
                      </div>
                    ) : null}
                    <Image
                      src={page.imageApiPath || `/api/books/${encodeURIComponent(`page ${page.page}.png`)}`}
                      alt={`Page ${page.page}`}
                      className="page-image"
                      width={imageWidth}
                      height={imageHeight}
                      sizes="(max-width: 900px) 100vw, 1240px"
                      priority={entry.page === currentPageNumber}
                      loading={entry.page === currentPageNumber ? "eager" : "lazy"}
                      quality={72}
                      onLoad={() => markImageReady(page.page)}
                    />
                    {isImageReady ? (
                      <button
                        type="button"
                        className="page-play-button"
                        onClick={() => playPage(page)}
                        aria-label={`Play page ${page.page}`}
                        title={`Play page ${page.page}`}
                      >
                        ▶
                      </button>
                    ) : null}
                    {isImageReady && editMode ? (
                      <button
                        type="button"
                        className="page-add-box-button"
                        onClick={() => handleAddBox(page.page)}
                        title="Add a new text box to this page"
                      >
                        ➕ Add Box
                      </button>
                    ) : null}
                    <div className={["region-layer", isImageReady ? "is-ready" : ""].filter(Boolean).join(" ")}>
                      {isImageReady
                        ? page.regions.map((region) => {
                          const regionKey = `${page.page}:${region.id}`;
                          if (editMode) {
                            return (
                              <div
                                key={region.id}
                                className={[
                                  "region",
                                  "edit-mode-box",
                                  selectedRegion === regionKey ? "active" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                style={{
                                  left: `${region.x * 100}%`,
                                  top: `${region.y * 100}%`,
                                  width: `${region.w * 100}%`,
                                  height: `${region.h * 100}%`,
                                }}
                                onPointerDown={(event) => handleEditPointerDown(event, "move", region, page.page)}
                                onPointerMove={(event) => handleEditPointerMove(event, region.id, page.page)}
                                onPointerUp={(event) => handleEditPointerUp(event, region.id, page.page)}
                                onContextMenu={(event) => handleDeleteRegion(event, region, page.page)}
                                onDoubleClick={(event) => handleTextEdit(event, region, page.page)}
                              >
                                <span className="region-edit-label">{region.text}</span>
                                <div
                                  className="resize-handle"
                                  onPointerDown={(event) => handleEditPointerDown(event, "resize", region, page.page)}
                                  onPointerMove={(event) => handleEditPointerMove(event, region.id, page.page)}
                                  onPointerUp={(event) => handleEditPointerUp(event, region.id, page.page)}
                                />
                              </div>
                            );
                          }
                          return (
                            <button
                              key={region.id}
                              type="button"
                              title={region.text}
                              aria-label={region.text}
                              className={[
                                "region",
                                showBoxes ? "show-boxes" : "",
                                selectedRegion === regionKey ? "active" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              style={{
                                left: `${region.x * 100}%`,
                                top: `${region.y * 100}%`,
                                width: `${region.w * 100}%`,
                                height: `${region.h * 100}%`,
                              }}
                              onPointerDown={(event) => handleRegionPointerDown(event, region, page.page)}
                              onPointerUp={handleRegionPointerUp}
                              onPointerCancel={handleRegionPointerUp}
                              onPointerLeave={handleRegionPointerLeave}
                              onContextMenu={(event) => event.preventDefault()}
                              onClick={(event) => {
                                if (longPressTriggeredRef.current) {
                                  longPressTriggeredRef.current = false;
                                  return;
                                }
                                const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

                                if (isCoarsePointer) {
                                  const now = Date.now();
                                  const lastTap = lastTapRef.current;

                                  if (
                                    lastTap.regionKey === regionKey &&
                                    now - lastTap.timestamp <= MOBILE_DOUBLE_TAP_MS
                                  ) {
                                    lastTapRef.current = { regionKey: "", timestamp: 0 };
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    if (rect) {
                                      void openPronunciationCard(region.text, rect);
                                    }
                                    setSelectedRegion(regionKey);
                                    return;
                                  }

                                  lastTapRef.current = { regionKey, timestamp: now };
                                }

                                speakText(region.text, regionKey);
                              }}
                            />
                          );
                        })
                        : null}
                    </div>
                  </div>
                ) : (
                  <div className="page-loading" style={{ aspectRatio }}>
                    {mountedPageNumbers.has(entry.page) ? `Loading page ${entry.page}...` : `Page ${entry.page}`}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </main>

      {showScrollAnchor ? (
        <div className="page-scrubber">
          <div className="page-scrubber-rail">
            <div className="page-scrubber-track" />
            <div
              className="page-scrubber-thumb"
              style={{ "--scrubber-top": `${scrubberProgress * 100}%` }}
              aria-hidden="true"
            >
              <span>{scrubberDisplayPage}</span>
            </div>
          </div>
        </div>
      ) : null}

      {pronunciationCard ? (
        <div
          className="pronunciation-card"
          style={{
            left: `${pronunciationCard.x}px`,
            top: `${pronunciationCard.y}px`,
          }}
        >
          <strong className="pronunciation-title">{pronunciationCard.text}</strong>
          {pronunciationCard.loading ? <p className="pronunciation-ipa">Loading…</p> : null}
          {pronunciationCard.error ? <p className="pronunciation-ipa">{pronunciationCard.error}</p> : null}
          {pronunciationCard.data ? (
            <p className="pronunciation-ipa">
              {pronunciationCard.data.ipa ? `/${pronunciationCard.data.ipa}/` : "No IPA available"}
            </p>
          ) : null}
        </div>
      ) : null}

      <aside className={["settings-drawer", settingsOpen ? "is-open" : ""].filter(Boolean).join(" ")}>
        <div className="settings-card">
          <div className="settings-head">
            <div>
              <p className="eyebrow">Settings</p>
              <h2>Reading Controls</h2>
            </div>
            <button type="button" className="icon-button" onClick={() => setSettingsOpen(false)}>
              Close
            </button>
          </div>

          <label className="field inline">
            <span>Rate</span>
            <input type="range" min="0.6" max="1.4" step="0.05" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
            <output>{rate.toFixed(2)}x</output>
          </label>

          <label className="checkbox">
            <input type="checkbox" checked={showBoxes} onChange={(event) => setShowBoxes(event.target.checked)} />
            <span>Show text boxes</span>
          </label>

          <div className="details">
            <h3>Now Reading</h3>
            <p>Current page: <strong>{currentPageNumber}</strong></p>
            <p>Saved page: <strong>{savedPageNumber}</strong></p>
            <p>Status: <strong>{status}</strong></p>
          </div>

          <div className="details">
            <h3>Chunk</h3>
            <label className="field">
              <span>Choose chunk</span>
              <select value={currentChunkIndex} onChange={(event) => goToChunk(Number(event.target.value))}>
                {Array.from({ length: totalChunks }, (_, index) => {
                  const entries = getChunkEntries(manifestPages, index);
                  const startPage = entries[0]?.page;
                  const endPage = entries.at(-1)?.page;
                  return (
                    <option key={index} value={index}>
                      Chunk {index + 1} ({startPage} - {endPage})
                    </option>
                  );
                })}
              </select>
            </label>
            <p>Current chunk: <strong>{currentChunkIndex + 1}</strong> / {totalChunks}</p>
            <p>Chunk pages: <strong>{currentChunkStartPage} - {currentChunkEndPage}</strong></p>
            <p>Total pages: <strong>{manifest.totalPages || manifest.pages.length}</strong></p>
          </div>

          <div className="details">
            <h3>Quick Jump</h3>
            <div className="jump-grid">
              {buildJumpPages(manifestPages, currentIndex, currentChunkEntries).map((entry) => (
                <button key={entry.page} type="button" className="ghost-button" onClick={() => jumpToPage(entry.page)}>
                  {entry.page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <OnboardingTour
        active={tourActive}
        onClose={() => setTourActive(false)}
        currentPageNumber={currentPageNumber}
      />
    </div>
  );
}

function buildJumpPages(entries, currentIndex, currentChunkEntries) {
  const indexes = new Set([
    0,
    currentIndex - 10,
    currentIndex - 5,
    currentIndex,
    currentIndex + 5,
    currentIndex + 10,
    entries.length - 1,
    ...currentChunkEntries.map((entry) => entries.findIndex((item) => item.page === entry.page)).filter((index) => index >= 0),
  ]);
  return [...indexes]
    .filter((index) => index >= 0 && index < entries.length)
    .sort((a, b) => a - b)
    .map((index) => entries[index]);
}

function chooseBestDefaultVoice(voices) {
  return (
    voices.find((voice) => /Samantha|Karen|Moira|Nicky|Female|Jenny|Aria|Ava|Emma|Libby|Sonia|Google UK English Female|Google US English Female/i.test(voice.name)) ||
    voices.find((voice) => voice.lang === "en-US") ||
    voices[0] ||
    null
  );
}

function isLikelyMaleVoice(voice) {
  return /Daniel|Alex|Tom|Thomas|Fred|Aaron|Arthur|Bruce|Junior|Ralph|Google US English\b|Google UK English Male/i.test(voice.name);
}

function chunkIndexFromPageIndex(index) {
  return Math.floor(index / CHUNK_SIZE);
}

function getChunkEntries(entries, chunkIndex) {
  const start = chunkIndex * CHUNK_SIZE;
  return entries.slice(start, start + CHUNK_SIZE);
}
