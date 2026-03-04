// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React from "react";

interface Problem {
  platform: string;
  title: string;
  url: string;
  difficulty?: string;
  why: string;
}

interface Props {
  problems: Problem[];
}

const platformColors: Record<string, string> = {
  LeetCode: "#f59e0b",
  Codeforces: "#3b82f6",
  CSES: "#10b981",
  AtCoder: "#8b5cf6",
  Other: "#6b7280",
};

const PracticeList: React.FC<Props> = ({ problems }) => {
  if (!problems || problems.length === 0) {
    return (
      <div className="card p-6 text-center" style={{ color: "var(--muted)" }}>
        No curated problems for this topic yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3
        className="font-semibold text-lg"
        style={{ color: "var(--fg)" }}
      >
        📝 Curated Practice Problems
      </h3>
      <div className="grid gap-3">
        {problems.map((p, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 transition-all"
            style={{
              backgroundColor: "var(--panel)",
              border: "1px solid rgba(148,163,184,.25)",
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span
                className="text-xs px-2 py-1 rounded font-medium flex-shrink-0"
                style={{
                  backgroundColor: platformColors[p.platform] || "#6b7280",
                  color: "white",
                }}
              >
                {p.platform}
              </span>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium link truncate"
              >
                {p.title}
              </a>
              {p.difficulty && (
                <span
                  className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                  style={{
                    background: "var(--card-hover-bg)",
                    color: "var(--muted)",
                  }}
                >
                  {p.difficulty}
                </span>
              )}
            </div>
            <div
              className="text-xs sm:text-right flex-shrink-0 sm:max-w-[200px]"
              style={{ color: "var(--muted)" }}
            >
              {p.why}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeList;
