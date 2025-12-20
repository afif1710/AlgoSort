import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const PalindromePartitionVisualizer: React.FC = () => {
  const [inputString, setInputString] = useState<string>("aab");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [currentPartition, setCurrentPartition] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [allPartitions, setAllPartitions] = useState<string[][]>([]);
  const [message, setMessage] = useState<string>("");
  const [highlightRange, setHighlightRange] = useState<[number, number] | null>(
    null
  );

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const isPalindrome = (s: string, start: number, end: number): boolean => {
    while (start < end) {
      if (s[start] !== s[end]) return false;
      start++;
      end--;
    }
    return true;
  };

  const partition = async (
    s: string,
    start: number,
    path: string[],
    result: string[][]
  ): Promise<void> => {
    if (start === s.length) {
      result.push([...path]);
      setAllPartitions([...result]);
      setMessage(`✅ Found partition: [${path.join(", ")}]`);
      await sleep(1500);
      return;
    }

    setCurrentIndex(start);
    setCurrentPartition([...path]);
    setMessage(`At position ${start}, exploring partitions...`);
    await sleep(800);

    for (let end = start; end < s.length; end++) {
      const substring = s.substring(start, end + 1);
      setHighlightRange([start, end]);
      setMessage(`Checking substring "${substring}"...`);
      await sleep(600);

      if (isPalindrome(s, start, end)) {
        setMessage(`✓ "${substring}" is a palindrome!`);
        await sleep(800);

        path.push(substring);
        setCurrentPartition([...path]);
        setMessage(`Added "${substring}" to current partition`);
        await sleep(800);

        await partition(s, end + 1, path, result);

        path.pop();
        setCurrentPartition([...path]);
        setMessage(`Backtracked: removed "${substring}"`);
        await sleep(600);
      } else {
        setMessage(`✗ "${substring}" is not a palindrome`);
        await sleep(400);
      }
    }

    setHighlightRange(null);
  };

  const findAllPartitions = async () => {
    setAnimating(true);
    setAllPartitions([]);
    setCurrentPartition([]);
    setMessage("Starting palindrome partitioning...");
    await sleep(1000);

    const result: string[][] = [];
    await partition(inputString, 0, [], result);

    setCurrentIndex(-1);
    setCurrentPartition([]);
    setHighlightRange(null);
    setMessage(`✅ Complete! Found ${result.length} partition(s)`);
    setAnimating(false);
  };

  const reset = () => {
    setAllPartitions([]);
    setCurrentPartition([]);
    setCurrentIndex(-1);
    setHighlightRange(null);
    setMessage("");
  };

  const loadExample = (example: string) => {
    if (animating) return;
    setInputString(example);
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
          Palindrome Partitioning Visualizer
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
                reset();
              }}
              disabled={animating}
              maxLength={8}
              className="w-full px-3 py-2 rounded font-mono"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                border: "2px solid var(--brand)",
              }}
              placeholder="Enter string (max 8 chars)"
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
              {["aab", "aabb", "racecar", "abcba"].map((example) => (
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
              ))}
            </div>
          </div>

          {/* Solve Button */}
          <button
            onClick={findAllPartitions}
            disabled={animating || !inputString || inputString.length > 8}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor:
                animating || !inputString || inputString.length > 8
                  ? "#64748b"
                  : "#10b981",
              color: "white",
              cursor:
                animating || !inputString || inputString.length > 8
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {animating ? "Finding Partitions..." : "Find All Partitions"}
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

          {/* Visual String */}
          {inputString && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                String Visualization:
              </label>
              <div className="flex gap-1 justify-center">
                {inputString.split("").map((char, idx) => {
                  const isInRange =
                    highlightRange &&
                    idx >= highlightRange[0] &&
                    idx <= highlightRange[1];
                  const isCurrent = idx === currentIndex;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center"
                      style={{ minWidth: "40px" }}
                    >
                      <div
                        className="text-xs mb-1"
                        style={{
                          color: isCurrent ? "#fbbf24" : "var(--muted)",
                        }}
                      >
                        {idx}
                      </div>
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded font-mono font-bold"
                        style={{
                          backgroundColor: isInRange
                            ? "#10b981"
                            : isCurrent
                            ? "#fbbf24"
                            : "var(--bg)",
                          color: isInRange || isCurrent ? "white" : "var(--fg)",
                          border: "2px solid var(--brand)",
                        }}
                      >
                        {char}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Partition Path */}
          {currentPartition.length > 0 && (
            <div
              className="p-3 rounded"
              style={{
                backgroundColor: "#3b82f620",
                border: "2px solid #3b82f6",
              }}
            >
              <div
                className="text-sm font-semibold mb-2"
                style={{ color: "#3b82f6" }}
              >
                Current Partition Path:
              </div>
              <div className="flex gap-2 flex-wrap">
                {currentPartition.map((part, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 rounded font-mono text-sm font-bold"
                    style={{ backgroundColor: "#3b82f6", color: "white" }}
                  >
                    "{part}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Partitions */}
          {allPartitions.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                All Palindrome Partitions ({allPartitions.length}):
              </label>
              <div
                className="space-y-2 max-h-64 overflow-y-auto p-3 rounded"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {allPartitions.map((partition, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded"
                    style={{ backgroundColor: "var(--panel)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      Partition {idx + 1}:
                    </span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {partition.map((part, pIdx) => (
                        <div
                          key={pIdx}
                          className="px-2 py-1 rounded font-mono text-sm"
                          style={{
                            backgroundColor: "#10b981",
                            color: "white",
                            border: "1px solid #10b981",
                          }}
                        >
                          "{part}"
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
          💡 Palindrome Partitioning Algorithm:
        </p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• At each position, try all possible palindromic prefixes</li>
          <li>• Check if substring is palindrome using two pointers</li>
          <li>• Add palindrome to path and recurse on remaining string</li>
          <li>• Backtrack by removing last palindrome from path</li>
          <li>• Time: O(n × 2^n) - try all possible partitions</li>
          <li>• Optimization: precompute palindrome table with DP</li>
        </ul>
      </div>
    </div>
  );
};

export default PalindromePartitionVisualizer;
