// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React from "react";

export interface TeachingData {
  prerequisites?: string[];
  tldr: string;
  intuition: string[];
  definitions: string[];
  keyIdeas: string[];
  proofSketch?: string[];
  workedExamples: Array<{
    title: string;
    steps: string[];
    takeaway: string;
  }>;
  commonMistakes: string[];
  variantsAndExtensions?: string[];
  programmingNotes?: string[];
  visualizerHints?: string[];
  summaryCheatSheet: {
    formulas: string[];
    rulesOfThumb: string[];
  };
}

export default function TeachingBlock({ teaching }: { teaching: TeachingData }) {
  return (
    <div className="space-y-6">
      {/* TL;DR */}
      <section className="card p-4 space-y-2 border-l-4" style={{ borderLeftColor: "var(--brand)" }}>
        <h3 className="font-semibold text-lg">TL;DR</h3>
        <p style={{ color: "var(--fg)" }}>{teaching.tldr}</p>
      </section>

      {/* Prerequisites */}
      {teaching.prerequisites && teaching.prerequisites.length > 0 && (
        <section className="card p-4 space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>📚</span> Prerequisites
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {teaching.prerequisites.map((p, i) => (
              <li key={i} style={{ color: "var(--muted)" }}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Intuition */}
      <section className="card p-4 space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>💡</span> Intuition
        </h3>
        {teaching.intuition.map((p, i) => (
          <p key={i} style={{ color: "var(--fg)" }}>{p}</p>
        ))}
      </section>

      {/* Definitions & Notation */}
      <section className="card p-4 space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>📝</span> Definitions & Notation
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          {teaching.definitions.map((d, i) => (
            <li key={i} style={{ color: "var(--fg)" }}>{d}</li>
          ))}
        </ul>
      </section>

      {/* Key Ideas */}
      <section className="card p-4 space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>🔑</span> Key Ideas
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          {teaching.keyIdeas.map((k, i) => (
            <li key={i} style={{ color: "var(--fg)" }}>{k}</li>
          ))}
        </ul>
      </section>

      {/* Proof Sketch (Collapsible) */}
      {teaching.proofSketch && teaching.proofSketch.length > 0 && (
        <section className="card p-4 space-y-2">
          <details className="group cursor-pointer">
            <summary className="font-semibold text-lg flex items-center gap-2 list-none" style={{ color: "var(--brand)" }}>
              <span>🔍</span> Proof Sketch / Why It Works
              <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-3 pl-2 pr-2">
              <ol className="list-decimal pl-5 space-y-2">
                {teaching.proofSketch.map((step, i) => (
                  <li key={i} style={{ color: "var(--fg)" }}>{step}</li>
                ))}
              </ol>
            </div>
          </details>
        </section>
      )}
      
      {/* Worked Examples */}
      <section className="space-y-4">
        <h3 className="font-semibold text-xl border-b pb-2" style={{ borderColor: "rgba(148,163,184,.35)" }}>
          Worked Examples
        </h3>
        {teaching.workedExamples.map((ex, idx) => (
          <div key={idx} className="card p-4 space-y-3">
            <h4 className="font-semibold" style={{ color: "var(--brand)" }}>
              Example {idx + 1}: {ex.title}
            </h4>
            <ol className="list-decimal pl-5 space-y-2">
              {ex.steps.map((step, i) => (
                <li key={i} style={{ color: "var(--fg)" }}>{step}</li>
              ))}
            </ol>
            <div className="p-3 mt-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)"}}>
              <strong>Takeaway:</strong> {ex.takeaway}
            </div>
          </div>
        ))}
      </section>

      {/* Common Mistakes */}
      <section className="card p-4 space-y-2 border-l-4 border-red-500">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
          <span>⚠️</span> Common Mistakes
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          {teaching.commonMistakes.map((m, i) => (
            <li key={i} style={{ color: "var(--fg)" }}>{m}</li>
          ))}
        </ul>
      </section>

      {/* Variants & Extensions */}
      {teaching.variantsAndExtensions && teaching.variantsAndExtensions.length > 0 && (
        <section className="card p-4 space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>🔄</span> Variants & Extensions
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {teaching.variantsAndExtensions.map((v, i) => (
              <li key={i} style={{ color: "var(--fg)" }}>{v}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Programming Notes */}
      {teaching.programmingNotes && teaching.programmingNotes.length > 0 && (
        <section className="card p-4 space-y-2" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "#8b5cf6" }}>
            <span>💻</span> Programming Notes
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {teaching.programmingNotes.map((note, i) => (
              <li key={i} style={{ color: "var(--fg)" }}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Visualizer Hints */}
      {teaching.visualizerHints && teaching.visualizerHints.length > 0 && (
        <section className="card p-4 space-y-2" style={{ backgroundColor: "rgba(99,102,241,0.05)" }}>
          <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--brand)" }}>
            <span>👀</span> Visualizer Hints: Try This!
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {teaching.visualizerHints.map((hint, i) => (
              <li key={i} style={{ color: "var(--fg)" }}>{hint}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Cheat Sheet */}
      <section className="card p-5 space-y-4" style={{ backgroundColor: "var(--panel)", border: "2px solid var(--brand)" }}>
        <h3 className="font-bold text-xl flex items-center gap-2" style={{ color: "var(--brand)" }}>
          <span>📋</span> Summary Cheat Sheet
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm" style={{ color: "var(--muted)" }}>Formulas</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {teaching.summaryCheatSheet.formulas.map((f, i) => (
                <li key={i} style={{ color: "var(--fg)" }}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm" style={{ color: "var(--muted)" }}>Rules of Thumb</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {teaching.summaryCheatSheet.rulesOfThumb.map((r, i) => (
                <li key={i} style={{ color: "var(--fg)" }}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
