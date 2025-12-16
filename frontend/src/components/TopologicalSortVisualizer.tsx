import React, { useState } from "react";
import SpeedControl from "./SpeedControl"; // ✅ STEP 1: Import added

interface Edge {
  from: number;
  to: number;
}

type Algorithm = "kahn" | "dfs";

const TopologicalSortVisualizer: React.FC = () => {
  const [numNodes, setNumNodes] = useState<number>(5);
  const [edges, setEdges] = useState<Edge[]>([
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
  ]);
  const [fromNode, setFromNode] = useState<string>("");
  const [toNode, setToNode] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("kahn");

  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [result, setResult] = useState<number[]>([]);
  const [inDegrees, setInDegrees] = useState<Map<number, number>>(new Map());
  const [queueState, setQueueState] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // ✅ STEP 2: State added

  const getNodePositions = (n: number) => {
    const positions = [];
    const centerX = 200;
    const centerY = 175;
    const radius = 100;

    for (let i = 0; i < n; i++) {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    return positions;
  };

  const nodePositions = getNodePositions(numNodes);

  const buildAdjList = () => {
    const adj = new Map<number, number[]>();
    for (let i = 0; i < numNodes; i++) {
      adj.set(i, []);
    }
    edges.forEach(({ from, to }) => {
      if (from < numNodes && to < numNodes) {
        adj.get(from)?.push(to);
      }
    });
    return adj;
  };

  const calculateInDegrees = () => {
    const inDeg = new Map<number, number>();
    for (let i = 0; i < numNodes; i++) {
      inDeg.set(i, 0);
    }
    edges.forEach(({ to }) => {
      if (to < numNodes) {
        inDeg.set(to, (inDeg.get(to) || 0) + 1);
      }
    });
    return inDeg;
  };

  // ✅ STEP 3: Updated sleep function
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const kahnAlgorithm = async (adj: Map<number, number[]>) => {
    const inDeg = calculateInDegrees();
    setInDegrees(new Map(inDeg));

    // Find all nodes with in-degree 0
    const queue: number[] = [];
    for (let i = 0; i < numNodes; i++) {
      if (inDeg.get(i) === 0) {
        queue.push(i);
      }
    }

    const order: number[] = [];
    const visited = new Set<number>();

    await sleep(500);

    while (queue.length > 0) {
      setQueueState([...queue]);
      await sleep(800);

      const node = queue.shift()!;
      order.push(node);
      visited.add(node);

      setCurrentNode(node);
      setResult([...order]);
      setVisitedNodes(new Set(visited));
      await sleep(600);

      // Process neighbors
      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        inDeg.set(neighbor, inDeg.get(neighbor)! - 1);
        setInDegrees(new Map(inDeg));
        await sleep(300);

        if (inDeg.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }

      setCurrentNode(null);
      await sleep(200);
    }

    setQueueState([]);

    // Check for cycle
    if (order.length !== numNodes) {
      return { order: null, hasCycle: true };
    }

    return { order, hasCycle: false };
  };

  const dfsTopologicalSort = async (adj: Map<number, number[]>) => {
    const visited = new Set<number>();
    const recStack = new Set<number>();
    const order: number[] = [];

    const dfs = async (node: number): Promise<boolean> => {
      if (recStack.has(node)) {
        return false; // Cycle detected
      }

      if (visited.has(node)) {
        return true;
      }

      visited.add(node);
      recStack.add(node);
      setVisitedNodes(new Set(visited));
      setCurrentNode(node);
      await sleep(600);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!(await dfs(neighbor))) {
          return false;
        }
      }

      recStack.delete(node);
      order.push(node);
      setResult([...order].reverse());
      setCurrentNode(null);
      await sleep(400);

      return true;
    };

    for (let i = 0; i < numNodes; i++) {
      if (!visited.has(i)) {
        if (!(await dfs(i))) {
          return { order: null, hasCycle: true };
        }
      }
    }

    return { order: order.reverse(), hasCycle: false };
  };

  const handleVisualize = async () => {
    if (animating) return;

    setAnimating(true);
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setResult([]);
    setInDegrees(new Map());
    setQueueState([]);
    setMessage("");

    const adj = buildAdjList();

    let orderResult;
    if (algorithm === "kahn") {
      orderResult = await kahnAlgorithm(adj);
    } else {
      orderResult = await dfsTopologicalSort(adj);
    }

    if (orderResult.hasCycle) {
      setMessage("❌ Cycle detected! No topological ordering possible.");
    } else {
      setMessage(
        `✅ Valid topological order found!\nOrder: ${orderResult.order!.join(
          " → "
        )}`
      );
    }

    setAnimating(false);
  };

  const handleAddEdge = () => {
    const from = parseInt(fromNode);
    const to = parseInt(toNode);

    if (isNaN(from) || isNaN(to)) {
      alert("Please enter valid numbers");
      return;
    }

    if (from < 0 || from >= numNodes || to < 0 || to >= numNodes) {
      alert(`Nodes must be between 0 and ${numNodes - 1}`);
      return;
    }

    if (from === to) {
      alert("Cannot add self-loop (creates cycle)");
      return;
    }

    const duplicate = edges.some((e) => e.from === from && e.to === to);

    if (duplicate) {
      alert("Edge already exists!");
      return;
    }

    setEdges([...edges, { from, to }]);
    setFromNode("");
    setToNode("");
  };

  const handleRemoveEdge = (index: number) => {
    setEdges(edges.filter((_, i) => i !== index));
  };

  const loadExample = (type: string) => {
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setResult([]);
    setInDegrees(new Map());
    setQueueState([]);
    setMessage("");

    if (type === "courses") {
      setNumNodes(5);
      setEdges([
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
      ]);
    } else if (type === "complex") {
      setNumNodes(6);
      setEdges([
        { from: 5, to: 2 },
        { from: 5, to: 0 },
        { from: 4, to: 0 },
        { from: 4, to: 1 },
        { from: 2, to: 3 },
        { from: 3, to: 1 },
      ]);
    } else if (type === "cycle") {
      setNumNodes(4);
      setEdges([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 1 }, // Creates cycle
      ]);
    } else if (type === "linear") {
      setNumNodes(5);
      setEdges([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
      ]);
    }
  };

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
          Topological Sort Controls
        </h3>

        <div className="space-y-4">
          {/* ✅ STEP 4: Speed Control Component Added */}
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setAlgorithm("kahn")}
                className="tree-example-btn px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    algorithm === "kahn"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: algorithm === "kahn" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                Kahn's (BFS)
              </button>
              <button
                onClick={() => setAlgorithm("dfs")}
                className="tree-example-btn px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    algorithm === "dfs"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: algorithm === "dfs" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                DFS-based
              </button>
            </div>
          </div>

          {/* Graph Settings */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Number of Nodes: {numNodes}
            </label>
            <input
              type="range"
              min="3"
              max="8"
              value={numNodes}
              onChange={(e) => {
                const newNum = parseInt(e.target.value);
                setNumNodes(newNum);
                setEdges(edges.filter((e) => e.from < newNum && e.to < newNum));
              }}
              className="w-full"
            />
          </div>

          {/* Add Edge */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Add Directed Edge (u → v):
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={fromNode}
                onChange={(e) => setFromNode(e.target.value)}
                placeholder="From"
                min="0"
                max={numNodes - 1}
                className="w-20 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <span style={{ color: "var(--fg)" }}>→</span>
              <input
                type="number"
                value={toNode}
                onChange={(e) => setToNode(e.target.value)}
                placeholder="To"
                min="0"
                max={numNodes - 1}
                className="w-20 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <button
                onClick={handleAddEdge}
                className="build-tree-btn px-4 py-2 rounded text-sm"
                style={{ backgroundColor: "var(--brand)", color: "white" }}
              >
                Add
              </button>
            </div>
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
                onClick={() => loadExample("courses")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Course Schedule
              </button>
              <button
                onClick={() => loadExample("complex")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Complex DAG
              </button>
              <button
                onClick={() => loadExample("linear")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Linear Chain
              </button>
              <button
                onClick={() => loadExample("cycle")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                }}
              >
                With Cycle ⚠️
              </button>
            </div>
          </div>

          {/* Visualize Button */}
          <button
            onClick={handleVisualize}
            disabled={animating}
            className="build-tree-btn px-6 py-2 rounded font-medium w-full"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating
              ? "Running..."
              : `Run ${
                  algorithm === "kahn"
                    ? "Kahn's Algorithm"
                    : "DFS Topological Sort"
                }`}
          </button>

          {/* Result */}
          {message && (
            <div
              className="p-4 rounded text-sm font-medium whitespace-pre-line"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
          )}

          {/* Queue State (Kahn's) */}
          {algorithm === "kahn" && queueState.length > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Queue (nodes with in-degree 0):
              </p>
              <div className="flex gap-2 flex-wrap">
                {queueState.map((node, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded font-mono text-sm"
                    style={{ backgroundColor: "#10b981", color: "white" }}
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* In-degrees (Kahn's) */}
          {algorithm === "kahn" && inDegrees.size > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                In-degrees:
              </p>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: numNodes }, (_, i) => i).map((node) => (
                  <span
                    key={node}
                    className="px-3 py-1 rounded font-mono text-sm"
                    style={{
                      backgroundColor:
                        inDegrees.get(node) === 0 ? "#10b981" : "var(--brand)",
                      color: "white",
                    }}
                  >
                    {node}: {inDegrees.get(node) || 0}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Result Order */}
          {result.length > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Current Topological Order:
              </p>
              <div className="flex gap-2 flex-wrap">
                {result.map((node, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded font-mono text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Edge List */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Current Edges:
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {edges.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  No edges yet
                </p>
              ) : (
                edges.map((edge, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm p-2 rounded"
                    style={{ backgroundColor: "var(--bg)" }}
                  >
                    <span className="font-mono" style={{ color: "var(--fg)" }}>
                      {edge.from} → {edge.to}
                    </span>
                    <button
                      onClick={() => handleRemoveEdge(idx)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: "#ef4444", color: "white" }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
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
          Directed Acyclic Graph (DAG)
        </h3>
        <svg
          width="400"
          height="350"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          {/* Edges */}
          {edges.map((edge, idx) => {
            if (edge.from >= numNodes || edge.to >= numNodes) return null;
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            if (!fromPos || !toPos) return null;

            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
            const endX = toPos.x - Math.cos(angle) * 30;
            const endY = toPos.y - Math.sin(angle) * 30;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={endX}
                  y2={endY}
                  stroke="var(--brand)"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <polygon
                  points={`${endX},${endY} ${
                    endX - 10 * Math.cos(angle - Math.PI / 6)
                  },${endY - 10 * Math.sin(angle - Math.PI / 6)} ${
                    endX - 10 * Math.cos(angle + Math.PI / 6)
                  },${endY - 10 * Math.sin(angle + Math.PI / 6)}`}
                  fill="var(--brand)"
                  opacity="0.5"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {Array.from({ length: numNodes }, (_, i) => i).map((node) => {
            const pos = nodePositions[node];
            if (!pos) return null;

            const isVisited = visitedNodes.has(node);
            const isCurrent = currentNode === node;

            let fillColor = "var(--panel)";
            let strokeColor = "var(--brand)";
            let textColor = "var(--fg)";

            if (isCurrent) {
              fillColor = "#fbbf24";
              strokeColor = "#f59e0b";
              textColor = "white";
            } else if (isVisited) {
              fillColor = "var(--brand)";
              textColor = "white";
            }

            return (
              <g key={`node-${node}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="25"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                  style={{ transition: "all 0.3s ease" }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
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
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: "var(--panel)",
                border: "2px solid var(--brand)",
              }}
            ></div>
            <span>Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#fbbf24" }}
            ></div>
            <span>Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "var(--brand)" }}
            ></div>
            <span>Processed</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Topological Sort:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Kahn's (BFS):</strong> Start with 0 in-degree nodes,
            process dependencies level-by-level
          </li>
          <li>
            • <strong>DFS:</strong> Visit all descendants first, add node to
            result in post-order, then reverse
          </li>
          <li>
            • <strong>Cycle Detection:</strong> Kahn's: not all nodes processed.
            DFS: node in recursion stack
          </li>
          <li>
            • <strong>Applications:</strong> Course scheduling, build systems,
            package dependencies, task ordering
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TopologicalSortVisualizer;
