// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useCallback, useRef } from "react";
import SpeedControl from "../../SpeedControl";
import { buildPrefixSum1D, queryPrefixSum1D } from "../../../utils/math";

type Mode = "build" | "query";

const DEFAULT_ARR = [3, 1, 4, 1, 5, 9, 2, 6];

const PrefixSum1DVisualizer: React.FC = () => {
  const [arr] = useState<number[]>(DEFAULT_ARR);
  const [prefix, setPrefix] = useState<number[]>([]);
  const [step, setStep] = useState(-1);
  const [mode, setMode] = useState<Mode>("build");
  const [animating, setAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [status, setStatus] = useState("Press 'Build' or 'Step' to begin.");
  const [queryL, setQueryL] = useState(2);
  const [queryR, setQueryR] = useState(5);
  const [queryResult, setQueryResult] = useState<number | null>(null);
  const [highlightCells, setHighlightCells] = useState<Set<number>>(new Set());
  const cancelRef = useRef(false);

  const sleep = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms / speed);
        // We'll check cancelRef after resolve
        return t;
      }),
    [speed]
  );

  const reset = () => {
    cancelRef.current = true;
    setStep(-1);
    setPrefix([]);
    setAnimating(false);
    setQueryResult(null);
    setHighlightCells(new Set());
    setStatus("Reset. Press 'Build' or 'Step' to begin.");
    setMode("build");
  };

  const buildStep = (currentStep: number, currentPrefix: number[]) => {
    if (currentStep > arr.length) return { prefix: currentPrefix, done: true };
    const p = [...currentPrefix];
    if (currentStep === 0) {
      p[0] = 0;
    } else {
      p[currentStep] = p[currentStep - 1] + arr[currentStep - 1];
    }
    return { prefix: p, done: currentStep === arr.length };
  };

  const doStep = () => {
    if (animating) return;
    const nextStep = step + 1;
    if (nextStep > arr.length) {
      setStatus("✅ Build complete! Switch to Query mode.");
      return;
    }
    const { prefix: newPrefix, done } = buildStep(nextStep, prefix.length > 0 ? prefix : []);
    setPrefix(newPrefix);
    setStep(nextStep);
    setHighlightCells(new Set([nextStep]));
    if (done) {
      setStatus(`✅ Build complete! prefix[${nextStep}] = ${newPrefix[nextStep]}`);
    } else {
      setStatus(
        nextStep === 0
          ? `prefix[0] = 0`
          : `prefix[${nextStep}] = prefix[${nextStep - 1}] + arr[${nextStep - 1}] = ${newPrefix[nextStep - 1]} + ${arr[nextStep - 1]} = ${newPrefix[nextStep]}`
      );
    }
  };

  const buildAll = async () => {
    if (animating) return;
    setAnimating(true);
    cancelRef.current = false;

    let p: number[] = [];
    for (let i = 0; i <= arr.length; i++) {
      if (cancelRef.current) break;
      const { prefix: newP } = buildStep(i, p);
      p = newP;
      setPrefix([...p]);
      setStep(i);
      setHighlightCells(new Set([i]));
      if (i === 0) {
        setStatus(`prefix[0] = 0`);
      } else {
        setStatus(
          `prefix[${i}] = prefix[${i - 1}] + arr[${i - 1}] = ${p[i - 1]} + ${arr[i - 1]} = ${p[i]}`
        );
      }
      await sleep(600);
    }

    if (!cancelRef.current) {
      setHighlightCells(new Set());
      setStatus("✅ Build complete! Switch to Query mode.");
    }
    setAnimating(false);
  };

  const handleQuery = () => {
    if (prefix.length === 0) {
      setStatus("⚠️ Build the prefix array first!");
      return;
    }
    const l = Math.max(0, Math.min(queryL, arr.length - 1));
    const r = Math.max(l, Math.min(queryR, arr.length - 1));
    const fullPrefix = buildPrefixSum1D(arr);
    const result = queryPrefixSum1D(fullPrefix, l, r);
    setQueryResult(result);
    const cells = new Set<number>();
    for (let i = l; i <= r; i++) cells.add(i);
    setHighlightCells(cells);
    setStatus(
      `Query [${l}..${r}]: prefix[${r + 1}] − prefix[${l}] = ${fullPrefix[r + 1]} − ${fullPrefix[l]} = ${result}`
    );
  };

  return (
    <div className="space-y-4">
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          1D Prefix Sum Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl speed={speed} onSpeedChange={setSpeed} />

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("build")}
              className="px-4 py-2 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: mode === "build" ? "var(--brand)" : "var(--card-hover-bg)",
                color: mode === "build" ? "white" : "var(--fg)",
                border: "2px solid var(--brand)",
              }}
              aria-label="Switch to Build mode"
            >
              Build Mode
            </button>
            <button
              onClick={() => {
                if (prefix.length === 0) {
                  const fullP = buildPrefixSum1D(arr);
                  setPrefix(fullP);
                  setStep(arr.length);
                }
                setMode("query");
              }}
              className="px-4 py-2 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: mode === "query" ? "var(--brand)" : "var(--card-hover-bg)",
                color: mode === "query" ? "white" : "var(--fg)",
                border: "2px solid var(--brand)",
              }}
              aria-label="Switch to Query mode"
            >
              Query Mode
            </button>
          </div>

          {/* Array Display */}
          <div>
            <label className="block text-sm mb-2" style={{ color: "var(--fg)" }}>
              Input Array:
            </label>
            <div className="flex gap-1 flex-wrap">
              {arr.map((val, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded flex flex-col items-center justify-center text-sm font-mono transition-all"
                  style={{
                    backgroundColor: highlightCells.has(i)
                      ? "var(--brand)"
                      : "var(--bg)",
                    color: highlightCells.has(i) ? "white" : "var(--fg)",
                    border: "2px solid var(--brand)",
                    transform: highlightCells.has(i) ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <span className="text-[10px]" style={{ opacity: 0.6 }}>
                    {i}
                  </span>
                  <span className="font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prefix Array */}
          <div>
            <label className="block text-sm mb-2" style={{ color: "var(--fg)" }}>
              Prefix Array:
            </label>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: arr.length + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded flex flex-col items-center justify-center text-sm font-mono transition-all"
                  style={{
                    backgroundColor:
                      i <= step
                        ? highlightCells.has(i) && mode === "build"
                          ? "#22c55e"
                          : "var(--card-hover-bg)"
                        : "var(--bg)",
                    color: "var(--fg)",
                    border:
                      i <= step
                        ? "2px solid #22c55e"
                        : "2px dashed rgba(148,163,184,.35)",
                    opacity: i <= step ? 1 : 0.4,
                  }}
                >
                  <span className="text-[10px]" style={{ opacity: 0.6 }}>
                    {i}
                  </span>
                  <span className="font-bold">
                    {i <= step && prefix[i] !== undefined ? prefix[i] : "?"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          {mode === "build" && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={buildAll}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#10b981",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
                aria-label="Build prefix array"
              >
                ▶ Build
              </button>
              <button
                onClick={doStep}
                disabled={animating || step >= arr.length}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    animating || step >= arr.length ? "#64748b" : "#3b82f6",
                  color: "white",
                  cursor:
                    animating || step >= arr.length
                      ? "not-allowed"
                      : "pointer",
                }}
                aria-label="Next step"
              >
                Step →
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: "#ef4444", color: "white" }}
                aria-label="Reset visualizer"
              >
                Reset
              </button>
            </div>
          )}

          {/* Query Controls */}
          {mode === "query" && (
            <div className="space-y-3">
              <div className="flex gap-4 items-end flex-wrap">
                <div>
                  <label
                    className="block text-xs mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    L (start)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={arr.length - 1}
                    value={queryL}
                    onChange={(e) => setQueryL(parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 rounded text-sm"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    R (end)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={arr.length - 1}
                    value={queryR}
                    onChange={(e) => setQueryR(parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 rounded text-sm"
                  />
                </div>
                <button
                  onClick={handleQuery}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                  aria-label="Run query"
                >
                  Query
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{ backgroundColor: "#ef4444", color: "white" }}
                  aria-label="Reset visualizer"
                >
                  Reset
                </button>
              </div>
              {queryResult !== null && (
                <div
                  className="p-3 rounded text-lg font-bold text-center font-mono"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.1)",
                    color: "#22c55e",
                    border: "1px solid #22c55e",
                  }}
                >
                  Sum [{queryL}..{queryR}] = {queryResult}
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div
            className="p-3 rounded text-sm font-medium"
            style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            aria-live="polite"
          >
            {status}
          </div>
        </div>
      </div>

      {/* Formula reference */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 Key Formulas:</p>
        <ul className="space-y-1 ml-4 text-xs font-mono">
          <li>• prefix[0] = 0</li>
          <li>• prefix[i] = prefix[i−1] + arr[i−1]</li>
          <li>• sum(l, r) = prefix[r+1] − prefix[l]</li>
        </ul>
      </div>
    </div>
  );
};

export default PrefixSum1DVisualizer;
