import React, { useState } from "react";
import SpeedControl from "./SpeedControl"; // ✅ STEP 1: Import added

interface Edge {
  from: number;
  to: number;
  weight: number;
}

const DijkstraVisualizer: React.FC = () => {
  const [numNodes, setNumNodes] = useState<number>(5);
  const [edges, setEdges] = useState<Edge[]>([
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 2 },
    { from: 2, to: 1, weight: 1 },
    { from: 1, to: 3, weight: 5 },
    { from: 2, to: 3, weight: 8 },
    { from: 3, to: 4, weight: 3 },
  ]);
  const [fromNode, setFromNode] = useState<string>("");
  const [toNode, setToNode] = useState<string>("");
  const [edgeWeight, setEdgeWeight] = useState<string>("");
  const [isDirected, setIsDirected] = useState<boolean>(false);
  const [startNode, setStartNode] = useState<string>("0");
  const [endNode, setEndNode] = useState<string>("4");

  const [distances, setDistances] = useState<Map<number, number>>(new Map());
  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [pathEdges, setPathEdges] = useState<Set<string>>(new Set());
  const [pqState, setPqState] = useState<Array<[number, number]>>([]);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<string>("");
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
    const adj = new Map<number, Array<[number, number]>>();
    for (let i = 0; i < numNodes; i++) {
      adj.set(i, []);
    }
    edges.forEach(({ from, to, weight }) => {
      if (from < numNodes && to < numNodes) {
        adj.get(from)?.push([to, weight]);
        if (!isDirected) {
          adj.get(to)?.push([from, weight]);
        }
      }
    });
    return adj;
  };

  // ✅ STEP 3: Updated sleep function
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const dijkstra = async (
    start: number,
    end: number,
    adj: Map<number, Array<[number, number]>>
  ) => {
    const dist = new Map<number, number>();
    const parent = new Map<number, number>();
    const visited = new Set<number>();

    // Initialize distances
    for (let i = 0; i < numNodes; i++) {
      dist.set(i, Infinity);
    }
    dist.set(start, 0);
    parent.set(start, -1);

    // Priority queue: [distance, node]
    const pq: Array<[number, number]> = [[0, start]];

    while (pq.length > 0) {
      // Sort to simulate min-heap
      pq.sort((a, b) => a[0] - b[0]);
      setPqState([...pq]);
      await sleep(800);

      const [currentDist, node] = pq.shift()!;

      if (visited.has(node)) continue;

      visited.add(node);
      setVisitedNodes(new Set(visited));
      setCurrentNode(node);
      setDistances(new Map(dist));
      await sleep(600);

      // Early exit if we reached destination
      if (node === end) break;

      // Relax edges
      const neighbors = adj.get(node) || [];
      for (const [neighbor, weight] of neighbors) {
        if (!visited.has(neighbor)) {
          const newDist = dist.get(node)! + weight;
          if (newDist < dist.get(neighbor)!) {
            dist.set(neighbor, newDist);
            parent.set(neighbor, node);
            pq.push([newDist, neighbor]);
            setDistances(new Map(dist));
            await sleep(300);
          }
        }
      }

      setCurrentNode(null);
      await sleep(200);
    }

    setPqState([]);

    // Reconstruct path
    if (dist.get(end) === Infinity) {
      return { path: null, cost: Infinity };
    }

    const path: number[] = [];
    let current = end;
    while (current !== -1) {
      path.unshift(current);
      const prev = parent.get(current);
      current = prev === undefined ? -1 : prev;
    }

    return { path, cost: dist.get(end)! };
  };

  const handleVisualize = async () => {
    if (animating) return;

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
      return;
    }

    setAnimating(true);
    setDistances(new Map());
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setPathEdges(new Set());
    setPqState([]);
    setResult("");

    const adj = buildAdjList();
    const { path, cost } = await dijkstra(start, end, adj);

    if (path) {
      // Highlight shortest path
      const pathEdgesSet = new Set<string>();
      for (let i = 0; i < path.length - 1; i++) {
        pathEdgesSet.add(`${path[i]}-${path[i + 1]}`);
        if (!isDirected) {
          pathEdgesSet.add(`${path[i + 1]}-${path[i]}`);
        }
      }
      setPathEdges(pathEdgesSet);
      setResult(
        `✅ Shortest path found! Cost: ${cost}\nPath: ${path.join(" → ")}`
      );
    } else {
      setResult(`❌ No path exists from ${start} to ${end}`);
    }

    setAnimating(false);
  };

  const handleAddEdge = () => {
    const from = parseInt(fromNode);
    const to = parseInt(toNode);
    const weight = parseInt(edgeWeight);

    if (isNaN(from) || isNaN(to) || isNaN(weight)) {
      alert("Please enter valid numbers");
      return;
    }

    if (from < 0 || from >= numNodes || to < 0 || to >= numNodes) {
      alert(`Nodes must be between 0 and ${numNodes - 1}`);
      return;
    }

    if (weight <= 0) {
      alert("Weight must be positive (Dijkstra requires non-negative weights)");
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

    setEdges([...edges, { from, to, weight }]);
    setFromNode("");
    setToNode("");
    setEdgeWeight("");
  };

  const handleRemoveEdge = (index: number) => {
    setEdges(edges.filter((_, i) => i !== index));
  };

  const loadExample = (type: string) => {
    setDistances(new Map());
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setPathEdges(new Set());
    setPqState([]);
    setResult("");

    if (type === "simple") {
      setNumNodes(5);
      setIsDirected(false);
      setEdges([
        { from: 0, to: 1, weight: 4 },
        { from: 0, to: 2, weight: 2 },
        { from: 2, to: 1, weight: 1 },
        { from: 1, to: 3, weight: 5 },
        { from: 2, to: 3, weight: 8 },
        { from: 3, to: 4, weight: 3 },
      ]);
      setStartNode("0");
      setEndNode("4");
    } else if (type === "complex") {
      setNumNodes(6);
      setIsDirected(false);
      setEdges([
        { from: 0, to: 1, weight: 7 },
        { from: 0, to: 2, weight: 9 },
        { from: 0, to: 5, weight: 14 },
        { from: 1, to: 2, weight: 10 },
        { from: 1, to: 3, weight: 15 },
        { from: 2, to: 3, weight: 11 },
        { from: 2, to: 5, weight: 2 },
        { from: 3, to: 4, weight: 6 },
        { from: 4, to: 5, weight: 9 },
      ]);
      setStartNode("0");
      setEndNode("4");
    } else if (type === "directed") {
      setNumNodes(5);
      setIsDirected(true);
      setEdges([
        { from: 0, to: 1, weight: 10 },
        { from: 0, to: 3, weight: 5 },
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 4, weight: 4 },
        { from: 3, to: 1, weight: 3 },
        { from: 3, to: 2, weight: 9 },
        { from: 3, to: 4, weight: 2 },
        { from: 4, to: 2, weight: 6 },
      ]);
      setStartNode("0");
      setEndNode("2");
    }
  };

  const getEdgeLabel = (from: number, to: number): number | null => {
    const edge = edges.find(
      (e) =>
        (e.from === from && e.to === to) ||
        (!isDirected && e.from === to && e.to === from)
    );
    return edge ? edge.weight : null;
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
          Dijkstra's Algorithm Controls
        </h3>

        <div className="space-y-4">
          {/* ✅ STEP 4: Speed Control Component Added */}
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

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
              Add Weighted Edge:
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
              <input
                type="number"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                placeholder="Weight"
                min="1"
                className="w-24 px-3 py-2 rounded border text-sm"
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

          {/* Path Selection */}
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
                onClick={() => loadExample("complex")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Complex Graph
              </button>
              <button
                onClick={() => loadExample("directed")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Directed Graph
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
            {animating ? "Running Dijkstra..." : "Find Shortest Path"}
          </button>

          {/* Result */}
          {result && (
            <div
              className="p-4 rounded text-sm font-medium whitespace-pre-line"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {result}
            </div>
          )}

          {/* Priority Queue State */}
          {pqState.length > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Priority Queue (min-heap):
              </p>
              <div className="flex gap-2 flex-wrap">
                {pqState.map(([dist, node], idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded font-mono text-sm"
                    style={{ backgroundColor: "#10b981", color: "white" }}
                  >
                    ({node}, {dist})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Distances */}
          {distances.size > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Current Distances:
              </p>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: numNodes }, (_, i) => i).map((node) => (
                  <span
                    key={node}
                    className="px-3 py-1 rounded font-mono text-sm"
                    style={{ backgroundColor: "var(--brand)", color: "white" }}
                  >
                    {node}:{" "}
                    {distances.get(node) === Infinity
                      ? "∞"
                      : distances.get(node)}
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
              {edges.map((edge, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm p-2 rounded"
                  style={{ backgroundColor: "var(--bg)" }}
                >
                  <span className="font-mono" style={{ color: "var(--fg)" }}>
                    {edge.from} → {edge.to} (weight: {edge.weight})
                  </span>
                  <button
                    onClick={() => handleRemoveEdge(idx)}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: "#ef4444", color: "white" }}
                  >
                    ×
                  </button>
                </div>
              ))}
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

            const edgeKey = `${edge.from}-${edge.to}`;
            const isPathEdge = pathEdges.has(edgeKey);

            // Calculate midpoint for weight label
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;

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
                  <circle cx={midX} cy={midY} r="12" fill="var(--bg)" />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isPathEdge ? "#fbbf24" : "var(--fg)"}
                    fontSize="10"
                    fontWeight="600"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            } else {
              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={isPathEdge ? "#fbbf24" : "var(--brand)"}
                    strokeWidth={isPathEdge ? "3" : "2"}
                    opacity={isPathEdge ? "1" : "0.5"}
                  />
                  <circle cx={midX} cy={midY} r="12" fill="var(--bg)" />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isPathEdge ? "#fbbf24" : "var(--fg)"}
                    fontSize="10"
                    fontWeight="600"
                  >
                    {edge.weight}
                  </text>
                </g>
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
                {/* Distance label */}
                {distances.has(node) && distances.get(node) !== Infinity && (
                  <text
                    x={pos.x}
                    y={pos.y + 40}
                    textAnchor="middle"
                    fill="var(--fg)"
                    fontSize="11"
                    fontWeight="500"
                  >
                    d={distances.get(node)}
                  </text>
                )}
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
          <strong>💡 Dijkstra's Algorithm:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Greedy approach:</strong> Always pick unvisited node with
            minimum distance
          </li>
          <li>
            • <strong>Priority Queue:</strong> Efficiently selects next node.
            O((V+E) log V)
          </li>
          <li>
            • <strong>Non-negative weights required:</strong> Negative weights
            break the algorithm
          </li>
          <li>
            • <strong>Use BFS for unweighted,</strong> Dijkstra for weighted,
            Bellman-Ford for negative weights
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DijkstraVisualizer;
