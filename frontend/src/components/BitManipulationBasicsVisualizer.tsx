import React, { useState, useRef, useEffect } from "react";
import SpeedControl from "./SpeedControl";

type Mode = "single" | "power2" | "countbits" | "subsets";

const BitManipulationBasicsVisualizer: React.FC = () => {
  const [mode, setMode] = useState<Mode>("single");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  // Single number
  const [singleArray, setSingleArray] = useState<number[]>([4, 1, 2, 1, 2]);
  const [singleInput, setSingleInput] = useState<string>("4,1,2,1,2");

  // Power of 2
  const [powerNum, setPowerNum] = useState<number>(16);

  // Count bits
  const [countNum, setCountNum] = useState<number>(11);

  // Subsets with bitmask
  const [subsetNums, setSubsetNums] = useState<number[]>([1, 2, 3]);
  const [subsetInput, setSubsetInput] = useState<string>("1,2,3");

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

  const toBinary = (num: number, minLength: number = 8): string => {
    return num.toString(2).padStart(minLength, "0");
  };

  const runSingleNumber = async () => {
    const xorSteps: any[] = [];
    let result = 0;

    xorSteps.push({
      current: null,
      xorResult: result,
      binary: toBinary(result),
      description: "Start with result = 0",
    });

    for (const num of singleArray) {
      const prev = result;
      result ^= num;
      xorSteps.push({
        current: num,
        xorResult: result,
        binary: toBinary(result),
        prevBinary: toBinary(prev),
        currentBinary: toBinary(num),
        description: `${prev} ^ ${num} = ${result} | Binary: ${toBinary(
          prev
        )} ^ ${toBinary(num)} = ${toBinary(result)}`,
      });
    }

    setSteps(xorSteps);
    for (let i = 0; i < xorSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(1000);
    }

    setResult(`✅ Single number is ${result} (all pairs cancel out via XOR)`);
  };

  const runPowerOf2 = async () => {
    const powerSteps: any[] = [];

    powerSteps.push({
      num: powerNum,
      binary: toBinary(powerNum, 8),
      description: `Check if ${powerNum} is power of 2`,
    });

    const minus1 = powerNum - 1;
    powerSteps.push({
      num: minus1,
      binary: toBinary(minus1, 8),
      description: `${powerNum} - 1 = ${minus1} | Binary: ${toBinary(
        minus1,
        8
      )}`,
    });

    const andResult = powerNum & minus1;
    powerSteps.push({
      num: andResult,
      binary: toBinary(andResult, 8),
      description: `${powerNum} & ${minus1} = ${andResult} | Binary: ${toBinary(
        powerNum,
        8
      )} & ${toBinary(minus1, 8)} = ${toBinary(andResult, 8)}`,
    });

    const isPower = powerNum > 0 && andResult === 0;
    powerSteps.push({
      num: null,
      binary: null,
      description: `Result: ${isPower ? "✅ Power of 2" : "❌ Not power of 2"}`,
    });

    setSteps(powerSteps);
    for (let i = 0; i < powerSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(1200);
    }

    setResult(
      isPower
        ? `✅ ${powerNum} is a power of 2`
        : `❌ ${powerNum} is NOT a power of 2`
    );
  };

  const runCountBits = async () => {
    const countSteps: any[] = [];
    let n = countNum;
    let count = 0;

    countSteps.push({
      num: n,
      binary: toBinary(n, 8),
      count: count,
      description: `Start with n = ${n}, count = 0`,
    });

    while (n > 0) {
      const prev = n;
      n = n & (n - 1);
      count++;
      countSteps.push({
        num: n,
        binary: toBinary(n, 8),
        prevBinary: toBinary(prev, 8),
        count: count,
        description: `${prev} & (${prev} - 1) = ${n} | Clears rightmost 1 bit | Count: ${count}`,
      });
    }

    setSteps(countSteps);
    for (let i = 0; i < countSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(1200);
    }

    setResult(`✅ Number of 1 bits in ${countNum} is ${count}`);
  };

  const runSubsetsBitmask = async () => {
    const n = subsetNums.length;
    const totalSubsets = 1 << n; // 2^n
    const subsetSteps: any[] = [];

    for (let mask = 0; mask < totalSubsets; mask++) {
      const subset: number[] = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          subset.push(subsetNums[i]);
        }
      }
      subsetSteps.push({
        mask,
        binary: toBinary(mask, n),
        subset,
        description: `Mask ${mask} (${toBinary(mask, n)}) → [${subset.join(
          ", "
        )}]`,
      });
    }

    setSteps(subsetSteps);
    for (let i = 0; i < subsetSteps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await sleep(600);
    }

    setResult(`✅ Generated ${totalSubsets} subsets using bitmask (2^${n})`);
  };

  const runAnimation = async () => {
    reset();
    cancelRef.current = false;
    setAnimating(true);

    if (mode === "single") {
      await runSingleNumber();
    } else if (mode === "power2") {
      await runPowerOf2();
    } else if (mode === "countbits") {
      await runCountBits();
    } else if (mode === "subsets") {
      await runSubsetsBitmask();
    }

    setAnimating(false);
  };

  const currentStepData =
    currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

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
          Bit Manipulation Visualizer
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
                { key: "single", label: "Single Number (XOR)" },
                { key: "power2", label: "Power of Two" },
                { key: "countbits", label: "Count Bits" },
                { key: "subsets", label: "Subsets (Bitmask)" },
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

          {mode === "single" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Array (one element appears once, others twice):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={singleInput}
                  onChange={(e) => setSingleInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
                <button
                  onClick={() => {
                    const arr = singleInput
                      .split(",")
                      .map((v) => parseInt(v.trim()))
                      .filter((v) => !isNaN(v));
                    if (arr.length > 0) setSingleArray(arr);
                  }}
                  className="px-4 py-2 rounded text-sm"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                >
                  Set
                </button>
              </div>
            </div>
          )}

          {mode === "power2" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Number to check: {powerNum}
              </label>
              <input
                type="range"
                min="1"
                max="128"
                value={powerNum}
                onChange={(e) => setPowerNum(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {mode === "countbits" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Number to count bits: {countNum}
              </label>
              <input
                type="range"
                min="1"
                max="255"
                value={countNum}
                onChange={(e) => setCountNum(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Binary: {toBinary(countNum, 8)}
              </p>
            </div>
          )}

          {mode === "subsets" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Input array:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subsetInput}
                  onChange={(e) => setSubsetInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
                <button
                  onClick={() => {
                    const arr = subsetInput
                      .split(",")
                      .map((v) => parseInt(v.trim()))
                      .filter((v) => !isNaN(v));
                    if (arr.length > 0 && arr.length <= 5) setSubsetNums(arr);
                  }}
                  className="px-4 py-2 rounded text-sm"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                >
                  Set
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Max 5 elements for visualization
              </p>
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
            {animating ? "Running..." : "Run Bit Operation"}
          </button>

          {result && (
            <div
              className="p-4 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {result}
            </div>
          )}

          {currentStepData && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              <p className="text-sm font-semibold mb-2">
                Step {currentStep + 1}:
              </p>
              {currentStepData.binary && (
                <p className="text-xs font-mono mb-1">
                  Binary: {currentStepData.binary}
                </p>
              )}
              <p className="text-xs">{currentStepData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Binary Visualization */}
      {currentStepData && currentStepData.binary && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--panel)" }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--fg)" }}
          >
            Binary Representation
          </h3>
          <div className="flex justify-center gap-1">
            {currentStepData.binary
              .split("")
              .map((bit: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-center p-3 rounded border-2 font-mono text-lg font-bold"
                  style={{
                    backgroundColor: bit === "1" ? "var(--brand)" : "var(--bg)",
                    borderColor: bit === "1" ? "var(--brand)" : "var(--panel)",
                    color: bit === "1" ? "white" : "var(--fg)",
                    minWidth: "40px",
                  }}
                >
                  {bit}
                </div>
              ))}
          </div>
          <p
            className="text-xs text-center mt-2"
            style={{ color: "var(--muted)" }}
          >
            Decimal:{" "}
            {currentStepData.num !== null && currentStepData.num !== undefined
              ? currentStepData.num
              : "N/A"}
          </p>
        </div>
      )}

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Bit Manipulation Tricks:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>XOR:</strong> x ^ x = 0, x ^ 0 = x. Pairs cancel out!
          </li>
          <li>
            • <strong>Power of 2:</strong> n & (n-1) == 0 checks if only one bit
            is set
          </li>
          <li>
            • <strong>Count Bits:</strong> n & (n-1) clears the rightmost 1 bit
          </li>
          <li>
            • <strong>Bitmask Subsets:</strong> Each bit indicates if element is
            included
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BitManipulationBasicsVisualizer;
