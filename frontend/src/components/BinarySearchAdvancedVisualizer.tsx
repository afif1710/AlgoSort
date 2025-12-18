import React, { useState, useRef, useEffect } from "react";
import SpeedControl from "./SpeedControl";

type Mode = "answer" | "rotated" | "boundary";

type SearchStep = {
  left: number;
  right: number;
  mid: number;
  description: string;
  feasible?: boolean;
};

const BinarySearchAdvancedVisualizer: React.FC = () => {
  const [mode, setMode] = useState<Mode>("answer");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  // Search on answer mode
  const [piles, setPiles] = useState<number[]>([3, 6, 7, 11]);
  const [hours, setHours] = useState<number>(8);
  const [pilesInput, setPilesInput] = useState<string>("3,6,7,11");

  // Rotated array mode
  const [rotatedArray, setRotatedArray] = useState<number[]>([
    4, 5, 6, 7, 0, 1, 2,
  ]);
  const [target, setTarget] = useState<number>(0);
  const [rotatedInput, setRotatedInput] = useState<string>("4,5,6,7,0,1,2");

  // Boundary mode
  const [boundaryArray, setBoundaryArray] = useState<number[]>([
    1, 2, 2, 2, 3, 4, 5,
  ]);
  const [boundaryTarget, setBoundaryTarget] = useState<number>(2);
  const [boundaryInput, setBoundaryInput] = useState<string>("1,2,2,2,3,4,5");

  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [animating, setAnimating] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

  const cancelRef = useRef<boolean>(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const reset = () => {
    cancelRef.current = true;
    setAnimating(false);
    setCurrentStep(-1);
    setSteps([]);
    setResult("");
  };

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const runSearchOnAnswer = async () => {
    const searchSteps: SearchStep[] = [];

    const canFinish = (speed: number): boolean => {
      let totalHours = 0;
      for (const pile of piles) {
        totalHours += Math.ceil(pile / speed);
      }
      return totalHours <= hours;
    };

    let left = 1;
    let right = Math.max(...piles);

    while (left < right) {
      const mid = left + Math.floor((right - left) / 2);
      const feasible = canFinish(mid);

      searchSteps.push({
        left,
        right,
        mid,
        description: `Speed ${mid}: ${
          feasible ? "✅ Can finish" : "❌ Too slow"
        }`,
        feasible,
      });

      if (feasible) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }

    setSteps(searchSteps);
    for (let i = 0; i < searchSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(1000);
    }

    setResult(`✅ Minimum eating speed: ${left} bananas/hour`);
  };

  const runRotatedSearch = async () => {
    const searchSteps: SearchStep[] = [];
    let left = 0;
    let right = rotatedArray.length - 1;
    let foundIndex = -1;

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      const midVal = rotatedArray[mid];

      let desc = "";
      if (midVal === target) {
        desc = `Found ${target} at index ${mid}`;
        foundIndex = mid;
        searchSteps.push({ left, right, mid, description: desc });
        break;
      }

      if (rotatedArray[left] <= midVal) {
        if (rotatedArray[left] <= target && target < midVal) {
          desc = `Left half sorted, target in left half`;
          right = mid - 1;
        } else {
          desc = `Left half sorted, target in right half`;
          left = mid + 1;
        }
      } else {
        if (midVal < target && target <= rotatedArray[right]) {
          desc = `Right half sorted, target in right half`;
          left = mid + 1;
        } else {
          desc = `Right half sorted, target in left half`;
          right = mid - 1;
        }
      }

      searchSteps.push({ left, right, mid, description: desc });
    }

    setSteps(searchSteps);
    for (let i = 0; i < searchSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(1000);
    }

    if (foundIndex !== -1) {
      setResult(`✅ Target ${target} found at index ${foundIndex}`);
    } else {
      setResult(`❌ Target ${target} not found`);
    }
  };

  const runBoundarySearch = async () => {
    const searchSteps: SearchStep[] = [];

    // Find first occurrence
    let left = 0;
    let right = boundaryArray.length - 1;
    let first = -1;

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);

      if (boundaryArray[mid] === boundaryTarget) {
        first = mid;
        right = mid - 1;
        searchSteps.push({
          left,
          right: right,
          mid,
          description: `Found ${boundaryTarget} at ${mid}, search left for first`,
        });
      } else if (boundaryArray[mid] < boundaryTarget) {
        left = mid + 1;
        searchSteps.push({
          left,
          right,
          mid,
          description: `${boundaryArray[mid]} < ${boundaryTarget}, search right`,
        });
      } else {
        right = mid - 1;
        searchSteps.push({
          left,
          right,
          mid,
          description: `${boundaryArray[mid]} > ${boundaryTarget}, search left`,
        });
      }
    }

    // Find last occurrence
    left = 0;
    right = boundaryArray.length - 1;
    let last = -1;

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);

      if (boundaryArray[mid] === boundaryTarget) {
        last = mid;
        left = mid + 1;
        searchSteps.push({
          left,
          right,
          mid,
          description: `Found ${boundaryTarget} at ${mid}, search right for last`,
        });
      } else if (boundaryArray[mid] < boundaryTarget) {
        left = mid + 1;
        searchSteps.push({
          left,
          right,
          mid,
          description: `${boundaryArray[mid]} < ${boundaryTarget}, search right`,
        });
      } else {
        right = mid - 1;
        searchSteps.push({
          left,
          right,
          mid,
          description: `${boundaryArray[mid]} > ${boundaryTarget}, search left`,
        });
      }
    }

    setSteps(searchSteps);
    for (let i = 0; i < searchSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(800);
    }

    if (first !== -1 && last !== -1) {
      setResult(
        `✅ First: ${first}, Last: ${last}, Count: ${last - first + 1}`
      );
    } else {
      setResult(`❌ Target ${boundaryTarget} not found`);
    }
  };

  const runAnimation = async () => {
    reset();
    cancelRef.current = false;
    setAnimating(true);

    if (mode === "answer") {
      await runSearchOnAnswer();
    } else if (mode === "rotated") {
      await runRotatedSearch();
    } else if (mode === "boundary") {
      await runBoundarySearch();
    }

    setAnimating(false);
  };

  const handleSetPiles = () => {
    const arr = pilesInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) {
      setPiles(arr);
      reset();
    }
  };

  const handleSetRotated = () => {
    const arr = rotatedInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) {
      setRotatedArray(arr);
      reset();
    }
  };

  const handleSetBoundary = () => {
    const arr = boundaryInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) {
      setBoundaryArray(arr);
      reset();
    }
  };

  const currentStepData =
    currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  // Get current array based on mode
  const getCurrentArray = () => {
    if (mode === "rotated") return rotatedArray;
    if (mode === "boundary") return boundaryArray;
    return Array.from({ length: Math.max(...piles) }, (_, i) => i + 1); // For answer mode, show speed range
  };

  const currentArray = getCurrentArray();

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
          Advanced Binary Search Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Select Pattern:
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "answer", label: "Search on Answer" },
                { key: "rotated", label: "Rotated Array" },
                { key: "boundary", label: "Find Boundaries" },
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

          {mode === "answer" && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Banana piles (comma-separated):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pilesInput}
                    onChange={(e) => setPilesInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border text-sm"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--fg)",
                      borderColor: "var(--brand)",
                    }}
                  />
                  <button
                    onClick={handleSetPiles}
                    disabled={animating}
                    className="px-4 py-2 rounded text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    Set
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Current: [{piles.join(", ")}]
                </p>
              </div>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Hours available: {hours}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {mode === "rotated" && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Rotated sorted array:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rotatedInput}
                    onChange={(e) => setRotatedInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border text-sm"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--fg)",
                      borderColor: "var(--brand)",
                    }}
                  />
                  <button
                    onClick={handleSetRotated}
                    disabled={animating}
                    className="px-4 py-2 rounded text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    Set
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Current: [{rotatedArray.join(", ")}]
                </p>
              </div>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Target: {target}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {mode === "boundary" && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Sorted array with duplicates:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={boundaryInput}
                    onChange={(e) => setBoundaryInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border text-sm"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--fg)",
                      borderColor: "var(--brand)",
                    }}
                  />
                  <button
                    onClick={handleSetBoundary}
                    disabled={animating}
                    className="px-4 py-2 rounded text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    Set
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Current: [{boundaryArray.join(", ")}]
                </p>
              </div>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Target: {boundaryTarget}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={boundaryTarget}
                  onChange={(e) => setBoundaryTarget(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

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
            {animating ? "Running..." : "Run Search"}
          </button>

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

      {/* Array Visualization */}
      {mode !== "answer" && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--panel)" }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--fg)" }}
          >
            Array Visualization
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {currentArray.map((num, idx) => {
              let bgColor = "var(--bg)";
              let textColor = "var(--fg)";
              let borderColor = "var(--panel)";

              if (currentStepData) {
                if (idx === currentStepData.mid) {
                  bgColor = "#fbbf24";
                  textColor = "white";
                  borderColor = "#f59e0b";
                } else if (
                  idx >= currentStepData.left &&
                  idx <= currentStepData.right
                ) {
                  bgColor = "var(--card-hover-bg)";
                  borderColor = "var(--brand)";
                }
              }

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all"
                  style={{
                    minWidth: "60px",
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    color: textColor,
                  }}
                >
                  <span className="text-xs font-semibold">{idx}</span>
                  <span className="text-lg font-bold">{num}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Speed Range Visualization for "Search on Answer" */}
      {mode === "answer" && currentStepData && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--panel)" }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--fg)" }}
          >
            Speed Range Visualization
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {/* Left range */}
                <div
                  className="absolute h-8 rounded-l transition-all"
                  style={{
                    left: 0,
                    width: `${
                      (currentStepData.left / Math.max(...piles)) * 100
                    }%`,
                    backgroundColor: "var(--muted)",
                    opacity: 0.3,
                  }}
                />
                {/* Right range */}
                <div
                  className="absolute h-8 rounded-r transition-all"
                  style={{
                    right: 0,
                    width: `${
                      ((Math.max(...piles) - currentStepData.right) /
                        Math.max(...piles)) *
                      100
                    }%`,
                    backgroundColor: "var(--muted)",
                    opacity: 0.3,
                  }}
                />
                {/* Mid marker */}
                <div
                  className="absolute h-8 w-2 rounded transition-all"
                  style={{
                    left: `${
                      (currentStepData.mid / Math.max(...piles)) * 100
                    }%`,
                    backgroundColor: currentStepData.feasible
                      ? "#10b981"
                      : "#ef4444",
                  }}
                />
              </div>
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: "var(--muted)" }}
              >
                <span>1</span>
                <span>Mid: {currentStepData.mid}</span>
                <span>{Math.max(...piles)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Info */}
      {currentStepData && (
        <div
          className="p-4 rounded"
          style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
        >
          <p className="text-sm font-semibold mb-2">Step {currentStep + 1}:</p>
          <p className="text-xs">
            <strong>Range:</strong> [{currentStepData.left},{" "}
            {currentStepData.right}], <strong>Mid:</strong>{" "}
            {currentStepData.mid}
          </p>
          <p className="text-xs mt-1">{currentStepData.description}</p>
        </div>
      )}

      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Advanced Binary Search Patterns:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Search on Answer:</strong> Binary search the answer space
            with feasibility check
          </li>
          <li>
            • <strong>Rotated Array:</strong> Identify sorted half, then decide
            direction
          </li>
          <li>
            • <strong>Find Boundaries:</strong> Continue searching for
            first/last after finding target
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BinarySearchAdvancedVisualizer;
