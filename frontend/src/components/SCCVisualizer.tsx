import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface Edge {
  from: number;
  to: number;
}

// Define colors OUTSIDE the component (accessible to all)
const SCC_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const SCCVisualizer: React.FC = () => {
  const [nodes] = useState<number[]>([0, 1, 2, 3, 4]);
  const [edges] = useState<Edge[]>([
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 0 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 3 },
    { from: 1, to: 3 },
  ]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [sccs, setSccs] = useState<number[][]>([]);
  const [nodeColors, setNodeColors] = useState<Map<number, string>>(new Map());
  const [message, setMessage] = useState<string>("");
  const [finishOrder, setFinishOrder] = useState<number[]>([]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const buildGraph = () => {
    const graph = new Map<number, number[]>();
    const reversed = new Map<number, number[]>();

    for (const node of nodes) {
      graph.set(node, []);
      reversed.set(node, []);
    }

    for (const edge of edges) {
      graph.get(edge.from)!.push(edge.to);
      reversed.get(edge.to)!.push(edge.from);
    }

    return { graph, reversed };
  };

  const runKosaraju = async () => {
    setAnimating(true);
    setSccs([]);
    setNodeColors(new Map());
    setFinishOrder([]);
    setMessage("Starting Kosaraju's Algorithm...");
    await sleep(1000);

    const { graph, reversed } = buildGraph();

    // Pass 1: DFS to get finish times
    setMessage("Pass 1: Computing finish times with DFS...");
    await sleep(1000);

    const visited = new Set<number>();
    const stack: number[] = [];

    const dfs1 = async (v: number) => {
      visited.add(v);
      setCurrentNode(v);
      setMessage(`Visiting node ${v}...`);
      await sleep(600);

      for (const neighbor of graph.get(v)!) {
        if (!visited.has(neighbor)) {
          await dfs1(neighbor);
        }
      }

      stack.push(v);
      setFinishOrder([...stack]);
      setMessage(`Finished node ${v}, added to stack`);
      await sleep(600);
    };

    for (const node of nodes) {
      if (!visited.has(node)) {
        await dfs1(node);
      }
    }

    setMessage(`Finish order (bottom to top): ${stack.join(" → ")}`);
    await sleep(1500);

    // Pass 2: DFS on reversed graph
    setMessage("Pass 2: DFS on reversed graph to find SCCs...");
    await sleep(1000);

    visited.clear();
    const foundSccs: number[][] = [];
    const colorMap = new Map<number, string>();

    const dfs2 = async (v: number, component: number[]) => {
      visited.add(v);
      component.push(v);
      setCurrentNode(v);
      setMessage(`Adding node ${v} to current SCC...`);
      await sleep(600);

      for (const neighbor of reversed.get(v)!) {
        if (!visited.has(neighbor)) {
          await dfs2(neighbor, component);
        }
      }
    };

    while (stack.length > 0) {
      const v = stack.pop()!;
      if (!visited.has(v)) {
        const component: number[] = [];
        await dfs2(v, component);

        const color = SCC_COLORS[foundSccs.length % SCC_COLORS.length]; // ✅ USE SCC_COLORS
        for (const node of component) {
          colorMap.set(node, color);
        }

        foundSccs.push(component);
        setSccs([...foundSccs]);
        setNodeColors(new Map(colorMap));
        setMessage(
          `Found SCC ${foundSccs.length}: {${component.sort().join(", ")}}`
        );
        await sleep(1500);
      }
    }

    setCurrentNode(null);
    setMessage(`✅ Found ${foundSccs.length} strongly connected components!`);
    setAnimating(false);
  };

  const reset = () => {
    setSccs([]);
    setNodeColors(new Map());
    setCurrentNode(null);
    setMessage("");
    setFinishOrder([]);
  };

  const getNodePosition = (id: number) => {
    const positions: Record<number, { x: number; y: number }> = {
      0: { x: 80, y: 80 },
      1: { x: 200, y: 80 },
      2: { x: 140, y: 160 },
      3: { x: 280, y: 120 },
      4: { x: 320, y: 200 },
    };
    return positions[id] || { x: 200, y: 140 };
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
          Strongly Connected Components (Kosaraju's Algorithm)
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Run Button */}
          <button
            onClick={runKosaraju}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Running..." : "Run Kosaraju's Algorithm"}
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

          {/* Finish Order */}
          {finishOrder.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Finish Time Order:
              </label>
              <div
                className="p-3 rounded text-sm font-mono"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                {finishOrder.join(" → ")}
              </div>
            </div>
          )}

          {/* SCCs Found */}
          {sccs.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Strongly Connected Components Found: {sccs.length}
              </label>
              <div className="space-y-2">
                {sccs.map((scc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded text-sm font-medium"
                    style={{
                      backgroundColor: SCC_COLORS[idx % SCC_COLORS.length], // ✅ USE SCC_COLORS
                      color: "white",
                    }}
                  >
                    SCC {idx + 1}: {"{"}
                    {scc.sort((a, b) => a - b).join(", ")}
                    {"}"}
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
          Directed Graph
        </h3>
        <svg
          width="400"
          height="280"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          {/* Draw edges with arrows */}
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="var(--brand)" />
            </marker>
          </defs>

          {edges.map((edge, idx) => {
            const fromPos = getNodePosition(edge.from);
            const toPos = getNodePosition(edge.to);

            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
            const endX = toPos.x - 25 * Math.cos(angle);
            const endY = toPos.y - 25 * Math.sin(angle);

            return (
              <line
                key={idx}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={endX}
                y2={endY}
                stroke="var(--brand)"
                strokeWidth="2"
                markerEnd="url(#arrow)"
                opacity="0.6"
              />
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const pos = getNodePosition(node);
            const isCurrent = currentNode === node;
            const nodeColor = nodeColors.get(node);

            let fillColor = "var(--panel)";
            let strokeColor = "var(--brand)";

            if (nodeColor) {
              fillColor = nodeColor;
              strokeColor = nodeColor;
            } else if (isCurrent) {
              fillColor = "#fbbf24";
            }

            return (
              <g key={node}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="22"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="3"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={nodeColor || isCurrent ? "white" : "var(--fg)"}
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
          <p className="font-semibold mb-2">Graph Structure:</p>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Cycle 1: 0 → 1 → 2 → 0</li>
            <li>• Cycle 2: 3 → 4 → 3</li>
            <li>• Connection: 2 → 3, 1 → 3</li>
          </ul>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 Kosaraju's Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Pass 1: DFS on original graph to get finish times</li>
          <li>• Pass 2: DFS on reversed graph in finish time order</li>
          <li>• Each DFS tree in pass 2 is one SCC</li>
          <li>• Time: O(V + E), Space: O(V)</li>
        </ul>
      </div>
    </div>
  );
};

export default SCCVisualizer;
