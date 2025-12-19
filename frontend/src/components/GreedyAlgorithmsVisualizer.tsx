import React, { useState, useRef, useEffect } from "react";
import SpeedControl from "./SpeedControl";

type Mode = "activity" | "jump" | "gas";

type ActivityStep = {
  index: number;
  start: number;
  end: number;
  selected: boolean;
  reason: string;
};

const GreedyAlgorithmsVisualizer: React.FC = () => {
  const [mode, setMode] = useState<Mode>("activity");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  // Activity selection
  const [starts, setStarts] = useState<number[]>([1, 3, 0, 5, 8, 5]);
  const [ends, setEnds] = useState<number[]>([2, 4, 6, 7, 9, 9]);
  const [startsInput, setStartsInput] = useState<string>("1,3,0,5,8,5");
  const [endsInput, setEndsInput] = useState<string>("2,4,6,7,9,9");

  // Jump game
  const [jumpArray, setJumpArray] = useState<number[]>([2, 3, 1, 1, 4]);
  const [jumpInput, setJumpInput] = useState<string>("2,3,1,1,4");

  // Gas station
  const [gas, setGas] = useState<number[]>([1, 2, 3, 4, 5]);
  const [cost, setCost] = useState<number[]>([3, 4, 5, 1, 2]);
  const [gasInput, setGasInput] = useState<string>("1,2,3,4,5");
  const [costInput, setCostInput] = useState<string>("3,4,5,1,2");

  const [steps, setSteps] = useState<any[]>([]);
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

  const runActivitySelection = async () => {
    const activities = starts.map((s, i) => ({
      start: s,
      end: ends[i],
      index: i,
    }));
    activities.sort((a, b) => a.end - b.end);

    const activitySteps: ActivityStep[] = [];
    let count = 0;
    let lastEnd = 0;

    for (const act of activities) {
      if (act.start >= lastEnd) {
        activitySteps.push({
          index: act.index,
          start: act.start,
          end: act.end,
          selected: true,
          reason: `✅ Select [${act.start}, ${act.end}]`,
        });
        lastEnd = act.end;
        count++;
      } else {
        activitySteps.push({
          index: act.index,
          start: act.start,
          end: act.end,
          selected: false,
          reason: `❌ Skip [${act.start}, ${act.end}] - overlaps`,
        });
      }
    }

    setSteps(activitySteps);
    for (let i = 0; i < activitySteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(1000);
    }

    setResult(`✅ Maximum activities: ${count}`);
  };

  const runJumpGame = async () => {
    const jumpSteps: any[] = [];
    let farthest = 0;
    let canReach = true;

    for (let i = 0; i < jumpArray.length; i++) {
      if (i > farthest) {
        canReach = false;
        jumpSteps.push({
          index: i,
          value: jumpArray[i],
          farthest,
          stuck: true,
        });
        break;
      }

      const newFarthest = Math.max(farthest, i + jumpArray[i]);
      jumpSteps.push({
        index: i,
        value: jumpArray[i],
        farthest: newFarthest,
        stuck: false,
      });
      farthest = newFarthest;

      if (farthest >= jumpArray.length - 1) {
        break;
      }
    }

    setSteps(jumpSteps);
    for (let i = 0; i < jumpSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(800);
    }

    if (canReach && farthest >= jumpArray.length - 1) {
      setResult(`✅ Can reach the end!`);
    } else {
      setResult(`❌ Stuck! Cannot reach end.`);
    }
  };

  const runGasStation = async () => {
    const totalGas = gas.reduce((a, b) => a + b, 0);
    const totalCost = cost.reduce((a, b) => a + b, 0);

    if (totalGas < totalCost) {
      setResult(
        `❌ Impossible: Total gas (${totalGas}) < Total cost (${totalCost})`
      );
      setAnimating(false);
      return;
    }

    const gasSteps: any[] = [];
    let start = 0;
    let tank = 0;

    for (let i = 0; i < gas.length; i++) {
      tank += gas[i] - cost[i];
      gasSteps.push({
        index: i,
        gas: gas[i],
        cost: cost[i],
        tank,
        start,
        restart: tank < 0,
      });

      if (tank < 0) {
        start = i + 1;
        tank = 0;
      }
    }

    setSteps(gasSteps);
    for (let i = 0; i < gasSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(800);
    }

    setResult(`✅ Start from station ${start}`);
  };

  const runAnimation = async () => {
    reset();
    cancelRef.current = false;
    setAnimating(true);

    if (mode === "activity") {
      await runActivitySelection();
    } else if (mode === "jump") {
      await runJumpGame();
    } else if (mode === "gas") {
      await runGasStation();
    }

    setAnimating(false);
  };

  const handleSetActivities = () => {
    const s = startsInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    const e = endsInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (s.length > 0 && e.length > 0 && s.length === e.length) {
      setStarts(s);
      setEnds(e);
      reset();
    }
  };

  const handleSetJump = () => {
    const arr = jumpInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) {
      setJumpArray(arr);
      reset();
    }
  };

  const handleSetGas = () => {
    const g = gasInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    const c = costInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (g.length > 0 && c.length > 0 && g.length === c.length) {
      setGas(g);
      setCost(c);
      reset();
    }
  };

  const currentStepData =
    currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  // Calculate timeline max for activity selection
  const timelineMax = mode === "activity" ? Math.max(...ends) + 1 : 0;

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
          Greedy Algorithms Visualizer
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
              Select Problem:
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "activity", label: "Activity Selection" },
                { key: "jump", label: "Jump Game" },
                { key: "gas", label: "Gas Station" },
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

          {mode === "activity" && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Start times:
                </label>
                <input
                  type="text"
                  value={startsInput}
                  onChange={(e) => setStartsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  End times:
                </label>
                <input
                  type="text"
                  value={endsInput}
                  onChange={(e) => setEndsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
              </div>
              <button
                onClick={handleSetActivities}
                disabled={animating}
                className="px-4 py-2 rounded text-sm"
                style={{ backgroundColor: "var(--brand)", color: "white" }}
              >
                Set Activities
              </button>
            </div>
          )}

          {mode === "jump" && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Jump array:
                </label>
                <input
                  type="text"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
              </div>
              <button
                onClick={handleSetJump}
                disabled={animating}
                className="px-4 py-2 rounded text-sm"
                style={{ backgroundColor: "var(--brand)", color: "white" }}
              >
                Set Array
              </button>
            </div>
          )}

          {mode === "gas" && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Gas amounts:
                </label>
                <input
                  type="text"
                  value={gasInput}
                  onChange={(e) => setGasInput(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Cost amounts:
                </label>
                <input
                  type="text"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
              </div>
              <button
                onClick={handleSetGas}
                disabled={animating}
                className="px-4 py-2 rounded text-sm"
                style={{ backgroundColor: "var(--brand)", color: "white" }}
              >
                Set Stations
              </button>
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
            {animating ? "Running..." : "Run Greedy Algorithm"}
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

      {/* VISUAL TIMELINE for Activity Selection */}
      {mode === "activity" && steps.length > 0 && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--panel)" }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--fg)" }}
          >
            Timeline Visualization
          </h3>
          <div className="space-y-3">
            {steps.map((step: ActivityStep, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs w-16"
                      style={{ color: "var(--muted)" }}
                    >
                      [{step.start}, {step.end}]
                    </span>
                    <div
                      className="flex-1 relative h-8 rounded"
                      style={{ backgroundColor: "var(--bg)" }}
                    >
                      {/* Timeline bar */}
                      <div
                        className="absolute h-8 rounded transition-all"
                        style={{
                          left: `${(step.start / timelineMax) * 100}%`,
                          width: `${
                            ((step.end - step.start) / timelineMax) * 100
                          }%`,
                          backgroundColor: step.selected
                            ? isActive
                              ? "#10b981"
                              : isPast
                              ? "#059669"
                              : "var(--card-hover-bg)"
                            : isActive
                            ? "#ef4444"
                            : isPast
                            ? "#dc2626"
                            : "var(--card-hover-bg)",
                          opacity: isActive ? 1 : isPast ? 0.7 : 0.3,
                          border: isActive ? "2px solid white" : "none",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs w-24"
                      style={{ color: step.selected ? "#10b981" : "#ef4444" }}
                    >
                      {step.reason}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ARRAY VISUALIZATION for Jump Game */}
      {mode === "jump" && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--panel)" }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--fg)" }}
          >
            Jump Array Visualization
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {jumpArray.map((num, idx) => {
              const isCurrentIndex =
                currentStepData && idx === currentStepData.index;
              const isReachable =
                currentStepData && idx <= currentStepData.farthest;
              const isStuck =
                currentStepData?.stuck && idx === currentStepData.index;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all"
                  style={{
                    minWidth: "60px",
                    backgroundColor: isStuck
                      ? "#ef4444"
                      : isCurrentIndex
                      ? "#fbbf24"
                      : isReachable
                      ? "var(--brand)"
                      : "var(--bg)",
                    borderColor: isCurrentIndex
                      ? "#f59e0b"
                      : isReachable
                      ? "var(--brand)"
                      : "var(--panel)",
                    color: isReachable || isStuck ? "white" : "var(--fg)",
                    opacity: isReachable ? 1 : 0.4,
                  }}
                >
                  <span className="text-xs font-semibold">{idx}</span>
                  <span className="text-lg font-bold">{num}</span>
                  {idx === jumpArray.length - 1 && (
                    <span className="text-xs">🎯</span>
                  )}
                </div>
              );
            })}
          </div>
          {currentStepData && (
            <p
              className="text-sm text-center mt-4"
              style={{ color: "var(--muted)" }}
            >
              At index {currentStepData.index}: Can jump {currentStepData.value}{" "}
              steps → Farthest reachable: {currentStepData.farthest}
            </p>
          )}
        </div>
      )}

      {/* STATIONS VISUALIZATION for Gas Station */}
      {mode === "gas" && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--panel)" }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--fg)" }}
          >
            Gas Stations Visualization
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {gas.map((g, idx) => {
              const isCurrentStation =
                currentStepData && idx === currentStepData.index;
              const isStartStation =
                currentStepData && idx === currentStepData.start;
              const shouldRestart =
                currentStepData &&
                currentStepData.restart &&
                idx === currentStepData.index;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center p-3 rounded-md border-2 transition-all"
                  style={{
                    minWidth: "80px",
                    backgroundColor: shouldRestart
                      ? "#ef4444"
                      : isStartStation
                      ? "#10b981"
                      : isCurrentStation
                      ? "#fbbf24"
                      : "var(--bg)",
                    borderColor: isCurrentStation ? "#f59e0b" : "var(--panel)",
                    color:
                      isCurrentStation || isStartStation || shouldRestart
                        ? "white"
                        : "var(--fg)",
                  }}
                >
                  <span className="text-xs font-semibold">Station {idx}</span>
                  <span className="text-sm">+{g} gas</span>
                  <span className="text-sm">-{cost[idx]} cost</span>
                  {currentStepData && idx === currentStepData.index && (
                    <span className="text-xs mt-1">
                      Tank: {currentStepData.tank}
                    </span>
                  )}
                  {isStartStation && <span className="text-xs">🚀 START</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Greedy Strategy:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          {mode === "activity" && (
            <>
              <li>• Sort by end time</li>
              <li>• Always pick earliest ending activity</li>
              <li>• Skip if it overlaps with previous selection</li>
            </>
          )}
          {mode === "jump" && (
            <>
              <li>• Track farthest reachable position</li>
              <li>
                • At each index, update farthest = max(farthest, i + nums[i])
              </li>
              <li>• If current index &gt; farthest, stuck!</li>
            </>
          )}
          {mode === "gas" && (
            <>
              <li>• If total gas &lt; total cost, impossible</li>
              <li>• Track tank as we move through stations</li>
              <li>• If tank goes negative, restart from next station</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GreedyAlgorithmsVisualizer;
