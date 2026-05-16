"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const LAST_PAGE_KEY = "english-through-pictures:last-page";
const SETTINGS_KEY = "english-through-pictures:settings";
const CHUNK_SIZE = 50;
const CHUNK_EDGE_BUFFER = 5;
const defaultStatus = "Idle";
const LONG_PRESS_MS = 420;

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
  const [editorMode, setEditorMode] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savedPageNumber, setSavedPageNumber] = useState(initialPage.page);
  const [voices, setVoices] = useState([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [pronunciationCard, setPronunciationCard] = useState(null);
  const [renderablePages, setRenderablePages] = useState(() => new Set([initialPage.page]));

  const synthRef = useRef(null);
  const pageNodesRef = useRef(new Map());
  const hydratedTargetRef = useRef(null);
  const bootstrappedFromStorageRef = useRef(false);
  const loadingRef = useRef(new Set());
  const voiceUriRef = useRef("");
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

  const totalChunks = Math.ceil(manifestPages.length / CHUNK_SIZE);
  const visibleEntries = useMemo(
    () => mountedChunkIndexes.flatMap((chunkIndex) => getChunkEntries(manifestPages, chunkIndex)),
    [manifestPages, mountedChunkIndexes],
  );

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    setHydrated(true);

    try {
      const savedSettings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "null");
      if (savedSettings && typeof savedSettings === "object") {
        if (typeof savedSettings.showBoxes === "boolean") setShowBoxes(savedSettings.showBoxes);
        if (typeof savedSettings.editorMode === "boolean") setEditorMode(savedSettings.editorMode);
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
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        showBoxes,
        editorMode,
        rate,
        voiceUri,
      }),
    );
  }, [editorMode, hydrated, rate, showBoxes, voiceUri]);

  useEffect(() => {
    const missing = visibleEntries.filter((entry) => !pageDataMap.has(entry.page) && !loadingRef.current.has(entry.page));
    if (!missing.length) return;

    missing.forEach((entry) => loadingRef.current.add(entry.page));

    Promise.all(
      missing.map(async (entry) => {
        const response = await fetch(`/api/pages/${entry.page}`);
        if (!response.ok) {
          throw new Error(`Failed to load page ${entry.page}`);
        }
        return response.json();
      }),
    )
      .then((pages) => {
        const allowedPages = new Set(visibleEntries.map((entry) => entry.page));
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
      })
      .catch((error) => {
        console.error(error);
        setStatus(error.message);
      })
      .finally(() => {
        missing.forEach((entry) => loadingRef.current.delete(entry.page));
      });
  }, [pageDataMap, visibleEntries]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const candidates = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = candidates[0];
        if (!top) return;
        const pageNumber = Number(top.target.getAttribute("data-page"));
        if (!pageNumber || pageNumber === currentPageNumber) return;
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
  }, [visibleEntries, currentPageNumber, pageDataMap]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const nextVisible = new Set();
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            nextVisible.add(Number(entry.target.getAttribute("data-page")));
          }
        });

        if (!nextVisible.size) return;
        setRenderablePages((current) => {
          const next = new Set(current);
          nextVisible.forEach((page) => next.add(page));
          return next;
        });
      },
      {
        rootMargin: "1200px 0px 1200px 0px",
        threshold: 0.01,
      },
    );

    for (const node of pageNodesRef.current.values()) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [visibleEntries]);

  useEffect(() => {
    if (!hydrated || !currentPageNumber) return;
    window.localStorage.setItem(LAST_PAGE_KEY, String(currentPageNumber));
    setSavedPageNumber(currentPageNumber);
    window.history.replaceState({}, "", `/?page=${currentPageNumber}`);

    const currentIndex = manifestPages.findIndex((entry) => entry.page === currentPageNumber);
    if (currentIndex >= 0) {
      const nextChunkIndex = chunkIndexFromPageIndex(currentIndex);
      if (nextChunkIndex !== currentChunkIndex) {
        setCurrentChunkIndex(nextChunkIndex);
      }

      setMountedChunkIndexes((current) => {
        const next = computeMountedChunkIndexes(nextChunkIndex, currentIndex, manifestPages.length);
        return arraysEqual(current, next) ? current : next;
      });
    }
  }, [currentChunkIndex, currentPageNumber, hydrated, manifestPages]);

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

  const currentPage = pageDataMap.get(currentPageNumber) || initialPage;
  const currentIndex = Math.max(
    0,
    manifestPages.findIndex((entry) => entry.page === currentPageNumber),
  );
  const currentChunkEntries = getChunkEntries(manifestPages, currentChunkIndex);
  const currentChunkStartPage = currentChunkEntries[0]?.page;
  const currentChunkEndPage = currentChunkEntries.at(-1)?.page;
  const selectedRegionText = resolveSelectedRegionText(selectedRegion, pageDataMap);

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
    if (!synthRef.current) return;
    setPronunciationCard(null);
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    const voice = chooseVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => {
      setSelectedRegion(regionKey);
      setStatus(`Speaking: ${text.slice(0, 48)}${text.length > 48 ? "..." : ""}`);
    };
    utterance.onend = () => {
      setStatus(defaultStatus);
      setSelectedRegion(null);
    };
    synthRef.current.speak(utterance);
  }

  async function playPage(page) {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    for (const region of page.regions) {
      const regionKey = `${page.page}:${region.id}`;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(region.text);
        utterance.lang = "en-US";
        utterance.rate = rate;
        const voice = chooseVoice();
        if (voice) utterance.voice = voice;
        utterance.onstart = () => {
          setCurrentPageNumber(page.page);
          setSelectedRegion(regionKey);
          setStatus(`Playing page ${page.page}`);
        };
        utterance.onend = resolve;
        utterance.onerror = resolve;
        synthRef.current.speak(utterance);
      });
    }

    setStatus(defaultStatus);
    setSelectedRegion(null);
  }

  function stopPlayback() {
    synthRef.current?.cancel();
    setStatus("Stopped");
    setSelectedRegion(null);
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleRegionPointerDown(event, region, pageNumber) {
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

  async function copyCurrentPageJson() {
    await navigator.clipboard.writeText(JSON.stringify(currentPage, null, 2));
    setStatus(`Copied page ${currentPage.page} JSON`);
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
  }

  function rememberPageNode(pageNumber, node) {
    if (!node) {
      pageNodesRef.current.delete(pageNumber);
      return;
    }
    pageNodesRef.current.set(pageNumber, node);
  }

  return (
    <div className="reader-layout">
      <header className="topbar">
        <div className="topbar-actions">
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
          const shouldRenderPage = renderablePages.has(entry.page) || entry.page === currentPageNumber;
          const aspectRatio = page ? `${page.stats.imageWidth} / ${page.stats.imageHeight}` : "1180 / 1875";
          return (
            <article
              key={entry.page}
              data-page={entry.page}
              ref={(node) => rememberPageNode(entry.page, node)}
              className={[
                "page-section",
                currentPageNumber === entry.page ? "is-current" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="page-stage">
                {page && shouldRenderPage ? (
                  <div className="page-canvas">
                    <button
                      type="button"
                      className="page-play-button"
                      onClick={() => playPage(page)}
                      aria-label={`Play page ${page.page}`}
                      title={`Play page ${page.page}`}
                    >
                      ▶
                    </button>
                    <img
                      src={page.imageApiPath || `/api/books/${encodeURIComponent(`page ${page.page}.png`)}`}
                      alt={`Page ${page.page}`}
                      className="page-image"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="region-layer">
                      {page.regions.map((region) => {
                        const regionKey = `${page.page}:${region.id}`;
                        return (
                          <button
                            key={region.id}
                            type="button"
                            title={region.text}
                            aria-label={region.text}
                            className={[
                              "region",
                              showBoxes ? "show-boxes" : "",
                              editorMode ? "manual" : "",
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
                            onClick={() => {
                              if (longPressTriggeredRef.current) {
                                longPressTriggeredRef.current = false;
                                return;
                              }
                              speakText(region.text, regionKey);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="page-loading" style={{ aspectRatio }}>
                    Loading page {entry.page}...
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </main>

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
              <h2>Reader Controls</h2>
            </div>
            <button type="button" className="icon-button" onClick={() => setSettingsOpen(false)}>
              Close
            </button>
          </div>

          <div className="settings-group">
            <button type="button" onClick={stopPlayback}>Stop Audio</button>
            <button type="button" onClick={copyCurrentPageJson}>Copy Current Page JSON</button>
          </div>

          <label className="field inline">
            <span>Rate</span>
            <input type="range" min="0.6" max="1.4" step="0.05" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
            <output>{rate.toFixed(2)}x</output>
          </label>

          <label className="field">
            <span>Voice</span>
            <select value={voiceUri} onChange={(event) => setVoiceUri(event.target.value)}>
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox">
            <input type="checkbox" checked={showBoxes} onChange={(event) => setShowBoxes(event.target.checked)} />
            <span>Show OCR boxes</span>
          </label>

          <label className="checkbox">
            <input type="checkbox" checked={editorMode} onChange={(event) => setEditorMode(event.target.checked)} />
            <span>Editor mode highlight</span>
          </label>

          <div className="details">
            <h3>Status</h3>
            <p>{status}</p>
          </div>

          <div className="details">
            <h3>Resume</h3>
            <p>Last opened page: <strong>{savedPageNumber}</strong></p>
            <p>Current page: <strong>{currentPageNumber}</strong></p>
            <p>Current chunk: <strong>{currentChunkIndex + 1}</strong> / {totalChunks}</p>
            <p>Chunk range: <strong>{currentChunkStartPage} - {currentChunkEndPage}</strong></p>
            <p>Total pages: <strong>{manifest.totalPages || manifest.pages.length}</strong></p>
          </div>

          <div className="details">
            <h3>Selected Region</h3>
            <p className="region-preview">{selectedRegionText || "Click a text region to preview and play it."}</p>
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

function resolveSelectedRegionText(regionKey, pageDataMap) {
  if (!regionKey) return "";
  const [pageNumberText, regionId] = regionKey.split(":");
  const page = pageDataMap.get(Number(pageNumberText));
  return page?.regions.find((region) => region.id === regionId)?.text || "";
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

function computeMountedChunkIndexes(chunkIndex, pageIndex, totalPages) {
  const indexes = [chunkIndex];
  const positionInChunk = pageIndex % CHUNK_SIZE;
  const totalChunks = Math.ceil(totalPages / CHUNK_SIZE);

  if (positionInChunk <= CHUNK_EDGE_BUFFER && chunkIndex > 0) {
    indexes.unshift(chunkIndex - 1);
  }

  if (positionInChunk >= CHUNK_SIZE - CHUNK_EDGE_BUFFER - 1 && chunkIndex < totalChunks - 1) {
    indexes.push(chunkIndex + 1);
  }

  return [...new Set(indexes)];
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}
