import React, { useState, useRef, useEffect } from "react";
import SpeedControl from "./SpeedControl";

type Mode = "subsets" | "permutations" | "combinations";

const BacktrackingBasicsVisualizer: React.FC = () => {
  const [mode, setMode] = useState<Mode>("subsets");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const [nums, setNums] = useState<number[]>([1, 2, 3]);
  const [n, setN] = useState<number>(4);
  const [k, setK] = useState<number>(2);
  const [numsInput, setNumsInput] = useState<string>("1,2,3");

  const [results, setResults] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [animating, setAnimating] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<string>("");

  const cancelRef = useRef<boolean>(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const reset = () => {
    cancelRef.current = true;
    setAnimating(false);
    setCurrentIndex(-1);
    setResults([]);
    setFinalResult("");
  };

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const generateSubsets = async () => {
    const allSubsets: number[][] = [];
    const backtrack = (start: number, path: number[]) => {
      allSubsets.push([...path]);
      for (let i = start; i < nums.length; i++) {
        path.push(nums[i]);
        backtrack(i + 1, path);
        path.pop();
      }
    };
    backtrack(0, []);

    setResults(allSubsets);
    for (let i = 0; i < allSubsets.length; i++) {
      if (cancelRef.current) break;
      setCurrentIndex(i);
      await sleep(400);
    }

    setFinalResult(
      `✅ Generated ${allSubsets.length} subsets (2^${nums.length})`
    );
  };

  const generatePermutations = async () => {
    const allPermutations: number[][] = [];
    const backtrack = (path: number[], remaining: number[]) => {
      if (remaining.length === 0) {
        allPermutations.push([...path]);
        return;
      }
      for (let i = 0; i < remaining.length; i++) {
        backtrack(
          [...path, remaining[i]],
          [...remaining.slice(0, i), ...remaining.slice(i + 1)]
        );
      }
    };
    backtrack([], nums);

    setResults(allPermutations);
    for (let i = 0; i < allPermutations.length; i++) {
      if (cancelRef.current) break;
      setCurrentIndex(i);
      await sleep(400);
    }

    setFinalResult(
      `✅ Generated ${allPermutations.length} permutations (${nums.length}!)`
    );
  };

  const generateCombinations = async () => {
    const allCombinations: number[][] = [];
    const backtrack = (start: number, path: number[]) => {
      if (path.length === k) {
        allCombinations.push([...path]);
        return;
      }
      for (let i = start; i <= n; i++) {
        path.push(i);
        backtrack(i + 1, path);
        path.pop();
      }
    };
    backtrack(1, []);

    setResults(allCombinations);
    for (let i = 0; i < allCombinations.length; i++) {
      if (cancelRef.current) break;
      setCurrentIndex(i);
      await sleep(400);
    }

    setFinalResult(
      `✅ Generated ${allCombinations.length} combinations C(${n},${k})`
    );
  };

  const runAnimation = async () => {
    reset();
    cancelRef.current = false;
    setAnimating(true);

    if (mode === "subsets") {
      await generateSubsets();
    } else if (mode === "permutations") {
      await generatePermutations();
    } else if (mode === "combinations") {
      await generateCombinations();
    }

    setAnimating(false);
  };

  const loadExample = (type: string) => {
    reset();
    if (type === "subset-small") {
      setMode("subsets");
      setNums([1, 2]);
      setNumsInput("1,2");
    } else if (type === "subset-medium") {
      setMode("subsets");
      setNums([1, 2, 3]);
      setNumsInput("1,2,3");
    } else if (type === "perm-small") {
      setMode("permutations");
      setNums([1, 2]);
      setNumsInput("1,2");
    } else if (type === "perm-medium") {
      setMode("permutations");
      setNums([1, 2, 3]);
      setNumsInput("1,2,3");
    } else if (type === "comb-small") {
      setMode("combinations");
      setN(3);
      setK(2);
    } else if (type === "comb-medium") {
      setMode("combinations");
      setN(4);
      setK(2);
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
          Backtracking Visualizer
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
                { key: "subsets", label: "Subsets" },
                { key: "permutations", label: "Permutations" },
                { key: "combinations", label: "Combinations" },
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

          {(mode === "subsets" || mode === "permutations") && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Input array (comma-separated):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={numsInput}
                  onChange={(e) => setNumsInput(e.target.value)}
                  placeholder="1,2,3"
                  className="flex-1 px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
                <button
                  onClick={() => {
                    const arr = numsInput
                      .split(",")
                      .map((v) => parseInt(v.trim()))
                      .filter((v) => !isNaN(v));
                    if (arr.length > 0) {
                      setNums(arr);
                      reset();
                    }
                  }}
                  disabled={animating}
                  className="px-4 py-2 rounded text-sm"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                >
                  Set
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Current array: [{nums.join(", ")}]
              </p>
            </div>
          )}

          {mode === "combinations" && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  n (choose from 1 to n): {n}
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={n}
                  onChange={(e) => setN(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  k (choose k elements): {k}
                </label>
                <input
                  type="range"
                  min="1"
                  max={Math.min(n, 5)}
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Load Examples:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample("subset-small")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Subsets [1,2]
              </button>
              <button
                onClick={() => loadExample("subset-medium")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Subsets [1,2,3]
              </button>
              <button
                onClick={() => loadExample("perm-small")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Permute [1,2]
              </button>
              <button
                onClick={() => loadExample("perm-medium")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Permute [1,2,3]
              </button>
              <button
                onClick={() => loadExample("comb-small")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                C(3,2)
              </button>
              <button
                onClick={() => loadExample("comb-medium")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                C(4,2)
              </button>
            </div>
          </div>

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
            {animating ? "Generating..." : "Generate All Solutions"}
          </button>

          {finalResult && (
            <div
              className="p-4 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {finalResult}
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          Generated Solutions
        </h3>

        {results.length > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded border text-center text-sm transition-all"
                  style={{
                    backgroundColor:
                      idx === currentIndex ? "var(--brand)" : "var(--bg)",
                    borderColor:
                      idx === currentIndex ? "var(--brand)" : "var(--panel)",
                    color: idx === currentIndex ? "white" : "var(--fg)",
                    opacity: idx <= currentIndex ? 1 : 0.3,
                  }}
                >
                  [{result.join(", ")}]
                </div>
              ))}
            </div>
            <p
              className="text-xs text-center mt-4"
              style={{ color: "var(--muted)" }}
            >
              Showing {results.length} solutions generated by backtracking
            </p>
          </div>
        ) : (
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            Click "Generate All Solutions" to see results
          </p>
        )}
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Backtracking Patterns:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Subsets:</strong> At each element, choose to include or
            exclude it (2^n solutions)
          </li>
          <li>
            • <strong>Permutations:</strong> Try each unused element at each
            position (n! solutions)
          </li>
          <li>
            • <strong>Combinations:</strong> Choose k elements from n,
            maintaining order (C(n,k) solutions)
          </li>
          <li>
            • <strong>Template:</strong> Make choice → Recurse → Undo choice
            (backtrack)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BacktrackingBasicsVisualizer;
