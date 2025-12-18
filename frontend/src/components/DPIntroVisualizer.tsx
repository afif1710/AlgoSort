import React, { useState, useEffect, useRef } from "react";
import SpeedControl from "./SpeedControl";

type FibStep = {
  i: number;
  value: number | null;
  from: number[]; // indices used to compute this
};

type GridStep = {
  row: number;
  col: number;
  value: number;
};

type Mode = "fibonacci" | "grid";

const DPIntroVisualizer: React.FC = () => {
  const [mode, setMode] = useState<Mode>("fibonacci");
  const [n, setN] = useState<number>(6);
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [speed, setSpeed] = useState<number>(1);
  const [fibSteps, setFibSteps] = useState<FibStep[]>([]);
  const [gridSteps, setGridSteps] = useState<GridStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const cancelRef = useRef<boolean>(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / speed));

  const reset = () => {
    cancelRef.current = true;
    setIsRunning(false);
    setCurrentIndex(-1);
    setFibSteps([]);
    setGridSteps([]);
  };

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const buildFibTabulationSteps = (nVal: number): FibStep[] => {
    const steps: FibStep[] = [];
    if (nVal <= 1) {
      steps.push({ i: 0, value: 0, from: [] });
      if (nVal === 1) {
        steps.push({ i: 1, value: 1, from: [] });
      }
      return steps;
    }
    const dp: number[] = Array(nVal + 1).fill(0);
    dp[0] = 0;
    dp[1] = 1;
    steps.push({ i: 0, value: dp[0], from: [] });
    steps.push({ i: 1, value: dp[1], from: [] });
    for (let i = 2; i <= nVal; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      steps.push({ i, value: dp[i], from: [i - 1, i - 2] });
    }
    return steps;
  };

  const buildGridSteps = (r: number, c: number): GridStep[] => {
    const steps: GridStep[] = [];
    const dp: number[][] = Array.from({ length: r }, () => Array(c).fill(0));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        if (i === 0 && j === 0) {
          dp[i][j] = 1;
        } else {
          const fromTop = i > 0 ? dp[i - 1][j] : 0;
          const fromLeft = j > 0 ? dp[i][j - 1] : 0;
          dp[i][j] = fromTop + fromLeft;
        }
        steps.push({ row: i, col: j, value: dp[i][j] });
      }
    }
    return steps;
  };

  const runAnimation = async () => {
    reset();
    cancelRef.current = false;
    setIsRunning(true);

    if (mode === "fibonacci") {
      const steps = buildFibTabulationSteps(n);
      setFibSteps(steps);
      for (let i = 0; i < steps.length; i++) {
        if (cancelRef.current) break;
        setCurrentIndex(i);
        await sleep(600);
      }
    } else {
      const steps = buildGridSteps(rows, cols);
      setGridSteps(steps);
      for (let i = 0; i < steps.length; i++) {
        if (cancelRef.current) break;
        setCurrentIndex(i);
        await sleep(600);
      }
    }

    setIsRunning(false);
  };

  const currentFib =
    currentIndex >= 0 && currentIndex < fibSteps.length
      ? fibSteps[currentIndex]
      : null;
  const currentGrid =
    currentIndex >= 0 && currentIndex < gridSteps.length
      ? gridSteps[currentIndex]
      : null;

  return (
    <div className="mt-6 rounded-xl border border-[var(--panel)] bg-[var(--bg)] p-4 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--fg)]">
            Dynamic Programming Visualizer
          </h2>
          <p className="text-sm text-gray-400">
            See how subproblems build up answers using tabulation for Fibonacci
            and grid paths.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md border border-[var(--panel)] bg-[var(--bg)] p-1 text-xs">
            <button
              className={
                "rounded px-3 py-1 transition " +
                (mode === "fibonacci"
                  ? "bg-[var(--brand)] text-white"
                  : "text-gray-300 hover:bg-[var(--card-hover-bg)]")
              }
              onClick={() => {
                if (isRunning) return;
                reset();
                setMode("fibonacci");
              }}
            >
              Fibonacci
            </button>
            <button
              className={
                "rounded px-3 py-1 transition " +
                (mode === "grid"
                  ? "bg-[var(--brand)] text-white"
                  : "text-gray-300 hover:bg-[var(--card-hover-bg)]")
              }
              onClick={() => {
                if (isRunning) return;
                reset();
                setMode("grid");
              }}
            >
              Grid Paths
            </button>
          </div>

          {mode === "fibonacci" && (
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span>n:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={n}
                onChange={(e) => setN(Number(e.target.value) || 1)}
                className="w-16 rounded border border-[var(--panel)] bg-[var(--bg)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
              />
            </div>
          )}

          {mode === "grid" && (
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span>Rows:</span>
              <input
                type="number"
                min={1}
                max={8}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value) || 1)}
                className="w-14 rounded border border-[var(--panel)] bg-[var(--bg)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
              />
              <span>Cols:</span>
              <input
                type="number"
                min={1}
                max={8}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value) || 1)}
                className="w-14 rounded border border-[var(--panel)] bg-[var(--bg)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
              />
            </div>
          )}

          <button
            onClick={runAnimation}
            disabled={isRunning}
            className="rounded-md bg-[var(--brand)] px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? "Running..." : "Run Animation"}
          </button>

          <button
            onClick={reset}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Speed Control */}
      <div className="mt-4">
        <SpeedControl speed={speed} onSpeedChange={setSpeed} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Explanation panel */}
        <div className="rounded-lg bg-[var(--panel)]/40 p-3 text-xs text-gray-200">
          {mode === "fibonacci" ? (
            <>
              <p className="mb-2 font-semibold">Fibonacci with Tabulation</p>
              <p className="mb-1">
                State: <code>dp[i]</code> is the value of fib(i).
              </p>
              <p className="mb-1">
                Recurrence: <code>dp[i] = dp[i-1] + dp[i-2]</code>.
              </p>
              <p className="mb-2">
                The animation fills the table from i = 0 up to your chosen n.
                The highlighted cell is the current subproblem being solved.
              </p>
              {currentFib && (
                <div className="mt-2 rounded-md bg-black/30 p-2">
                  <p className="font-semibold">Current step</p>
                  <p>i = {currentFib.i}</p>
                  <p>value = {currentFib.value}</p>
                  {currentFib.from.length > 0 && (
                    <p>
                      computed from{" "}
                      {currentFib.from.map((idx) => `dp[${idx}]`).join(" and ")}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="mb-2 font-semibold">Grid Paths with Tabulation</p>
              <p className="mb-1">
                State: <code>dp[r][c]</code> is the number of ways to reach cell
                (r, c) from the top-left.
              </p>
              <p className="mb-1">
                Recurrence: <code>dp[r][c] = dp[r-1][c] + dp[r][c-1]</code> when
                inside the grid.
              </p>
              <p className="mb-2">
                The animation fills the grid row by row. The highlighted cell is
                the current subproblem.
              </p>
              {currentGrid && (
                <div className="mt-2 rounded-md bg-black/30 p-2">
                  <p className="font-semibold">Current cell</p>
                  <p>
                    position = ({currentGrid.row}, {currentGrid.col})
                  </p>
                  <p>ways = {currentGrid.value}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Visual panel */}
        <div className="flex flex-col items-center justify-center rounded-lg bg-[var(--panel)]/40 p-3">
          {mode === "fibonacci" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-wrap justify-center gap-2">
                {fibSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={
                      "flex h-14 w-14 flex-col items-center justify-center rounded-md border text-xs transition " +
                      (idx === currentIndex
                        ? "border-[var(--brand)] bg-[var(--brand)]/20 text-[var(--brand)]"
                        : "border-[var(--panel)] bg-black/30 text-gray-200")
                    }
                  >
                    <span className="font-semibold">i = {step.i}</span>
                    <span>{step.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[0.7rem] text-gray-400">
                Think of this as a table where each entry stores the answer to a
                smaller subproblem.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="inline-block rounded-md border border-[var(--panel)] bg-black/20 p-2">
                {Array.from({ length: rows }).map((_, rIdx) => (
                  <div key={rIdx} className="flex">
                    {Array.from({ length: cols }).map((_, cIdx) => {
                      const stepIndex = gridSteps.findIndex(
                        (s) => s.row === rIdx && s.col === cIdx
                      );
                      const value =
                        stepIndex >= 0 ? gridSteps[stepIndex].value : "";
                      const isActive = stepIndex === currentIndex;
                      return (
                        <div
                          key={cIdx}
                          className={
                            "m-1 flex h-12 w-12 items-center justify-center rounded-md border text-xs transition " +
                            (isActive
                              ? "border-[var(--brand)] bg-[var(--brand)]/20 text-[var(--brand)]"
                              : "border-[var(--panel)] bg-black/40 text-gray-200")
                          }
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="text-[0.7rem] text-gray-400">
                Each cell collects paths from the top and left, reusing
                subproblem results instead of recomputing them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DPIntroVisualizer;
