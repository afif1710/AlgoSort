import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const SuffixArrayVisualizer: React.FC = () => {
  const [inputString, setInputString] = useState<string>("banana");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [suffixArray, setSuffixArray] = useState<number[]>([]);
  const [lcpArray, setLcpArray] = useState<number[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const buildSuffixArray = async () => {
    setAnimating(true);
    setSuffixArray([]);
    setLcpArray([]);
    setHighlightIndex(-1);
    setMessage("Building suffix array...");
    await sleep(1000);

    const s = inputString;
    const n = s.length;

    // Create suffix array using simple sorting
    const suffixes: Array<{ index: number; suffix: string }> = [];
    for (let i = 0; i < n; i++) {
      suffixes.push({ index: i, suffix: s.substring(i) });
    }

    setMessage("Sorting suffixes lexicographically...");
    await sleep(1000);

    suffixes.sort((a, b) => a.suffix.localeCompare(b.suffix));

    const sa = suffixes.map((s) => s.index);
    setSuffixArray(sa);

    // Animate through suffix array
    for (let i = 0; i < sa.length; i++) {
      setHighlightIndex(i);
      setMessage(
        `Suffix ${i}: starts at position ${sa[i]} → "${s.substring(sa[i])}"`
      );
      await sleep(800);
    }

    setHighlightIndex(-1);
    setMessage("Building LCP array...");
    await sleep(1000);

    // Build LCP array
    const lcp = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
      const prev = s.substring(sa[i - 1]);
      const curr = s.substring(sa[i]);
      let len = 0;
      while (
        len < prev.length &&
        len < curr.length &&
        prev[len] === curr[len]
      ) {
        len++;
      }
      lcp[i] = len;

      setHighlightIndex(i);
      setLcpArray([...lcp]);
      setMessage(`LCP[${i}] = ${len}: common prefix length between suffixes`);
      await sleep(800);
    }

    setHighlightIndex(-1);
    setMessage(`✅ Complete! Suffix array and LCP array built.`);
    setAnimating(false);
  };

  const findPattern = async (pattern: string) => {
    if (suffixArray.length === 0) {
      setMessage("Please build suffix array first!");
      return;
    }

    setAnimating(true);
    setHighlightIndex(-1);
    setMessage(`Searching for pattern "${pattern}"...`);
    await sleep(1000);

    const s = inputString;
    const matches: number[] = [];

    for (let i = 0; i < suffixArray.length; i++) {
      setHighlightIndex(i);
      const suffix = s.substring(suffixArray[i]);

      if (suffix.startsWith(pattern)) {
        matches.push(suffixArray[i]);
        setMessage(`✓ Found at position ${suffixArray[i]}`);
      } else {
        setMessage(`✗ Checking suffix at position ${suffixArray[i]}...`);
      }
      await sleep(600);
    }

    setHighlightIndex(-1);
    if (matches.length > 0) {
      setMessage(
        `✅ Pattern "${pattern}" found at positions: ${matches.join(", ")}`
      );
    } else {
      setMessage(`❌ Pattern "${pattern}" not found`);
    }
    setAnimating(false);
  };

  const loadExample = (example: string) => {
    if (animating) return;
    setInputString(example);
    setSuffixArray([]);
    setLcpArray([]);
    setHighlightIndex(-1);
    setMessage("");
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
          Suffix Array Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Input */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Input String:
            </label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => {
                setInputString(e.target.value.toLowerCase());
                setSuffixArray([]);
                setLcpArray([]);
                setMessage("");
              }}
              disabled={animating}
              maxLength={12}
              className="w-full px-3 py-2 rounded font-mono"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                border: "2px solid var(--brand)",
              }}
              placeholder="Enter string (max 12 chars)"
            />
          </div>

          {/* Examples */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Quick Examples:
            </label>
            <div className="flex gap-2 flex-wrap">
              {["banana", "mississippi", "abracadabra", "abcabc"].map(
                (example) => (
                  <button
                    key={example}
                    onClick={() => loadExample(example)}
                    disabled={animating}
                    className="px-3 py-1 rounded text-sm font-mono"
                    style={{
                      backgroundColor: "var(--card-hover-bg)",
                      color: "var(--fg)",
                      border: "1px solid var(--brand)",
                      cursor: animating ? "not-allowed" : "pointer",
                    }}
                  >
                    "{example}"
                  </button>
                )
              )}
            </div>
          </div>

          {/* Build Button */}
          <button
            onClick={buildSuffixArray}
            disabled={animating || !inputString}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor:
                animating || !inputString ? "#64748b" : "var(--brand)",
              color: "white",
              cursor: animating || !inputString ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Building..." : "Build Suffix Array"}
          </button>

          {/* Search Pattern */}
          {suffixArray.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Search Pattern:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => findPattern("ana")}
                  disabled={animating}
                  className="flex-1 px-3 py-2 rounded text-sm font-mono"
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    cursor: animating ? "not-allowed" : "pointer",
                  }}
                >
                  Find "ana"
                </button>
                <button
                  onClick={() => findPattern("na")}
                  disabled={animating}
                  className="flex-1 px-3 py-2 rounded text-sm font-mono"
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    cursor: animating ? "not-allowed" : "pointer",
                  }}
                >
                  Find "na"
                </button>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className="p-3 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
          )}

          {/* Suffix Array Display */}
          {suffixArray.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Suffix Array (sorted suffixes):
              </label>
              <div
                className="p-3 rounded space-y-1 max-h-80 overflow-y-auto"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {suffixArray.map((pos, idx) => {
                  const isHighlighted = idx === highlightIndex;
                  const suffix = inputString.substring(pos);

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded font-mono text-sm"
                      style={{
                        backgroundColor: isHighlighted
                          ? "#fbbf2420"
                          : "var(--panel)",
                        border: isHighlighted
                          ? "2px solid #fbbf24"
                          : "1px solid var(--bg)",
                      }}
                    >
                      <span style={{ color: "var(--muted)", minWidth: "30px" }}>
                        {idx}:
                      </span>
                      <span style={{ color: "var(--brand)", minWidth: "60px" }}>
                        SA[{idx}] = {pos}
                      </span>
                      {lcpArray[idx] !== undefined && (
                        <span style={{ color: "#10b981", minWidth: "80px" }}>
                          LCP = {lcpArray[idx]}
                        </span>
                      )}
                      <span style={{ color: "var(--fg)" }}>"{suffix}"</span>
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
        <p className="font-semibold mb-2">💡 Suffix Array:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• SA[i] = starting position of i-th suffix in sorted order</li>
          <li>• LCP[i] = longest common prefix with previous suffix</li>
          <li>• Pattern matching: binary search in O(|P| log n)</li>
          <li>• Longest repeated substring: max value in LCP array</li>
          <li>• Construction: O(n log² n) practical, O(n) theoretical</li>
          <li>• More space-efficient than suffix trees</li>
        </ul>
      </div>
    </div>
  );
};

export default SuffixArrayVisualizer;
