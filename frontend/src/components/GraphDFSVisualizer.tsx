import React, { useState } from "react";
import SpeedControl from "./SpeedControl"; // ✅ STEP 1: Import added

interface Edge {
  from: number;
  to: number;
}

type Mode = "traverse" | "cycle" | "components";

const GraphDFSVisualizer: React.FC = () => {
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
  const [isDirected, setIsDirected] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>("traverse");
  const [startNode, setStartNode] = useState<string>("0");

  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [traversalOrder, setTraversalOrder] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<string>("");
  const [components, setComponents] = useState<number[][]>([]);
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
        if (!isDirected) {
          adj.get(to)?.push(from);
        }
      }
    });
    return adj;
  };

  // ✅ STEP 3: Updated sleep function
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const dfsTraversal = async (
    node: number,
    adj: Map<number, number[]>,
    visited: Set<number>,
    order: number[]
  ) => {
    visited.add(node);
    order.push(node);
    setVisitedNodes(new Set(visited));
    setCurrentNode(node);
    setTraversalOrder([...order]);
    await sleep(800);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        await dfsTraversal(neighbor, adj, visited, order);
      }
    }

    setCurrentNode(null);
    await sleep(300);
  };

  const detectCycleUndirected = (
    node: number,
    parent: number | null,
    adj: Map<number, number[]>,
    visited: Set<number>
  ): boolean => {
    visited.add(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (detectCycleUndirected(neighbor, node, adj, visited)) {
          return true;
        }
      } else if (neighbor !== parent) {
        return true; // Back edge found
      }
    }
    return false;
  };

  const detectCycleDirected = (
    node: number,
    adj: Map<number, number[]>,
    visited: Set<number>,
    recStack: Set<number>
  ): boolean => {
    visited.add(node);
    recStack.add(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (detectCycleDirected(neighbor, adj, visited, recStack)) {
          return true;
        }
      } else if (recStack.has(neighbor)) {
        return true; // Back edge to node in recursion stack
      }
    }

    recStack.delete(node);
    return false;
  };

  const findConnectedComponents = () => {
    const adj = buildAdjList();
    const visited = new Set<number>();
    const comps: number[][] = [];

    for (let i = 0; i < numNodes; i++) {
      if (!visited.has(i)) {
        const component: number[] = [];
        const dfsComponent = (node: number) => {
          visited.add(node);
          component.push(node);
          const neighbors = adj.get(node) || [];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              dfsComponent(neighbor);
            }
          }
        };
        dfsComponent(i);
        comps.push(component);
      }
    }

    return comps;
  };

  const handleVisualize = async () => {
    if (animating) return;
    setAnimating(true);
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setTraversalOrder([]);
    setResult("");
    setComponents([]);

    const adj = buildAdjList();

    if (mode === "traverse") {
      const start = parseInt(startNode);
      if (isNaN(start) || start < 0 || start >= numNodes) {
        setResult("❌ Invalid start node!");
        setAnimating(false);
        return;
      }

      const visited = new Set<number>();
      const order: number[] = [];
      await dfsTraversal(start, adj, visited, order);
      setResult(`✅ DFS Order: ${order.join(" → ")}`);
    } else if (mode === "cycle") {
      let hasCycle = false;

      if (isDirected) {
        const visited = new Set<number>();
        const recStack = new Set<number>();
        for (let i = 0; i < numNodes; i++) {
          if (!visited.has(i)) {
            if (detectCycleDirected(i, adj, visited, recStack)) {
              hasCycle = true;
              break;
            }
          }
        }
      } else {
        const visited = new Set<number>();
        for (let i = 0; i < numNodes; i++) {
          if (!visited.has(i)) {
            if (detectCycleUndirected(i, null, adj, visited)) {
              hasCycle = true;
              break;
            }
          }
        }
      }

      setResult(
        hasCycle ? "🔴 Cycle detected!" : "✅ No cycle (Graph is acyclic)"
      );
    } else if (mode === "components") {
      const comps = findConnectedComponents();
      setComponents(comps);
      setResult(
        `📊 Found ${comps.length} connected component${
          comps.length !== 1 ? "s" : ""
        }`
      );

      // Highlight components one by one
      for (let i = 0; i < comps.length; i++) {
        setVisitedNodes(new Set(comps[i]));
        await sleep(1000);
      }
      // Show all components
      const allNodes = new Set(comps.flat());
      setVisitedNodes(allNodes);
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
      alert("Cannot add self-loop");
      return;
    }

    const duplicate = edges.some(
      (e) =>
        (e.from === from && e.to === to) ||
        (!isDirected && e.from === to && e.to === from)
    );

    if (duplicate) {
      alert("Edge already exists!");
      return;
    }

    setEdges([...edges, { from, to }]);
    setFromNode("");
    setToNode("");
  };

  const loadExample = (type: string) => {
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setTraversalOrder([]);
    setResult("");
    setComponents([]);

    if (type === "simple") {
      setNumNodes(5);
      setIsDirected(false);
      setEdges([
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
      ]);
    } else if (type === "cycle") {
      setNumNodes(4);
      setIsDirected(false);
      setEdges([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 0 },
      ]);
    } else if (type === "components") {
      setNumNodes(6);
      setIsDirected(false);
      setEdges([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 3, to: 4 },
      ]);
    } else if (type === "dag") {
      setNumNodes(5);
      setIsDirected(true);
      setEdges([
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
      ]);
    }
  };

  const getComponentColor = (node: number): string => {
    for (let i = 0; i < components.length; i++) {
      if (components[i].includes(node)) {
        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
        return colors[i % colors.length];
      }
    }
    return "var(--brand)";
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
          DFS Visualization Controls
        </h3>

        <div className="space-y-4">
          {/* ✅ STEP 4: Speed Control Component Added */}
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
              Select Mode:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setMode("traverse")}
                className="tree-example-btn px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    mode === "traverse"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: mode === "traverse" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                DFS Traversal
              </button>
              <button
                onClick={() => setMode("cycle")}
                className="tree-example-btn px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    mode === "cycle" ? "var(--brand)" : "var(--card-hover-bg)",
                  color: mode === "cycle" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                Cycle Detection
              </button>
              <button
                onClick={() => setMode("components")}
                className="tree-example-btn px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    mode === "components"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: mode === "components" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                Connected Components
              </button>
            </div>
          </div>

          {/* Graph Settings */}
          <div className="grid md:grid-cols-2 gap-4">
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
                  setEdges(
                    edges.filter((e) => e.from < newNum && e.to < newNum)
                  );
                }}
                className="w-full"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDirected}
                  onChange={(e) => setIsDirected(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm" style={{ color: "var(--fg)" }}>
                  Directed Graph
                </span>
              </label>
            </div>
          </div>

          {/* Add Edge */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Add Edge:
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

          {/* Start Node for Traversal */}
          {mode === "traverse" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Start Node:
              </label>
              <input
                type="number"
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                min="0"
                max={numNodes - 1}
                className="w-24 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
            </div>
          )}

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
                onClick={() => loadExample("simple")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Simple Graph
              </button>
              <button
                onClick={() => loadExample("cycle")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                With Cycle
              </button>
              <button
                onClick={() => loadExample("components")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Multiple Components
              </button>
              <button
                onClick={() => loadExample("dag")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                DAG (Directed)
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
                  mode === "traverse"
                    ? "DFS"
                    : mode === "cycle"
                    ? "Cycle Detection"
                    : "Find Components"
                }`}
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

          {/* Traversal Order */}
          {traversalOrder.length > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Traversal Order:
              </p>
              <div className="flex gap-2 flex-wrap">
                {traversalOrder.map((node, idx) => (
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

          {/* Components */}
          {components.length > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Components:
              </p>
              <div className="space-y-2">
                {components.map((comp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-sm" style={{ color: "var(--fg)" }}>
                      Component {idx + 1}:
                    </span>
                    <div className="flex gap-1">
                      {comp.map((node) => (
                        <span
                          key={node}
                          className="px-2 py-1 rounded font-mono text-xs"
                          style={{
                            backgroundColor: getComponentColor(node),
                            color: "white",
                          }}
                        >
                          {node}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
          Graph Visualization
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

            if (isDirected) {
              const angle = Math.atan2(
                toPos.y - fromPos.y,
                toPos.x - fromPos.x
              );
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
            } else {
              return (
                <line
                  key={`edge-${idx}`}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="var(--brand)"
                  strokeWidth="2"
                  opacity="0.5"
                />
              );
            }
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
              if (mode === "components" && components.length > 0) {
                fillColor = getComponentColor(node);
                textColor = "white";
              } else {
                fillColor = "var(--brand)";
                textColor = "white";
              }
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
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "var(--brand)" }}
            ></div>
            <span>Visited</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 DFS Key Concepts:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Traversal:</strong> Go deep first, backtrack when stuck.
            O(V+E) time
          </li>
          <li>
            • <strong>Cycle Detection:</strong> Undirected: back edge to visited
            (not parent). Directed: back edge to recursion stack
          </li>
          <li>
            • <strong>Components:</strong> Run DFS from each unvisited node.
            Each call finds one component
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GraphDFSVisualizer;
