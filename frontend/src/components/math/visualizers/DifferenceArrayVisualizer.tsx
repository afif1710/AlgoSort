// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useCallback, useRef } from "react";
import SpeedControl from "../../SpeedControl";
import {
  createDifferenceArray,
  applyDifferenceUpdate,
  buildFromDifference,
} from "../../../utils/math";

interface Update {
  l: number;
  r: number;
  val: number;
}

const ARRAY_SIZE = 8;

const DifferenceArrayVisualizer: React.FC = () => {
  const [diff, setDiff] = useState<number[]>(createDifferenceArray(ARRAY_SIZE));
  const [finalArr, setFinalArr] = useState<number[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [inputL, setInputL] = useState(1);
  const [inputR, setInputR] = useState(4);
  const [inputVal, setInputVal] = useState(3);
  const [animating, setAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [status, setStatus] = useState(
    "Add range updates, then press 'Build Final Array'."
  );
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [buildStep, setBuildStep] = useState(-1);
  const cancelRef = useRef(false);

  const sleep = useCallback(
    (ms: number) => new Promise<void>((r) => setTimeout(r, ms / speed)),
    [speed]
  );

  const addUpdate = () => {
    if (animating) return;
    const l = Math.max(0, Math.min(inputL, ARRAY_SIZE - 1));
    const r = Math.max(l, Math.min(inputR, ARRAY_SIZE - 1));
    const val = inputVal;
    const newDiff = applyDifferenceUpdate(diff, l, r, val);
    setDiff(newDiff);
    setUpdates((prev) => [...prev, { l, r, val }]);
    setFinalArr([]);
    setBuildStep(-1);
    setStatus(
      `Applied: diff[${l}] += ${val}${r + 1 < ARRAY_SIZE ? `, diff[${r + 1}] -= ${val}` : " (r+1 out of bounds, skip)"}`
    );
  };

  const buildStepByStep = async () => {
    if (animating) return;
    setAnimating(true);
    cancelRef.current = false;

    const result: number[] = [];
    let running = 0;

    for (let i = 0; i < diff.length; i++) {
      if (cancelRef.current) break;
      running += diff[i];
      result.push(running);
      setFinalArr([...result]);
      setBuildStep(i);
      setHighlightIdx(i);
      setStatus(
        `Building: final[${i}] = running_sum + diff[${i}] = ${running}`
      );
      await sleep(500);
    }

    if (!cancelRef.current) {
      setHighlightIdx(null);
      setStatus(
        `✅ Final array built! [${result.join(", ")}]`
      );
    }
    setAnimating(false);
  };

  const doOneStep = () => {
    if (animating) return;
    const nextStep = buildStep + 1;
    if (nextStep >= diff.length) {
      setStatus("✅ Build complete!");
      return;
    }

    const prevRunning =
      finalArr.length > 0 ? finalArr[finalArr.length - 1] : 0;
    const running = prevRunning + diff[nextStep];
    const newFinal = [...finalArr, running];
    setFinalArr(newFinal);
    setBuildStep(nextStep);
    setHighlightIdx(nextStep);
    setStatus(
      `final[${nextStep}] = ${prevRunning} + diff[${nextStep}](${diff[nextStep]}) = ${running}`
    );
  };

  const reset = () => {
    cancelRef.current = true;
    setDiff(createDifferenceArray(ARRAY_SIZE));
    setFinalArr([]);
    setUpdates([]);
    setAnimating(false);
    setHighlightIdx(null);
    setBuildStep(-1);
    setStatus("Reset. Add range updates, then build.");
  };

  const updateColors = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

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
          Difference Array / Imos Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl speed={speed} onSpeedChange={setSpeed} />

          {/* Add Update Controls */}
          <div
            className="p-4 rounded-lg space-y-3"
            style={{
              backgroundColor: "var(--bg)",
              border: "1px solid rgba(148,163,184,.25)",
            }}
          >
            <label
              className="block text-sm font-medium"
              style={{ color: "var(--fg)" }}
            >
              Add Range Update:
            </label>
            <div className="flex gap-3 items-end flex-wrap">
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
                  max={ARRAY_SIZE - 1}
                  value={inputL}
                  onChange={(e) => setInputL(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded text-sm"
                  disabled={animating}
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
                  max={ARRAY_SIZE - 1}
                  value={inputR}
                  onChange={(e) => setInputR(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded text-sm"
                  disabled={animating}
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Value (+/−)
                </label>
                <input
                  type="number"
                  value={inputVal}
                  onChange={(e) => setInputVal(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded text-sm"
                  disabled={animating}
                />
              </div>
              <button
                onClick={addUpdate}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "var(--brand)",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
                aria-label="Add range update"
              >
                + Add Update
              </button>
            </div>
          </div>

          {/* Update History */}
          {updates.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Applied Updates:
              </label>
              <div className="flex gap-2 flex-wrap">
                {updates.map((u, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded font-mono"
                    style={{
                      backgroundColor: updateColors[i % updateColors.length],
                      color: "white",
                    }}
                  >
                    [{u.l}..{u.r}] += {u.val}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Difference Array */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Difference Array:
            </label>
            <div className="flex gap-1 flex-wrap">
              {diff.map((val, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded flex flex-col items-center justify-center text-sm font-mono transition-all"
                  style={{
                    backgroundColor:
                      val !== 0 ? "rgba(99,102,241,0.2)" : "var(--bg)",
                    color: "var(--fg)",
                    border:
                      val !== 0
                        ? "2px solid var(--brand)"
                        : "2px solid rgba(148,163,184,.25)",
                    fontWeight: val !== 0 ? "bold" : "normal",
                  }}
                >
                  <span
                    className="text-[10px]"
                    style={{ opacity: 0.6 }}
                  >
                    {i}
                  </span>
                  <span
                    style={{
                      color:
                        val > 0
                          ? "#22c55e"
                          : val < 0
                          ? "#ef4444"
                          : "var(--muted)",
                    }}
                  >
                    {val > 0 ? `+${val}` : val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Final Array */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Final Array (prefix sum of diff):
            </label>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: ARRAY_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded flex flex-col items-center justify-center text-sm font-mono transition-all"
                  style={{
                    backgroundColor:
                      highlightIdx === i
                        ? "#22c55e"
                        : i <= buildStep
                        ? "var(--card-hover-bg)"
                        : "var(--bg)",
                    color: highlightIdx === i ? "white" : "var(--fg)",
                    border:
                      i <= buildStep
                        ? "2px solid #22c55e"
                        : "2px dashed rgba(148,163,184,.35)",
                    opacity: i <= buildStep ? 1 : 0.4,
                  }}
                >
                  <span className="text-[10px]" style={{ opacity: 0.6 }}>
                    {i}
                  </span>
                  <span className="font-bold">
                    {i <= buildStep && finalArr[i] !== undefined
                      ? finalArr[i]
                      : "?"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={buildStepByStep}
              disabled={animating || updates.length === 0}
              className="px-4 py-2 rounded text-sm font-medium"
              style={{
                backgroundColor:
                  animating || updates.length === 0 ? "#64748b" : "#10b981",
                color: "white",
                cursor:
                  animating || updates.length === 0
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Build final array"
            >
              ▶ Build Final
            </button>
            <button
              onClick={doOneStep}
              disabled={animating || buildStep >= ARRAY_SIZE - 1 || updates.length === 0}
              className="px-4 py-2 rounded text-sm font-medium"
              style={{
                backgroundColor:
                  animating ||
                  buildStep >= ARRAY_SIZE - 1 ||
                  updates.length === 0
                    ? "#64748b"
                    : "#3b82f6",
                color: "white",
                cursor:
                  animating ||
                  buildStep >= ARRAY_SIZE - 1 ||
                  updates.length === 0
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Next build step"
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
        <p className="font-semibold mb-2">💡 Difference Array Method:</p>
        <ul className="space-y-1 ml-4 text-xs font-mono">
          <li>• Range update [l,r] += val → diff[l] += val, diff[r+1] -= val</li>
          <li>• Build final: prefix sum over diff array</li>
          <li>• O(1) per update, O(n) to build</li>
          <li>• Also known as "Imos Method" in Japanese CP</li>
        </ul>
      </div>
    </div>
  );
};

export default DifferenceArrayVisualizer;
