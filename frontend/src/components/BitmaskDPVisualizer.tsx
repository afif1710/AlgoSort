import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const BitmaskDPVisualizer: React.FC = () => {
  const [n, setN] = useState<number>(4);
  const [currentMask, setCurrentMask] = useState<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [tspCosts, setTspCosts] = useState<Map<string, number>>(new Map());
  const [selectedBit, setSelectedBit] = useState<number | null>(null);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const isBitSet = (mask: number, bit: number): boolean => {
    return (mask & (1 << bit)) !== 0;
  };

  const setBit = (mask: number, bit: number): number => {
    return mask | (1 << bit);
  };

  const unsetBit = (mask: number, bit: number): number => {
    return mask & ~(1 << bit);
  };

  const countBits = (mask: number): number => {
    return mask.toString(2).split("1").length - 1;
  };

  const handleSetBit = async (bit: number) => {
    if (animating) return;
    setAnimating(true);
    setSelectedBit(bit);
    setMessage(`Setting bit ${bit}...`);
    await sleep(500);

    const newMask = setBit(currentMask, bit);
    setCurrentMask(newMask);
    setMessage(
      `✅ Bit ${bit} set! Mask is now ${newMask.toString(2).padStart(n, "0")}`
    );

    await sleep(800);
    setSelectedBit(null);
    setAnimating(false);
  };

  const handleUnsetBit = async (bit: number) => {
    if (animating) return;
    setAnimating(true);
    setSelectedBit(bit);
    setMessage(`Unsetting bit ${bit}...`);
    await sleep(500);

    const newMask = unsetBit(currentMask, bit);
    setCurrentMask(newMask);
    setMessage(
      `✅ Bit ${bit} unset! Mask is now ${newMask.toString(2).padStart(n, "0")}`
    );

    await sleep(800);
    setSelectedBit(null);
    setAnimating(false);
  };

  const handleToggleBit = (bit: number) => {
    if (animating) return;
    if (isBitSet(currentMask, bit)) {
      handleUnsetBit(bit);
    } else {
      handleSetBit(bit);
    }
  };

  const visualizeAllSubsets = async () => {
    if (animating) return;
    setAnimating(true);
    setMessage("Iterating through all possible subsets...");
    await sleep(800);

    const maxMask = (1 << n) - 1;
    for (let mask = 0; mask <= maxMask; mask++) {
      setCurrentMask(mask);
      const elements = [];
      for (let i = 0; i < n; i++) {
        if (isBitSet(mask, i)) elements.push(i);
      }
      setMessage(
        `Mask ${mask.toString(2).padStart(n, "0")} = {${
          elements.join(", ") || "∅"
        }}`
      );
      await sleep(300);
    }

    setMessage("✅ All subsets enumerated!");
    await sleep(1000);
    setCurrentMask(0);
    setAnimating(false);
  };

  const simulateTSP = async () => {
    if (n > 4) {
      alert("TSP visualization limited to n ≤ 4 for clarity");
      return;
    }

    if (animating) return;
    setAnimating(true);
    setTspCosts(new Map());
    setCurrentMask(1); // Start at city 0

    // Simple distance matrix
    const dist = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) =>
        i === j ? 0 : Math.abs(i - j) * 10 + 5
      )
    );

    setMessage("Starting TSP from city 0...");
    await sleep(1000);

    // Simulate visiting a few states
    const states = [
      { mask: 1, city: 0, cost: 0 },
      { mask: 3, city: 1, cost: 15 },
      { mask: 7, city: 2, cost: 35 },
      { mask: 15, city: 3, cost: 65 },
    ];

    for (const { mask, city, cost } of states) {
      setCurrentMask(mask);
      const visited = [];
      for (let i = 0; i < n; i++) {
        if (isBitSet(mask, i)) visited.push(i);
      }
      setMessage(
        `Visited cities: {${visited.join(
          ", "
        )}}, Current: ${city}, Cost: ${cost}`
      );
      setTspCosts(new Map([[`${mask}-${city}`, cost]]));
      await sleep(1200);
    }

    setMessage("✅ TSP simulation complete! (Simplified for visualization)");
    await sleep(1500);
    setAnimating(false);
  };

  const reset = () => {
    setCurrentMask(0);
    setMessage("");
    setTspCosts(new Map());
    setSelectedBit(null);
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
          Bitmask DP Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Number of elements */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Number of elements (n): {n}
            </label>
            <input
              type="range"
              min="3"
              max="6"
              value={n}
              onChange={(e) => {
                setN(parseInt(e.target.value));
                reset();
              }}
              className="w-full"
              disabled={animating}
            />
          </div>

          {/* Current mask display */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Current Mask:
            </label>
            <div
              className="p-4 rounded font-mono text-2xl font-bold text-center"
              style={{ backgroundColor: "var(--bg)", color: "var(--brand)" }}
            >
              {currentMask.toString(2).padStart(n, "0")} = {currentMask}
            </div>
            <div
              className="text-sm text-center mt-2"
              style={{ color: "var(--muted)" }}
            >
              Set elements: {"{"}
              {Array.from({ length: n })
                .map((_, i) => (isBitSet(currentMask, i) ? i : null))
                .filter((x) => x !== null)
                .join(", ") || "∅"}
              {"}"}
            </div>
          </div>

          {/* Bit controls */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Toggle Bits (Click to set/unset):
            </label>
            <div className="flex gap-2 flex-wrap justify-center">
              {Array.from({ length: n }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleToggleBit(i)}
                  disabled={animating}
                  className="w-16 h-16 rounded-lg text-lg font-bold transition-all"
                  style={{
                    backgroundColor: isBitSet(currentMask, i)
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                    color: isBitSet(currentMask, i) ? "white" : "var(--fg)",
                    border:
                      selectedBit === i
                        ? "3px solid #fbbf24"
                        : "2px solid var(--brand)",
                    transform: selectedBit === i ? "scale(1.1)" : "scale(1)",
                    cursor: animating ? "not-allowed" : "pointer",
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Visualizations:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={visualizeAllSubsets}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#10b981",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                Enumerate All Subsets
              </button>
              <button
                onClick={simulateTSP}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#f59e0b",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                Simulate TSP
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: "#ef4444", color: "white" }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className="p-4 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
          )}

          {/* Bit stats */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Statistics:
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                <div className="text-xs text-[var(--muted)]">Decimal Value</div>
                <div className="font-mono font-bold">{currentMask}</div>
              </div>
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                <div className="text-xs text-[var(--muted)]">
                  Set Bits (Popcount)
                </div>
                <div className="font-mono font-bold">
                  {countBits(currentMask)}
                </div>
              </div>
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                <div className="text-xs text-[var(--muted)]">Total Subsets</div>
                <div className="font-mono font-bold">{1 << n}</div>
              </div>
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                <div className="text-xs text-[var(--muted)]">
                  Current / Total
                </div>
                <div className="font-mono font-bold">
                  {currentMask} / {(1 << n) - 1}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bitmask operations reference */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 Bitmask Operations:</p>
        <ul className="space-y-1 ml-4 text-xs font-mono">
          <li>• Set bit i: mask | (1 &lt;&lt; i)</li>
          <li>• Unset bit i: mask &amp; ~(1 &lt;&lt; i)</li>
          <li>• Check bit i: (mask &gt;&gt; i) &amp; 1</li>
          <li>• Toggle bit i: mask ^ (1 &lt;&lt; i)</li>
          <li>• Count bits: bin(mask).count('1')</li>
          <li>• All subsets: range(1 &lt;&lt; n)</li>
        </ul>
      </div>
    </div>
  );
};

export default BitmaskDPVisualizer;
