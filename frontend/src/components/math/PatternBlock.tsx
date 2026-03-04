// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState } from "react";

interface Pattern {
  ifYouSee: string[];
  think: string;
  why: string;
}

interface Props {
  patterns: Pattern[];
}

const PatternBlock: React.FC<Props> = ({ patterns }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  if (!patterns || patterns.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3
        className="font-semibold text-lg flex items-center gap-2"
        style={{ color: "var(--fg)" }}
      >
        <span>🎯</span> Pattern Recognition
      </h3>
      <div className="space-y-2">
        {patterns.map((p, idx) => {
          const isOpen = expandedIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-lg overflow-hidden transition-all"
              style={{
                backgroundColor: "var(--panel)",
                border: isOpen
                  ? "1px solid var(--brand)"
                  : "1px solid rgba(148,163,184,.25)",
              }}
            >
              <button
                onClick={() => setExpandedIdx(isOpen ? null : idx)}
                className="w-full text-left px-4 py-3 flex items-center justify-between"
                style={{ color: "var(--fg)" }}
                aria-expanded={isOpen}
                aria-label={`Pattern: ${p.think}`}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: "rgba(99,102,241,0.15)",
                      color: "var(--brand)",
                    }}
                  >
                    IF YOU SEE
                  </span>
                  <span style={{ color: "var(--muted)" }}>
                    {p.ifYouSee.join(" · ")}
                  </span>
                </div>
                <span
                  className="transition-transform text-xs"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    color: "var(--muted)",
                  }}
                >
                  ▼
                </span>
              </button>

              {isOpen && (
                <div
                  className="px-4 pb-4 space-y-2 text-sm animate-fade-in"
                  style={{ borderTop: "1px solid rgba(148,163,184,.15)" }}
                >
                  <div className="pt-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium mr-2"
                      style={{
                        backgroundColor: "rgba(34,197,94,0.15)",
                        color: "#22c55e",
                      }}
                    >
                      THINK
                    </span>
                    <span style={{ color: "var(--fg)" }}>{p.think}</span>
                  </div>
                  <div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium mr-2"
                      style={{
                        backgroundColor: "rgba(245,158,11,0.15)",
                        color: "#f59e0b",
                      }}
                    >
                      WHY
                    </span>
                    <span style={{ color: "var(--muted)" }}>{p.why}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatternBlock;
