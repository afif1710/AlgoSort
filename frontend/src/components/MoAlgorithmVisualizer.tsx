import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface Query {
  left: number;
  right: number;
  id: number;
}

const MoAlgorithmVisualizer: React.FC = () => {
  const [array, setArray] = useState<number[]>([1, 1, 2, 1, 3, 4, 5, 2, 8]);
  const [queries, setQueries] = useState<Query[]>([
    { left: 0, right: 4, id: 0 },
    { left: 1, right: 3, id: 1 },
    { left: 2, right: 6, id: 2 },
  ]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [currentL, setCurrentL] = useState<number>(-1);
  const [currentR, setCurrentR] = useState<number>(-1);
  const [currentQueryIdx, setCurrentQueryIdx] = useState<number>(-1);
  const [message, setMessage] = useState<string>("");
  const [results, setResults] = useState<{ sum: number; distinct: number }[]>(
    []
  );
  const [logs, setLogs] = useState<string[]>([]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const blockSize = Math.floor(Math.sqrt(array.length)) + 1;

  const runMoAlgorithm = async () => {
    setAnimating(true);
    setResults([]);
    setLogs([]);
    setMessage("Starting Mo's Algorithm...");
    await sleep(1000);

    const logList: string[] = [];
    logList.push(`Block size: ${blockSize}`);
    logList.push(`Sorting queries by Mo's order...`);
    setLogs([...logList]);
    await sleep(1500);

    // Sort queries
    const sortedQueries = [...queries].sort((a, b) => {
      const blockA = Math.floor(a.left / blockSize);
      const blockB = Math.floor(b.left / blockSize);
      if (blockA !== blockB) return blockA - blockB;
      return a.right - b.right;
    });

    logList.push(
      `Sorted order: ${sortedQueries.map((q) => `Q${q.id}`).join(", ")}`
    );
    setLogs([...logList]);
    await sleep(1500);

    let currL = 0;
    let currR = 0;
    let currSum = 0;
    const freq: { [key: number]: number } = {};

    const res: { sum: number; distinct: number }[] = new Array(queries.length);

    for (let i = 0; i < sortedQueries.length; i++) {
      const query = sortedQueries[i];
      setCurrentQueryIdx(query.id);
      setMessage(
        `Processing Query ${query.id}: [${query.left}, ${query.right}]`
      );
      logList.push(
        `\n--- Query ${query.id}: [${query.left}, ${query.right}] ---`
      );
      setLogs([...logList]);
      await sleep(1000);

      // Expand right
      while (currR <= query.right) {
        setCurrentR(currR);
        currSum += array[currR];
        freq[array[currR]] = (freq[array[currR]] || 0) + 1;
        logList.push(`Add arr[${currR}] = ${array[currR]}`);
        setLogs([...logList]);
        await sleep(600);
        currR++;
      }

      // Contract right
      while (currR > query.right + 1) {
        currR--;
        setCurrentR(currR);
        currSum -= array[currR];
        freq[array[currR]]--;
        logList.push(`Remove arr[${currR}] = ${array[currR]}`);
        setLogs([...logList]);
        await sleep(600);
      }

      // Contract left
      while (currL < query.left) {
        setCurrentL(currL);
        currSum -= array[currL];
        freq[array[currL]]--;
        logList.push(`Remove arr[${currL}] = ${array[currL]}`);
        setLogs([...logList]);
        await sleep(600);
        currL++;
      }

      // Expand left
      while (currL > query.left) {
        currL--;
        setCurrentL(currL);
        currSum += array[currL];
        freq[array[currL]] = (freq[array[currL]] || 0) + 1;
        logList.push(`Add arr[${currL}] = ${array[currL]}`);
        setLogs([...logList]);
        await sleep(600);
      }

      setCurrentL(currL);
      setCurrentR(currR - 1);

      const distinct = Object.values(freq).filter((v) => v > 0).length;
      res[query.id] = { sum: currSum, distinct };

      logList.push(`Result: sum=${currSum}, distinct=${distinct}`);
      setLogs([...logList]);
      setResults([...res]);
      await sleep(1000);
    }

    setCurrentL(-1);
    setCurrentR(-1);
    setCurrentQueryIdx(-1);
    setMessage(
      `✅ Mo's Algorithm complete! Processed ${queries.length} queries.`
    );
    setAnimating(false);
  };

  const reset = () => {
    setCurrentL(-1);
    setCurrentR(-1);
    setCurrentQueryIdx(-1);
    setResults([]);
    setLogs([]);
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
          Mo's Algorithm Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Array Display */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Array (Block size: {blockSize}):
            </label>
            <div className="flex gap-1 flex-wrap">
              {array.map((val, idx) => {
                const isInRange =
                  idx >= currentL && idx <= currentR && currentL !== -1;
                const isPointer = idx === currentL || idx === currentR;

                return (
                  <div
                    key={idx}
                    className="relative px-3 py-2 rounded text-center font-mono font-bold"
                    style={{
                      backgroundColor: isPointer
                        ? "#fbbf24"
                        : isInRange
                        ? "#10b98140"
                        : "var(--bg)",
                      color: isPointer ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                      minWidth: "40px",
                    }}
                  >
                    <div
                      className="text-xs"
                      style={{ color: isPointer ? "white" : "var(--muted)" }}
                    >
                      {idx}
                    </div>
                    <div className="text-sm">{val}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Queries */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Queries:
            </label>
            <div className="space-y-2">
              {queries.map((query, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded"
                  style={{
                    backgroundColor:
                      currentQueryIdx === idx ? "#10b98120" : "var(--bg)",
                    border:
                      currentQueryIdx === idx
                        ? "2px solid #10b981"
                        : "1px solid var(--bg)",
                  }}
                >
                  <span
                    className="font-mono font-bold"
                    style={{ color: "var(--fg)", minWidth: "60px" }}
                  >
                    Query {idx}:
                  </span>
                  <span className="font-mono" style={{ color: "var(--fg)" }}>
                    [{query.left}, {query.right}]
                  </span>
                  {results[idx] && (
                    <span
                      className="ml-auto text-sm font-mono"
                      style={{ color: "#10b981" }}
                    >
                      Sum: {results[idx].sum}, Distinct: {results[idx].distinct}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runMoAlgorithm}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Running..." : "Run Mo's Algorithm"}
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

          {/* Current Range */}
          {currentL !== -1 && currentR !== -1 && (
            <div
              className="p-3 rounded"
              style={{
                backgroundColor: "#10b98120",
                border: "2px solid #10b981",
              }}
            >
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: "#10b981" }}
              >
                Current Range: [{currentL}, {currentR}]
              </div>
              <div className="text-xs font-mono" style={{ color: "var(--fg)" }}>
                Elements: {array.slice(currentL, currentR + 1).join(", ")}
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Execution Log:
              </label>
              <div
                className="p-3 rounded max-h-64 overflow-y-auto font-mono text-xs"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="mb-1"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
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
        <p className="font-semibold mb-2">💡 Mo's Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Offline algorithm for range queries</li>
          <li>• Sort queries by (L/√n, R) for optimal order</li>
          <li>• Expand/contract current range to answer queries</li>
          <li>• Total complexity: O((n + q)√n) for q queries</li>
          <li>• Best for: distinct elements, sum, frequency queries</li>
        </ul>
      </div>
    </div>
  );
};

export default MoAlgorithmVisualizer;
