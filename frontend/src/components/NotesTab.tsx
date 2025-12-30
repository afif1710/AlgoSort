import { useState, useEffect, useRef } from "react";
import { getNotes, saveNotes, clearNotes } from "../utils/storage";

interface Props {
  topicSlug: string;
}

export default function NotesTab({ topicSlug }: Props) {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = getNotes(topicSlug);
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

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveNotes(topicSlug, value);
      setLastSaved(new Date().toISOString());
      setSaving(false);
    }, 500);
  };

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear your notes for this topic?"
      )
    ) {
      clearNotes(topicSlug);
      setContent("");
      setLastSaved(null);
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {saving ? (
            <span>Saving...</span>
          ) : lastSaved ? (
            <span>✓ Saved at {formatTime(lastSaved)}</span>
          ) : (
            <span>No notes saved yet</span>
          )}
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

      <div className="text-xs" style={{ color: "var(--muted)" }}>
        💡 Tip: Notes are saved locally in your browser and persist across
        sessions.
      </div>
    </div>
  );
}
