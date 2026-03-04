// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useEffect, useRef } from "react";

const MATH_NOTES_PREFIX = "algosort-math-notes-";

interface NotesEntry {
  content: string;
  lastSavedAt: string;
}

interface Props {
  topicSlug: string;
  pitfalls?: string[];
  complexities?: { time: string; space: string; note?: string };
}

function getMathNotes(slug: string): NotesEntry | null {
  try {
    const raw = localStorage.getItem(MATH_NOTES_PREFIX + slug);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveMathNotes(slug: string, content: string): void {
  try {
    localStorage.setItem(
      MATH_NOTES_PREFIX + slug,
      JSON.stringify({ content, lastSavedAt: new Date().toISOString() })
    );
  } catch (e) {
    console.error("Failed to save math notes", e);
  }
}

function clearMathNotes(slug: string): void {
  localStorage.removeItem(MATH_NOTES_PREFIX + slug);
}

const MathNotesTab: React.FC<Props> = ({
  topicSlug,
  pitfalls,
  complexities,
}) => {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = getMathNotes(topicSlug);
    if (saved) {
      setContent(saved.content);
      setLastSaved(saved.lastSavedAt);
    } else {
      setContent("");
      setLastSaved(null);
    }
  }, [topicSlug]);

  const handleChange = (value: string) => {
    setContent(value);
    setSaving(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      saveMathNotes(topicSlug, value);
      setLastSaved(new Date().toISOString());
      setSaving(false);
    }, 500);
  };

  const handleClear = () => {
    if (window.confirm("Clear your notes for this topic?")) {
      clearMathNotes(topicSlug);
      setContent("");
      setLastSaved(null);
    }
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleString();

  const hasCheatSheet =
    (pitfalls && pitfalls.length > 0) || complexities;

  return (
    <div className="space-y-6">
      {/* Cheat Sheet Card */}
      {hasCheatSheet && (
        <div
          className="p-5 rounded-lg space-y-4"
          style={{
            backgroundColor: "var(--panel)",
            border: "1px solid var(--brand)",
          }}
        >
          <h3
            className="font-semibold text-lg flex items-center gap-2"
            style={{ color: "var(--fg)" }}
          >
            <span>📋</span> Cheat Sheet
          </h3>

          {/* Complexity summary */}
          {complexities && (
            <div className="space-y-1">
              <h4
                className="text-sm font-medium"
                style={{ color: "var(--fg)" }}
              >
                Complexity
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-3 rounded text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                  }}
                >
                  <div
                    className="text-xs mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    Time
                  </div>
                  <div className="font-mono font-semibold">
                    {complexities.time}
                  </div>
                </div>
                <div
                  className="p-3 rounded text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                  }}
                >
                  <div
                    className="text-xs mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    Space
                  </div>
                  <div className="font-mono font-semibold">
                    {complexities.space}
                  </div>
                </div>
              </div>
              {complexities.note && (
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--muted)" }}
                >
                  💡 {complexities.note}
                </div>
              )}
            </div>
          )}

          {/* Pitfalls */}
          {pitfalls && pitfalls.length > 0 && (
            <div className="space-y-1">
              <h4
                className="text-sm font-medium"
                style={{ color: "var(--fg)" }}
              >
                ⚠️ Common Pitfalls
              </h4>
              <ul className="space-y-1">
                {pitfalls.map((p, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-start gap-2"
                    style={{ color: "var(--muted)" }}
                  >
                    <span
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "#ef4444" }}
                    >
                      •
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Personal Notes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3
            className="font-semibold text-lg flex items-center gap-2"
            style={{ color: "var(--fg)" }}
          >
            <span>✏️</span> Personal Notes
          </h3>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            {saving ? (
              <span>Saving...</span>
            ) : lastSaved ? (
              <span>✓ Saved at {formatTime(lastSaved)}</span>
            ) : (
              <span>No notes saved yet</span>
            )}
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your notes here... They will be auto-saved."
          className="w-full h-64 p-4 rounded-lg resize-y"
          style={{
            background: "var(--panel)",
            border: "1px solid rgba(148,163,184,.35)",
            color: "var(--fg)",
            minHeight: "200px",
          }}
        />

        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            💡 Notes are saved locally in your browser and persist across
            sessions.
          </div>
          {content && (
            <button
              onClick={handleClear}
              className="text-sm px-3 py-1 rounded"
              style={{ color: "#ef4444", border: "1px solid #ef4444" }}
            >
              Clear Notes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathNotesTab;
