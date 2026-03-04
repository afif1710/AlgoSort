// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  evDiceSum,
  evCoinFlips,
  evCouponCollector,
  runBatch,
} from "../../../utils/probability";

type Scenario = "dice" | "coins" | "coupon";

const SCENARIOS: { id: Scenario; label: string; desc: string }[] = [
  { id: "dice", label: "🎲 Dice Sum", desc: "Sum of n fair 6-sided dice" },
  { id: "coins", label: "🪙 Coin Flips", desc: "Heads in n fair coin flips" },
  { id: "coupon", label: "🎫 Coupon Collector", desc: "Trials to collect k coupon types" },
];

const MAX_PLOT_POINTS = 200;
const BATCH_STEP = 500;
const ANIMATE_INTERVAL_MS = 80;

function getTheoretical(scenario: Scenario, n: number, k: number): number {
  if (scenario === "dice") return evDiceSum(n);
  if (scenario === "coins") return evCoinFlips(n);
  return evCouponCollector(k);
}

function getIndicatorNote(scenario: Scenario, n: number, k: number): string {
  if (scenario === "dice")
    return `LOE: E[X₁+…+X${n}] = ${n} × E[one die] = ${n} × 3.5 = ${evDiceSum(n).toFixed(2)}. Each die is an independent indicator contributing equally.`;
  if (scenario === "coins")
    return `LOE: Define Iᵢ = 1 if flip i is heads. E[Iᵢ] = 0.5. E[heads] = Σ E[Iᵢ] = ${n} × 0.5 = ${evCoinFlips(n).toFixed(2)} — even though each flip is not dependent on others.`;
  return `LOE: E[trials] = Σ k/(k−i) for i=0..k−1. With k=${k}: E ≈ ${evCouponCollector(k).toFixed(2)}. Each phase is independent; LOE sums their expected waiting times.`;
}

const ExpectedValueSimulatorVisualizer: React.FC = () => {
  const [scenario, setScenario] = useState<Scenario>("dice");
  const [n, setN] = useState(3);
  const [k, setK] = useState(4);
  const [totalTrials, setTotalTrials] = useState(1000);
  const [running, setRunning] = useState(false);

  // Simulation state
  const [trialCount, setTrialCount] = useState(0);
  const [empiricalMean, setEmpiricalMean] = useState<number | null>(null);
  const [plotPoints, setPlotPoints] = useState<{ t: number; mean: number }[]>([]);
  const [status, setStatus] = useState("Choose a scenario and press Run.");

  const sumRef = useRef(0);
  const countRef = useRef(0);
  const animTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const theoretical = getTheoretical(scenario, n, k);

  const reset = useCallback(() => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setRunning(false);
    setTrialCount(0);
    setEmpiricalMean(null);
    setPlotPoints([]);
    sumRef.current = 0;
    countRef.current = 0;
    setStatus("Reset. Choose a scenario and press Run.");
  }, []);

  // Reset when scenario/params change
  useEffect(() => { reset(); }, [scenario, n, k, reset]);

  const doStep = useCallback((batchSize: number) => {
    const { newSum, newCount, batchMean } = runBatch(
      scenario,
      { n, sides: 6, k },
      batchSize,
      sumRef.current,
      countRef.current,
    );
    sumRef.current = newSum;
    countRef.current = newCount;
    setTrialCount(newCount);
    setEmpiricalMean(batchMean);
    setPlotPoints((prev) => {
      const pt = { t: newCount, mean: batchMean };
      const next = [...prev, pt];
      if (next.length > MAX_PLOT_POINTS) {
        // downsample: keep every Nth
        const step = Math.ceil(next.length / MAX_PLOT_POINTS);
        return next.filter((_, i) => i % step === 0 || i === next.length - 1);
      }
      return next;
    });
    setStatus(
      `${newCount.toLocaleString()} trials — empirical mean = ${batchMean.toFixed(4)} · theoretical = ${theoretical.toFixed(4)} · error = ${Math.abs(batchMean - theoretical).toFixed(4)}`
    );
  }, [scenario, n, k, theoretical]);

  const handleRun = () => {
    reset();
    // Use rAF-like batched animation
    let done = false;
    let accumulated = 0;
    sumRef.current = 0;
    countRef.current = 0;
    setRunning(true);

    animTimerRef.current = setInterval(() => {
      const remaining = totalTrials - accumulated;
      if (remaining <= 0 || done) {
        clearInterval(animTimerRef.current!);
        setRunning(false);
        done = true;
        return;
      }
      const batch = Math.min(BATCH_STEP, remaining);
      accumulated += batch;
      doStep(batch);
    }, ANIMATE_INTERVAL_MS);
  };

  const handleStep = () => {
    if (running) return;
    if (countRef.current >= totalTrials) {
      setStatus("All trials done. Reset to run again.");
      return;
    }
    doStep(BATCH_STEP);
  };

  // SVG plot
  const svgW = 500, svgH = 140;
  const padL = 48, padR = 12, padT = 12, padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxT = Math.max(totalTrials, trialCount, 1);
  const allMeans = plotPoints.map((p) => p.mean);
  const allVals = [...allMeans, theoretical];
  const minV = allVals.length > 0 ? Math.min(...allVals) * 0.9 : 0;
  const maxV = allVals.length > 0 ? Math.max(...allVals) * 1.1 : 1;
  const rangeV = maxV - minV || 1;

  const toSVG = (t: number, mean: number) => ({
    x: padL + (t / maxT) * plotW,
    y: padT + plotH - ((mean - minV) / rangeV) * plotH,
  });

  const linePath =
    plotPoints.length > 1
      ? plotPoints
          .map((p, i) => {
            const { x, y } = toSVG(p.t, p.mean);
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" ")
      : "";

  const theoreticalY = padT + plotH - ((theoretical - minV) / rangeV) * plotH;

  const error = empiricalMean !== null ? Math.abs(empiricalMean - theoretical) : null;

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg space-y-5" style={{ backgroundColor: "var(--panel)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
          ⟨X⟩ Expected Value Simulator (Monte Carlo)
        </h3>

        {/* Scenario selector */}
        <div className="flex gap-2 flex-wrap">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              className="px-3 py-1.5 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: scenario === s.id ? "var(--brand)" : "var(--card-hover-bg)",
                color: scenario === s.id ? "white" : "var(--fg)",
                border: "2px solid var(--brand)",
              }}
              aria-label={`Select scenario: ${s.label}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          {SCENARIOS.find((s) => s.id === scenario)?.desc}
        </p>

        {/* Parameters */}
        <div className="flex gap-6 flex-wrap">
          {scenario !== "coupon" && (
            <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--fg)" }}>
              n = {n}
              <input
                type="range"
                min={1}
                max={10}
                value={n}
                onChange={(e) => setN(+e.target.value)}
                className="w-32"
                aria-label="Number of dice/flips"
              />
            </label>
          )}
          {scenario === "coupon" && (
            <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--fg)" }}>
              k (types) = {k}
              <input
                type="range"
                min={2}
                max={10}
                value={k}
                onChange={(e) => setK(+e.target.value)}
                className="w-32"
                aria-label="Number of coupon types"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--fg)" }}>
            Trials = {totalTrials.toLocaleString()}
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={totalTrials}
              onChange={(e) => { setTotalTrials(+e.target.value); reset(); }}
              className="w-40"
              aria-label="Number of trials"
            />
          </label>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={handleRun}
            disabled={running}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{
              backgroundColor: running ? "#64748b" : "#10b981",
              color: "white",
              cursor: running ? "not-allowed" : "pointer",
            }}
            aria-label="Run all trials"
          >
            ▶ Run
          </button>
          <button
            onClick={handleStep}
            disabled={running || trialCount >= totalTrials}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{
              backgroundColor: running || trialCount >= totalTrials ? "#64748b" : "#3b82f6",
              color: "white",
              cursor: running || trialCount >= totalTrials ? "not-allowed" : "pointer",
            }}
            aria-label={`Step ${BATCH_STEP} trials`}
          >
            +{BATCH_STEP} Trials
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: "#ef4444", color: "white" }}
            aria-label="Reset simulation"
          >
            Reset
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Trials", value: trialCount.toLocaleString() },
            { label: "Theoretical E[X]", value: theoretical.toFixed(4) },
            { label: "Empirical mean", value: empiricalMean !== null ? empiricalMean.toFixed(4) : "—" },
            { label: "Error", value: error !== null ? error.toFixed(4) : "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.2)" }}
            >
              <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{stat.label}</div>
              <div className="font-mono font-bold text-sm" style={{ color: "var(--fg)" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* SVG Plot */}
        <div
          className="rounded-lg p-2 overflow-x-auto"
          style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.2)" }}
        >
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
            {/* Axes */}
            <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(148,163,184,.4)" strokeWidth={1} />
            <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(148,163,184,.4)" strokeWidth={1} />

            {/* Theoretical line */}
            <line
              x1={padL} y1={theoreticalY}
              x2={padL + plotW} y2={theoreticalY}
              stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3"
            />
            <text x={padL + plotW + 2} y={theoreticalY + 4} fontSize={9} fill="#f59e0b">E[X]</text>

            {/* Running mean line */}
            {linePath && (
              <path d={linePath} fill="none" stroke="var(--brand)" strokeWidth={2} />
            )}

            {/* Y-axis labels */}
            <text x={padL - 4} y={padT + 4} fontSize={9} fill="rgba(148,163,184,.8)" textAnchor="end">
              {maxV.toFixed(1)}
            </text>
            <text x={padL - 4} y={padT + plotH} fontSize={9} fill="rgba(148,163,184,.8)" textAnchor="end">
              {minV.toFixed(1)}
            </text>

            {/* X-axis labels */}
            <text x={padL} y={svgH - 4} fontSize={9} fill="rgba(148,163,184,.8)">0</text>
            <text x={padL + plotW} y={svgH - 4} fontSize={9} fill="rgba(148,163,184,.8)" textAnchor="end">
              {maxT.toLocaleString()}
            </text>

            {/* Convergence marker */}
            {empiricalMean !== null && plotPoints.length > 0 && (() => {
              const last = plotPoints[plotPoints.length - 1];
              const { x, y } = toSVG(last.t, last.mean);
              return <circle cx={x} cy={y} r={4} fill="var(--brand)" />;
            })()}
          </svg>
          <p className="text-[10px] text-center mt-1" style={{ color: "var(--muted)" }}>
            Running mean (purple) vs Theoretical (dashed amber) · Converges by Law of Large Numbers
          </p>
        </div>

        {/* LOE explanation */}
        {trialCount > 0 && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{ backgroundColor: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,.25)", color: "var(--fg)" }}
          >
            <p className="font-semibold mb-1">💡 Why LOE applies here</p>
            <p style={{ color: "var(--muted)" }}>{getIndicatorNote(scenario, n, k)}</p>
          </div>
        )}

        {/* Status */}
        <div
          className="p-3 rounded text-sm font-medium"
          style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </div>
      </div>
    </div>
  );
};

export default ExpectedValueSimulatorVisualizer;
