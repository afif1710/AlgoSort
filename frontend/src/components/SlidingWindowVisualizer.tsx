import { useState } from "react";
import SpeedControl from "./SpeedControl";

type WindowType = "fixed" | "variable";

export default function SlidingWindowVisualizer() {
  const [array, setArray] = useState<number[]>([2, 1, 5, 1, 3, 2, 7, 4, 2]);
  const [windowStart, setWindowStart] = useState<number>(-1);
  const [windowEnd, setWindowEnd] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string>("");
  const [windowType, setWindowType] = useState<WindowType>("fixed");
  const [windowSize, setWindowSize] = useState<number>(3);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // ✅ ADDED

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed)); // ✅ UPDATED

  const shuffle = () => {
    const newArray = Array.from(
      { length: 9 },
      () => Math.floor(Math.random() * 10) + 1
    );
    setArray(newArray);
    setWindowStart(-1);
    setWindowEnd(-1);
    setResult("");
  };

  const fixedSizeWindow = async () => {
    setRunning(true);
    setResult("Finding maximum sum of subarray with fixed size...");
    await sleep(1000);

    const arr = [...array];
    const k = windowSize;
    let maxSum = 0;
    let windowSum = 0;

    for (let i = 0; i < k; i++) {
      windowSum += arr[i];
    }
    maxSum = windowSum;

    setWindowStart(0);
    setWindowEnd(k - 1);
    setResult(`Initial window [0-${k - 1}]: sum = ${windowSum}`);
    await sleep(1500);

    for (let i = k; i < arr.length; i++) {
      windowSum = windowSum - arr[i - k] + arr[i];

      setWindowStart(i - k + 1);
      setWindowEnd(i);
      setResult(
        `Window [${i - k + 1}-${i}]: removed ${arr[i - k]}, added ${
          arr[i]
        }, sum = ${windowSum}`
      );
      await sleep(1500);

      if (windowSum > maxSum) {
        maxSum = windowSum;
        setResult(
          `New maximum found! Window [${i - k + 1}-${i}]: sum = ${windowSum}`
        );
        await sleep(1000);
      }
    }

    setResult(`Maximum sum of ${k} consecutive elements: ${maxSum}`);
    setRunning(false);
  };

  const variableSizeWindow = async () => {
    setRunning(true);
    setResult("Finding longest subarray with sum ≤ target...");
    await sleep(1000);

    const arr = [...array];
    const target = 10;
    let start = 0;
    let currentSum = 0;
    let maxLength = 0;
    let bestStart = 0;
    let bestEnd = 0;

    for (let end = 0; end < arr.length; end++) {
      currentSum += arr[end];

      setWindowStart(start);
      setWindowEnd(end);
      setResult(`Expand: added arr[${end}]=${arr[end]}, sum=${currentSum}`);
      await sleep(1200);

      while (currentSum > target && start <= end) {
        setResult(`Sum ${currentSum} > ${target}, shrinking...`);
        await sleep(800);

        currentSum -= arr[start];
        start++;

        setWindowStart(start);
        setResult(
          `Removed arr[${start - 1}]=${arr[start - 1]}, sum=${currentSum}`
        );
        await sleep(1000);
      }

      if (end - start + 1 > maxLength) {
        maxLength = end - start + 1;
        bestStart = start;
        bestEnd = end;
        setResult(
          `New longest subarray [${start}-${end}]: length=${maxLength}, sum=${currentSum}`
        );
        await sleep(1000);
      }
    }

    setWindowStart(bestStart);
    setWindowEnd(bestEnd);
    setResult(
      `Longest subarray with sum ≤ ${target}: [${bestStart}-${bestEnd}], length=${maxLength}`
    );
    setRunning(false);
  };

  const runWindow = () => {
    if (windowType === "fixed") {
      fixedSizeWindow();
    } else {
      variableSizeWindow();
    }
  };

  const isInWindow = (index: number) => {
    return index >= windowStart && index <= windowEnd;
  };

  const getBarColor = (index: number) => {
    if (isInWindow(index)) {
      if (index === windowStart) return "bg-blue-500";
      if (index === windowEnd) return "bg-red-500";
      return "bg-green-500";
    }
    return "bg-brand";
  };

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Sliding Window Visualization</h4>

      {/* ✅ ADDED SPEED CONTROL */}
      <SpeedControl speed={animationSpeed} onSpeedChange={setAnimationSpeed} />

      <div className="space-y-2">
        <label className="text-sm font-medium">Select Window Type:</label>
        <div className="flex gap-2 flex-wrap">
          <button
            className={`px-4 py-2 rounded ${
              windowType === "fixed" ? "bg-brand text-white" : "btn-outline"
            }`}
            onClick={() => setWindowType("fixed")}
            disabled={running}
          >
            Fixed Size Window
          </button>
          <button
            className={`px-4 py-2 rounded ${
              windowType === "variable" ? "bg-brand text-white" : "btn-outline"
            }`}
            onClick={() => setWindowType("variable")}
            disabled={running}
          >
            Variable Size Window
          </button>
        </div>
      </div>

      {windowType === "fixed" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Window Size: {windowSize}
          </label>
          <input
            type="range"
            min="2"
            max="5"
            value={windowSize}
            onChange={(e) => setWindowSize(parseInt(e.target.value))}
            disabled={running}
            className="w-full"
          />
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={runWindow} disabled={running}>
          {running ? "Running..." : "Run"}
        </button>
        <button className="btn-outline" onClick={shuffle} disabled={running}>
          Shuffle
        </button>
      </div>

      {result && (
        <div className="text-sm bg-brand/10 px-3 py-2 rounded">
          <span className="font-semibold">{result}</span>
        </div>
      )}

      <div className="bg-[var(--panel)] p-6 rounded-lg min-h-[280px] flex flex-col items-center justify-center gap-4">
        <div className="flex items-end justify-center gap-2 flex-wrap">
          {array.map((value, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 relative"
            >
              <div
                className={`${getBarColor(
                  idx
                )} transition-all duration-300 w-14 rounded-t-lg flex items-end justify-center pb-2 text-white font-bold`}
                style={{
                  height: `${Math.max(value * 20, 40)}px`,
                  minHeight: "40px",
                }}
              >
                {isInWindow(idx) && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                    {idx === windowStart && idx === windowEnd
                      ? "Window"
                      : idx === windowStart
                      ? "Start"
                      : idx === windowEnd
                      ? "End"
                      : "In"}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold">{value}</span>
                <span className="text-xs text-[var(--muted)]">[{idx}]</span>
              </div>
            </div>
          ))}
        </div>

        {windowStart >= 0 && windowEnd >= 0 && (
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[var(--muted)]">Window:</span>
              <span className="font-mono font-bold">
                [{array.slice(windowStart, windowEnd + 1).join(", ")}]
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--muted)]">Size:</span>
              <span className="font-bold">{windowEnd - windowStart + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--muted)]">Sum:</span>
              <span className="font-bold">
                {array
                  .slice(windowStart, windowEnd + 1)
                  .reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Window Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Inside Window</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Window End</span>
        </div>
      </div>

      <div className="text-sm text-[var(--muted)] space-y-1">
        {windowType === "fixed" ? (
          <>
            <p>• Fixed window size: maintains constant size while sliding</p>
            <p>• Removes leftmost element, adds new rightmost element</p>
            <p>• Example: Maximum sum of k consecutive elements</p>
            <p>• Time: O(n), Space: O(1)</p>
          </>
        ) : (
          <>
            <p>• Variable window: expands/contracts based on condition</p>
            <p>• Expands when condition allows, shrinks when violated</p>
            <p>• Example: Longest subarray with sum ≤ target</p>
            <p>• Time: O(n), Space: O(1)</p>
          </>
        )}
      </div>
    </div>
  );
}
