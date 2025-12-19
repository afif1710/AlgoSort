import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface Edge {
  from: number;
  to: number;
  weight: number;
}

interface GraphConfig {
  nodes: number[];
  edges: Edge[];
  hasNegativeCycle: boolean;
}

const BellmanFordVisualizer: React.FC = () => {
  const [graphSize, setGraphSize] = useState<number>(3);
  const [graphType, setGraphType] = useState<"normal" | "negative-cycle">(
    "normal"
  );
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [distances, setDistances] = useState<number[]>([]);
  const [currentEdge, setCurrentEdge] = useState<Edge | null>(null);
  const [iteration, setIteration] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [relaxationLog, setRelaxationLog] = useState<string[]>([]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  // Generate graph configurations
  const getGraphConfig = (
    size: number,
    type: "normal" | "negative-cycle"
  ): GraphConfig => {
    if (type === "negative-cycle") {
      // Negative cycle graphs
      if (size === 2) {
        return {
          nodes: [0, 1],
          edges: [
            { from: 0, to: 1, weight: 1 },
            { from: 1, to: 0, weight: -2 }, // Creates negative cycle
          ],
          hasNegativeCycle: true,
        };
      } else if (size === 3) {
        return {
          nodes: [0, 1, 2],
          edges: [
            { from: 0, to: 1, weight: 1 },
            { from: 1, to: 2, weight: -1 },
            { from: 2, to: 0, weight: -1 }, // Cycle 0→1→2→0 = -1 (negative!)
          ],
          hasNegativeCycle: true,
        };
      } else {
        return {
          nodes: [0, 1, 2, 3],
          edges: [
            { from: 0, to: 1, weight: 2 },
            { from: 1, to: 2, weight: 3 },
            { from: 2, to: 3, weight: -1 },
            { from: 3, to: 1, weight: -5 }, // Cycle 1→2→3→1 = -3 (negative!)
          ],
          hasNegativeCycle: true,
        };
      }
    } else {
      // Normal graphs (no negative cycles)
      if (size === 2) {
        return {
          nodes: [0, 1],
          edges: [
            { from: 0, to: 1, weight: 5 },
            { from: 1, to: 0, weight: 3 },
          ],
          hasNegativeCycle: false,
        };
      } else if (size === 3) {
        return {
          nodes: [0, 1, 2],
          edges: [
            { from: 0, to: 1, weight: 4 },
            { from: 1, to: 2, weight: 3 },
            { from: 0, to: 2, weight: 8 },
            { from: 2, to: 1, weight: -2 }, // Negative edge but no cycle
          ],
          hasNegativeCycle: false,
        };
      } else {
        return {
          nodes: [0, 1, 2, 3],
          edges: [
            { from: 0, to: 1, weight: 4 },
            { from: 0, to: 2, weight: 5 },
            { from: 1, to: 2, weight: -3 },
            { from: 2, to: 3, weight: 2 },
          ],
          hasNegativeCycle: false,
        };
      }
    }
  };

  const currentGraph = getGraphConfig(graphSize, graphType);

  const runBellmanFord = async () => {
    setAnimating(true);
    setRelaxationLog([]);
    const source = 0;
    const n = currentGraph.nodes.length;
    const dist = Array(n).fill(Infinity);
    dist[source] = 0;
    setDistances([...dist]);
    setMessage(`Starting Bellman-Ford from vertex ${source}...`);
    await sleep(1000);

    const log: string[] = [];

    // Relax edges n-1 times
    for (let i = 0; i < n - 1; i++) {
      setIteration(i + 1);
      setMessage(`Iteration ${i + 1}/${n - 1}: Relaxing all edges...`);
      await sleep(800);

      let updated = false;

      for (const edge of currentGraph.edges) {
        setCurrentEdge(edge);
        await sleep(600);

        if (
          dist[edge.from] !== Infinity &&
          dist[edge.from] + edge.weight < dist[edge.to]
        ) {
          const oldDist = dist[edge.to];
          dist[edge.to] = dist[edge.from] + edge.weight;
          updated = true;

          const logMsg = `Iter ${i + 1}: Relax (${edge.from}→${
            edge.to
          }): dist[${edge.to}] = ${oldDist === Infinity ? "∞" : oldDist} → ${
            dist[edge.to]
          }`;
          log.push(logMsg);
          setRelaxationLog([...log]);
          setDistances([...dist]);
          setMessage(
            `Relaxed edge (${edge.from}, ${edge.to}): dist[${edge.to}] = ${
              dist[edge.to]
            }`
          );
          await sleep(1000);
        }
      }

      setCurrentEdge(null);

      if (!updated) {
        setMessage(`No updates in iteration ${i + 1}. Converged early! ✅`);
        await sleep(1500);
        break;
      }
    }

    // Check for negative cycle
    setMessage("Checking for negative cycles...");
    await sleep(1000);

    let hasNegativeCycle = false;
    for (const edge of currentGraph.edges) {
      setCurrentEdge(edge);
      await sleep(500);

      if (
        dist[edge.from] !== Infinity &&
        dist[edge.from] + edge.weight < dist[edge.to]
      ) {
        hasNegativeCycle = true;
        setMessage(
          `❌ Negative cycle detected via edge (${edge.from}, ${edge.to})!`
        );
        log.push(
          `NEGATIVE CYCLE: Edge (${edge.from}→${edge.to}) still decreases distance!`
        );
        setRelaxationLog([...log]);
        await sleep(2000);
        break;
      }
    }

    setCurrentEdge(null);

    if (!hasNegativeCycle) {
      setMessage(`✅ Bellman-Ford complete! No negative cycles.`);
    }

    setAnimating(false);
  };

  const reset = () => {
    setDistances([]);
    setCurrentEdge(null);
    setIteration(0);
    setMessage("");
    setRelaxationLog([]);
  };

  const handleSizeChange = (size: number) => {
    if (animating) return;
    setGraphSize(size);
    reset();
  };

  const handleTypeChange = (type: "normal" | "negative-cycle") => {
    if (animating) return;
    setGraphType(type);
    reset();
  };

  const getNodePosition = (id: number, size: number) => {
    if (size === 2) {
      const positions: Record<number, { x: number; y: number }> = {
        0: { x: 100, y: 100 },
        1: { x: 300, y: 100 },
      };
      return positions[id] || { x: 200, y: 100 };
    } else if (size === 3) {
      const positions: Record<number, { x: number; y: number }> = {
        0: { x: 80, y: 100 },
        1: { x: 200, y: 50 },
        2: { x: 200, y: 150 },
      };
      return positions[id] || { x: 160, y: 100 };
    } else {
      const positions: Record<number, { x: number; y: number }> = {
        0: { x: 80, y: 100 },
        1: { x: 200, y: 50 },
        2: { x: 200, y: 150 },
        3: { x: 320, y: 100 },
      };
      return positions[id] || { x: 200, y: 100 };
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
          Bellman-Ford Algorithm Visualizer
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
                      graphSize === size
                        ? "var(--brand)"
                        : "var(--card-hover-bg)",
                    color: graphSize === size ? "white" : "var(--fg)",
                    cursor: animating ? "not-allowed" : "pointer",
                    border: "2px solid var(--brand)",
                  }}
                >
                  n = {size}
                  <span className="text-xs ml-1">({size - 1} iterations)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Graph Type Selector */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Graph Type:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleTypeChange("normal")}
                disabled={animating}
                className="flex-1 px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    graphType === "normal" ? "#10b981" : "var(--card-hover-bg)",
                  color: graphType === "normal" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                  border: "2px solid #10b981",
                }}
              >
                Normal Graph ✅
              </button>
              <button
                onClick={() => handleTypeChange("negative-cycle")}
                disabled={animating}
                className="flex-1 px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    graphType === "negative-cycle"
                      ? "#ef4444"
                      : "var(--card-hover-bg)",
                  color: graphType === "negative-cycle" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                  border: "2px solid #ef4444",
                }}
              >
                Negative Cycle ⚠️
              </button>
            </div>
            <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              {graphType === "normal"
                ? "✅ No negative cycles - algorithm will find shortest paths"
                : "⚠️ Contains negative cycle - algorithm will detect it!"}
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runBellmanFord}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating
              ? "Running..."
              : `Run Bellman-Ford (${graphSize} vertices)`}
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

          {/* Current Iteration */}
          {iteration > 0 && (
            <div
              className="p-3 rounded text-center"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <div
                className="text-lg font-bold"
                style={{ color: "var(--brand)" }}
              >
                Iteration: {iteration} / {currentGraph.nodes.length - 1}
              </div>
            </div>
          )}

          {/* Distances Table */}
          {distances.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Current Distances from Source (vertex 0):
              </label>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${currentGraph.nodes.length}, minmax(0, 1fr))`,
                }}
              >
                {currentGraph.nodes.map((node) => (
                  <div
                    key={node}
                    className="p-3 rounded text-center"
                    style={{ backgroundColor: "var(--bg)" }}
                  >
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      Vertex {node}
                    </div>
                    <div
                      className="text-lg font-bold font-mono"
                      style={{ color: "var(--fg)" }}
                    >
                      {distances[node] === Infinity ? "∞" : distances[node]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relaxation Log */}
          {relaxationLog.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Relaxation Log ({relaxationLog.length} events):
              </label>
              <div
                className="p-3 rounded max-h-32 overflow-y-auto text-xs font-mono"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                {relaxationLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="mb-1"
                    style={{
                      color: log.includes("NEGATIVE CYCLE")
                        ? "#ef4444"
                        : "var(--fg)",
                      fontWeight: log.includes("NEGATIVE CYCLE")
                        ? "bold"
                        : "normal",
                    }}
                  >
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
          Graph Structure ({graphSize} vertices, {currentGraph.edges.length}{" "}
          edges)
        </h3>
        <svg
          width="400"
          height="200"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          {/* Draw edges with arrows */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="var(--brand)" />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#fbbf24" />
            </marker>
          </defs>

          {currentGraph.edges.map((edge, idx) => {
            const fromPos = getNodePosition(edge.from, graphSize);
            const toPos = getNodePosition(edge.to, graphSize);
            const isCurrent =
              currentEdge &&
              currentEdge.from === edge.from &&
              currentEdge.to === edge.to;

            const strokeColor = isCurrent ? "#fbbf24" : "var(--brand)";
            const strokeWidth = isCurrent ? 3 : 2;
            const marker = isCurrent
              ? "url(#arrowhead-active)"
              : "url(#arrowhead)";

            // Calculate midpoint for weight label
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;

            // Offset arrow end to not overlap with node
            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
            const endX = toPos.x - 25 * Math.cos(angle);
            const endY = toPos.y - 25 * Math.sin(angle);

            return (
              <g key={idx}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={endX}
                  y2={endY}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                />
                <circle cx={midX} cy={midY - 10} r="12" fill="var(--panel)" />
                <text
                  x={midX}
                  y={midY - 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={edge.weight < 0 ? "#ef4444" : "var(--fg)"}
                  fontSize="11"
                  fontWeight="bold"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Draw nodes */}
          {currentGraph.nodes.map((node) => {
            const pos = getNodePosition(node, graphSize);

            return (
              <g key={node}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="22"
                  fill={node === 0 ? "#10b981" : "var(--panel)"}
                  stroke="var(--brand)"
                  strokeWidth="3"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={node === 0 ? "white" : "var(--fg)"}
                  fontSize="16"
                  fontWeight="600"
                >
                  {node}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-4 text-sm" style={{ color: "var(--fg)" }}>
          <p className="mb-1">
            <span style={{ color: "#10b981" }}>●</span> Source vertex (0)
          </p>
          <p className="mb-1">
            <span style={{ color: "#ef4444" }}>●</span> Negative weight edge
          </p>
          {graphType === "negative-cycle" && (
            <p
              className="mt-2 text-xs p-2 rounded"
              style={{ backgroundColor: "#ef444420" }}
            >
              ⚠️ This graph contains a negative cycle! The algorithm will detect
              it during the V-th iteration check.
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 Bellman-Ford Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Handles negative edge weights (unlike Dijkstra)</li>
          <li>• Relaxes all edges V-1 times to find shortest paths</li>
          <li>• Detects negative cycles with V-th iteration check</li>
          <li>
            • Time: O(VE) = O({graphSize} × {currentGraph.edges.length}) for
            this graph
          </li>
          <li>• Space: O(V) = O({graphSize})</li>
        </ul>
      </div>
    </div>
  );
};

export default BellmanFordVisualizer;
