import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const FloydWarshallVisualizer: React.FC = () => {
  const [n, setN] = useState<number>(3); // Start with n=3 (balanced)
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [dist, setDist] = useState<number[][]>([]);
  const [currentK, setCurrentK] = useState<number>(-1);
  const [currentI, setCurrentI] = useState<number>(-1);
  const [currentJ, setCurrentJ] = useState<number>(-1);
  const [message, setMessage] = useState<string>("");
  const [updateLog, setUpdateLog] = useState<string[]>([]);

  const INF = 9999;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const initializeGraph = (size: number) => {
    // Different graphs based on size
    if (size === 2) {
      return [
        [0, 5],
        [3, 0],
      ];
    } else if (size === 3) {
      return [
        [0, 4, INF],
        [INF, 0, 2],
        [1, INF, 0],
      ];
    } else {
      // size === 4
      return [
        [0, 3, INF, 7],
        [8, 0, 2, INF],
        [5, INF, 0, 1],
        [2, INF, INF, 0],
      ];
    }
  };

  const runFloydWarshall = async () => {
    setAnimating(true);
    setUpdateLog([]);

    const matrix = initializeGraph(n).map((row) => [...row]);
    setDist(matrix.map((row) => [...row]));
    setMessage("Initialized distance matrix with direct edge weights...");
    await sleep(1500);

    const log: string[] = [];

    // Floyd-Warshall algorithm
    for (let k = 0; k < n; k++) {
      setCurrentK(k);
      setMessage(`Trying vertex ${k} as intermediate vertex...`);
      await sleep(1000);

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          setCurrentI(i);
          setCurrentJ(j);

          if (i === j) {
            await sleep(200);
            continue;
          }

          const directPath = matrix[i][j];
          const throughK =
            matrix[i][k] === INF || matrix[k][j] === INF
              ? INF
              : matrix[i][k] + matrix[k][j];

          setMessage(
            `Checking dist[${i}][${j}]: Direct = ${
              directPath === INF ? "∞" : directPath
            }, ` + `Through ${k} = ${throughK === INF ? "∞" : throughK}`
          );
          await sleep(600);

          if (throughK < directPath) {
            matrix[i][j] = throughK;
            setDist(matrix.map((row) => [...row]));

            const logMsg = `k=${k}: dist[${i}][${j}] updated ${
              directPath === INF ? "∞" : directPath
            } → ${throughK}`;
            log.push(logMsg);
            setUpdateLog([...log]);

            setMessage(
              `✅ Updated! dist[${i}][${j}] = ${throughK} (path: ${i}→${k}→${j})`
            );
            await sleep(800);
          } else {
            await sleep(300);
          }
        }
      }

      setMessage(`✅ Completed iteration with intermediate vertex ${k}`);
      await sleep(1000);
    }

    setCurrentK(-1);
    setCurrentI(-1);
    setCurrentJ(-1);
    setMessage("✅ Floyd-Warshall complete! All-pairs shortest paths found.");
    setAnimating(false);
  };

  const reset = () => {
    setDist([]);
    setCurrentK(-1);
    setCurrentI(-1);
    setCurrentJ(-1);
    setMessage("");
    setUpdateLog([]);
  };

  const handleSizeChange = (newSize: number) => {
    if (animating) return;
    setN(newSize);
    reset();
  };

  const getCellColor = (i: number, j: number) => {
    if (i === currentI && j === currentJ) return "#fbbf24"; // Current cell
    if (i === currentK || j === currentK) return "#3b82f6"; // Intermediate vertex row/col
    if (i === j) return "var(--bg)"; // Diagonal
    return "var(--panel)";
  };

  const getNodePosition = (id: number, size: number) => {
    if (size === 2) {
      const positions: Record<number, { x: number; y: number }> = {
        0: { x: 80, y: 100 },
        1: { x: 200, y: 100 },
      };
      return positions[id] || { x: 140, y: 100 };
    } else if (size === 3) {
      const positions: Record<number, { x: number; y: number }> = {
        0: { x: 120, y: 50 },
        1: { x: 60, y: 150 },
        2: { x: 180, y: 150 },
      };
      return positions[id] || { x: 120, y: 120 };
    } else {
      const positions: Record<number, { x: number; y: number }> = {
        0: { x: 60, y: 60 },
        1: { x: 180, y: 60 },
        2: { x: 180, y: 180 },
        3: { x: 60, y: 180 },
      };
      return positions[id] || { x: 120, y: 120 };
    }
  };

  // Get initial edges for graph display
  const getGraphEdges = () => {
    const initial = initializeGraph(n);
    const edges: Array<{ from: number; to: number; weight: number }> = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && initial[i][j] !== INF) {
          edges.push({ from: i, to: j, weight: initial[i][j] });
        }
      }
    }
    return edges;
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
          Floyd-Warshall Algorithm Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Graph Size Selector */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Graph Size (n vertices):
            </label>
            <div className="flex gap-2">
              {[2, 3, 4].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
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
                  n = {size}
                  <span className="text-xs ml-1">
                    ({size}x{size} = {size * size * size} iterations)
                  </span>
                </button>
              ))}
            </div>
            <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              💡 Start with n=2 or n=3 to easily follow each step!
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runFloydWarshall}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Running..." : `Run Floyd-Warshall (${n}x${n} matrix)`}
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

          {/* Current K */}
          {currentK >= 0 && (
            <div
              className="p-3 rounded text-center"
              style={{ backgroundColor: "#3b82f6", color: "white" }}
            >
              <div className="text-sm font-bold">
                Intermediate Vertex: {currentK}
              </div>
              <div className="text-xs mt-1">
                Iteration {currentK + 1} of {n} - Trying paths through vertex{" "}
                {currentK}
              </div>
            </div>
          )}

          {/* Distance Matrix */}
          {dist.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Distance Matrix:
              </label>
              <div className="overflow-x-auto">
                <table
                  className="w-full text-center text-sm mx-auto"
                  style={{
                    borderCollapse: "collapse",
                    maxWidth: n === 2 ? "250px" : n === 3 ? "300px" : "400px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        className="p-2 font-bold"
                        style={{ color: "var(--muted)", fontSize: "11px" }}
                      ></th>
                      {Array.from({ length: n }).map((_, j) => (
                        <th
                          key={j}
                          className="p-2 font-bold"
                          style={{
                            color: j === currentK ? "#3b82f6" : "var(--muted)",
                            fontSize: "11px",
                          }}
                        >
                          {j}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dist.map((row, i) => (
                      <tr key={i}>
                        <td
                          className="p-2 font-bold"
                          style={{
                            color: i === currentK ? "#3b82f6" : "var(--muted)",
                            fontSize: "11px",
                          }}
                        >
                          {i}
                        </td>
                        {row.map((val, j) => (
                          <td
                            key={j}
                            className="p-3 font-mono font-bold transition-all"
                            style={{
                              backgroundColor: getCellColor(i, j),
                              color:
                                i === currentI && j === currentJ
                                  ? "white"
                                  : "var(--fg)",
                              border: "1px solid var(--bg)",
                              fontSize:
                                n === 2 ? "18px" : n === 3 ? "16px" : "14px",
                              minWidth:
                                n === 2 ? "60px" : n === 3 ? "55px" : "50px",
                            }}
                          >
                            {val === INF ? "∞" : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="mt-3 flex gap-4 text-xs flex-wrap"
                style={{ color: "var(--fg)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "#fbbf24" }}
                  ></div>
                  <span>Checking now</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span>Intermediate vertex k</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "var(--panel)" }}
                  ></div>
                  <span>Regular cell</span>
                </div>
              </div>
            </div>
          )}

          {/* Update Log */}
          {updateLog.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Updates Log ({updateLog.length} updates):
              </label>
              <div
                className="p-3 rounded max-h-32 overflow-y-auto text-xs font-mono"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                {updateLog.map((log, idx) => (
                  <div key={idx} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Graph Visualization */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          Original Graph Structure ({n} vertices)
        </h3>
        <svg
          width={n === 2 ? "280" : "240"}
          height={n === 2 ? "200" : "240"}
          style={{ width: "100%", maxWidth: n === 2 ? "280px" : "240px" }}
        >
          <defs>
            <marker
              id="arrow-fw"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 8 2.5, 0 5" fill="var(--brand)" />
            </marker>
          </defs>

          {/* Draw edges */}
          {getGraphEdges().map((edge, idx) => {
            const fromPos = getNodePosition(edge.from, n);
            const toPos = getNodePosition(edge.to, n);

            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
            const endX = toPos.x - 18 * Math.cos(angle);
            const endY = toPos.y - 18 * Math.sin(angle);

            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;

            return (
              <g key={idx}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={endX}
                  y2={endY}
                  stroke="var(--brand)"
                  strokeWidth="2"
                  markerEnd="url(#arrow-fw)"
                  opacity="0.6"
                />
                <circle cx={midX} cy={midY - 8} r="10" fill="var(--panel)" />
                <text
                  x={midX}
                  y={midY - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--fg)"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Draw nodes */}
          {Array.from({ length: n }).map((_, node) => {
            const pos = getNodePosition(node, n);
            const isIntermediate = node === currentK;

            return (
              <g key={node}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="18"
                  fill={isIntermediate ? "#3b82f6" : "var(--panel)"}
                  stroke="var(--brand)"
                  strokeWidth="3"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isIntermediate ? "white" : "var(--fg)"}
                  fontSize="14"
                  fontWeight="600"
                >
                  {node}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-4 text-xs" style={{ color: "var(--fg)" }}>
          <p className="font-semibold mb-1">Initial edge weights:</p>
          <div className="grid grid-cols-2 gap-1 ml-2">
            {getGraphEdges().map((edge, idx) => (
              <div key={idx}>
                {edge.from} → {edge.to}: {edge.weight}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 Floyd-Warshall Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>
            • Finds shortest paths between <strong>all pairs</strong> of
            vertices
          </li>
          <li>
            • For each vertex k, tries using k as intermediate: dist[i][j] =
            min(dist[i][j], dist[i][k] + dist[k][j])
          </li>
          <li>• Works with negative weights (but not negative cycles)</li>
          <li>
            • Time: O(V³) = O({n}³) = {n * n * n} iterations for this graph
          </li>
          <li>
            • Best for: Dense graphs, all-pairs queries, small-medium graphs
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FloydWarshallVisualizer;
