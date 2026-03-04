// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useEffect } from "react";
import { readJSON, writeJSON } from "../../utils/storage";

const PRACTICE_PREFIX = "algosort-math-practice-";

interface Check {
  question: string;
  answer: string;
  hint?: string;
}

interface Props {
  topicSlug: string;
  checks: Check[];
}

interface Attempt {
  correct: number;
  total: number;
  lastAt: string;
}

const MicroCheck: React.FC<Props> = ({ topicSlug, checks }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [stats, setStats] = useState<Attempt | null>(null);

  const storageKey = PRACTICE_PREFIX + topicSlug;

  useEffect(() => {
    setUserAnswers({});
    setSubmitted({});
    setStats(readJSON<Attempt | null>(storageKey, null));
  }, [topicSlug, storageKey]);

  if (!checks || checks.length === 0) return null;

  const handleCheck = (idx: number) => {
    const user = (userAnswers[idx] || "").trim().toLowerCase();
    const expected = checks[idx].answer.trim().toLowerCase();
    const isCorrect = user === expected;

    setSubmitted((prev) => ({ ...prev, [idx]: true }));

    // Save attempt when all are answered
    const newSubmitted = { ...submitted, [idx]: true };
    const allDone = checks.every((_, i) => newSubmitted[i]);
    if (allDone) {
      const correct = checks.filter((c, i) => {
        const ans = (userAnswers[i] || "").trim().toLowerCase();
        return ans === c.answer.trim().toLowerCase();
      }).length;
      const attempt: Attempt = {
        correct,
        total: checks.length,
        lastAt: new Date().toISOString(),
      };
      writeJSON(storageKey, attempt);
      setStats(attempt);
    }

    return isCorrect;
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="font-semibold text-lg flex items-center gap-2"
          style={{ color: "var(--fg)" }}
        >
          <span>⚡</span> Quick Check
        </h3>
        {stats && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Last: {stats.correct}/{stats.total} correct
          </span>
        )}
      </div>

      {checks.map((check, idx) => {
        const isSubmitted = submitted[idx];
        const user = (userAnswers[idx] || "").trim().toLowerCase();
        const expected = check.answer.trim().toLowerCase();
        const isCorrect = user === expected;

        return (
          <div
            key={idx}
            className="p-4 rounded-lg space-y-2"
            style={{
              backgroundColor: "var(--panel)",
              border: isSubmitted
                ? `2px solid ${isCorrect ? "#22c55e" : "#ef4444"}`
                : "1px solid rgba(148,163,184,.25)",
            }}
          >
            <div className="text-sm font-medium" style={{ color: "var(--fg)" }}>
              {idx + 1}. {check.question}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={userAnswers[idx] || ""}
                onChange={(e) =>
                  setUserAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                }
                disabled={isSubmitted}
                placeholder="Your answer..."
                className="flex-1 px-3 py-1.5 rounded text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSubmitted) handleCheck(idx);
                }}
              />
              {!isSubmitted && (
                <button
                  onClick={() => handleCheck(idx)}
                  className="px-3 py-1.5 rounded text-sm font-medium"
                  style={{
                    backgroundColor: "var(--brand)",
                    color: "white",
                  }}
                  aria-label={`Check answer ${idx + 1}`}
                >
                  Check
                </button>
              )}
            </div>
            {isSubmitted && (
              <div
                className="text-xs"
                style={{ color: isCorrect ? "#22c55e" : "#ef4444" }}
              >
                {isCorrect
                  ? "✅ Correct!"
                  : `❌ Expected: ${check.answer}`}
                {!isCorrect && check.hint && (
                  <span style={{ color: "var(--muted)" }}>
                    {" "}
                    — Hint: {check.hint}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={handleReset}
        className="text-sm px-3 py-1.5 rounded"
        style={{
          backgroundColor: "var(--card-hover-bg)",
          color: "var(--fg)",
          border: "1px solid rgba(148,163,184,.35)",
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default MicroCheck;
