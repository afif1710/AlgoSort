import React, { useState, useRef, useEffect } from "react";
import SpeedControl from "./SpeedControl";

type Mode = "knapsack" | "subset" | "space";

type Cell = {
  row: number;
  col: number;
  value: number | boolean;
  decision?: string;
};

const DPKnapsackVisualizer: React.FC = () => {
  const [mode, setMode] = useState<Mode>("knapsack");
  const [weights, setWeights] = useState<number[]>([1, 3, 4, 5]);
  const [values, setValues] = useState<number[]>([1, 4, 5, 7]);
  const [capacity, setCapacity] = useState<number>(7);
  const [targetSum, setTargetSum] = useState<number>(11);
  const [subsetNums, setSubsetNums] = useState<number[]>([1, 5, 11, 5]);

  const [weightsInput, setWeightsInput] = useState<string>("1,3,4,5");
  const [valuesInput, setValuesInput] = useState<string>("1,4,5,7");
  const [subsetInput, setSubsetInput] = useState<string>("1,5,11,5");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const [dpTable, setDpTable] = useState<(number | boolean)[][]>([]);
  const [currentCell, setCurrentCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [animating, setAnimating] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [cellHistory, setCellHistory] = useState<Cell[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [spaceArray, setSpaceArray] = useState<boolean[]>([]);

  const cancelRef = useRef<boolean>(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const reset = () => {
    cancelRef.current = true;
    setAnimating(false);
    setCurrentCell(null);
    setDpTable([]);
    setResult("");
    setCellHistory([]);
    setCurrentStep(-1);
    setSpaceArray([]);
  };

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const build01KnapsackTable = async () => {
    const n = weights.length;
    const W = capacity;
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
      Array(W + 1).fill(0)
    );
    const history: Cell[] = [];

    // Fill table
    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= W; w++) {
        const weight = weights[i - 1];
        const value = values[i - 1];

        // Skip item
        dp[i][w] = dp[i - 1][w];
        let decision = `Skip item ${i - 1}`;

        // Take item if it fits
        if (weight <= w) {
          const takeValue = value + dp[i - 1][w - weight];
          if (takeValue > dp[i][w]) {
            dp[i][w] = takeValue;
            decision = `Take item ${i - 1}: ${value} + dp[${i - 1}][${
              w - weight
            }] = ${takeValue}`;
          }
        }

        history.push({ row: i, col: w, value: dp[i][w], decision });
      }
    }

    setDpTable(dp);
    setCellHistory(history);

    // Animate
    for (let idx = 0; idx < history.length; idx++) {
      if (cancelRef.current) break;
      const cell = history[idx];
      setCurrentCell({ row: cell.row, col: cell.col });
      setCurrentStep(idx);
      await sleep(300);
    }

    setResult(`✅ Max value: ${dp[n][W]} with capacity ${W}`);
  };

  const buildSubsetSumTable = async () => {
    const n = subsetNums.length;
    const target = targetSum;
    const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
      Array(target + 1).fill(false)
    );
    const history: Cell[] = [];

    // Base case: sum 0 is always achievable
    for (let i = 0; i <= n; i++) {
      dp[i][0] = true;
    }

    for (let i = 1; i <= n; i++) {
      for (let s = 0; s <= target; s++) {
        const num = subsetNums[i - 1];

        // Don't take
        dp[i][s] = dp[i - 1][s];
        let decision = `Skip ${num}`;

        // Take if possible
        if (num <= s && dp[i - 1][s - num]) {
          dp[i][s] = true;
          decision = `Take ${num}: dp[${i - 1}][${s - num}] = true`;
        }

        history.push({ row: i, col: s, value: dp[i][s], decision });
      }
    }

    setDpTable(dp);
    setCellHistory(history);

    for (let idx = 0; idx < history.length; idx++) {
      if (cancelRef.current) break;
      const cell = history[idx];
      setCurrentCell({ row: cell.row, col: cell.col });
      setCurrentStep(idx);
      await sleep(200);
    }

    setResult(
      dp[n][target]
        ? `✅ Can achieve sum ${target}`
        : `❌ Cannot achieve sum ${target}`
    );
  };

  const buildSpaceOptimized = async () => {
    const target = targetSum;
    const dp: boolean[] = Array(target + 1).fill(false);
    dp[0] = true;

    const steps: { array: boolean[]; num: number; decision: string }[] = [];

    for (const num of subsetNums) {
      const newDp = [...dp];
      for (let s = target; s >= num; s--) {
        if (dp[s - num]) {
          newDp[s] = true;
        }
      }
      steps.push({
        array: [...newDp],
        num,
        decision: `Processing ${num}: update sums from ${target} down to ${num}`,
      });
      dp.splice(0, dp.length, ...newDp);
    }

    for (let idx = 0; idx < steps.length; idx++) {
      if (cancelRef.current) break;
      setSpaceArray(steps[idx].array);
      setCurrentStep(idx);
      await sleep(800);
    }

    setResult(
      dp[target] ? `✅ Can partition (O(target) space)` : `❌ Cannot partition`
    );
  };

  const runAnimation = async () => {
    reset();
    cancelRef.current = false;
    setAnimating(true);

    if (mode === "knapsack") {
      await build01KnapsackTable();
    } else if (mode === "subset") {
      await buildSubsetSumTable();
    } else if (mode === "space") {
      await buildSpaceOptimized();
    }

    setAnimating(false);
  };

  const handleWeightsChange = () => {
    const arr = weightsInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) setWeights(arr);
  };

  const handleValuesChange = () => {
    const arr = valuesInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) setValues(arr);
  };

  const handleSubsetChange = () => {
    const arr = subsetInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) {
      setSubsetNums(arr);
      const total = arr.reduce((a, b) => a + b, 0);
      if (total % 2 === 0) setTargetSum(total / 2);
    }
  };

  const loadExample = (type: string) => {
    reset();
    if (type === "knapsack-small") {
      setMode("knapsack");
      setWeights([2, 3, 4]);
      setValues([3, 4, 5]);
      setCapacity(5);
      setWeightsInput("2,3,4");
      setValuesInput("3,4,5");
    } else if (type === "knapsack-medium") {
      setMode("knapsack");
      setWeights([1, 3, 4, 5]);
      setValues([1, 4, 5, 7]);
      setCapacity(7);
      setWeightsInput("1,3,4,5");
      setValuesInput("1,4,5,7");
    } else if (type === "subset-yes") {
      setMode("subset");
      setSubsetNums([1, 5, 11, 5]);
      setTargetSum(11);
      setSubsetInput("1,5,11,5");
    } else if (type === "subset-no") {
      setMode("subset");
      setSubsetNums([1, 2, 5]);
      setTargetSum(4);
      setSubsetInput("1,2,5");
    }
  };

  const currentCellData =
    currentStep >= 0 && currentStep < cellHistory.length
      ? cellHistory[currentStep]
      : null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          Knapsack DP Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Mode Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Select Problem:
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "knapsack", label: "0/1 Knapsack" },
                { key: "subset", label: "Subset Sum" },
                { key: "space", label: "Space Optimized" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => {
                    if (!animating) {
                      setMode(m.key as Mode);
                      reset();
                    }
                  }}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor:
                      mode === m.key ? "var(--brand)" : "var(--card-hover-bg)",
                    color: mode === m.key ? "white" : "var(--fg)",
                    border: "2px solid var(--brand)",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Knapsack Inputs */}
          {mode === "knapsack" && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Weights (comma-separated):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={weightsInput}
                    onChange={(e) => setWeightsInput(e.target.value)}
                    placeholder="1,3,4,5"
                    className="flex-1 px-3 py-2 rounded border text-sm"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--fg)",
                      borderColor: "var(--brand)",
                    }}
                  />
                  <button
                    onClick={handleWeightsChange}
                    className="px-4 py-2 rounded text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    Set
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Values (comma-separated):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={valuesInput}
                    onChange={(e) => setValuesInput(e.target.value)}
                    placeholder="1,4,5,7"
                    className="flex-1 px-3 py-2 rounded border text-sm"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--fg)",
                      borderColor: "var(--brand)",
                    }}
                  />
                  <button
                    onClick={handleValuesChange}
                    className="px-4 py-2 rounded text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    Set
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Capacity: {capacity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Items: {weights.length}, Weights: [{weights.join(", ")}],
                Values: [{values.join(", ")}]
              </p>
            </div>
          )}

          {/* Subset Sum Inputs */}
          {(mode === "subset" || mode === "space") && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Numbers (comma-separated):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subsetInput}
                    onChange={(e) => setSubsetInput(e.target.value)}
                    placeholder="1,5,11,5"
                    className="flex-1 px-3 py-2 rounded border text-sm"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--fg)",
                      borderColor: "var(--brand)",
                    }}
                  />
                  <button
                    onClick={handleSubsetChange}
                    className="px-4 py-2 rounded text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    Set
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Target Sum: {targetSum}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={targetSum}
                  onChange={(e) => setTargetSum(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Numbers: [{subsetNums.join(", ")}], Total:{" "}
                {subsetNums.reduce((a, b) => a + b, 0)}
              </p>
            </div>
          )}

          {/* Examples */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Load Examples:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample("knapsack-small")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Knapsack (small)
              </button>
              <button
                onClick={() => loadExample("knapsack-medium")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Knapsack (medium)
              </button>
              <button
                onClick={() => loadExample("subset-yes")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Subset (Yes)
              </button>
              <button
                onClick={() => loadExample("subset-no")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Subset (No)
              </button>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runAnimation}
            disabled={animating}
            className="px-6 py-2 rounded font-medium w-full"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Running..." : "Run Animation"}
          </button>

          {/* Result */}
          {result && (
            <div
              className="p-4 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {result}
            </div>
          )}
        </div>
      </div>

      {/* Visualization */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          DP Table Visualization
        </h3>

        {mode !== "space" && dpTable.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs">
                <thead>
                  <tr>
                    <th
                      className="border px-2 py-1"
                      style={{
                        borderColor: "var(--panel)",
                        color: "var(--fg)",
                      }}
                    >
                      i \ w
                    </th>
                    {Array.from({ length: dpTable[0].length }, (_, idx) => (
                      <th
                        key={idx}
                        className="border px-2 py-1"
                        style={{
                          borderColor: "var(--panel)",
                          color: "var(--fg)",
                        }}
                      >
                        {idx}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dpTable.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td
                        className="border px-2 py-1 font-semibold"
                        style={{
                          borderColor: "var(--panel)",
                          color: "var(--fg)",
                        }}
                      >
                        {rIdx}
                      </td>
                      {row.map((cell, cIdx) => {
                        const isActive =
                          currentCell?.row === rIdx &&
                          currentCell?.col === cIdx;
                        return (
                          <td
                            key={cIdx}
                            className="border px-2 py-1 text-center transition-all"
                            style={{
                              borderColor: "var(--panel)",
                              backgroundColor: isActive
                                ? "var(--brand)"
                                : rIdx === 0 || cIdx === 0
                                ? "var(--bg)"
                                : "var(--card-hover-bg)",
                              color: isActive ? "white" : "var(--fg)",
                              fontWeight: isActive ? "bold" : "normal",
                            }}
                          >
                            {typeof cell === "boolean"
                              ? cell
                                ? "T"
                                : "F"
                              : cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentCellData && (
              <div
                className="p-4 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                <p className="text-sm font-semibold mb-2">
                  Current Cell: [{currentCellData.row}][{currentCellData.col}]
                </p>
                <p className="text-xs">
                  <strong>Value:</strong>{" "}
                  {typeof currentCellData.value === "boolean"
                    ? currentCellData.value
                      ? "True"
                      : "False"
                    : currentCellData.value}
                </p>
                {currentCellData.decision && (
                  <p className="text-xs mt-1">
                    <strong>Decision:</strong> {currentCellData.decision}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : mode === "space" && spaceArray.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {spaceArray.map((canAchieve, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-3 rounded-md border"
                  style={{
                    minWidth: "50px",
                    backgroundColor: canAchieve ? "var(--brand)" : "var(--bg)",
                    borderColor: "var(--panel)",
                    color: canAchieve ? "white" : "var(--muted)",
                  }}
                >
                  <span className="text-xs font-semibold">{idx}</span>
                  <span className="text-sm">{canAchieve ? "✓" : "✗"}</span>
                </div>
              ))}
            </div>
            <p
              className="text-xs text-center"
              style={{ color: "var(--muted)" }}
            >
              1D array showing which sums are achievable (O(target) space)
            </p>
          </div>
        ) : (
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            Click "Run Animation" to visualize the DP table
          </p>
        )}
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Knapsack DP Concepts:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>0/1 Knapsack:</strong> dp[i][w] = max(skip, take if fits).
            O(n × W) time and space.
          </li>
          <li>
            • <strong>Subset Sum:</strong> dp[i][s] = can we achieve sum s?
            Boolean version of knapsack.
          </li>
          <li>
            • <strong>Space Optimization:</strong> Use 1D array, iterate
            backwards to avoid overwriting needed values.
          </li>
          <li>
            • <strong>Key Insight:</strong> Each cell depends on the row above,
            making bottom-up tabulation natural.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DPKnapsackVisualizer;
