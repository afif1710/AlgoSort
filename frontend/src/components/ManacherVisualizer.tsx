import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const ManacherVisualizer: React.FC = () => {
  const [inputString, setInputString] = useState<string>("babad");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [transformed, setTransformed] = useState<string>("");
  const [P, setP] = useState<number[]>([]);
  const [currentI, setCurrentI] = useState<number>(-1);
  const [C, setC] = useState<number>(-1);
  const [R, setR] = useState<number>(-1);
  const [message, setMessage] = useState<string>("");
  const [longestPalindrome, setLongestPalindrome] = useState<string>("");
  const [allPalindromes, setAllPalindromes] = useState<string[]>([]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const runManacher = async () => {
    setAnimating(true);
    setAllPalindromes([]);

    // Transform string
    const trans = "#" + inputString.split("").join("#") + "#";
    setTransformed(trans);
    setMessage(`Transformed string: '${inputString}' → '${trans}'`);
    await sleep(1500);

    const n = trans.length;
    const pArray = Array(n).fill(0);
    setP([...pArray]);

    let center = 0;
    let right = 0;
    setC(center);
    setR(right);

    let maxLen = 0;
    let centerIndex = 0;

    for (let i = 0; i < n; i++) {
      setCurrentI(i);
      const mirror = 2 * center - i;

      // Initialize using mirror property
      if (i < right) {
        pArray[i] = Math.min(right - i, pArray[mirror]);
        setP([...pArray]);
        setMessage(
          `i=${i}: Inside palindrome. Mirror=${mirror}, P[${i}] = min(${right}-${i}, ${pArray[mirror]}) = ${pArray[i]}`
        );
        await sleep(1000);
      } else {
        pArray[i] = 0;
        setP([...pArray]);
        setMessage(`i=${i}: Outside palindrome. Start from 0.`);
        await sleep(1000);
      }

      // Expand around center
      let expanded = false;
      while (
        i + pArray[i] + 1 < n &&
        i - pArray[i] - 1 >= 0 &&
        trans[i + pArray[i] + 1] === trans[i - pArray[i] - 1]
      ) {
        pArray[i]++;
        expanded = true;
        setP([...pArray]);
        await sleep(600);
      }

      if (expanded) {
        const palindrome = trans.substring(i - pArray[i], i + pArray[i] + 1);
        setMessage(
          `Expanded to P[${i}] = ${pArray[i]}. Palindrome: '${palindrome}'`
        );
        await sleep(800);
      }

      // Update C and R
      if (i + pArray[i] > right) {
        center = i;
        right = i + pArray[i];
        setC(center);
        setR(right);
        setMessage(`Updated center C=${center}, right boundary R=${right}`);
        await sleep(800);
      }

      // Track longest
      if (pArray[i] > maxLen) {
        maxLen = pArray[i];
        centerIndex = i;
      }
    }

    // Extract longest palindrome
    const start = Math.floor((centerIndex - maxLen) / 2);
    const longest = inputString.substring(start, start + maxLen);
    setLongestPalindrome(longest);

    // Find all palindromes
    const palindromes = new Set<string>();
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= pArray[i]; j++) {
        const s = Math.floor((i - j) / 2);
        const e = Math.floor((i + j) / 2);
        if (s >= 0 && e <= inputString.length) {
          const substr = inputString.substring(s, e);
          if (substr.length > 0) {
            palindromes.add(substr);
          }
        }
      }
    }
    setAllPalindromes(
      Array.from(palindromes).sort(
        (a, b) => b.length - a.length || a.localeCompare(b)
      )
    );

    setCurrentI(-1);
    setMessage(
      `✅ Complete! Longest palindrome: '${longest}' (length ${maxLen})`
    );
    setAnimating(false);
  };

  const reset = () => {
    setTransformed("");
    setP([]);
    setCurrentI(-1);
    setC(-1);
    setR(-1);
    setMessage("");
    setLongestPalindrome("");
    setAllPalindromes([]);
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
          Manacher's Algorithm Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Input Field */}
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
              onChange={(e) => setInputString(e.target.value.toLowerCase())}
              disabled={animating}
              className="w-full px-3 py-2 rounded font-mono"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                border: "1px solid var(--brand)",
              }}
              placeholder="Enter string (e.g., babad)"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={runManacher}
            disabled={animating || !inputString}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating || !inputString ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Running..." : "Run Manacher's Algorithm"}
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

          {/* Transformed String */}
          {transformed && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Transformed String:
              </label>
              <div className="flex gap-1 flex-wrap">
                {transformed.split("").map((char, idx) => {
                  let bgColor = "var(--bg)";
                  let textColor = "var(--fg)";

                  if (idx === currentI) {
                    bgColor = "#fbbf24";
                    textColor = "white";
                  } else if (idx === C) {
                    bgColor = "#3b82f6";
                    textColor = "white";
                  } else if (currentI >= 0 && P[currentI] > 0) {
                    if (
                      idx >= currentI - P[currentI] &&
                      idx <= currentI + P[currentI]
                    ) {
                      bgColor = "#10b98120";
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded font-mono text-sm font-bold"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        minWidth: "30px",
                        textAlign: "center",
                      }}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
              <div
                className="mt-2 text-xs flex gap-4"
                style={{ color: "var(--fg)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "#fbbf24" }}
                  ></div>
                  <span>Current position (i)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span>Center (C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "#10b98120" }}
                  ></div>
                  <span>Current palindrome</span>
                </div>
              </div>
            </div>
          )}

          {/* P Array */}
          {P.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                P Array (Palindrome Radius):
              </label>
              <div className="overflow-x-auto">
                <div className="flex gap-1" style={{ minWidth: "max-content" }}>
                  {P.map((val, idx) => (
                    <div
                      key={idx}
                      className="text-center"
                      style={{ minWidth: "30px" }}
                    >
                      <div
                        className="text-xs mb-1"
                        style={{
                          color: idx === currentI ? "#fbbf24" : "var(--muted)",
                          fontWeight: idx === currentI ? "bold" : "normal",
                        }}
                      >
                        {idx}
                      </div>
                      <div
                        className="px-2 py-1 rounded font-mono text-sm font-bold"
                        style={{
                          backgroundColor:
                            idx === currentI ? "#fbbf24" : "var(--bg)",
                          color: idx === currentI ? "white" : "var(--fg)",
                        }}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Center and Right Boundary */}
          {C >= 0 && R >= 0 && (
            <div className="grid grid-cols-2 gap-2">
              <div
                className="p-3 rounded text-center"
                style={{ backgroundColor: "#3b82f6", color: "white" }}
              >
                <div className="text-xs">Center (C)</div>
                <div className="text-lg font-bold">{C}</div>
              </div>
              <div
                className="p-3 rounded text-center"
                style={{ backgroundColor: "#8b5cf6", color: "white" }}
              >
                <div className="text-xs">Right Boundary (R)</div>
                <div className="text-lg font-bold">{R}</div>
              </div>
            </div>
          )}

          {/* Longest Palindrome */}
          {longestPalindrome && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Longest Palindrome:
              </label>
              <div
                className="p-4 rounded text-center text-xl font-bold font-mono"
                style={{ backgroundColor: "#10b981", color: "white" }}
              >
                "{longestPalindrome}" (length {longestPalindrome.length})
              </div>
            </div>
          )}

          {/* All Palindromes */}
          {allPalindromes.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                All Unique Palindromes ({allPalindromes.length}):
              </label>
              <div
                className="p-3 rounded max-h-40 overflow-y-auto"
                style={{ backgroundColor: "var(--bg)" }}
              >
                <div className="flex flex-wrap gap-2">
                  {allPalindromes.map((pal, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded text-sm font-mono"
                      style={{
                        backgroundColor: "var(--panel)",
                        color: "var(--fg)",
                        border: "1px solid var(--brand)",
                      }}
                    >
                      "{pal}"
                    </div>
                  ))}
                </div>
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
        <p className="font-semibold mb-2">💡 Manacher's Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Finds ALL palindromes in O(n) linear time</li>
          <li>
            • Transform string with '#' to handle odd/even palindromes uniformly
          </li>
          <li>• Uses mirror property to avoid redundant comparisons</li>
          <li>• P[i] = radius of palindrome centered at position i</li>
          <li>• Best algorithm for palindrome problems!</li>
        </ul>
      </div>
    </div>
  );
};

export default ManacherVisualizer;
