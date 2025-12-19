import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface Edge {
  from: number;
  to: number;
  weight: number;
}

const MSTVisualizer: React.FC = () => {
  const [nodes] = useState<number[]>([0, 1, 2, 3, 4]);
  const [edges] = useState<Edge[]>([
    { from: 0, to: 1, weight: 2 },
    { from: 0, to: 3, weight: 6 },
    { from: 1, to: 2, weight: 3 },
    { from: 1, to: 3, weight: 8 },
    { from: 1, to: 4, weight: 5 },
    { from: 2, to: 4, weight: 7 },
    { from: 3, to: 4, weight: 9 },
  ]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [algorithm, setAlgorithm] = useState<"kruskal" | "prim">("kruskal");
  const [currentEdge, setCurrentEdge] = useState<Edge | null>(null);
  const [mstEdges, setMstEdges] = useState<Set<string>>(new Set());
  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<string>("");
  const [totalWeight, setTotalWeight] = useState<number>(0);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const edgeKey = (u: number, v: number) => {
    return u < v ? `${u}-${v}` : `${v}-${u}`;
  };

  // Union-Find for Kruskal's
  class UnionFind {
    parent: number[];
    rank: number[];

    constructor(n: number) {
      this.parent = Array.from({ length: n }, (_, i) => i);
      this.rank = Array(n).fill(0);
    }

    find(x: number): number {
      if (this.parent[x] !== x) {
        this.parent[x] = this.find(this.parent[x]);
      }
      return this.parent[x];
    }

    union(x: number, y: number): boolean {
      const rootX = this.find(x);
      const rootY = this.find(y);

      if (rootX === rootY) return false;

      if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY;
      } else if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX;
      } else {
        this.parent[rootY] = rootX;
        this.rank[rootX]++;
      }
      return true;
    }
  }

  const runKruskal = async () => {
    setAnimating(true);
    setMstEdges(new Set());
    setVisitedNodes(new Set());
    setTotalWeight(0);
    setMessage("Starting Kruskal's Algorithm...");
    await sleep(1000);

    // Sort edges by weight
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    setMessage(
      `Sorted edges by weight: ${sortedEdges.map((e) => e.weight).join(", ")}`
    );
    await sleep(1500);

    const uf = new UnionFind(nodes.length);
    const mst = new Set<string>();
    let weight = 0;

    for (const edge of sortedEdges) {
      setCurrentEdge(edge);
      setMessage(
        `Checking edge (${edge.from}, ${edge.to}) with weight ${edge.weight}...`
      );
      await sleep(1200);

      if (uf.union(edge.from, edge.to)) {
        mst.add(edgeKey(edge.from, edge.to));
        weight += edge.weight;
        setMstEdges(new Set(mst));
        setTotalWeight(weight);
        setMessage(
          `✅ Added edge (${edge.from}, ${edge.to}). Total weight: ${weight}`
        );
      } else {
        setMessage(
          `❌ Skipped edge (${edge.from}, ${edge.to}) - creates cycle!`
        );
      }
      await sleep(1500);

      if (mst.size === nodes.length - 1) {
        break;
      }
    }

    setCurrentEdge(null);
    setMessage(`✅ Kruskal's complete! MST weight: ${weight}`);
    setAnimating(false);
  };

  const runPrim = async () => {
    setAnimating(true);
    setMstEdges(new Set());
    setVisitedNodes(new Set([0]));
    setTotalWeight(0);
    setMessage("Starting Prim's Algorithm from vertex 0...");
    await sleep(1000);

    // Build adjacency list
    const graph: Map<number, Array<{ to: number; weight: number }>> = new Map();
    for (const node of nodes) {
      graph.set(node, []);
    }
    for (const edge of edges) {
      graph.get(edge.from)!.push({ to: edge.to, weight: edge.weight });
      graph.get(edge.to)!.push({ to: edge.from, weight: edge.weight });
    }

    const visited = new Set<number>([0]);
    const mst = new Set<string>();
    let weight = 0;

    // Priority queue (manually maintained)
    const pq: Array<{ weight: number; from: number; to: number }> = [];
    for (const { to, weight: w } of graph.get(0)!) {
      pq.push({ weight: w, from: 0, to });
    }
    pq.sort((a, b) => a.weight - b.weight);

    while (pq.length > 0 && visited.size < nodes.length) {
      const edge = pq.shift()!;

      if (visited.has(edge.to)) continue;

      setCurrentEdge({ from: edge.from, to: edge.to, weight: edge.weight });
      setMessage(
        `Adding edge (${edge.from}, ${edge.to}) with weight ${edge.weight}...`
      );
      await sleep(1200);

      visited.add(edge.to);
      mst.add(edgeKey(edge.from, edge.to));
      weight += edge.weight;

      setVisitedNodes(new Set(visited));
      setMstEdges(new Set(mst));
      setTotalWeight(weight);
      setMessage(
        `✅ Added edge (${edge.from}, ${edge.to}). Total weight: ${weight}`
      );
      await sleep(1500);

      // Add new edges from newly visited node
      for (const { to, weight: w } of graph.get(edge.to)!) {
        if (!visited.has(to)) {
          pq.push({ weight: w, from: edge.to, to });
        }
      }
      pq.sort((a, b) => a.weight - b.weight);
    }

    setCurrentEdge(null);
    setMessage(`✅ Prim's complete! MST weight: ${weight}`);
    setAnimating(false);
  };

  const runAlgorithm = () => {
    if (algorithm === "kruskal") {
      runKruskal();
    } else {
      runPrim();
    }
  };

  const reset = () => {
    setMstEdges(new Set());
    setVisitedNodes(new Set());
    setCurrentEdge(null);
    setMessage("");
    setTotalWeight(0);
  };

  const getNodePosition = (id: number) => {
    const positions: Record<number, { x: number; y: number }> = {
      0: { x: 100, y: 50 },
      1: { x: 200, y: 120 },
      2: { x: 300, y: 50 },
      3: { x: 100, y: 200 },
      4: { x: 300, y: 200 },
    };
    return positions[id] || { x: 200, y: 125 };
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
          Minimum Spanning Tree Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Algorithm Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Select Algorithm:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAlgorithm("kruskal");
                  reset();
                }}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    algorithm === "kruskal"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: algorithm === "kruskal" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                Kruskal's (Sort Edges)
              </button>
              <button
                onClick={() => {
                  setAlgorithm("prim");
                  reset();
                }}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    algorithm === "prim"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: algorithm === "prim" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                Prim's (Grow Tree)
              </button>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runAlgorithm}
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
              : `Run ${algorithm === "kruskal" ? "Kruskal's" : "Prim's"}`}
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

          {/* Stats */}
          {totalWeight > 0 && (
            <div
              className="p-4 rounded text-center"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--brand)" }}
              >
                MST Weight: {totalWeight}
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                Edges in MST: {mstEdges.size} / {nodes.length - 1}
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
          Graph Structure
        </h3>
        <svg
          width="400"
          height="260"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          {/* Draw edges */}
          {edges.map((edge, idx) => {
            const fromPos = getNodePosition(edge.from);
            const toPos = getNodePosition(edge.to);
            const key = edgeKey(edge.from, edge.to);
            const inMST = mstEdges.has(key);
            const isCurrent =
              currentEdge && edgeKey(currentEdge.from, currentEdge.to) === key;

            let strokeColor = "var(--muted)";
            let strokeWidth = 2;

            if (inMST) {
              strokeColor = "#10b981";
              strokeWidth = 4;
            } else if (isCurrent) {
              strokeColor = "#fbbf24";
              strokeWidth = 4;
            }

            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;

            return (
              <g key={idx}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={inMST || isCurrent ? 1 : 0.3}
                />
                <circle cx={midX} cy={midY} r="12" fill="var(--panel)" />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--fg)"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const pos = getNodePosition(node);
            const isVisited = visitedNodes.has(node);

            return (
              <g key={node}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="25"
                  fill={isVisited ? "#10b981" : "var(--panel)"}
                  stroke="var(--brand)"
                  strokeWidth="3"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isVisited ? "white" : "var(--fg)"}
                  fontSize="16"
                  fontWeight="600"
                >
                  {node}
                </text>
              </g>
            );
          })}
        </svg>

        <div
          className="mt-4 flex gap-4 text-sm flex-wrap"
          style={{ color: "var(--fg)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-1"
              style={{ backgroundColor: "#10b981", height: "4px" }}
            ></div>
            <span>In MST</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-1"
              style={{ backgroundColor: "#fbbf24", height: "4px" }}
            ></div>
            <span>Checking</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-1 opacity-30"
              style={{ backgroundColor: "var(--muted)", height: "2px" }}
            ></div>
            <span>Not in MST</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 MST Algorithms:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>
            • <strong>Kruskal's:</strong> Sort edges, add smallest that doesn't
            create cycle
          </li>
          <li>
            • <strong>Prim's:</strong> Grow tree from starting vertex, always
            add cheapest edge
          </li>
          <li>• Both produce optimal MST with same total weight</li>
          <li>• Time: Kruskal O(E log E), Prim O(E log V)</li>
        </ul>
      </div>
    </div>
  );
};

export default MSTVisualizer;
