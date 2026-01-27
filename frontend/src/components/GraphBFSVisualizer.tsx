import React, { useState } from "react";
import SpeedControl from "./SpeedControl"; // ✅ STEP 1: Import added

interface Edge {
  from: number;
  to: number;
}

type Mode = "traverse" | "shortest" | "bipartite";

const GraphBFSVisualizer: React.FC = () => {
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
  const [endNode, setEndNode] = useState<string>("4");

  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [currentLevel, setCurrentLevel] = useState<Set<number>>(new Set());
  const [traversalOrder, setTraversalOrder] = useState<number[]>([]);
  const [queueState, setQueueState] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<string>("");
  const [pathEdges, setPathEdges] = useState<Set<string>>(new Set());
  const [nodeColors, setNodeColors] = useState<Map<number, number>>(new Map());
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

  const bfsTraversal = async (start: number, adj: Map<number, number[]>) => {
    const visited = new Set<number>();
    const queue: number[] = [start];
    const order: number[] = [];

    visited.add(start);

    while (queue.length > 0) {
      setQueueState([...queue]);
      await sleep(800);

      const levelSize = queue.length;
      const currentLevelNodes = new Set<number>();

      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift()!;
        order.push(node);
        currentLevelNodes.add(node);

        setCurrentLevel(new Set(currentLevelNodes));
        setTraversalOrder([...order]);
        setVisitedNodes(new Set(visited));
        await sleep(600);

        const neighbors = adj.get(node) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      await sleep(400);
    }

    setQueueState([]);
    setCurrentLevel(new Set());
    return order;
  };

  const findShortestPath = (
    start: number,
    end: number,
    adj: Map<number, number[]>
  ): number[] | null => {
    if (start === end) return [start];

    const visited = new Set<number>([start]);
    const queue: number[] = [start];
    const parent = new Map<number, number>();
    parent.set(start, -1);

    while (queue.length > 0) {
      const node = queue.shift()!;

      if (node === end) {
        // Reconstruct path
        const path: number[] = [];
        let current = end;
        while (current !== -1) {
          path.unshift(current);
          current = parent.get(current)!;
        }
        return path;
      }

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, node);
          queue.push(neighbor);
        }
      }
    }

    return null; // No path
  };

  const checkBipartite = (
    adj: Map<number, number[]>
  ): { isBipartite: boolean; coloring: Map<number, number> } => {
    const color = new Map<number, number>();

    for (let start = 0; start < numNodes; start++) {
      if (!color.has(start)) {
        const queue: number[] = [start];
        color.set(start, 0);

        while (queue.length > 0) {
          const node = queue.shift()!;
          const currentColor = color.get(node)!;

          const neighbors = adj.get(node) || [];
          for (const neighbor of neighbors) {
            if (!color.has(neighbor)) {
              color.set(neighbor, 1 - currentColor);
              queue.push(neighbor);
            } else if (color.get(neighbor) === currentColor) {
              return { isBipartite: false, coloring: color };
            }
          }
        }
      }
    }

    return { isBipartite: true, coloring: color };
  };

  const handleVisualize = async () => {
    if (animating) return;
    setAnimating(true);
    setVisitedNodes(new Set());
    setCurrentLevel(new Set());
    setTraversalOrder([]);
    setQueueState([]);
    setResult("");
    setPathEdges(new Set());
    setNodeColors(new Map());

    const adj = buildAdjList();

    if (mode === "traverse") {
      const start = parseInt(startNode);
      if (isNaN(start) || start < 0 || start >= numNodes) {
        setResult("❌ Invalid start node!");
        setAnimating(false);
        return;
      }

      const order = await bfsTraversal(start, adj);
      setResult(`✅ BFS Order: ${order.join(" → ")}`);
    } else if (mode === "shortest") {
      const start = parseInt(startNode);
      const end = parseInt(endNode);

      if (
        isNaN(start) ||
        start < 0 ||
        start >= numNodes ||
        isNaN(end) ||
        end < 0 ||
        end >= numNodes
      ) {
        setResult("❌ Invalid nodes!");
        setAnimating(false);
        return;
      }

      const path = findShortestPath(start, end, adj);

      if (path) {
        setVisitedNodes(new Set(path));
        setTraversalOrder(path);

        // Highlight path edges
        const pathEdgesSet = new Set<string>();
        for (let i = 0; i < path.length - 1; i++) {
          pathEdgesSet.add(`${path[i]}-${path[i + 1]}`);
          if (!isDirected) {
            pathEdgesSet.add(`${path[i + 1]}-${path[i]}`);
          }
        }
        setPathEdges(pathEdgesSet);

        setResult(
          `✅ Shortest path (${path.length - 1} edges): ${path.join(" → ")}`
        );
      } else {
        setResult(`❌ No path exists from ${start} to ${end}`);
      }
    } else if (mode === "bipartite") {
      const { isBipartite, coloring } = checkBipartite(adj);
      setNodeColors(coloring);
      setVisitedNodes(new Set(Array.from({ length: numNodes }, (_, i) => i)));

      if (isBipartite) {
        setResult("✅ Graph is BIPARTITE! Can be colored with 2 colors.");
      } else {
        setResult("❌ Graph is NOT bipartite (contains odd-length cycle)");
      }
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
    setCurrentLevel(new Set());
    setTraversalOrder([]);
    setQueueState([]);
    setResult("");
    setPathEdges(new Set());
    setNodeColors(new Map());

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
    } else if (type === "bipartite-yes") {
      setNumNodes(4);
      setIsDirected(false);
      setEdges([
        { from: 0, to: 1 },
        { from: 0, to: 3 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ]);
    } else if (type === "bipartite-no") {
      setNumNodes(3);
      setIsDirected(false);
      setEdges([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 0 },
      ]);
    } else if (type === "grid") {
      setNumNodes(6);
      setIsDirected(false);
      setEdges([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 0, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
      ]);
    }
  };

  const getNodeColor = (
    node: number
  ): { fill: string; stroke: string; text: string } => {
    if (mode === "bipartite" && nodeColors.has(node)) {
      const color = nodeColors.get(node);
      if (color === 0) {
        return { fill: "#3b82f6", stroke: "#2563eb", text: "white" };
      } else {
        return { fill: "#10b981", stroke: "#059669", text: "white" };
      }
    }

    if (currentLevel.has(node)) {
      return { fill: "#fbbf24", stroke: "#f59e0b", text: "white" };
    }

    if (visitedNodes.has(node)) {
      return { fill: "var(--brand)", stroke: "var(--brand)", text: "white" };
    }

    return { fill: "var(--panel)", stroke: "var(--brand)", text: "var(--fg)" };
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
          BFS Visualization Controls
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
                BFS Traversal
              </button>
              <button
                onClick={() => setMode("shortest")}
                className="tree-example-btn px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    mode === "shortest"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: mode === "shortest" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                Shortest Path
              </button>
              <button
                onClick={() => setMode("bipartite")}
                className="tree-example-btn px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    mode === "bipartite"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: mode === "bipartite" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                Bipartite Check
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

          {/* Node Inputs */}
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

          {mode === "shortest" && (
            <div className="flex gap-4">
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
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  End Node:
                </label>
                <input
                  type="number"
                  value={endNode}
                  onChange={(e) => setEndNode(e.target.value)}
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
                onClick={() => loadExample("bipartite-yes")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Bipartite (Yes)
              </button>
              <button
                onClick={() => loadExample("bipartite-no")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Bipartite (No)
              </button>
              <button
                onClick={() => loadExample("grid")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Grid Graph
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
                    ? "BFS"
                    : mode === "shortest"
                    ? "Shortest Path"
                    : "Bipartite Check"
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

          {/* Queue State */}
          {queueState.length > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Queue State:
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

          {/* Traversal Order */}
          {traversalOrder.length > 0 && mode !== "bipartite" && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                {mode === "shortest" ? "Path:" : "Traversal Order:"}
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
          viewBox="0 0 400 350"
          className="w-full h-auto max-w-[400px]"
        >
          {/* Edges */}
          {edges.map((edge, idx) => {
            if (edge.from >= numNodes || edge.to >= numNodes) return null;
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            if (!fromPos || !toPos) return null;

            const edgeKey = `${edge.from}-${edge.to}`;
            const isPathEdge = pathEdges.has(edgeKey);

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
                    stroke={isPathEdge ? "#fbbf24" : "var(--brand)"}
                    strokeWidth={isPathEdge ? "3" : "2"}
                    opacity={isPathEdge ? "1" : "0.5"}
                  />
                  <polygon
                    points={`${endX},${endY} ${
                      endX - 10 * Math.cos(angle - Math.PI / 6)
                    },${endY - 10 * Math.sin(angle - Math.PI / 6)} ${
                      endX - 10 * Math.cos(angle + Math.PI / 6)
                    },${endY - 10 * Math.sin(angle + Math.PI / 6)}`}
                    fill={isPathEdge ? "#fbbf24" : "var(--brand)"}
                    opacity={isPathEdge ? "1" : "0.5"}
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
                  stroke={isPathEdge ? "#fbbf24" : "var(--brand)"}
                  strokeWidth={isPathEdge ? "3" : "2"}
                  opacity={isPathEdge ? "1" : "0.5"}
                />
              );
            }
          })}

          {/* Nodes */}
          {Array.from({ length: numNodes }, (_, i) => i).map((node) => {
            const pos = nodePositions[node];
            if (!pos) return null;

            const { fill, stroke, text } = getNodeColor(node);

            return (
              <g key={`node-${node}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="25"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                  style={{ transition: "all 0.3s ease" }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={text}
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
            <span>Current Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "var(--brand)" }}
            ></div>
            <span>Visited</span>
          </div>
          {mode === "bipartite" && (
            <>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: "#3b82f6" }}
                ></div>
                <span>Color 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: "#10b981" }}
                ></div>
                <span>Color 1</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 BFS Key Concepts:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Traversal:</strong> Visit level-by-level using queue
            (FIFO). O(V+E) time
          </li>
          <li>
            • <strong>Shortest Path:</strong> First visit = shortest path in
            unweighted graphs
          </li>
          <li>
            • <strong>Bipartite:</strong> 2-colorable graph. Use BFS to assign
            alternating colors
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GraphBFSVisualizer;
