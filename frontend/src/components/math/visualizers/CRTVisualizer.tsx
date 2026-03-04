// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useMemo, useCallback } from "react";
import {
  modNormalize,
  crtSolve,
  crtSteps,
  type Congruence,
  type CRTStep,
} from "../../../utils/numberTheory";

const MAX_CONG = 4;
const DEFAULT_CONGS: Congruence[] = [
  { a: 2, m: 3 },
  { a: 3, m: 5 },
];

const CRTVisualizer: React.FC = () => {
  const [congs, setCongs] = useState<Congruence[]>(DEFAULT_CONGS);
  const [stepIdx, setStepIdx] = useState(-1);
  const [status, setStatus] = useState("Add congruences and step through the CRT merge.");

  // derived
  const steps = useMemo(() => crtSteps(congs), [congs]);
  const solution = useMemo(() => crtSolve(congs), [congs]);

  const resetSteps = useCallback(() => {
    setStepIdx(-1);
    setStatus("Press 'Step' to merge congruences one pair at a time.");
  }, []);

  const updateCong = (idx: number, field: "a" | "m", value: number) => {
    setCongs((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: field === "m" ? Math.max(1, value) : value };
      return next;
    });
    resetSteps();
  };

  const addCong = () => {
    if (congs.length >= MAX_CONG) return;
    setCongs((prev) => [...prev, { a: 1, m: 7 }]);
    resetSteps();
  };

  const removeCong = (idx: number) => {
    if (congs.length <= 2) return;
    setCongs((prev) => prev.filter((_, i) => i !== idx));
    resetSteps();
  };

  const handleStep = () => {
    const next = stepIdx + 1;
    if (next >= steps.length) {
      if (solution) {
        setStatus(`✅ Final: x ≡ ${solution.a} (mod ${solution.m})`);
      } else {
        setStatus("❌ No solution exists for this system.");
      }
      setStepIdx(steps.length);
      return;
    }
    const s = steps[next];
    setStepIdx(next);
    setStatus(s.explanation);
  };

  const handleReset = () => {
    resetSteps();
  };

  const handleRunAll = () => {
    setStepIdx(steps.length);
    if (solution) {
      setStatus(`✅ Final: x ≡ ${solution.a} (mod ${solution.m})`);
    } else {
      setStatus("❌ No solution exists for this system.");
    }
  };

  const activeStep: CRTStep | null = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg space-y-5" style={{ backgroundColor: "var(--panel)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
          🔗 Chinese Remainder Theorem — Step-by-Step
        </h3>

        {/* Congruence inputs */}
        <div className="space-y-2">
          {congs.map((c, i) => (
            <div key={i} className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-mono w-16" style={{ color: "var(--muted)" }}>
                x ≡
              </span>
              <input
                type="number"
                value={c.a}
                onChange={(e) => updateCong(i, "a", +e.target.value || 0)}
                className="w-20 px-2 py-1 rounded text-sm font-mono"
                aria-label={`Remainder a${i + 1}`}
              />
              <span className="text-sm font-mono" style={{ color: "var(--muted)" }}>(mod</span>
              <input
                type="number"
                value={c.m}
                min={1}
                onChange={(e) => updateCong(i, "m", +e.target.value || 1)}
                className="w-20 px-2 py-1 rounded text-sm font-mono"
                aria-label={`Modulus m${i + 1}`}
              />
              <span className="text-sm font-mono" style={{ color: "var(--muted)" }}>)</span>
              {congs.length > 2 && (
                <button
                  onClick={() => removeCong(i)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: "#ef4444", border: "1px solid #ef4444" }}
                  aria-label={`Remove congruence ${i + 1}`}
                >✕</button>
              )}
            </div>
          ))}
          {congs.length < MAX_CONG && (
            <button
              onClick={addCong}
              className="text-xs px-3 py-1 rounded"
              style={{ backgroundColor: "var(--card-hover-bg)", color: "var(--fg)", border: "1px solid var(--brand)" }}
            >+ Add congruence</button>
          )}
        </div>

        {/* Residue lines visualizer */}
        <div className="space-y-1">
          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            Residue lines (each row repeats mod mᵢ, star marks aᵢ):
          </p>
          <div className="space-y-1 overflow-x-auto">
            {congs.map((c, ci) => {
              const norm = modNormalize(c.a, c.m);
              const cells = Math.min(c.m * 3, 30); // show up to 30 cells
              return (
                <div key={ci} className="flex items-center gap-0.5">
                  <span className="text-xs font-mono w-24 flex-shrink-0" style={{ color: "var(--muted)" }}>
                    mod {c.m} (a={norm})
                  </span>
                  {Array.from({ length: cells }, (_, j) => {
                    const val = j % c.m;
                    const isHit = val === norm;
                    // If solution exists, highlight solution positions
                    const isSolution = solution ? j % c.m === norm && j === solution.a % cells : false;
                    return (
                      <div
                        key={j}
                        className="w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-mono flex-shrink-0"
                        style={{
                          backgroundColor: isHit ? "var(--brand)" : "var(--card-hover-bg)",
                          color: isHit ? "white" : "var(--muted)",
                          border: isSolution ? "2px solid #f59e0b" : "1px solid rgba(148,163,184,.2)",
                        }}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleStep} disabled={stepIdx >= steps.length}
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{
              backgroundColor: stepIdx >= steps.length ? "#64748b" : "#3b82f6",
              color: "white", cursor: stepIdx >= steps.length ? "not-allowed" : "pointer",
            }}
          >Step →</button>
          <button onClick={handleRunAll} className="px-3 py-1.5 rounded text-sm font-medium"
            style={{ backgroundColor: "#10b981", color: "white" }}
          >Run All</button>
          <button onClick={handleReset} className="px-3 py-1.5 rounded text-sm font-medium"
            style={{ backgroundColor: "#ef4444", color: "white" }}
          >Reset</button>
        </div>

        {/* Steps log */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {steps.map((s, i) => {
            const revealed = i <= stepIdx;
            const isActive = i === stepIdx;
            return (
              <div key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm"
                style={{
                  backgroundColor: isActive
                    ? (s.consistent ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)")
                    : revealed ? "var(--bg)" : "var(--card-hover-bg)",
                  border: isActive
                    ? `2px solid ${s.consistent ? "#22c55e" : "#ef4444"}`
                    : "1px solid transparent",
                  opacity: revealed ? 1 : 0.4,
                }}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: s.consistent ? "#22c55e" : "#ef4444", color: "white" }}>
                  {s.consistent ? "✓" : "✗"}
                </span>
                <span className="font-mono text-xs" style={{ color: "var(--fg)" }}>
                  x≡{s.a1}(mod {s.m1}) ∧ x≡{s.a2}(mod {s.m2})
                </span>
                {revealed && s.consistent && (
                  <span className="ml-auto font-mono font-bold text-xs" style={{ color: "var(--brand)" }}>
                    → x≡{s.resultA}(mod {s.resultM})
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Final result badge */}
        {stepIdx >= steps.length && (
          <div className="p-4 rounded-lg text-center font-bold font-mono"
            style={{
              backgroundColor: solution ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `2px solid ${solution ? "#22c55e" : "#ef4444"}`,
              color: solution ? "#22c55e" : "#ef4444",
            }}>
            {solution ? `x ≡ ${solution.a} (mod ${solution.m})` : "No solution — inconsistent system"}
          </div>
        )}

        {/* Status */}
        <div className="p-3 rounded text-sm font-medium"
          style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
          aria-live="polite" aria-atomic="true">
          {status}
        </div>
      </div>
    </div>
  );
};

export default CRTVisualizer;
