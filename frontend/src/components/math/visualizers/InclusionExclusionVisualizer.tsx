// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useCallback } from "react";
import { pieSteps2, pieSteps3, pieSteps4, type PieStep } from "../../../utils/probability";

type NumSets = 2 | 3 | 4;
type Mode = "formula" | "universe";

const UNIVERSE_SIZE = 30;
const SET_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];
const SET_LABELS = ["A", "B", "C", "D"];

// ── Formula mode state ──────────────────────────────────────────────

interface Formula2State {
  a: number; b: number; ab: number;
}
interface Formula3State {
  a: number; b: number; c: number;
  ab: number; ac: number; bc: number;
  abc: number;
}
interface Formula4State {
  a: number; b: number; c: number; d: number;
  ab: number; ac: number; ad: number; bc: number; bd: number; cd: number;
  abc: number; abd: number; acd: number; bcd: number;
  abcd: number;
}

// ── Universe mode: each dot has a set membership bitmask ─────────────

function buildInitialDots(n: NumSets): number[] {
  // Assign each dot a random membership in 0..2^n-1
  return Array.from({ length: UNIVERSE_SIZE }, () =>
    Math.floor(Math.random() * (1 << n))
  );
}

function computeUniverseValues(dots: number[], n: NumSets) {
  const masks = Array.from({ length: n }, (_, i) => 1 << i);
  const singles = masks.map((m) => dots.filter((d) => (d & m) === m).length);
  const pairs: number[] = [];
  const triples: number[] = [];
  let quad = 0;

  if (n >= 2) {
    pairs.push(dots.filter((d) => (d & 3) === 3).length); // AB
  }
  if (n >= 3) {
    pairs.push(dots.filter((d) => (d & 5) === 5).length); // AC
    pairs.push(dots.filter((d) => (d & 6) === 6).length); // BC
    triples.push(dots.filter((d) => (d & 7) === 7).length); // ABC
  }
  if (n === 4) {
    // Pairs: AB(3), AC(5), AD(9), BC(6), BD(10), CD(12)
    // Clear and rebuild for 4 sets
    const p4 = [3, 5, 9, 6, 10, 12].map(m => dots.filter(d => (d & m) === m).length);
    const t4 = [7, 11, 13, 14].map(m => dots.filter(d => (d & m) === m).length);
    quad = dots.filter(d => d === 15).length;
    return { singles, pairs: p4, triples: t4, quad, union: dots.filter(d => d > 0).length };
  }

  return { singles, pairs, triples, quad: 0, union: dots.filter((d) => d > 0).length };
}

// ── Component ───────────────────────────────────────────────────────

const InclusionExclusionVisualizer: React.FC = () => {
  const [numSets, setNumSets] = useState<NumSets>(3);
  const [mode, setMode] = useState<Mode>("formula");
  const [stepIdx, setStepIdx] = useState(-1);
  const [status, setStatus] = useState("Configure set sizes and step through PIE.");

  // Formula mode state
  const [f2, setF2] = useState<Formula2State>({ a: 8, b: 6, ab: 3 });
  const [f3, setF3] = useState<Formula3State>({ a: 10, b: 8, c: 7, ab: 4, ac: 3, bc: 3, abc: 2 });
  const [f4, setF4] = useState<Formula4State>({
    a: 12, b: 10, c: 8, d: 8,
    ab: 5, ac: 4, ad: 4, bc: 4, bd: 4, cd: 4,
    abc: 2, abd: 2, acd: 2, bcd: 2,
    abcd: 1
  });

  // Universe mode state
  const [dots, setDots] = useState<number[]>(() => buildInitialDots(3));
  const [highlightSet, setHighlightSet] = useState<number | null>(null);

  const resetSteps = useCallback(() => {
    setStepIdx(-1);
    setStatus("Press 'Step' to walk through PIE terms.");
  }, []);

  // Compute steps
  const steps: PieStep[] = (() => {
    if (mode === "formula") {
      if (numSets === 2) return pieSteps2(f2.a, f2.b, f2.ab);
      if (numSets === 3) return pieSteps3(f3.a, f3.b, f3.c, f3.ab, f3.ac, f3.bc, f3.abc);
      return pieSteps4(
        f4.a, f4.b, f4.c, f4.d,
        f4.ab, f4.ac, f4.ad, f4.bc, f4.bd, f4.cd,
        f4.abc, f4.abd, f4.acd, f4.bcd, f4.abcd
      );
    }
    // Universe mode — derive values from dots
    const uv = computeUniverseValues(dots, numSets);
    if (numSets === 2) return pieSteps2(uv.singles[0], uv.singles[1], uv.pairs[0]);
    if (numSets === 3) return pieSteps3(
      uv.singles[0], uv.singles[1], uv.singles[2],
      uv.pairs[0], uv.pairs[1], uv.pairs[2],
      uv.triples[0],
    );
    return pieSteps4(
      uv.singles[0], uv.singles[1], uv.singles[2], uv.singles[3],
      uv.pairs[0], uv.pairs[1], uv.pairs[2], uv.pairs[3], uv.pairs[4], uv.pairs[5],
      uv.triples[0], uv.triples[1], uv.triples[2], uv.triples[3],
      uv.quad,
    );
  })();

  const finalResult = steps.length > 0 ? steps[steps.length - 1].running : 0;
  const activeStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  const handleStep = () => {
    const next = stepIdx + 1;
    if (next >= steps.length) {
      setStepIdx(next);
      setStatus(`✅ |Union| = ${finalResult}`);
      return;
    }
    setStepIdx(next);
    const s = steps[next];
    setStatus(
      `Step ${next + 1}: ${s.sign === "+" ? "Add" : "Subtract"} ${s.label} = ${s.value} → running total = ${s.running}`
    );
  };

  const handleReset = () => {
    setStepIdx(-1);
    setHighlightSet(null);
    setStatus("Press 'Step' to walk through PIE terms.");
  };

  const handleRandomize = () => {
    setDots(buildInitialDots(numSets));
    handleReset();
  };

  // Toggle dot membership in universe mode
  const toggleDotSet = (dotIdx: number, setIdx: number) => {
    const mask = 1 << setIdx;
    setDots((prev) => {
      const next = [...prev];
      next[dotIdx] ^= mask;
      return next;
    });
    setStepIdx(-1);
    setStatus("Dot membership updated. Step through PIE again.");
  };

  const SIGN_COLORS = { "+": "#22c55e", "-": "#ef4444" };

  // Number input helper
  const NumInput = ({
    label, value, min = 0, max = 50, onChange,
  }: { label: string; value: number; min?: number; max?: number; onChange: (v: number) => void }) => (
    <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--muted)" }}>
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => { onChange(Math.max(min, Math.min(max, +e.target.value || 0))); setStepIdx(-1); }}
        className="w-20 px-2 py-1 rounded text-sm"
        aria-label={label}
      />
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg space-y-5" style={{ backgroundColor: "var(--panel)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
          ⋃ Inclusion–Exclusion Visualizer
        </h3>

        {/* Top controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Set count */}
          <div className="space-y-1">
            <div className="text-xs" style={{ color: "var(--muted)" }}>Number of sets</div>
            <div className="flex gap-1">
              {([2, 3, 4] as NumSets[]).map((n) => (
                <button
                  key={n}
                  onClick={() => { setNumSets(n); setDots(buildInitialDots(n)); handleReset(); }}
                  className="px-3 py-1.5 rounded text-sm font-medium"
                  style={{
                    backgroundColor: numSets === n ? "var(--brand)" : "var(--card-hover-bg)",
                    color: numSets === n ? "white" : "var(--fg)",
                    border: "2px solid var(--brand)",
                  }}
                  aria-label={`Use ${n} sets`}
                >
                  {n} Sets
                </button>
              ))}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="space-y-1">
            <div className="text-xs" style={{ color: "var(--muted)" }}>Mode</div>
            <div className="flex gap-1">
              {(["formula", "universe"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); handleReset(); }}
                  className="px-3 py-1.5 rounded text-sm font-medium capitalize"
                  style={{
                    backgroundColor: mode === m ? "var(--brand)" : "var(--card-hover-bg)",
                    color: mode === m ? "white" : "var(--fg)",
                    border: "2px solid var(--brand)",
                  }}
                  aria-label={`Switch to ${m} mode`}
                >
                  {m === "formula" ? "📊 Formula" : "🔵 Universe"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Formula mode inputs ── */}
        {mode === "formula" && (
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.25)" }}
          >
            <p className="text-xs mb-3 font-medium" style={{ color: "var(--muted)" }}>
              Enter set cardinalities:
            </p>
            <div className="flex flex-wrap gap-4">
              {numSets === 2 && (
                <>
                  <NumInput label="|A|" value={f2.a} onChange={(v) => setF2((p) => ({ ...p, a: v }))} />
                  <NumInput label="|B|" value={f2.b} onChange={(v) => setF2((p) => ({ ...p, b: v }))} />
                  <NumInput label="|A∩B|" value={f2.ab} max={Math.min(f2.a, f2.b)} onChange={(v) => setF2((p) => ({ ...p, ab: v }))} />
                </>
              )}
              {numSets === 3 && (
                <>
                  <NumInput label="|A|" value={f3.a} onChange={(v) => setF3((p) => ({ ...p, a: v }))} />
                  <NumInput label="|B|" value={f3.b} onChange={(v) => setF3((p) => ({ ...p, b: v }))} />
                  <NumInput label="|C|" value={f3.c} onChange={(v) => setF3((p) => ({ ...p, c: v }))} />
                  <NumInput label="|A∩B|" value={f3.ab} onChange={(v) => setF3((p) => ({ ...p, ab: v }))} />
                  <NumInput label="|A∩C|" value={f3.ac} onChange={(v) => setF3((p) => ({ ...p, ac: v }))} />
                  <NumInput label="|B∩C|" value={f3.bc} onChange={(v) => setF3((p) => ({ ...p, bc: v }))} />
                  <NumInput label="|A∩B∩C|" value={f3.abc} onChange={(v) => setF3((p) => ({ ...p, abc: v }))} />
                </>
              )}
              {numSets === 4 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                  <NumInput label="|A|" value={f4.a} onChange={v => setF4(p => ({ ...p, a: v }))} />
                  <NumInput label="|B|" value={f4.b} onChange={v => setF4(p => ({ ...p, b: v }))} />
                  <NumInput label="|C|" value={f4.c} onChange={v => setF4(p => ({ ...p, c: v }))} />
                  <NumInput label="|D|" value={f4.d} onChange={v => setF4(p => ({ ...p, d: v }))} />
                  <NumInput label="|A∩B|" value={f4.ab} onChange={v => setF4(p => ({ ...p, ab: v }))} />
                  <NumInput label="|A∩C|" value={f4.ac} onChange={v => setF4(p => ({ ...p, ac: v }))} />
                  <NumInput label="|A∩D|" value={f4.ad} onChange={v => setF4(p => ({ ...p, ad: v }))} />
                  <NumInput label="|B∩C|" value={f4.bc} onChange={v => setF4(p => ({ ...p, bc: v }))} />
                  <NumInput label="|B∩D|" value={f4.bd} onChange={v => setF4(p => ({ ...p, bd: v }))} />
                  <NumInput label="|C∩D|" value={f4.cd} onChange={v => setF4(p => ({ ...p, cd: v }))} />
                  <NumInput label="|A∩B∩C|" value={f4.abc} onChange={v => setF4(p => ({ ...p, abc: v }))} />
                  <NumInput label="|A∩B∩D|" value={f4.abd} onChange={v => setF4(p => ({ ...p, abd: v }))} />
                  <NumInput label="|A∩C∩D|" value={f4.acd} onChange={v => setF4(p => ({ ...p, acd: v }))} />
                  <NumInput label="|B∩C∩D|" value={f4.bcd} onChange={v => setF4(p => ({ ...p, bcd: v }))} />
                  <NumInput label="|A∩B∩C∩D|" value={f4.abcd} onChange={v => setF4(p => ({ ...p, abcd: v }))} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Universe mode dots ── */}
        {mode === "universe" && (() => {
          const uv = computeUniverseValues(dots, numSets);
          return (
            <div className="space-y-3">
              {/* Set legend */}
              <div className="flex gap-3 flex-wrap">
                {SET_LABELS.slice(0, numSets).map((label, si) => (
                  <button
                    key={si}
                    onClick={() => setHighlightSet(highlightSet === si ? null : si)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: highlightSet === si ? SET_COLORS[si] : "var(--card-hover-bg)",
                      color: highlightSet === si ? "white" : "var(--fg)",
                      border: `2px solid ${SET_COLORS[si]}`,
                    }}
                    aria-label={`Highlight set ${label} (${uv.singles[si]} elements)`}
                  >
                    <span>{label}</span>
                    <span className="text-xs opacity-75">({uv.singles[si]})</span>
                  </button>
                ))}
                <span className="text-xs self-center" style={{ color: "var(--muted)" }}>
                  Union = {uv.union} · click dots to toggle membership
                </span>
              </div>
              {/* Dot grid */}
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.2)" }}
              >
                <div className="flex flex-wrap gap-1.5">
                  {dots.map((membership, di) => {
                    const inHighlight = highlightSet !== null ? (membership & (1 << highlightSet)) !== 0 : false;
                    const isInUnion = membership > 0;
                    // Determine dot color
                    let bg = "rgba(148,163,184,.2)"; // not in any set
                    if (highlightSet !== null) {
                      bg = inHighlight ? SET_COLORS[highlightSet] : "rgba(148,163,184,.15)";
                    } else if (isInUnion) {
                      // multi-membership: blend or use first set's color
                      const firstSet = [0, 1, 2, 3].find((si) => (membership & (1 << si)) !== 0) ?? 0;
                      bg = SET_COLORS[firstSet];
                    }
                    return (
                      <div key={di} className="flex flex-col items-center gap-0.5">
                        <div
                          className="w-5 h-5 rounded-full cursor-pointer transition-all"
                          style={{
                            backgroundColor: bg,
                            opacity: isInUnion || highlightSet !== null ? 1 : 0.3,
                            transform: inHighlight ? "scale(1.25)" : "scale(1)",
                            border: "1px solid rgba(255,255,255,.2)",
                          }}
                          onClick={() => {
                            // Cycle through sets by toggling first available set
                            const si = [0, 1, 2, 3].find((s) => s < numSets && (membership & (1 << s)) === 0) ?? 0;
                            toggleDotSet(di, si < numSets ? si : 0);
                          }}
                          aria-label={`Dot ${di + 1}, membership ${membership.toString(2).padStart(numSets, "0")}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleRandomize}
                  className="mt-2 px-3 py-1 text-xs rounded"
                  style={{ backgroundColor: "var(--card-hover-bg)", color: "var(--fg)", border: "1px solid rgba(148,163,184,.35)" }}
                >
                  🔀 Randomize
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── PIE Steps display ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm" style={{ color: "var(--fg)" }}>
              PIE Formula Breakdown:
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleStep}
                disabled={stepIdx >= steps.length}
                className="px-3 py-1.5 rounded text-sm font-medium"
                style={{
                  backgroundColor: stepIdx >= steps.length ? "#64748b" : "#3b82f6",
                  color: "white",
                  cursor: stepIdx >= steps.length ? "not-allowed" : "pointer",
                }}
                aria-label="Next PIE step"
              >
                Step →
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded text-sm font-medium"
                style={{ backgroundColor: "#ef4444", color: "white" }}
                aria-label="Reset steps"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Steps list */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {steps.map((s, i) => {
              const revealed = i <= stepIdx;
              const isActive = i === stepIdx;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm"
                  style={{
                    backgroundColor: isActive
                      ? s.sign === "+"
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(239,68,68,0.12)"
                      : revealed
                      ? "var(--bg)"
                      : "var(--card-hover-bg)",
                    border: isActive
                      ? `2px solid ${SIGN_COLORS[s.sign]}`
                      : "1px solid transparent",
                    opacity: revealed ? 1 : 0.4,
                  }}
                  aria-label={`${s.sign} ${s.label} = ${s.value}, running = ${s.running}`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: SIGN_COLORS[s.sign], color: "white" }}
                  >
                    {s.sign}
                  </span>
                  <span className="font-mono font-medium" style={{ color: "var(--fg)", minWidth: "80px" }}>
                    {s.label}
                  </span>
                  <span style={{ color: "var(--muted)" }}>= {s.value}</span>
                  {revealed && (
                    <span className="ml-auto font-mono font-bold" style={{ color: "var(--brand)" }}>
                      → {s.running}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final result */}
          {stepIdx >= steps.length - 1 && (
            <div
              className="p-4 rounded-lg text-center text-lg font-bold font-mono"
              style={{
                backgroundColor: "rgba(34,197,94,0.1)",
                border: "2px solid #22c55e",
                color: "#22c55e",
              }}
            >
              |{SET_LABELS.slice(0, numSets).join(" ∪ ")}| = {finalResult}
            </div>
          )}
        </div>

        {/* Status */}
        <div
          className="p-3 rounded text-sm font-medium"
          style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </div>

        {/* PIE sign pattern reminder */}
        <div
          className="p-3 rounded-lg text-xs"
          style={{ backgroundColor: "var(--bg)", color: "var(--muted)", border: "1px solid rgba(148,163,184,.2)" }}
        >
          <p className="font-semibold mb-1" style={{ color: "var(--fg)" }}>💡 PIE Sign Pattern</p>
          <p>Singles: <span style={{ color: "#22c55e" }}>+1</span> · Pairs: <span style={{ color: "#ef4444" }}>−1</span> · Triples: <span style={{ color: "#22c55e" }}>+1</span> · Quadruples: <span style={{ color: "#ef4444" }}>−1</span> · Alternates with each level of intersection.</p>
        </div>
      </div>
    </div>
  );
};

export default InclusionExclusionVisualizer;
