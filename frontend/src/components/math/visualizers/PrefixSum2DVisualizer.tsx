// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useCallback, useRef } from "react";
import SpeedControl from "../../SpeedControl";
import { buildPrefixSum2D, queryPrefixSum2D } from "../../../utils/math";

type Mode = "build" | "query";

const DEFAULT_MATRIX = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
];

const PrefixSum2DVisualizer: React.FC = () => {
  const [matrix] = useState(DEFAULT_MATRIX);
  const rows = matrix.length;
  const cols = matrix[0].length;
  const [prefix, setPrefix] = useState<number[][]>([]);
  const [builtCell, setBuiltCell] = useState<[number, number] | null>(null);
  const [buildProgress, setBuildProgress] = useState<number>(-1);
  const [mode, setMode] = useState<Mode>("build");
  const [animating, setAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [status, setStatus] = useState("Press 'Build' or 'Step' to begin.");
  const [qr1, setQr1] = useState(1);
  const [qc1, setQc1] = useState(1);
  const [qr2, setQr2] = useState(2);
  const [qc2, setQc2] = useState(3);
  const [queryResult, setQueryResult] = useState<number | null>(null);
  const [highlightRegion, setHighlightRegion] = useState<
    "none" | "add" | "query"
  >("none");
  const [queryRegion, setQueryRegion] = useState<{
    r1: number;
    c1: number;
    r2: number;
    c2: number;
  } | null>(null);
  const cancelRef = useRef(false);
  const totalCells = (rows + 1) * (cols + 1);

  const sleep = useCallback(
    (ms: number) => new Promise<void>((r) => setTimeout(r, ms / speed)),
    [speed]
  );

  const reset = () => {
    cancelRef.current = true;
    setPrefix([]);
    setBuiltCell(null);
    setBuildProgress(-1);
    setAnimating(false);
    setQueryResult(null);
    setHighlightRegion("none");
    setQueryRegion(null);
    setStatus("Reset. Press 'Build' or 'Step' to begin.");
    setMode("build");
  };

  // Sequence of build steps: (i,j) for i=0..rows, j=0..cols
  const getStepCoord = (stepIdx: number): [number, number] => {
    const i = Math.floor(stepIdx / (cols + 1));
    const j = stepIdx % (cols + 1);
    return [i, j];
  };

  const computeCell = (
    p: number[][],
    i: number,
    j: number
  ): number => {
    if (i === 0 || j === 0) return 0;
    return (
      matrix[i - 1][j - 1] +
      (p[i - 1]?.[j] ?? 0) +
      (p[i]?.[j - 1] ?? 0) -
      (p[i - 1]?.[j - 1] ?? 0)
    );
  };

  const doStep = () => {
    if (animating) return;
    const nextProgress = buildProgress + 1;
    if (nextProgress >= totalCells) {
      setStatus("✅ Build complete! Switch to Query mode.");
      return;
    }
    const [i, j] = getStepCoord(nextProgress);
    const p =
      prefix.length > 0
        ? prefix.map((row) => [...row])
        : Array.from({ length: rows + 1 }, () =>
            new Array(cols + 1).fill(0)
          );
    p[i][j] = computeCell(p, i, j);
    setPrefix(p);
    setBuiltCell([i, j]);
    setBuildProgress(nextProgress);

    if (i === 0 || j === 0) {
      setStatus(`prefix[${i}][${j}] = 0 (boundary)`);
    } else {
      setStatus(
        `prefix[${i}][${j}] = matrix[${i - 1}][${j - 1}] + prefix[${i - 1}][${j}] + prefix[${i}][${j - 1}] − prefix[${i - 1}][${j - 1}] = ${p[i][j]}`
      );
    }
  };

  const buildAll = async () => {
    if (animating) return;
    setAnimating(true);
    cancelRef.current = false;

    const p = Array.from({ length: rows + 1 }, () =>
      new Array(cols + 1).fill(0)
    );

    for (let s = 0; s < totalCells; s++) {
      if (cancelRef.current) break;
      const [i, j] = getStepCoord(s);
      p[i][j] = computeCell(p, i, j);
      setPrefix(p.map((row) => [...row]));
      setBuiltCell([i, j]);
      setBuildProgress(s);

      if (i === 0 || j === 0) {
        setStatus(`prefix[${i}][${j}] = 0`);
      } else {
        setStatus(`Building prefix[${i}][${j}] = ${p[i][j]}`);
      }
      await sleep(200);
    }

    if (!cancelRef.current) {
      setBuiltCell(null);
      setStatus("✅ Build complete! Switch to Query mode.");
    }
    setAnimating(false);
  };

  const handleQuery = () => {
    if (prefix.length === 0) {
      const fullP = buildPrefixSum2D(matrix);
      setPrefix(fullP);
      setBuildProgress(totalCells - 1);
    }
    const fullP = buildPrefixSum2D(matrix);
    const r1 = Math.max(0, Math.min(qr1, rows - 1));
    const c1 = Math.max(0, Math.min(qc1, cols - 1));
    const r2 = Math.max(r1, Math.min(qr2, rows - 1));
    const c2 = Math.max(c1, Math.min(qc2, cols - 1));

    const result = queryPrefixSum2D(fullP, r1, c1, r2, c2);
    setQueryResult(result);
    setQueryRegion({ r1, c1, r2, c2 });
    setHighlightRegion("query");
    setStatus(
      `Query (${r1},${c1})→(${r2},${c2}): P[${r2 + 1}][${c2 + 1}] − P[${r1}][${c2 + 1}] − P[${r2 + 1}][${c1}] + P[${r1}][${c1}] = ${result}`
    );
  };

  const getCellColor = (r: number, c: number): string => {
    if (highlightRegion === "query" && queryRegion) {
      const { r1, c1, r2, c2 } = queryRegion;
      if (r >= r1 && r <= r2 && c >= c1 && c <= c2) return "rgba(34,197,94,0.3)";
    }
    return "var(--bg)";
  };

  const getPrefixCellStyle = (i: number, j: number) => {
    const isBuilt = prefix.length > 0 && prefix[i]?.[j] !== undefined && (i * (cols + 1) + j) <= buildProgress;
    const isActive =
      builtCell !== null && builtCell[0] === i && builtCell[1] === j;
    return {
      backgroundColor: isActive
        ? "#22c55e"
        : isBuilt
        ? "var(--card-hover-bg)"
        : "var(--bg)",
      color: isActive ? "white" : "var(--fg)",
      border: isBuilt ? "2px solid #22c55e" : "2px dashed rgba(148,163,184,.35)",
      opacity: isBuilt ? 1 : 0.4,
    };
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
          2D Prefix Sum Visualizer
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
                  const fullP = buildPrefixSum2D(matrix);
                  setPrefix(fullP);
                  setBuildProgress(totalCells - 1);
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

          {/* Grids side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Matrix */}
            <div>
              <label
                className="block text-sm mb-2 font-medium"
                style={{ color: "var(--fg)" }}
              >
                Input Matrix ({rows}×{cols}):
              </label>
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 3rem)` }}>
                {matrix.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="w-12 h-10 rounded flex items-center justify-center text-sm font-mono font-bold transition-all"
                      style={{
                        backgroundColor: getCellColor(r, c),
                        color: "var(--fg)",
                        border: "1px solid rgba(148,163,184,.35)",
                      }}
                    >
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Prefix Matrix */}
            <div>
              <label
                className="block text-sm mb-2 font-medium"
                style={{ color: "var(--fg)" }}
              >
                Prefix Matrix ({rows + 1}×{cols + 1}):
              </label>
              <div
                className="inline-grid gap-1"
                style={{ gridTemplateColumns: `repeat(${cols + 1}, 3rem)` }}
              >
                {Array.from({ length: rows + 1 }).map((_, i) =>
                  Array.from({ length: cols + 1 }).map((_, j) => (
                    <div
                      key={`p-${i}-${j}`}
                      className="w-12 h-10 rounded flex items-center justify-center text-xs font-mono font-bold transition-all"
                      style={getPrefixCellStyle(i, j)}
                    >
                      {prefix[i]?.[j] !== undefined &&
                      i * (cols + 1) + j <= buildProgress
                        ? prefix[i][j]
                        : "?"}
                    </div>
                  ))
                )}
              </div>
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
                aria-label="Build prefix matrix"
              >
                ▶ Build
              </button>
              <button
                onClick={doStep}
                disabled={animating || buildProgress >= totalCells - 1}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    animating || buildProgress >= totalCells - 1
                      ? "#64748b"
                      : "#3b82f6",
                  color: "white",
                  cursor:
                    animating || buildProgress >= totalCells - 1
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
              <div className="flex gap-3 items-end flex-wrap">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>
                    r1
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={rows - 1}
                    value={qr1}
                    onChange={(e) => setQr1(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>
                    c1
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={cols - 1}
                    value={qc1}
                    onChange={(e) => setQc1(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>
                    r2
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={rows - 1}
                    value={qr2}
                    onChange={(e) => setQr2(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>
                    c2
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={cols - 1}
                    value={qc2}
                    onChange={(e) => setQc2(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded text-sm"
                  />
                </div>
                <button
                  onClick={handleQuery}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                  aria-label="Run 2D query"
                >
                  Query
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{ backgroundColor: "#ef4444", color: "white" }}
                  aria-label="Reset"
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
                  Rectangle sum = {queryResult}
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

      {/* Formula */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 Inclusion-Exclusion Formula:</p>
        <div className="text-xs font-mono space-y-1 ml-4">
          <p>• Build: P[i][j] = M[i-1][j-1] + P[i-1][j] + P[i][j-1] − P[i-1][j-1]</p>
          <p>• Query: sum(r1,c1,r2,c2) = P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]</p>
        </div>
      </div>
    </div>
  );
};

export default PrefixSum2DVisualizer;
