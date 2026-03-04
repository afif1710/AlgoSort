// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React from "react";
import { Link } from "react-router-dom";

export interface TutorialTeachingData {
  tldr: string;
  intuition: string[];
  coreIdeas: string[];
  invariantsOrRules?: string[];
  operations?: Array<{
    name: string;
    goal: string;
    time: string;
    notes?: string;
  }>;
  walkthroughs: Array<{
    title: string;
    steps: string[];
    takeaway: string;
  }>;
  commonMistakes: string[];
  mentalModels?: string[];
  readinessChecklist?: string[];
  linksNext?: Array<{
    label: string;
    to: string;
    why: string;
  }>;
  cheatSheet: {
    bullets: string[];
  };
}

export default function TeachingBlock({ teaching }: { teaching: TutorialTeachingData }) {
  return (
    <div className="space-y-6">
      {/* 1) TL;DR */}
      <section className="card p-4 space-y-2 border-l-4" style={{ borderLeftColor: "var(--brand)" }}>
        <h3 className="font-semibold text-lg">TL;DR</h3>
        <p style={{ color: "var(--fg)" }}>{teaching.tldr}</p>
      </section>

      {/* 2) Intuition */}
      <section className="card p-4 space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>💡</span> Intuition
        </h3>
        {teaching.intuition.map((p, i) => (
          <p key={i} style={{ color: "var(--fg)" }}>{p}</p>
        ))}
      </section>

      {/* 3) Core Ideas */}
      <section className="card p-4 space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>🔑</span> Core Ideas
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          {teaching.coreIdeas.map((k, i) => (
            <li key={i} style={{ color: "var(--fg)" }}>{k}</li>
          ))}
        </ul>
      </section>

      {/* 4) Invariants / Rules */}
      {teaching.invariantsOrRules && teaching.invariantsOrRules.length > 0 && (
        <section className="card p-4 space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>🛡️</span> Invariants & Rules
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {teaching.invariantsOrRules.map((rule, i) => (
              <li key={i} style={{ color: "var(--fg)" }}>{rule}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 5) Operations */}
      {teaching.operations && teaching.operations.length > 0 && (
        <section className="card p-4 space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>⚙️</span> Operations & Complexity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(148,163,184,.35)" }}>
                  <th className="p-2 font-semibold">Operation</th>
                  <th className="p-2 font-semibold">Goal</th>
                  <th className="p-2 font-semibold">Time</th>
                  <th className="p-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {teaching.operations.map((op, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(148,163,184,.15)" }}>
                    <td className="p-2 font-medium" style={{ color: "var(--brand)" }}>{op.name}</td>
                    <td className="p-2">{op.goal}</td>
                    <td className="p-2 font-mono text-sm">{op.time}</td>
                    <td className="p-2 text-sm" style={{ color: "var(--muted)" }}>{op.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6) Worked Walkthroughs */}
      {teaching.walkthroughs && teaching.walkthroughs.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-semibold text-xl border-b pb-2" style={{ borderColor: "rgba(148,163,184,.35)" }}>
            Worked Examples
          </h3>
          {teaching.walkthroughs.map((ex, idx) => (
            <div key={idx} className="card p-4 space-y-3">
              <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--brand)" }}>
                <span>{idx + 1}.</span> {ex.title}
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
      )}

      {/* 7) Common Mistakes */}
      {teaching.commonMistakes && teaching.commonMistakes.length > 0 && (
        <section className="card p-4 space-y-2 border-l-4 border-red-500">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
            <span>⚠️</span> Common Mistakes
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {teaching.commonMistakes.map((m, i) => (
              <li key={i} style={{ color: "var(--fg)" }}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Mental Models (Optional) */}
      {teaching.mentalModels && teaching.mentalModels.length > 0 && (
        <section className="card p-4 space-y-2" style={{ backgroundColor: "rgba(99,102,241,0.05)" }}>
          <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--brand)" }}>
            <span>🧠</span> Mental Models
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {teaching.mentalModels.map((model, i) => (
              <li key={i} style={{ color: "var(--fg)" }}>{model}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 8) Readiness Checklist */}
      {teaching.readinessChecklist && teaching.readinessChecklist.length > 0 && (
        <section className="card p-4 space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>✅</span> Readiness Checklist
          </h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>You should be able to:</p>
          <ul className="space-y-1">
            {teaching.readinessChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span style={{ color: "var(--fg)" }}>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 9) Next Links */}
      {teaching.linksNext && teaching.linksNext.length > 0 && (
        <section className="card p-4 space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>🔗</span> Where to Go Next
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {teaching.linksNext.map((link, i) => (
              <Link 
                key={i} 
                to={link.to}
                className="block p-3 rounded border transition-colors hover:border-brand"
                style={{ borderColor: "rgba(148,163,184,.35)", backgroundColor: "var(--card-hover-bg)" }}
              >
                <div className="font-medium" style={{ color: "var(--brand)" }}>{link.label} →</div>
                <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>{link.why}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 10) Cheat Sheet */}
      <section className="card p-5 space-y-4" style={{ backgroundColor: "var(--panel)", border: "2px solid var(--brand)" }}>
        <h3 className="font-bold text-xl flex items-center gap-2" style={{ color: "var(--brand)" }}>
          <span>📋</span> Cheat Sheet
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          {teaching.cheatSheet.bullets.map((b, i) => (
            <li key={i} style={{ color: "var(--fg)" }}>{b}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
