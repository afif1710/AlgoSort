import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const KMPVisualizer: React.FC = () => {
  const [text, setText] = useState<string>("ABABDABACDABABCABAB");
  const [pattern, setPattern] = useState<string>("ABABCABAB");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [lps, setLps] = useState<number[]>([]);
  const [buildingLPS, setBuildingLPS] = useState(false);
  const [currentI, setCurrentI] = useState<number>(-1);
  const [currentJ, setCurrentJ] = useState<number>(-1);
  const [message, setMessage] = useState<string>("");
  const [matches, setMatches] = useState<number[]>([]);
  const [lpsLog, setLpsLog] = useState<string[]>([]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const buildLPSArray = async (p: string) => {
    setBuildingLPS(true);
    const m = p.length;
    const lpsArray = Array(m).fill(0);
    setLps([...lpsArray]);
    setMessage("Building LPS array...");
    await sleep(1000);

    const log: string[] = [];
    let length = 0;
    let i = 1;

    while (i < m) {
      setCurrentI(i);
      setCurrentJ(length);

      if (p[i] === p[length]) {
        length++;
        lpsArray[i] = length;
        setLps([...lpsArray]);

        const logMsg = `Match at i=${i}: lps[${i}] = ${length}`;
        log.push(logMsg);
        setLpsLog([...log]);
        setMessage(
          `Match! pattern[${i}]='${p[i]}' == pattern[${length - 1}]='${
            p[length - 1]
          }'`
        );
        await sleep(800);
        i++;
      } else {
        if (length !== 0) {
          const logMsg = `Mismatch: fallback length from ${length} to ${
            lpsArray[length - 1]
          }`;
          log.push(logMsg);
          setLpsLog([...log]);
          setMessage(
            `Mismatch! Fallback: length = lps[${length - 1}] = ${
              lpsArray[length - 1]
            }`
          );
          await sleep(800);
          length = lpsArray[length - 1];
        } else {
          lpsArray[i] = 0;
          setLps([...lpsArray]);
          const logMsg = `No match at i=${i}: lps[${i}] = 0`;
          log.push(logMsg);
          setLpsLog([...log]);
          setMessage(`No prefix match at i=${i}`);
          await sleep(800);
          i++;
        }
      }
    }

    setCurrentI(-1);
    setCurrentJ(-1);
    setMessage("✅ LPS array built successfully!");
    await sleep(1000);
    setBuildingLPS(false);
    return lpsArray;
  };

  const runKMP = async () => {
    setAnimating(true);
    setMatches([]);
    setLpsLog([]);

    const lpsArray = await buildLPSArray(pattern);

    setMessage("Starting KMP search...");
    await sleep(1000);

    const n = text.length;
    const m = pattern.length;
    const foundMatches: number[] = [];

    let i = 0; // text index
    let j = 0; // pattern index

    while (i < n) {
      setCurrentI(i);
      setCurrentJ(j);

      if (pattern[j] === text[i]) {
        setMessage(
          `Match: text[${i}]='${text[i]}' == pattern[${j}]='${pattern[j]}'`
        );
        await sleep(600);
        i++;
        j++;
      }

      if (j === m) {
        const matchIndex = i - j;
        foundMatches.push(matchIndex);
        setMatches([...foundMatches]);
        setMessage(`✅ Pattern found at index ${matchIndex}!`);
        await sleep(1500);
        j = lpsArray[j - 1];
      } else if (i < n && pattern[j] !== text[i]) {
        setMessage(
          `Mismatch: text[${i}]='${text[i]}' != pattern[${j}]='${pattern[j]}'`
        );
        await sleep(600);

        if (j !== 0) {
          setMessage(`Using LPS: j = lps[${j - 1}] = ${lpsArray[j - 1]}`);
          await sleep(600);
          j = lpsArray[j - 1];
        } else {
          i++;
        }
      }
    }

    setCurrentI(-1);
    setCurrentJ(-1);
    setMessage(
      foundMatches.length > 0
        ? `✅ Found ${foundMatches.length} match(es)!`
        : "❌ No matches found."
    );
    setAnimating(false);
  };

  const reset = () => {
    setLps([]);
    setMatches([]);
    setCurrentI(-1);
    setCurrentJ(-1);
    setMessage("");
    setLpsLog([]);
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
          KMP Algorithm Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Input Fields */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Text:
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              disabled={animating}
              className="w-full px-3 py-2 rounded font-mono"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                border: "1px solid var(--brand)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Pattern:
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value.toUpperCase())}
              disabled={animating}
              className="w-full px-3 py-2 rounded font-mono"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                border: "1px solid var(--brand)",
              }}
            />
          </div>

          {/* Run Button */}
          <button
            onClick={runKMP}
            disabled={animating || !text || !pattern}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor:
                animating || !text || !pattern ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Running..." : "Run KMP Algorithm"}
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

          {/* LPS Array */}
          {lps.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                LPS Array (Longest Prefix Suffix):
              </label>
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${lps.length}, minmax(0, 1fr))`,
                }}
              >
                {lps.map((val, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="text-xs mb-1"
                      style={{
                        color:
                          buildingLPS && idx === currentI
                            ? "#fbbf24"
                            : "var(--muted)",
                        fontWeight:
                          buildingLPS && idx === currentI ? "bold" : "normal",
                      }}
                    >
                      {idx}
                    </div>
                    <div
                      className="p-2 rounded font-mono font-bold text-sm"
                      style={{
                        backgroundColor:
                          buildingLPS && idx === currentI
                            ? "#fbbf24"
                            : buildingLPS && idx === currentJ
                            ? "#3b82f6"
                            : "var(--bg)",
                        color:
                          buildingLPS && (idx === currentI || idx === currentJ)
                            ? "white"
                            : "var(--fg)",
                      }}
                    >
                      {val}
                    </div>
                    <div
                      className="text-xs mt-1 font-mono"
                      style={{ color: "var(--muted)" }}
                    >
                      {pattern[idx]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text and Pattern Comparison */}
          {!buildingLPS && lps.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Pattern Matching:
              </label>

              {/* Text */}
              <div className="mb-2">
                <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                  Text:
                </div>
                <div className="flex gap-1 flex-wrap">
                  {text.split("").map((char, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded font-mono text-sm font-bold"
                      style={{
                        backgroundColor: matches.some(
                          (m) => idx >= m && idx < m + pattern.length
                        )
                          ? "#10b981"
                          : idx === currentI
                          ? "#fbbf24"
                          : "var(--bg)",
                        color:
                          matches.some(
                            (m) => idx >= m && idx < m + pattern.length
                          ) || idx === currentI
                            ? "white"
                            : "var(--fg)",
                        minWidth: "30px",
                        textAlign: "center",
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pattern */}
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                  Pattern:
                </div>
                <div className="flex gap-1">
                  {pattern.split("").map((char, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded font-mono text-sm font-bold"
                      style={{
                        backgroundColor:
                          idx === currentJ ? "#3b82f6" : "var(--bg)",
                        color: idx === currentJ ? "white" : "var(--fg)",
                        minWidth: "30px",
                        textAlign: "center",
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Matches */}
          {matches.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Matches Found: {matches.length}
              </label>
              <div
                className="p-3 rounded text-sm font-mono"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                Indices: {matches.join(", ")}
              </div>
            </div>
          )}

          {/* LPS Log */}
          {lpsLog.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                LPS Construction Log:
              </label>
              <div
                className="p-3 rounded max-h-32 overflow-y-auto text-xs font-mono"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                {lpsLog.map((log, idx) => (
                  <div key={idx} className="mb-1">
                    {log}
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
        <p className="font-semibold mb-2">💡 KMP Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Builds LPS (Longest Prefix Suffix) array in O(m) time</li>
          <li>• Uses LPS to skip redundant comparisons during search</li>
          <li>
            • Total time complexity: O(n + m) - optimal for pattern matching!
          </li>
          <li>• Space: O(m) for LPS array</li>
          <li>• Best for: Single pattern search with worst-case guarantees</li>
        </ul>
      </div>
    </div>
  );
};

export default KMPVisualizer;
