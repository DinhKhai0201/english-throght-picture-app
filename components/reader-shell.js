"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const LAST_PAGE_KEY = "english-through-pictures:last-page";
const SETTINGS_KEY = "english-through-pictures:settings";
const BATCH_SIZE = 12;
const BUFFER_SIZE = 4;
const defaultStatus = "Idle";
const LONG_PRESS_MS = 420;

export default function ReaderShell({ manifest, initialPage, initialPageNumber, queryPageNumber }) {
  const manifestPages = manifest.pages;
  const initialIndex = Math.max(
    0,
    manifestPages.findIndex((entry) => entry.page === initialPageNumber),
  );

  const [pageDataMap, setPageDataMap] = useState(() => new Map([[initialPage.page, initialPage]]));
  const [visibleRange, setVisibleRange] = useState(() => rangeAround(initialIndex, manifestPages.length));
  const [currentPageNumber, setCurrentPageNumber] = useState(initialPage.page);
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

  const synthRef = useRef(null);
  const pageNodesRef = useRef(new Map());
  const hydratedTargetRef = useRef(null);
  const bootstrappedFromStorageRef = useRef(false);
  const loadingRef = useRef(new Set());
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

  const visibleEntries = useMemo(
    () => manifestPages.slice(visibleRange.start, visibleRange.end + 1),
    [manifestPages, visibleRange],
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
        if (typeof savedSettings.voiceUri === "string") setVoiceUri(savedSettings.voiceUri);
      }
    } catch {}

    const syncVoices = () => {
      const availableVoices = window.speechSynthesis
        .getVoices()
        .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
        .sort((a, b) => a.name.localeCompare(b.name));
      setVoices(availableVoices);
      if (!voiceUri) {
        const preferred = chooseBestDefaultVoice(availableVoices);
        if (preferred) setVoiceUri(preferred.voiceURI);
      }
    };
    syncVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", syncVoices);

    if (!queryPageNumber) {
      const savedPage = Number(window.localStorage.getItem(LAST_PAGE_KEY));
      if (savedPage && savedPage !== initialPage.page) {
        setSavedPageNumber(savedPage);
        const savedIndex = manifestPages.findIndex((entry) => entry.page === savedPage);
        if (savedIndex >= 0) {
          bootstrappedFromStorageRef.current = true;
          hydratedTargetRef.current = savedPage;
          setCurrentPageNumber(savedPage);
          setVisibleRange(rangeAround(savedIndex, manifestPages.length));
        }
      }
    }

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", syncVoices);
      window.speechSynthesis.cancel();
    };
  }, [initialPage.page, manifestPages, queryPageNumber, voiceUri]);

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
        setPageDataMap((current) => {
          const next = new Map(current);
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
    if (!hydrated || !currentPageNumber) return;
    window.localStorage.setItem(LAST_PAGE_KEY, String(currentPageNumber));
    setSavedPageNumber(currentPageNumber);
    window.history.replaceState({}, "", `/?page=${currentPageNumber}`);

    const currentIndex = manifestPages.findIndex((entry) => entry.page === currentPageNumber);
    if (currentIndex >= 0) {
      setVisibleRange((range) => expandRangeForIndex(range, currentIndex, manifestPages.length));
    }
  }, [currentPageNumber, hydrated, manifestPages]);

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
  }, [pageDataMap, visibleRange]);

  const currentPage = pageDataMap.get(currentPageNumber) || initialPage;
  const currentIndex = Math.max(
    0,
    manifestPages.findIndex((entry) => entry.page === currentPageNumber),
  );
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
  }

  function handleRegionPointerLeave() {
    clearLongPressTimer();
  }

  async function openPronunciationCard(text, rect) {
    const x = Math.min(window.innerWidth - 24, rect.left + rect.width / 2);
    const y = Math.max(18, rect.top - 12);
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
    hydratedTargetRef.current = pageNumber;
    setCurrentPageNumber(pageNumber);
    setVisibleRange(rangeAround(targetIndex, manifestPages.length));
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
        <div>
          <p className="eyebrow">Interactive Book</p>
          <h1>English Through Pictures</h1>
        </div>

        <div className="topbar-actions">
          <span className="status-pill">{status}</span>
          <button type="button" className="ghost-button" onClick={() => setSettingsOpen((open) => !open)}>
            {settingsOpen ? "Close Settings" : "Open Settings"}
          </button>
        </div>
      </header>

      <div className="meta-strip">
        <span>Current page <strong>{currentPageNumber}</strong></span>
        <span>{manifest.totalPages || manifest.pages.length} pages</span>
        <span>{currentPage.layout} layout</span>
        <span>{currentPage.stats.regionCount} regions</span>
      </div>

      <main className="continuous-reader">
        {visibleEntries.map((entry) => {
          const page = pageDataMap.get(entry.page);
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
              <div className="page-section-head">
                <div>
                  <p className="page-kicker">Page {entry.page}</p>
                  <h2>{page ? `${page.stats.wordCount} words, ${page.stats.regionCount} regions` : "Loading page..."}</h2>
                </div>
                <div className="page-head-actions">
                  <button type="button" className="ghost-button" onClick={() => jumpToPage(entry.page)}>
                    Focus Page
                  </button>
                  <button type="button" className="ghost-button" onClick={() => page && playPage(page)} disabled={!page}>
                    Play Page
                  </button>
                </div>
              </div>

              <div className="page-stage">
                {page ? (
                  <div className="page-canvas">
                    <img
                      src={page.imageApiPath || `/api/books/${encodeURIComponent(`page ${page.page}.png`)}`}
                      alt={`Page ${page.page}`}
                      className="page-image"
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
                  <div className="page-loading">Loading page {entry.page}...</div>
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
          <div className="pronunciation-card-head">
            <strong>{pronunciationCard.text}</strong>
            <button type="button" className="icon-button" onClick={() => setPronunciationCard(null)}>
              Close
            </button>
          </div>

          {pronunciationCard.loading ? <p>Loading pronunciation…</p> : null}
          {pronunciationCard.error ? <p>{pronunciationCard.error}</p> : null}

          {pronunciationCard.data?.items?.length ? (
            <div className="pronunciation-list">
              {pronunciationCard.data.items.map((item) => (
                <div key={`${pronunciationCard.text}-${item.word}`} className="pronunciation-row">
                  <strong>{item.word}</strong>
                  <span>{item.found ? `/${item.ipa}/` : "No CMU entry"}</span>
                  <span>{item.vietnameseApprox || "No approximation"}</span>
                </div>
              ))}
            </div>
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
            <h3>Resume</h3>
            <p>Last opened page: <strong>{savedPageNumber}</strong></p>
            <p>Current page: <strong>{currentPageNumber}</strong></p>
          </div>

          <div className="details">
            <h3>Selected Region</h3>
            <p className="region-preview">{selectedRegionText || "Click a text region to preview and play it."}</p>
          </div>

          <div className="details">
            <h3>Quick Jump</h3>
            <div className="jump-grid">
              {buildJumpPages(manifestPages, currentIndex).map((entry) => (
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

function rangeAround(index, total) {
  const start = Math.max(0, index - BUFFER_SIZE);
  const end = Math.min(total - 1, start + BATCH_SIZE - 1);
  return {
    start: Math.max(0, Math.min(start, end - BATCH_SIZE + 1)),
    end,
  };
}

function expandRangeForIndex(range, index, total) {
  let nextStart = range.start;
  let nextEnd = range.end;

  if (index >= range.end - 2 && range.end < total - 1) {
    nextEnd = Math.min(total - 1, range.end + BATCH_SIZE);
  }

  if (index <= range.start + 2 && range.start > 0) {
    nextStart = Math.max(0, range.start - BATCH_SIZE);
  }

  if (nextStart === range.start && nextEnd === range.end) {
    return range;
  }

  return { start: nextStart, end: nextEnd };
}

function buildJumpPages(entries, currentIndex) {
  const indexes = new Set([0, currentIndex - 10, currentIndex - 5, currentIndex, currentIndex + 5, currentIndex + 10, entries.length - 1]);
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
    voices.find((voice) => /Samantha|Daniel|Karen|Moira|Google US English|Nicky/i.test(voice.name)) ||
    voices.find((voice) => voice.lang === "en-US") ||
    voices[0] ||
    null
  );
}
