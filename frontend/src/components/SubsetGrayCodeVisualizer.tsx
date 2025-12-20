import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const SubsetGrayCodeVisualizer: React.FC = () => {
  const [n, setN] = useState<number>(4);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [currentMask, setCurrentMask] = useState<number>(-1);
  const [message, setMessage] = useState<string>("");
  const [subsets, setSubsets] = useState<number[]>([]);
  const [grayCode, setGrayCode] = useState<number[]>([]);
  const [mode, setMode] = useState<"subsets" | "gray">("subsets");

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const generateSubsets = async () => {
    setAnimating(true);
    setSubsets([]);
    setMessage(`Generating all ${1 << n} subsets for n=${n}...`);
    await sleep(1000);

    const allSubsets: number[] = [];

    for (let mask = 0; mask < 1 << n; mask++) {
      setCurrentMask(mask);
      allSubsets.push(mask);
      setSubsets([...allSubsets]);

      const elements = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          elements.push(i);
        }
      }

      setMessage(
        `Mask ${mask} (binary: ${mask
          .toString(2)
          .padStart(n, "0")}): {${elements.join(", ")}}`
      );
      await sleep(600);
    }

    setCurrentMask(-1);
    setMessage(`✅ Generated all ${1 << n} subsets!`);
    setAnimating(false);
  };

  const generateGrayCode = async () => {
    setAnimating(true);
    setGrayCode([]);
    setMessage(`Generating ${n}-bit Gray code...`);
    await sleep(1000);

    const codes: number[] = [];

    for (let i = 0; i < 1 << n; i++) {
      const gray = i ^ (i >> 1);
      setCurrentMask(gray);
      codes.push(gray);
      setGrayCode([...codes]);

      setMessage(
        `i=${i}: Gray code = ${gray} (binary: ${gray
          .toString(2)
          .padStart(n, "0")})`
      );

      if (i > 0) {
        const diff = codes[i] ^ codes[i - 1];
        const changedBit = Math.log2(diff);
        setMessage(
          `i=${i}: Gray code = ${gray} (binary: ${gray
            .toString(2)
            .padStart(n, "0")}) | Changed bit ${changedBit}`
        );
      }

      await sleep(600);
    }

    setCurrentMask(-1);
    setMessage(`✅ Generated ${1 << n} Gray codes!`);
    setAnimating(false);
  };

  const run = () => {
    if (mode === "subsets") {
      generateSubsets();
    } else {
      generateGrayCode();
    }
  };

  const reset = () => {
    setSubsets([]);
    setGrayCode([]);
    setCurrentMask(-1);
    setMessage("");
  };

  const handleNChange = (newN: number) => {
    if (animating) return;
    setN(newN);
    reset();
  };

  const handleModeChange = (newMode: "subsets" | "gray") => {
    if (animating) return;
    setMode(newMode);
    reset();
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
          Subset & Gray Code Visualization
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* N Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Number of elements (n):
            </label>
            <div className="flex gap-2">
              {[3, 4, 5].map((size) => (
                <button
                  key={size}
                  onClick={() => handleNChange(size)}
                  disabled={animating}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor:
                      n === size ? "var(--brand)" : "var(--card-hover-bg)",
                    color: n === size ? "white" : "var(--fg)",
                    cursor: animating ? "not-allowed" : "pointer",
                    border: "2px solid var(--brand)",
                  }}
                >
                  n = {size} ({1 << size} states)
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Visualization Mode:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange("subsets")}
                disabled={animating}
                className="flex-1 px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    mode === "subsets" ? "#10b981" : "var(--card-hover-bg)",
                  color: mode === "subsets" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                  border: "2px solid #10b981",
                }}
              >
                All Subsets
              </button>
              <button
                onClick={() => handleModeChange("gray")}
                disabled={animating}
                className="flex-1 px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    mode === "gray" ? "#3b82f6" : "var(--card-hover-bg)",
                  color: mode === "gray" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                  border: "2px solid #3b82f6",
                }}
              >
                Gray Code
              </button>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={run}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating
              ? "Running..."
              : mode === "subsets"
              ? "Generate Subsets"
              : "Generate Gray Code"}
          </button>

          {/* Message */}
          {message && (
            <div
              className="p-4 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
          )}

          {/* Visualization Grid */}
          {((mode === "subsets" && subsets.length > 0) ||
            (mode === "gray" && grayCode.length > 0)) && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                {mode === "subsets"
                  ? `All Subsets (${subsets.length}/${1 << n}):`
                  : `Gray Codes (${grayCode.length}/${1 << n}):`}
              </label>
              <div
                className="grid gap-2 max-h-96 overflow-y-auto p-3 rounded"
                style={{
                  backgroundColor: "var(--bg)",
                  gridTemplateColumns: `repeat(auto-fill, minmax(${
                    n === 3 ? "100px" : n === 4 ? "120px" : "140px"
                  }, 1fr))`,
                }}
              >
                {(mode === "subsets" ? subsets : grayCode).map((mask, idx) => {
                  const binary = mask.toString(2).padStart(n, "0");
                  const elements = [];
                  for (let i = 0; i < n; i++) {
                    if (mask & (1 << i)) {
                      elements.push(i);
                    }
                  }

                  const isCurrent = mask === currentMask;

                  return (
                    <div
                      key={idx}
                      className="p-2 rounded text-center"
                      style={{
                        backgroundColor: isCurrent ? "#fbbf24" : "var(--panel)",
                        color: isCurrent ? "white" : "var(--fg)",
                        border: isCurrent
                          ? "2px solid #fbbf24"
                          : "1px solid var(--bg)",
                      }}
                    >
                      <div className="text-xs font-mono mb-1">{binary}</div>
                      <div className="text-sm font-bold">{mask}</div>
                      {mode === "subsets" && (
                        <div
                          className="text-xs mt-1"
                          style={{
                            color: isCurrent ? "white" : "var(--muted)",
                          }}
                        >
                          {"{" + elements.join(",") + "}"}
                        </div>
                      )}
                      {mode === "gray" && idx > 0 && (
                        <div
                          className="text-xs mt-1"
                          style={{
                            color: isCurrent ? "white" : "var(--muted)",
                          }}
                        >
                          Δbit: {Math.log2(grayCode[idx] ^ grayCode[idx - 1])}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">
          💡 {mode === "subsets" ? "Bitmask Subsets:" : "Gray Code:"}
        </p>
        <ul className="space-y-1 ml-4 text-xs">
          {mode === "subsets" ? (
            <>
              <li>
                • Each bit represents inclusion (1) or exclusion (0) of element
              </li>
              <li>• Total subsets: 2^n (exponential growth!)</li>
              <li>• Used in DP for TSP, assignment, set cover problems</li>
              <li>• Check bit i: mask & (1 &lt;&lt; i)</li>
              <li>• Set bit i: mask | (1 &lt;&lt; i)</li>
            </>
          ) : (
            <>
              <li>• Consecutive codes differ by exactly one bit</li>
              <li>• Formula: gray[i] = i ^ (i &gt;&gt; 1)</li>
              <li>• O(1) computation per code</li>
              <li>
                • Used in error correction, K-maps, efficient state traversal
              </li>
              <li>• Avoids multiple bit flips when transitioning states</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SubsetGrayCodeVisualizer;
