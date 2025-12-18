import React, { useState, useRef, useEffect } from "react";
import SpeedControl from "./SpeedControl";

type Mode = "lcs" | "edit" | "lps";

type Cell = {
  row: number;
  col: number;
  value: number;
  decision?: string;
};

const DPStringsVisualizer: React.FC = () => {
  const [mode, setMode] = useState<Mode>("lcs");
  const [str1, setStr1] = useState<string>("abcde");
  const [str2, setStr2] = useState<string>("ace");
  const [str1Input, setStr1Input] = useState<string>("abcde");
  const [str2Input, setStr2Input] = useState<string>("ace");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const [dpTable, setDpTable] = useState<number[][]>([]);
  const [currentCell, setCurrentCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [animating, setAnimating] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [cellHistory, setCellHistory] = useState<Cell[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  const cancelRef = useRef<boolean>(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const reset = () => {
    cancelRef.current = true;
    setAnimating(false);
    setCurrentCell(null);
    setDpTable([]);
    setResult("");
    setCellHistory([]);
    setCurrentStep(-1);
  };

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const buildLCSTable = async () => {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );
    const history: Cell[] = [];

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        let decision = "";
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = 1 + dp[i - 1][j - 1];
          decision = `Match '${str1[i - 1]}': 1 + dp[${i - 1}][${j - 1}] = ${
            dp[i][j]
          }`;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          decision = `No match: max(dp[${i - 1}][${j}]=${
            dp[i - 1][j]
          }, dp[${i}][${j - 1}]=${dp[i][j - 1]}) = ${dp[i][j]}`;
        }
        history.push({ row: i, col: j, value: dp[i][j], decision });
      }
    }

    setDpTable(dp);
    setCellHistory(history);

    for (let idx = 0; idx < history.length; idx++) {
      if (cancelRef.current) break;
      const cell = history[idx];
      setCurrentCell({ row: cell.row, col: cell.col });
      setCurrentStep(idx);
      await sleep(300);
    }

    setResult(`✅ LCS length: ${dp[m][n]}`);
  };

  const buildEditDistanceTable = async () => {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );
    const history: Cell[] = [];

    // Base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        let decision = "";
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          decision = `Match '${str1[i - 1]}': no operation needed, dp[${
            i - 1
          }][${j - 1}] = ${dp[i][j]}`;
        } else {
          const replace = dp[i - 1][j - 1] + 1;
          const deleteOp = dp[i - 1][j] + 1;
          const insert = dp[i][j - 1] + 1;
          dp[i][j] = Math.min(replace, deleteOp, insert);
          decision = `Min(replace=${replace}, delete=${deleteOp}, insert=${insert}) = ${dp[i][j]}`;
        }
        history.push({ row: i, col: j, value: dp[i][j], decision });
      }
    }

    setDpTable(dp);
    setCellHistory(history);

    for (let idx = 0; idx < history.length; idx++) {
      if (cancelRef.current) break;
      const cell = history[idx];
      setCurrentCell({ row: cell.row, col: cell.col });
      setCurrentStep(idx);
      await sleep(300);
    }

    setResult(`✅ Edit distance: ${dp[m][n]} operations`);
  };

  const buildLPSTable = async () => {
    const n = str1.length;
    const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const history: Cell[] = [];

    // Base case: single character palindromes
    for (let i = 0; i < n; i++) {
      dp[i][i] = 1;
    }

    // Build for substrings of increasing length
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        let decision = "";
        if (str1[i] === str1[j]) {
          dp[i][j] = 2 + (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0);
          decision = `Match '${str1[i]}': 2 + dp[${i + 1}][${j - 1}] = ${
            dp[i][j]
          }`;
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
          decision = `No match: max(dp[${i + 1}][${j}]=${
            dp[i + 1][j]
          }, dp[${i}][${j - 1}]=${dp[i][j - 1]}) = ${dp[i][j]}`;
        }
        history.push({ row: i, col: j, value: dp[i][j], decision });
      }
    }

    setDpTable(dp);
    setCellHistory(history);

    for (let idx = 0; idx < history.length; idx++) {
      if (cancelRef.current) break;
      const cell = history[idx];
      setCurrentCell({ row: cell.row, col: cell.col });
      setCurrentStep(idx);
      await sleep(400);
    }

    setResult(`✅ Longest palindromic subsequence length: ${dp[0][n - 1]}`);
  };

  const runAnimation = async () => {
    reset();
    cancelRef.current = false;
    setAnimating(true);

    if (mode === "lcs") {
      await buildLCSTable();
    } else if (mode === "edit") {
      await buildEditDistanceTable();
    } else if (mode === "lps") {
      await buildLPSTable();
    }

    setAnimating(false);
  };

  const handleStr1Change = () => {
    if (str1Input.trim()) setStr1(str1Input.trim());
  };

  const handleStr2Change = () => {
    if (str2Input.trim()) setStr2(str2Input.trim());
  };

  const loadExample = (type: string) => {
    reset();
    if (type === "lcs-simple") {
      setMode("lcs");
      setStr1("abc");
      setStr2("ac");
      setStr1Input("abc");
      setStr2Input("ac");
    } else if (type === "lcs-medium") {
      setMode("lcs");
      setStr1("abcde");
      setStr2("ace");
      setStr1Input("abcde");
      setStr2Input("ace");
    } else if (type === "edit-simple") {
      setMode("edit");
      setStr1("horse");
      setStr2("ros");
      setStr1Input("horse");
      setStr2Input("ros");
    } else if (type === "edit-medium") {
      setMode("edit");
      setStr1("intention");
      setStr2("execution");
      setStr1Input("intention");
      setStr2Input("execution");
    } else if (type === "lps-simple") {
      setMode("lps");
      setStr1("bbbab");
      setStr1Input("bbbab");
    } else if (type === "lps-medium") {
      setMode("lps");
      setStr1("cbbd");
      setStr1Input("cbbd");
    }
  };

  const currentCellData =
    currentStep >= 0 && currentStep < cellHistory.length
      ? cellHistory[currentStep]
      : null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          String DP Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Mode Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Select Problem:
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "lcs", label: "LCS (Longest Common Subsequence)" },
                { key: "edit", label: "Edit Distance" },
                { key: "lps", label: "Longest Palindromic Subsequence" },
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

          {/* String Inputs */}
          <div className="space-y-3">
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                {mode === "lps" ? "String:" : "String 1:"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={str1Input}
                  onChange={(e) => setStr1Input(e.target.value)}
                  placeholder="abcde"
                  className="flex-1 px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    borderColor: "var(--brand)",
                  }}
                />
                <button
                  onClick={handleStr1Change}
                  className="px-4 py-2 rounded text-sm"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                >
                  Set
                </button>
              </div>
            </div>

            {mode !== "lps" && (
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  String 2:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={str2Input}
                    onChange={(e) => setStr2Input(e.target.value)}
                    placeholder="ace"
                    className="flex-1 px-3 py-2 rounded border text-sm"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--fg)",
                      borderColor: "var(--brand)",
                    }}
                  />
                  <button
                    onClick={handleStr2Change}
                    className="px-4 py-2 rounded text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    Set
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {mode === "lps"
                ? `String: "${str1}"`
                : `Comparing: "${str1}" and "${str2}"`}
            </p>
          </div>

          {/* Examples */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Load Examples:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample("lcs-simple")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                LCS (abc, ac)
              </button>
              <button
                onClick={() => loadExample("lcs-medium")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                LCS (abcde, ace)
              </button>
              <button
                onClick={() => loadExample("edit-simple")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Edit (horse, ros)
              </button>
              <button
                onClick={() => loadExample("edit-medium")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Edit (intention, execution)
              </button>
              <button
                onClick={() => loadExample("lps-simple")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                LPS (bbbab)
              </button>
              <button
                onClick={() => loadExample("lps-medium")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                LPS (cbbd)
              </button>
            </div>
          </div>

          {/* Run Button */}
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
            {animating ? "Running..." : "Run Animation"}
          </button>

          {/* Result */}
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

      {/* Visualization */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          DP Table Visualization
        </h3>

        {dpTable.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs">
                <thead>
                  <tr>
                    <th
                      className="border px-2 py-1"
                      style={{
                        borderColor: "var(--panel)",
                        color: "var(--fg)",
                      }}
                    >
                      {mode === "lps" ? "i \\ j" : ""}
                    </th>
                    {mode !== "lps" ? (
                      <>
                        <th
                          className="border px-2 py-1"
                          style={{
                            borderColor: "var(--panel)",
                            color: "var(--fg)",
                          }}
                        >
                          ""
                        </th>
                        {str2.split("").map((char, idx) => (
                          <th
                            key={idx}
                            className="border px-2 py-1"
                            style={{
                              borderColor: "var(--panel)",
                              color: "var(--fg)",
                            }}
                          >
                            {char}
                          </th>
                        ))}
                      </>
                    ) : (
                      str1.split("").map((char, idx) => (
                        <th
                          key={idx}
                          className="border px-2 py-1"
                          style={{
                            borderColor: "var(--panel)",
                            color: "var(--fg)",
                          }}
                        >
                          {char}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dpTable.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td
                        className="border px-2 py-1 font-semibold"
                        style={{
                          borderColor: "var(--panel)",
                          color: "var(--fg)",
                        }}
                      >
                        {mode !== "lps"
                          ? rIdx === 0
                            ? '""'
                            : str1[rIdx - 1]
                          : str1[rIdx]}
                      </td>
                      {row.map((cell, cIdx) => {
                        const isActive =
                          currentCell?.row === rIdx &&
                          currentCell?.col === cIdx;
                        return (
                          <td
                            key={cIdx}
                            className="border px-2 py-1 text-center transition-all"
                            style={{
                              borderColor: "var(--panel)",
                              backgroundColor: isActive
                                ? "var(--brand)"
                                : mode !== "lps" && (rIdx === 0 || cIdx === 0)
                                ? "var(--bg)"
                                : "var(--card-hover-bg)",
                              color: isActive ? "white" : "var(--fg)",
                              fontWeight: isActive ? "bold" : "normal",
                            }}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentCellData && (
              <div
                className="p-4 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                <p className="text-sm font-semibold mb-2">
                  Current Cell: [{currentCellData.row}][{currentCellData.col}]
                </p>
                <p className="text-xs">
                  <strong>Value:</strong> {currentCellData.value}
                </p>
                {currentCellData.decision && (
                  <p className="text-xs mt-1">
                    <strong>Decision:</strong> {currentCellData.decision}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            Click "Run Animation" to visualize the DP table
          </p>
        )}
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 String DP Concepts:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>LCS:</strong> If chars match: 1 + dp[i-1][j-1], else
            max(dp[i-1][j], dp[i][j-1])
          </li>
          <li>
            • <strong>Edit Distance:</strong> If match: dp[i-1][j-1], else 1 +
            min(replace, delete, insert)
          </li>
          <li>
            • <strong>LPS:</strong> If s[i]==s[j]: 2 + dp[i+1][j-1], else
            max(dp[i+1][j], dp[i][j-1])
          </li>
          <li>
            • <strong>Pattern:</strong> 2D table where dp[i][j] compares
            prefixes/substrings of two sequences
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DPStringsVisualizer;
