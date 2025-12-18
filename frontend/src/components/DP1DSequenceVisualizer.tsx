import React, { useState, useRef, useEffect } from "react";
import SpeedControl from "./SpeedControl";

type Mode = "climb" | "rob" | "mincost" | "space";

type DPStep = {
  index: number;
  value: number;
  from: number[];
  decision?: string;
};

// ✅ FIXED: Added current and decision to the type
type SpaceVarsType = {
  prev2: number;
  prev1: number;
  current: number;
  decision: string;
};

const DP1DSequenceVisualizer: React.FC = () => {
  const [mode, setMode] = useState<Mode>("climb");
  const [n, setN] = useState<number>(6);
  const [houseValues, setHouseValues] = useState<number[]>([2, 7, 9, 3, 1]);
  const [costArray, setCostArray] = useState<number[]>([10, 15, 20]);
  const [inputValue, setInputValue] = useState<string>("2,7,9,3,1");
  const [costInput, setCostInput] = useState<string>("10,15,20");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const [dpSteps, setDpSteps] = useState<DPStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [animating, setAnimating] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [spaceVars, setSpaceVars] = useState<SpaceVarsType | null>(null); // ✅ FIXED

  const cancelRef = useRef<boolean>(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const reset = () => {
    cancelRef.current = true;
    setAnimating(false);
    setCurrentIndex(-1);
    setDpSteps([]);
    setResult("");
    setSpaceVars(null);
  };

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const buildClimbingStairsSteps = (steps: number): DPStep[] => {
    const dp: DPStep[] = [];
    if (steps === 0) return dp;
    if (steps === 1) {
      dp.push({ index: 1, value: 1, from: [] });
      return dp;
    }
    dp.push({ index: 1, value: 1, from: [], decision: "Base case" });
    dp.push({ index: 2, value: 2, from: [], decision: "Base case" });

    for (let i = 3; i <= steps; i++) {
      const val = dp[i - 2].value + dp[i - 3].value;
      dp.push({
        index: i,
        value: val,
        from: [i - 1, i - 2],
        decision: `${dp[i - 2].value} + ${dp[i - 3].value}`,
      });
    }
    return dp;
  };

  const buildHouseRobberSteps = (nums: number[]): DPStep[] => {
    const dp: DPStep[] = [];
    if (nums.length === 0) return dp;
    if (nums.length === 1) {
      dp.push({ index: 0, value: nums[0], from: [], decision: "Only house" });
      return dp;
    }

    dp.push({
      index: 0,
      value: nums[0],
      from: [],
      decision: `Rob house 0: ${nums[0]}`,
    });
    const max1 = Math.max(nums[0], nums[1]);
    dp.push({
      index: 1,
      value: max1,
      from: max1 === nums[1] ? [1] : [0],
      decision: `max(${nums[0]}, ${nums[1]}) = ${max1}`,
    });

    for (let i = 2; i < nums.length; i++) {
      const rob = nums[i] + dp[i - 2].value;
      const skip = dp[i - 1].value;
      const best = Math.max(rob, skip);
      dp.push({
        index: i,
        value: best,
        from: best === rob ? [i, i - 2] : [i - 1],
        decision: `max(skip=${skip}, rob=${nums[i]}+${
          dp[i - 2].value
        }=${rob}) = ${best}`,
      });
    }
    return dp;
  };

  const buildMinCostSteps = (cost: number[]): DPStep[] => {
    const dp: DPStep[] = [];
    const n = cost.length;
    if (n === 0) return dp;

    dp.push({
      index: 0,
      value: cost[0],
      from: [],
      decision: `Start: cost[0]=${cost[0]}`,
    });
    if (n === 1) return dp;

    dp.push({
      index: 1,
      value: cost[1],
      from: [],
      decision: `Start: cost[1]=${cost[1]}`,
    });

    for (let i = 2; i < n; i++) {
      const fromPrev1 = dp[i - 1].value + cost[i];
      const fromPrev2 = dp[i - 2].value + cost[i];
      const best = Math.min(fromPrev1, fromPrev2);
      dp.push({
        index: i,
        value: best,
        from: best === fromPrev1 ? [i - 1] : [i - 2],
        decision: `${cost[i]} + min(${dp[i - 1].value}, ${
          dp[i - 2].value
        }) = ${best}`,
      });
    }

    // Final step: reach top from last or second-last
    const finalCost = Math.min(dp[n - 1].value, dp[n - 2].value);
    dp.push({
      index: n,
      value: finalCost,
      from: finalCost === dp[n - 1].value ? [n - 1] : [n - 2],
      decision: `Top: min(${dp[n - 1].value}, ${
        dp[n - 2].value
      }) = ${finalCost}`,
    });

    return dp;
  };

  const runAnimation = async () => {
    reset();
    cancelRef.current = false;
    setAnimating(true);

    let steps: DPStep[] = [];

    if (mode === "climb") {
      steps = buildClimbingStairsSteps(n);
      setDpSteps(steps);
      for (let i = 0; i < steps.length; i++) {
        if (cancelRef.current) break;
        setCurrentIndex(i);
        await sleep(700);
      }
      if (steps.length > 0) {
        setResult(
          `✅ Ways to climb ${n} stairs: ${steps[steps.length - 1].value}`
        );
      }
    } else if (mode === "rob") {
      steps = buildHouseRobberSteps(houseValues);
      setDpSteps(steps);
      for (let i = 0; i < steps.length; i++) {
        if (cancelRef.current) break;
        setCurrentIndex(i);
        await sleep(700);
      }
      if (steps.length > 0) {
        setResult(`✅ Max money robbed: $${steps[steps.length - 1].value}`);
      }
    } else if (mode === "mincost") {
      steps = buildMinCostSteps(costArray);
      setDpSteps(steps);
      for (let i = 0; i < steps.length; i++) {
        if (cancelRef.current) break;
        setCurrentIndex(i);
        await sleep(700);
      }
      if (steps.length > 0) {
        setResult(
          `✅ Minimum cost to reach top: ${steps[steps.length - 1].value}`
        );
      }
    } else if (mode === "space") {
      // Space-optimized House Robber animation
      const nums = houseValues;
      if (nums.length === 0) {
        setResult("❌ Empty array");
        setAnimating(false);
        return;
      }

      let prev2 = 0;
      let prev1 = 0;
      const spaceSteps: SpaceVarsType[] = []; // ✅ FIXED: Using proper type

      for (let i = 0; i < nums.length; i++) {
        const current = Math.max(prev1, nums[i] + prev2);
        spaceSteps.push({
          prev2,
          prev1,
          current,
          decision: `max(prev1=${prev1}, num=${nums[i]} + prev2=${prev2}) = ${current}`,
        });
        prev2 = prev1;
        prev1 = current;
      }

      for (let i = 0; i < spaceSteps.length; i++) {
        if (cancelRef.current) break;
        setSpaceVars(spaceSteps[i]);
        setCurrentIndex(i);
        await sleep(800);
      }

      setResult(`✅ Max robbed (O(1) space): $${prev1}`);
    }

    setAnimating(false);
  };

  const handleInputChange = () => {
    const arr = inputValue
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) {
      setHouseValues(arr);
    }
  };

  const handleCostInputChange = () => {
    const arr = costInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) {
      setCostArray(arr);
    }
  };

  const loadExample = (type: string) => {
    reset();
    if (type === "climb-small") {
      setMode("climb");
      setN(5);
    } else if (type === "climb-large") {
      setMode("climb");
      setN(10);
    } else if (type === "rob-simple") {
      setMode("rob");
      setHouseValues([1, 2, 3, 1]);
      setInputValue("1,2,3,1");
    } else if (type === "rob-complex") {
      setMode("rob");
      setHouseValues([2, 7, 9, 3, 1]);
      setInputValue("2,7,9,3,1");
    } else if (type === "cost-simple") {
      setMode("mincost");
      setCostArray([10, 15, 20]);
      setCostInput("10,15,20");
    } else if (type === "cost-complex") {
      setMode("mincost");
      setCostArray([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]);
      setCostInput("1,100,1,1,1,100,1,1,100,1");
    }
  };

  const currentStep =
    currentIndex >= 0 && currentIndex < dpSteps.length
      ? dpSteps[currentIndex]
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
          1D Sequence DP Visualizer
        </h3>

        <div className="space-y-4">
          {/* Speed Control */}
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
                { key: "climb", label: "Climbing Stairs" },
                { key: "rob", label: "House Robber" },
                { key: "mincost", label: "Min Cost Stairs" },
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

          {/* Input Controls */}
          {mode === "climb" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Number of stairs: {n}
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {mode === "rob" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                House values (comma-separated):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="2,7,9,3,1"
                  className="flex-1 px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
                <button
                  onClick={handleInputChange}
                  className="px-4 py-2 rounded text-sm"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                >
                  Set
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Current: [{houseValues.join(", ")}]
              </p>
            </div>
          )}

          {mode === "mincost" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Cost array (comma-separated):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  placeholder="10,15,20"
                  className="flex-1 px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
                <button
                  onClick={handleCostInputChange}
                  className="px-4 py-2 rounded text-sm"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                >
                  Set
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Current: [{costArray.join(", ")}]
              </p>
            </div>
          )}

          {mode === "space" && (
            <div
              className="p-3 rounded text-sm"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              <p className="font-semibold mb-1">Space Optimization Mode</p>
              <p className="text-xs">
                Uses only 2 variables (prev2, prev1) instead of an array. Still
                solves House Robber in O(n) time but O(1) space.
              </p>
              <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                Array: [{houseValues.join(", ")}]
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
                onClick={() => loadExample("climb-small")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Stairs (n=5)
              </button>
              <button
                onClick={() => loadExample("climb-large")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Stairs (n=10)
              </button>
              <button
                onClick={() => loadExample("rob-simple")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Rob [1,2,3,1]
              </button>
              <button
                onClick={() => loadExample("rob-complex")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Rob [2,7,9,3,1]
              </button>
              <button
                onClick={() => loadExample("cost-simple")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Cost [10,15,20]
              </button>
              <button
                onClick={() => loadExample("cost-complex")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Cost [1,100,...]
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
          DP Array & Decision Tree
        </h3>

        {mode !== "space" ? (
          <div className="space-y-4">
            {/* DP Array */}
            <div className="flex flex-wrap gap-2 justify-center">
              {dpSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-3 rounded-md border transition-all"
                  style={{
                    minWidth: "70px",
                    backgroundColor:
                      idx === currentIndex ? "var(--brand)" : "var(--bg)",
                    borderColor:
                      idx === currentIndex ? "var(--brand)" : "var(--panel)",
                    color: idx === currentIndex ? "white" : "var(--fg)",
                    opacity: idx <= currentIndex ? 1 : 0.3,
                  }}
                >
                  <span className="text-xs font-semibold">
                    {mode === "climb"
                      ? `step ${step.index}`
                      : mode === "mincost" && step.index === costArray.length
                      ? "top"
                      : `i=${step.index}`}
                  </span>
                  <span className="text-lg font-bold">{step.value}</span>
                </div>
              ))}
            </div>

            {/* Current Decision */}
            {currentStep && (
              <div
                className="p-4 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                <p className="text-sm font-semibold mb-2">Current Step:</p>
                <p className="text-xs">
                  <strong>Index:</strong> {currentStep.index}
                </p>
                <p className="text-xs">
                  <strong>Value:</strong> {currentStep.value}
                </p>
                {currentStep.decision && (
                  <p className="text-xs mt-1">
                    <strong>Decision:</strong> {currentStep.decision}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          // Space-optimized view
          <div className="space-y-4">
            {spaceVars && (
              <div className="flex justify-center gap-4">
                <div
                  className="p-4 rounded-lg border-2 text-center"
                  style={{
                    borderColor: "var(--brand)",
                    backgroundColor: "var(--bg)",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--muted)" }}
                  >
                    prev2
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--fg)" }}
                  >
                    {spaceVars.prev2}
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg border-2 text-center"
                  style={{
                    borderColor: "var(--brand)",
                    backgroundColor: "var(--bg)",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--muted)" }}
                  >
                    prev1
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--fg)" }}
                  >
                    {spaceVars.prev1}
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg border-2 text-center"
                  style={{
                    borderColor: "#10b981",
                    backgroundColor: "var(--brand)",
                  }}
                >
                  <p className="text-xs font-semibold text-white">current</p>
                  <p className="text-2xl font-bold text-white">
                    {spaceVars.current}
                  </p>
                </div>
              </div>
            )}

            {spaceVars && (
              <div
                className="p-4 rounded text-sm"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                <p className="font-semibold">Step {currentIndex + 1}:</p>
                <p className="text-xs mt-1">{spaceVars.decision}</p>
                <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                  Processing house {currentIndex}: value ={" "}
                  {houseValues[currentIndex]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div
          className="mt-6 flex gap-4 text-sm flex-wrap"
          style={{ color: "var(--fg)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: "var(--brand)",
                border: "2px solid var(--brand)",
              }}
            ></div>
            <span>Current Step</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: "var(--bg)",
                border: "2px solid var(--panel)",
              }}
            ></div>
            <span>Computed</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "var(--bg)", opacity: 0.3 }}
            ></div>
            <span>Not Yet Computed</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 1D Sequence DP Concepts:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Climbing Stairs:</strong> dp[i] = dp[i-1] + dp[i-2]. Count
            ways to reach step i.
          </li>
          <li>
            • <strong>House Robber:</strong> dp[i] = max(dp[i-1], nums[i] +
            dp[i-2]). Choose rob or skip.
          </li>
          <li>
            • <strong>Min Cost:</strong> dp[i] = cost[i] + min(dp[i-1],
            dp[i-2]). Minimize path cost.
          </li>
          <li>
            • <strong>Space Optimization:</strong> Only track last 2 values →
            O(1) space instead of O(n).
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DP1DSequenceVisualizer;
