import React, { useState, useRef, useEffect } from "react";
import SpeedControl from "./SpeedControl";

type SearchStep = {
  left: number;
  right: number;
  mid: number;
  comparison: string;
  found: boolean;
};

const BinarySearchBasicsVisualizer: React.FC = () => {
  const [array, setArray] = useState<number[]>([
    1, 3, 5, 7, 9, 11, 13, 15, 17, 19,
  ]);
  const [target, setTarget] = useState<number>(7);
  const [arrayInput, setArrayInput] = useState<string>(
    "1,3,5,7,9,11,13,15,17,19"
  );
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

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

  const runBinarySearch = async () => {
    reset();
    cancelRef.current = false;
    setAnimating(true);

    const searchSteps: SearchStep[] = [];
    let left = 0;
    let right = array.length - 1;
    let foundIndex = -1;

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      const midValue = array[mid];

      let comparison = "";
      let found = false;

      if (midValue === target) {
        comparison = `arr[${mid}] = ${midValue} equals target ${target}. Found!`;
        found = true;
        foundIndex = mid;
      } else if (midValue < target) {
        comparison = `arr[${mid}] = ${midValue} < ${target}. Search right half.`;
        left = mid + 1;
      } else {
        comparison = `arr[${mid}] = ${midValue} > ${target}. Search left half.`;
        right = mid - 1;
      }

      searchSteps.push({ left, right: right, mid, comparison, found });

      if (found) break;
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
      setResult(`❌ Target ${target} not found in array`);
    }

    setAnimating(false);
  };

  const handleArrayChange = () => {
    const arr = arrayInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b);
    if (arr.length > 0) setArray(arr);
  };

  const loadExample = (type: string) => {
    reset();
    if (type === "small") {
      setArray([2, 4, 6, 8, 10]);
      setArrayInput("2,4,6,8,10");
      setTarget(6);
    } else if (type === "medium") {
      setArray([1, 3, 5, 7, 9, 11, 13, 15]);
      setArrayInput("1,3,5,7,9,11,13,15");
      setTarget(11);
    } else if (type === "not-found") {
      setArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      setArrayInput("1,2,3,4,5,6,7,8,9");
      setTarget(10);
    } else if (type === "first") {
      setArray([5, 10, 15, 20, 25, 30]);
      setArrayInput("5,10,15,20,25,30");
      setTarget(5);
    } else if (type === "last") {
      setArray([5, 10, 15, 20, 25, 30]);
      setArrayInput("5,10,15,20,25,30");
      setTarget(30);
    }
  };

  const currentStepData =
    currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

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
          Binary Search Visualizer
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
              Sorted Array (comma-separated):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                placeholder="1,3,5,7,9,11,13,15"
                className="flex-1 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <button
                onClick={() => {
                  handleArrayChange();
                  reset();
                }}
                disabled={animating}
                className="px-4 py-2 rounded text-sm"
                style={{ backgroundColor: "var(--brand)", color: "white" }}
              >
                Set
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Array will be sorted automatically
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
              max="50"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Load Examples:
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "small", label: "Small Array" },
                { key: "medium", label: "Medium Array" },
                { key: "not-found", label: "Not Found" },
                { key: "first", label: "First Element" },
                { key: "last", label: "Last Element" },
              ].map((ex) => (
                <button
                  key={ex.key}
                  onClick={() => loadExample(ex.key)}
                  disabled={animating}
                  className="px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: "var(--card-hover-bg)",
                    color: "var(--fg)",
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runBinarySearch}
            disabled={animating}
            className="px-6 py-2 rounded font-medium w-full"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Searching..." : "Start Binary Search"}
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

      {/* Visualization */}
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

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {array.map((num, idx) => {
              let bgColor = "var(--bg)";
              let textColor = "var(--fg)";
              let borderColor = "var(--panel)";

              if (currentStepData) {
                if (idx === currentStepData.mid) {
                  bgColor = currentStepData.found ? "#10b981" : "#fbbf24";
                  textColor = "white";
                  borderColor = currentStepData.found ? "#059669" : "#f59e0b";
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

          {currentStepData && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              <p className="text-sm font-semibold mb-2">
                Step {currentStep + 1}:
              </p>
              <p className="text-xs">
                <strong>Left:</strong> {currentStepData.left},{" "}
                <strong>Right:</strong> {currentStepData.right},{" "}
                <strong>Mid:</strong> {currentStepData.mid}
              </p>
              <p className="text-xs mt-1">{currentStepData.comparison}</p>
            </div>
          )}
        </div>

        <div
          className="mt-6 flex gap-4 text-sm flex-wrap"
          style={{ color: "var(--fg)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: "#fbbf24",
                border: "2px solid #f59e0b",
              }}
            ></div>
            <span>Current Mid</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: "#10b981",
                border: "2px solid #059669",
              }}
            ></div>
            <span>Found</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: "var(--card-hover-bg)",
                border: "2px solid var(--brand)",
              }}
            ></div>
            <span>Search Space</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Binary Search Key Points:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>• Array must be sorted first</li>
          <li>• Time Complexity: O(log n) - very fast!</li>
          <li>• Space Complexity: O(1) - uses only a few variables</li>
          <li>• Divides search space in half each iteration</li>
        </ul>
      </div>
    </div>
  );
};

export default BinarySearchBasicsVisualizer;
