"use client";

import { SlidersIcon, XIcon, RotateCcwIcon } from "../Icons";

export default function DrillSettingsModal({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  onSelectVoice,
  speechRate,
  onChangeRate,
  onResetStats,
}) {
  if (!isOpen) return null;

  return (
    <div className="drill-modal-overlay" onClick={onClose}>
      <div className="drill-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="drill-modal-header">
          <h2>
            <SlidersIcon size={18} />
            <span>Cài Đặt Giọng Đọc &amp; Thống Kê</span>
          </h2>
          <button type="button" className="drill-modal-close" onClick={onClose} aria-label="Đóng">
            <XIcon size={18} />
          </button>
        </div>

        <div className="drill-modal-body">
          <div className="drill-setting-group">
            <label className="drill-setting-label">Giọng đọc tiếng Anh (Ưu tiên UK cho IELTS)</label>
            <select className="drill-select" value={selectedVoice} onChange={(e) => onSelectVoice(e.target.value)}>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option value="">Mặc định hệ thống</option>}
            </select>
          </div>

          <div className="drill-setting-group">
            <label className="drill-setting-label">Tốc độ đọc: {speechRate}x</label>
            <input
              type="range"
              min="0.5"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => onChangeRate(parseFloat(e.target.value))}
              className="drill-range-input"
            />
          </div>

          <div className="drill-reset-row">
            <button type="button" className="btn-reset btn-reset--danger" onClick={onResetStats}>
              <RotateCcwIcon size={14} />
              <span>Đặt lại điểm số Found &amp; First Try</span>
            </button>
          </div>
        </div>

        <div className="drill-modal-footer">
          <button type="button" className="drill-btn-done" onClick={onClose}>
            Đóng &amp; Tiếp tục luyện
          </button>
        </div>
      </div>
    </div>
  );
}

