// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useMemo } from "react";
import {
  mobiusSieve,
  divisorTransform,
  mobiusInversion,
  divisorTransformSteps,
  inversionSteps,
  factorizeString,
  divisorsOf,
} from "../../../utils/mobius";

const MAX_N = 200;
const SIEVE = mobiusSieve(MAX_N);

const MU_COLOR_MAP = new Map<number, string>([
  [1,  "#22c55e"],
  [-1, "#ef4444"],
  [0,  "#64748b"],
]);
function muColor(v: number): string { return MU_COLOR_MAP.get(v) ?? "#64748b"; }

const MobiusInversionVisualizer: React.FC = () => {
  const [tab, setTab] = useState<"explorer" | "sandbox">("explorer");

  // ── Panel A: μ explorer ──
  const [exploreN, setExploreN] = useState(12);
  const safeN = Math.max(1, Math.min(MAX_N, exploreN));
  const muVal = SIEVE.mu[safeN];
  const factStr = factorizeString(safeN, SIEVE.spf);
  const divs = divisorsOf(safeN);

  // ── Panel B: transform sandbox ──
  const [nMax, setNMax] = useState(12);
  const safeMax = Math.max(2, Math.min(30, nMax));

  const [fArr, setFArr] = useState<number[]>(() => {
    const arr = new Array(31).fill(0);
    arr[1] = 1; arr[2] = 1; arr[3] = 1;
    return arr;
  });

  const g = useMemo(() => divisorTransform(fArr.slice(0, safeMax + 1)), [fArr, safeMax]);
  const fRecovered = useMemo(() => mobiusInversion(g, SIEVE.mu), [g]);

  const [inspectN, setInspectN] = useState(6);
  const safeInspect = Math.max(1, Math.min(safeMax, inspectN));

  const forwardSteps = useMemo(
    () => divisorTransformSteps(safeInspect, fArr),
    [safeInspect, fArr]
  );
  const backwardSteps = useMemo(
    () => inversionSteps(safeInspect, g, SIEVE.mu),
    [safeInspect, g]
  );

  const randomizeF = () => {
    const arr = new Array(31).fill(0);
    for (let i = 1; i <= 30; i++) arr[i] = Math.floor(Math.random() * 5);
    setFArr(arr);
  };

  const updateF = (idx: number, val: number) => {
    setFArr((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg space-y-5" style={{ backgroundColor: "var(--panel)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
          μ Möbius Function & Inversion
        </h3>

        {/* Tab toggle */}
        <div className="flex gap-1">
          {(["explorer", "sandbox"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded text-sm font-medium capitalize"
              style={{
                backgroundColor: tab === t ? "var(--brand)" : "var(--card-hover-bg)",
                color: tab === t ? "white" : "var(--fg)", border: "2px solid var(--brand)",
              }}>{t === "explorer" ? "μ(n) Explorer" : "Transform Sandbox"}</button>
          ))}
        </div>

        {/* ── Explorer ── */}
        {tab === "explorer" && (
          <div className="space-y-4">
            <div className="flex items-end gap-4 flex-wrap">
              <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--fg)" }}>
                n = {safeN}
                <input type="range" min={1} max={MAX_N} value={safeN}
                  onChange={(e) => setExploreN(+e.target.value)} className="w-48" aria-label="Select n" />
              </label>
            </div>

            {/* Result badges */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1 rounded font-mono"
                style={{ backgroundColor: `${muColor(muVal)}22`, color: muColor(muVal), border: `1px solid ${muColor(muVal)}` }}>
                μ({safeN}) = {muVal}
              </span>
              <span className="text-xs px-3 py-1 rounded font-mono"
                style={{ backgroundColor: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid #8b5cf6" }}>
                {safeN} = {factStr}
              </span>
              <span className="text-xs px-3 py-1 rounded font-mono"
                style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid #3b82f6" }}>
                divisors: {divs.join(", ")}
              </span>
            </div>

            <div className="text-sm" style={{ color: "var(--muted)" }}>
              {muVal === 0
                ? `μ(${safeN}) = 0 because ${safeN} has a squared prime factor.`
                : muVal === 1
                ? `μ(${safeN}) = 1 because ${safeN} is a product of an even number of distinct primes.`
                : `μ(${safeN}) = −1 because ${safeN} is a product of an odd number of distinct primes.`}
            </div>

            {/* μ heatmap for 1..60 */}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
                μ(n) for n = 1..60:
              </p>
              <div className="flex flex-wrap gap-0.5">
                {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => (
                  <div key={n}
                    className="w-6 h-6 rounded-sm flex items-center justify-center text-[9px] font-mono cursor-pointer"
                    style={{
                      backgroundColor: muColor(SIEVE.mu[n]) + "33",
                      color: muColor(SIEVE.mu[n]),
                      border: n === safeN ? "2px solid var(--brand)" : "1px solid rgba(148,163,184,.15)",
                    }}
                    onClick={() => setExploreN(n)}
                    aria-label={`μ(${n})=${SIEVE.mu[n]}`}
                  >{SIEVE.mu[n]}</div>
                ))}
              </div>
              <div className="flex gap-3 mt-1 text-[10px]" style={{ color: "var(--muted)" }}>
                <span><span style={{ color: "#22c55e" }}>■</span> μ=1</span>
                <span><span style={{ color: "#ef4444" }}>■</span> μ=−1</span>
                <span><span style={{ color: "#64748b" }}>■</span> μ=0</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Transform Sandbox ── */}
        {tab === "sandbox" && (
          <div className="space-y-4">
            <div className="flex items-end gap-4 flex-wrap">
              <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--fg)" }}>
                N max = {safeMax}
                <input type="range" min={2} max={30} value={safeMax}
                  onChange={(e) => setNMax(+e.target.value)} className="w-32" aria-label="N max" />
              </label>
              <button onClick={randomizeF}
                className="px-3 py-1 text-xs rounded"
                style={{ backgroundColor: "var(--card-hover-bg)", border: "1px solid var(--brand)", color: "var(--fg)" }}>
                🔀 Random f
              </button>
            </div>

            {/* f, g, f' table */}
            <div className="overflow-x-auto">
              <div className="rounded-lg" style={{ border: "1px solid rgba(148,163,184,.25)" }}>
                <div className="grid text-[10px] font-medium px-2 py-1"
                  style={{ backgroundColor: "var(--card-hover-bg)", color: "var(--muted)", gridTemplateColumns: "2.5rem 3.5rem 3.5rem 3.5rem" }}>
                  <span>n</span><span>f(n)</span><span>g(n)</span><span>f'(n)</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {Array.from({ length: safeMax }, (_, i) => i + 1).map((n) => {
                    const fv = fArr[n] || 0;
                    const gv = n < g.length ? g[n] : 0;
                    const frv = n < fRecovered.length ? fRecovered[n] : 0;
                    const match = fv === frv;
                    return (
                      <div key={n} className="grid px-2 py-1 text-xs font-mono"
                        style={{
                          gridTemplateColumns: "2.5rem 3.5rem 3.5rem 3.5rem",
                          backgroundColor: n === safeInspect ? "rgba(99,102,241,0.1)" : n % 2 ? "var(--bg)" : "var(--panel)",
                          color: "var(--fg)",
                          borderLeft: n === safeInspect ? "3px solid var(--brand)" : "3px solid transparent",
                        }}
                        onClick={() => setInspectN(n)}>
                        <span style={{ color: "var(--muted)" }}>{n}</span>
                        <input type="number" value={fv} onChange={(e) => updateF(n, +e.target.value || 0)}
                          className="w-12 px-1 rounded text-xs bg-transparent" style={{ color: "var(--fg)" }}
                          aria-label={`f(${n})`} />
                        <span style={{ color: "#3b82f6" }}>{gv}</span>
                        <span style={{ color: match ? "#22c55e" : "#ef4444" }}>{frv}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>
                f(n)=original · g(n)=Σ f(d) · f'(n)=Möbius inversion of g (should equal f)
              </p>
            </div>

            {/* Step details for inspectN */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Forward */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.2)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--fg)" }}>
                  Forward: g({safeInspect}) = Σ f(d) for d | {safeInspect}
                </p>
                {forwardSteps.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono py-0.5">
                    <span style={{ color: "#22c55e" }}>+</span>
                    <span style={{ color: "var(--muted)" }}>f({s.divisor})</span>
                    <span style={{ color: "var(--fg)" }}>= {s.fValue}</span>
                    <span className="ml-auto" style={{ color: "var(--brand)" }}>→ {s.running}</span>
                  </div>
                ))}
                <div className="mt-1 text-xs font-bold" style={{ color: "var(--brand)" }}>
                  g({safeInspect}) = {forwardSteps.result}
                </div>
              </div>
              {/* Backward */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.2)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--fg)" }}>
                  Inversion: f({safeInspect}) = Σ μ(d)·g({safeInspect}/d)
                </p>
                {backwardSteps.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono py-0.5">
                    <span style={{ color: muColor(s.muD) }}>μ({s.divisor})={s.muD}</span>
                    <span style={{ color: "var(--muted)" }}>· g({safeInspect / s.divisor})</span>
                    <span style={{ color: "var(--fg)" }}>= {s.contribution}</span>
                    <span className="ml-auto" style={{ color: "var(--brand)" }}>→ {s.running}</span>
                  </div>
                ))}
                <div className="mt-1 text-xs font-bold" style={{ color: "var(--brand)" }}>
                  f'({safeInspect}) = {backwardSteps.result}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="p-3 rounded text-sm font-medium"
          style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
          aria-live="polite" aria-atomic="true">
          {tab === "explorer"
            ? `μ(${safeN}) = ${muVal}. ${factStr}. Divisors: ${divs.join(", ")}.`
            : `Inspecting n=${safeInspect}. g(${safeInspect})=${forwardSteps.result}. f'(${safeInspect})=${backwardSteps.result}.`}
        </div>
      </div>
    </div>
  );
};

export default MobiusInversionVisualizer;
