"use client";

import { Volume2Icon } from "../Icons";
import { isTextSelected } from "../../lib/uiUtils";

export function CommRoleplayView({
  roleplays,
  hideRoleB,
  revealedIds,
  onToggleReveal,
  playingId,
  onPlaySpeech,
  studyCounts,
  onIncrementCount,
}) {
  return (
    <section className="comm-tab-stack">
      {roleplays.map((rp) => (
        <article key={rp.id} className="sentence-card">
          <div className="card-top">
            <span className="card-index">{rp.level}</span>
            <span className="card-category">{rp.situation}</span>
          </div>
          <h2 className="grammar-title">{rp.title}</h2>
          <div className="comm-dialogue-list">
            {rp.lines.map((ln, idx) => {
              const lineId = `${rp.id}_${idx}`;
              const isHidden = hideRoleB && ln.role === "B" && !revealedIds.has(lineId);
              const isPlayingLine = playingId === lineId;
              const scriptText = ln.hanzi || ln.japanese;

              return (
                <div
                  key={idx}
                  className={`comm-dialogue-line ${ln.role === "B" ? "is-role-b" : ""} ${
                    isPlayingLine ? "is-playing" : ""
                  }`}
                  onClick={() => {
                    if (isTextSelected()) return;
                    if (isHidden) onToggleReveal(lineId);
                    onPlaySpeech(scriptText, lineId);
                    onIncrementCount(rp.id);
                  }}
                >
                  <span className="comm-role-badge">{ln.role}</span>
                  <div className="comm-dialogue-content">
                    <div className={isHidden ? "comm-masked-script" : ""}>
                      <div className="comm-dialogue-script">{scriptText}</div>
                      {ln.pinyin ? (
                        <div className="pinyin-text">{ln.pinyin}</div>
                      ) : (
                        <div className="kana-romaji-text">
                          {ln.kana && ln.kana !== ln.japanese && <span className="kana-badge">{ln.kana}</span>}
                          {ln.romaji && <span className="romaji-badge">{ln.romaji}</span>}
                        </div>
                      )}
                    </div>
                    <div className="comm-dialogue-vi">{ln.vi}</div>
                  </div>
                  <button type="button" className="play-button play-button--sm" aria-label="Nghe câu thoại">
                    <Volume2Icon size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="card-footer">
            <span className="comm-voice-summary">Bấm từng câu để nghe &amp; tăng lượt luyện hội thoại</span>
            <div className="study-counter" title="Số lượt luyện hội thoại này">
              <span className="counter-num">{studyCounts[rp.id] || 0}</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function CommPatternsView({
  patterns,
  playingId,
  onPlaySpeech,
  studyCounts,
  onIncrementCount,
}) {
  return (
    <section className="comm-tab-stack">
      {patterns.map((pb) => (
        <article key={pb.id} className="sentence-card">
          <div className="card-top">
            <span className="card-index">{pb.level}</span>
            <span className="card-category">Mẫu câu ghép phản xạ</span>
          </div>
          <h2 className="grammar-title">{pb.title}</h2>
          <div className="grammar-formula-box">
            <span className="grammar-formula-label">Khung</span>
            <code className="grammar-formula-code">{pb.pattern}</code>
          </div>
          <p className="grammar-explanation">{pb.note}</p>

          <div className="grammar-examples-list">
            {pb.slots.map((sl, sIdx) => {
              const slotId = `${pb.id}_${sIdx}`;
              const scriptText = sl.hanzi || sl.japanese;

              return (
                <div
                  key={sIdx}
                  className={`grammar-example-row ${playingId === slotId ? "is-playing" : ""}`}
                  onClick={() => {
                    if (isTextSelected()) return;
                    onPlaySpeech(scriptText, slotId);
                    onIncrementCount(pb.id);
                  }}
                >
                  <div className="grammar-example-text">
                    {sl.pinyin ? (
                      <p className="grammar-example-en">
                        {scriptText} — <span className="pinyin-text">{sl.pinyin}</span>
                      </p>
                    ) : (
                      <>
                        <p className="grammar-example-en">{scriptText}</p>
                        <div className="kana-romaji-text">
                          {sl.kana && sl.kana !== sl.japanese && <span className="kana-badge">{sl.kana}</span>}
                          {sl.romaji && <span className="romaji-badge">{sl.romaji}</span>}
                        </div>
                      </>
                    )}
                    <p className="grammar-example-vi">→ {sl.vi}</p>
                  </div>
                  <button type="button" className="play-button play-button--sm" aria-label="Nghe câu ghép">
                    <Volume2Icon size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="card-footer">
            <span className="comm-voice-summary">Bấm vào câu ví dụ để nghe &amp; tăng lượt đọc</span>
            <div className="study-counter" title="Số lần luyện khung mẫu này">
              <span className="counter-num">{studyCounts[pb.id] || 0}</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function ChinesePronunciationView({ data, playingId, onPlaySpeech }) {
  return (
    <section className="comm-tab-stack">
      <div className="sentence-card">
        <h2 className="grammar-title">1. 4 Thanh điệu chuẩn &amp; Thanh nhẹ</h2>
        <div className="comm-grid-2">
          {data.tones.map((t) => (
            <div
              key={t.id}
              className={`comm-sound-card ${playingId === t.id ? "is-playing" : ""}`}
              onClick={() => onPlaySpeech(t.hanzi, t.id)}
            >
              <div className="comm-sound-top">
                <span className="badge-code">{t.mark}</span>
                <button type="button" className="play-button play-button--sm" aria-label="Nghe thanh điệu">
                  <Volume2Icon size={15} />
                </button>
              </div>
              <div className="comm-sound-main">
                <span className="comm-big-script">{t.hanzi}</span>
                <span className="pinyin-text">{t.pinyin}</span>
                <span className="comm-sound-meaning">({t.meaning})</span>
              </div>
              <div className="comm-sound-name">{t.name}</div>
              <p className="comm-sound-tip">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sentence-card">
        <h2 className="grammar-title">2. 3 Quy tắc Biến điệu bắt buộc</h2>
        <div className="grammar-examples-list">
          {data.sandhiRules.map((r) => (
            <div
              key={r.id}
              className={`grammar-example-row ${playingId === r.id ? "is-playing" : ""}`}
              onClick={() => onPlaySpeech(r.exampleHanzi, r.id)}
            >
              <div className="grammar-example-text">
                <div className="comm-sound-name">{r.rule}</div>
                <p className="grammar-example-en">
                  {r.exampleHanzi} — <span className="pinyin-text">{r.examplePinyin}</span>
                </p>
                <p className="grammar-example-vi">→ {r.meaning}</p>
                <p className="comm-sound-tip">{r.note}</p>
              </div>
              <button type="button" className="play-button play-button--sm" aria-label="Nghe ví dụ">
                <Volume2Icon size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sentence-card">
        <h2 className="grammar-title">3. Cặp âm dễ nhầm</h2>
        <div className="grammar-examples-list">
          {data.soundPairs.map((sp) => (
            <div
              key={sp.id}
              className={`grammar-example-row ${playingId === sp.id ? "is-playing" : ""}`}
              onClick={() => onPlaySpeech(sp.sampleHanzi, sp.id)}
            >
              <div className="grammar-example-text">
                <div className="comm-sound-name">{sp.pair}</div>
                <p className="grammar-example-en">
                  {sp.sampleHanzi} — <span className="pinyin-text">{sp.samplePinyin}</span>
                </p>
                <p className="grammar-example-vi">→ {sp.meaning}</p>
                <p className="comm-sound-tip">{sp.tip}</p>
              </div>
              <button type="button" className="play-button play-button--sm" aria-label="Nghe cặp âm">
                <Volume2Icon size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JapanesePronunciationView({ data, playingId, onPlaySpeech }) {
  return (
    <section className="comm-tab-stack">
      <div className="sentence-card">
        <h2 className="grammar-title">1. 3 Quy tắc phát âm sống còn</h2>
        <div className="grammar-examples-list">
          {data.coreRules.map((r) => (
            <div
              key={r.id}
              className={`grammar-example-row ${playingId === r.id ? "is-playing" : ""}`}
              onClick={() => onPlaySpeech(r.japanese, r.id)}
            >
              <div className="grammar-example-text">
                <div className="comm-sound-name">{r.rule}</div>
                <p className="grammar-example-en">
                  {r.japanese} — <span className="kana-badge">{r.kana}</span>
                </p>
                <p className="romaji-badge">{r.romaji}</p>
                <p className="grammar-example-vi">→ {r.meaning}</p>
                <p className="comm-sound-tip">{r.tip}</p>
              </div>
              <button type="button" className="play-button play-button--sm" aria-label="Nghe quy tắc">
                <Volume2Icon size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sentence-card">
        <h2 className="grammar-title">2. Âm đục, Âm ghép &amp; Âm mũi 「ん」</h2>
        <div className="grammar-examples-list">
          {data.soundGroups.map((sg) => (
            <div
              key={sg.id}
              className={`grammar-example-row ${playingId === sg.id ? "is-playing" : ""}`}
              onClick={() => onPlaySpeech(sg.japanese, sg.id)}
            >
              <div className="grammar-example-text">
                <div className="comm-sound-name">{sg.title}</div>
                <p className="grammar-example-en">{sg.japanese}</p>
                <p className="romaji-badge">{sg.romaji}</p>
                <p className="grammar-example-vi">→ {sg.meaning}</p>
                <p className="comm-sound-tip">{sg.tip}</p>
              </div>
              <button type="button" className="play-button play-button--sm" aria-label="Nghe nhóm âm">
                <Volume2Icon size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

