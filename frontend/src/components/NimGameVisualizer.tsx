import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const NimGameVisualizer: React.FC = () => {
  const [heaps, setHeaps] = useState<number[]>([3, 4, 5]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [nimSum, setNimSum] = useState<number>(-1);
  const [isWinning, setIsWinning] = useState<boolean | null>(null);
  const [winningMove, setWinningMove] = useState<{
    heap: number;
    remove: number;
  } | null>(null);
  const [currentHeap, setCurrentHeap] = useState<number>(-1);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const analyzeNim = async () => {
    setAnimating(true);
    setWinningMove(null);
    setMessage("Analyzing Nim game...");
    await sleep(1000);

    // Calculate XOR of all heaps
    setMessage("Computing Nim-sum (XOR of all heap sizes)...");
    await sleep(1000);

    let xorSum = 0;
    for (let i = 0; i < heaps.length; i++) {
      setCurrentHeap(i);
      setMessage(
        `Heap ${i}: ${heaps[i]} objects (binary: ${heaps[i]
          .toString(2)
          .padStart(4, "0")})`
      );
      await sleep(800);
      xorSum ^= heaps[i];
    }

    setCurrentHeap(-1);
    setNimSum(xorSum);
    setMessage(
      `Nim-sum = ${xorSum} (binary: ${xorSum.toString(2).padStart(4, "0")})`
    );
    await sleep(1500);

    if (xorSum === 0) {
      setIsWinning(false);
      setMessage(
        "❌ Nim-sum = 0: LOSING position! Second player wins with optimal play."
      );
      await sleep(2000);
    } else {
      setIsWinning(true);
      setMessage(
        "✅ Nim-sum ≠ 0: WINNING position! First player can force a win."
      );
      await sleep(1500);

      // Find winning move
      setMessage("Finding winning move...");
      await sleep(1000);

      for (let i = 0; i < heaps.length; i++) {
        const target = heaps[i] ^ xorSum;
        if (target < heaps[i]) {
          const remove = heaps[i] - target;
          setWinningMove({ heap: i, remove });
          setCurrentHeap(i);
          setMessage(
            `✅ Winning move: Remove ${remove} from heap ${i} (${heaps[i]} → ${target})`
          );
          await sleep(1500);

          const newHeaps = [...heaps];
          newHeaps[i] = target;
          const newXor = newHeaps.reduce((acc, val) => acc ^ val, 0);
          setMessage(
            `New state: [${newHeaps.join(
              ", "
            )}], Nim-sum = ${newXor} (opponent loses!)`
          );
          await sleep(2000);
          break;
        }
      }
    }

    setCurrentHeap(-1);
    setAnimating(false);
  };

  const reset = () => {
    setNimSum(-1);
    setIsWinning(null);
    setWinningMove(null);
    setCurrentHeap(-1);
    setMessage("");
  };

  const updateHeap = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    const newHeaps = [...heaps];
    newHeaps[index] = Math.max(0, Math.min(20, num));
    setHeaps(newHeaps);
    reset();
  };

  const addHeap = () => {
    if (heaps.length < 6) {
      setHeaps([...heaps, 1]);
      reset();
    }
  };

  const removeHeap = (index: number) => {
    if (heaps.length > 2) {
      const newHeaps = heaps.filter((_, i) => i !== index);
      setHeaps(newHeaps);
      reset();
    }
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
          Nim Game Analyzer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Heaps Configuration */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Heaps Configuration:
            </label>
            <div className="space-y-2">
              {heaps.map((heap, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--fg)", minWidth: "60px" }}
                  >
                    Heap {idx}:
                  </span>
                  <input
                    type="number"
                    value={heap}
                    onChange={(e) => updateHeap(idx, e.target.value)}
                    disabled={animating}
                    min="0"
                    max="20"
                    className="px-3 py-2 rounded font-mono w-24"
                    style={{
                      backgroundColor:
                        currentHeap === idx ? "#fbbf24" : "var(--bg)",
                      color: currentHeap === idx ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                    }}
                  />
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--muted)" }}
                  >
                    (binary: {heap.toString(2).padStart(4, "0")})
                  </span>
                  {heaps.length > 2 && (
                    <button
                      onClick={() => removeHeap(idx)}
                      disabled={animating}
                      className="px-3 py-1 rounded text-sm"
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        cursor: animating ? "not-allowed" : "pointer",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {heaps.length < 6 && (
                <button
                  onClick={addHeap}
                  disabled={animating}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor: "var(--brand)",
                    color: "white",
                    cursor: animating ? "not-allowed" : "pointer",
                  }}
                >
                  + Add Heap
                </button>
              )}
            </div>
          </div>

          {/* Visual Heaps */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Visual Representation:
            </label>
            <div className="flex gap-4 flex-wrap">
              {heaps.map((heap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded"
                  style={{
                    backgroundColor:
                      currentHeap === idx ? "#fbbf2420" : "var(--bg)",
                    border:
                      currentHeap === idx
                        ? "2px solid #fbbf24"
                        : "2px solid var(--bg)",
                  }}
                >
                  <div
                    className="text-xs mb-2 font-bold"
                    style={{ color: "var(--fg)" }}
                  >
                    Heap {idx}
                  </div>
                  <div
                    className="flex gap-1 flex-wrap"
                    style={{ maxWidth: "150px" }}
                  >
                    {Array.from({ length: heap }).map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: "var(--brand)" }}
                      />
                    ))}
                  </div>
                  <div
                    className="text-xs mt-2 font-mono"
                    style={{ color: "var(--muted)" }}
                  >
                    Count: {heap}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeNim}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Analyzing..." : "Analyze Position"}
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

          {/* Results */}
          {nimSum >= 0 && (
            <div className="grid grid-cols-2 gap-2">
              <div
                className="p-4 rounded text-center"
                style={{ backgroundColor: "var(--bg)" }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                  Nim-Sum (XOR)
                </div>
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: "var(--fg)" }}
                >
                  {nimSum}
                </div>
                <div
                  className="text-xs mt-1 font-mono"
                  style={{ color: "var(--muted)" }}
                >
                  {nimSum.toString(2).padStart(4, "0")}
                </div>
              </div>
              <div
                className="p-4 rounded text-center"
                style={{
                  backgroundColor: isWinning ? "#10b981" : "#ef4444",
                  color: "white",
                }}
              >
                <div className="text-xs mb-1">Position</div>
                <div className="text-lg font-bold">
                  {isWinning ? "WINNING" : "LOSING"}
                </div>
                <div className="text-xs mt-1">
                  {isWinning ? "First player wins" : "Second player wins"}
                </div>
              </div>
            </div>
          )}

          {/* Winning Move */}
          {winningMove && (
            <div
              className="p-4 rounded"
              style={{
                backgroundColor: "#10b98120",
                border: "2px solid #10b981",
              }}
            >
              <div className="font-semibold mb-2" style={{ color: "#10b981" }}>
                🎯 Winning Move:
              </div>
              <div className="text-sm" style={{ color: "var(--fg)" }}>
                Remove <strong>{winningMove.remove}</strong> objects from{" "}
                <strong>Heap {winningMove.heap}</strong>
              </div>
              <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                This leaves opponent with Nim-sum = 0 (losing position)
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
        <p className="font-semibold mb-2">💡 Nim Game Strategy:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Compute Nim-sum: XOR all heap sizes together</li>
          <li>• If Nim-sum = 0: Current player loses with optimal play</li>
          <li>• If Nim-sum ≠ 0: Current player can force a win</li>
          <li>• Winning move: Make Nim-sum = 0 for opponent</li>
          <li>• Time: O(n), Space: O(1) - extremely efficient!</li>
        </ul>
      </div>
    </div>
  );
};

export default NimGameVisualizer;
