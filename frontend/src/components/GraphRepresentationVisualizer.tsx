import React, { useState } from "react";

interface Edge {
  from: number;
  to: number;
}

const GraphRepresentationVisualizer: React.FC = () => {
  const [numNodes, setNumNodes] = useState<number>(4);
  const [edges, setEdges] = useState<Edge[]>([
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
  ]);
  const [fromNode, setFromNode] = useState<string>("");
  const [toNode, setToNode] = useState<string>("");
  const [representation, setRepresentation] = useState<
    "all" | "edge" | "matrix" | "list"
  >("all");
  const [isDirected, setIsDirected] = useState<boolean>(false);

  // Simple circular layout
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

  const buildAdjacencyMatrix = (): number[][] => {
    const matrix = Array(numNodes)
      .fill(0)
      .map(() => Array(numNodes).fill(0));
    edges.forEach(({ from, to }) => {
      if (from < numNodes && to < numNodes) {
        matrix[from][to] = 1;
        if (!isDirected) {
          matrix[to][from] = 1;
        }
      }
    });
    return matrix;
  };

  const buildAdjacencyList = (): Map<number, number[]> => {
    const adjList = new Map<number, number[]>();
    for (let i = 0; i < numNodes; i++) {
      adjList.set(i, []);
    }
    edges.forEach(({ from, to }) => {
      if (from < numNodes && to < numNodes) {
        adjList.get(from)?.push(to);
        if (!isDirected) {
          adjList.get(to)?.push(from);
        }
      }
    });
    return adjList;
  };

  const handleAddEdge = () => {
    const from = parseInt(fromNode);
    const to = parseInt(toNode);

    // Validation
    if (isNaN(from) || isNaN(to)) {
      alert("Please enter valid numbers");
      return;
    }

    if (from < 0 || from >= numNodes || to < 0 || to >= numNodes) {
      alert(`Nodes must be between 0 and ${numNodes - 1}`);
      return;
    }

    if (from === to) {
      alert("Cannot add self-loop (from and to are same)");
      return;
    }

    // Check duplicate
    const duplicate = edges.some(
      (e) =>
        (e.from === from && e.to === to) ||
        (!isDirected && e.from === to && e.to === from)
    );

    if (duplicate) {
      alert("This edge already exists!");
      return;
    }

    // Add edge
    setEdges([...edges, { from, to }]);
    setFromNode("");
    setToNode("");
  };

  const handleRemoveEdge = (index: number) => {
    setEdges(edges.filter((_, i) => i !== index));
  };

  const handleClearGraph = () => {
    setEdges([]);
    setFromNode("");
    setToNode("");
  };

  const loadExample = (type: string) => {
    setIsDirected(false);

    if (type === "linear") {
      setNumNodes(4);
      setEdges([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ]);
    } else if (type === "cycle") {
      setNumNodes(4);
      setEdges([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 0 },
      ]);
    } else if (type === "complete") {
      setNumNodes(4);
      setEdges([
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
      ]);
    } else if (type === "star") {
      setNumNodes(5);
      setEdges([
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
        { from: 0, to: 4 },
      ]);
    }

    setFromNode("");
    setToNode("");
  };

  const adjacencyMatrix = buildAdjacencyMatrix();
  const adjacencyList = buildAdjacencyList();

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
          Build Your Graph
        </h3>

        <div className="space-y-4">
          {/* Number of Nodes */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Number of Nodes: {numNodes}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={numNodes}
              onChange={(e) => {
                const newNum = parseInt(e.target.value);
                setNumNodes(newNum);
                // Remove invalid edges
                setEdges(edges.filter((e) => e.from < newNum && e.to < newNum));
              }}
              className="w-full"
            />
          </div>

          {/* Directed/Undirected */}
          <div className="flex items-center gap-3">
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

          {/* Add Edge - Two separate inputs */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Add Edge (nodes: 0 to {numNodes - 1})
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
                onKeyPress={(e) => e.key === "Enter" && handleAddEdge()}
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
                className="build-tree-btn px-4 py-2 rounded font-medium text-sm"
                style={{ backgroundColor: "var(--brand)", color: "white" }}
              >
                Add Edge
              </button>
            </div>
          </div>

          {/* Example Graphs */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Load Examples of different Graphs:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample("linear")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Linear Graph
              </button>
              <button
                onClick={() => loadExample("cycle")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Cycle Graph
              </button>
              <button
                onClick={() => loadExample("complete")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Complete Graph
              </button>
              <button
                onClick={() => loadExample("star")}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Star Graph
              </button>
              <button
                onClick={handleClearGraph}
                className="tree-example-btn px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                }}
              >
                Clear All Edges
              </button>
            </div>
          </div>

          {/* Representation Toggle */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              View Representation:
            </label>
            <div className="flex gap-2 flex-wrap">
              {["all", "edge", "matrix", "list"].map((rep) => (
                <button
                  key={rep}
                  onClick={() => setRepresentation(rep as any)}
                  className="tree-example-btn px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor:
                      representation === rep
                        ? "var(--brand)"
                        : "var(--card-hover-bg)",
                    color: representation === rep ? "white" : "var(--fg)",
                    border: "2px solid var(--brand)",
                  }}
                >
                  {rep === "all"
                    ? "All"
                    : rep === "edge"
                    ? "Edge List"
                    : rep === "matrix"
                    ? "Matrix"
                    : "Adj List"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Graph */}
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
          {/* Draw Edges */}
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
                  />
                  <polygon
                    points={`${endX},${endY} ${
                      endX - 10 * Math.cos(angle - Math.PI / 6)
                    },${endY - 10 * Math.sin(angle - Math.PI / 6)} ${
                      endX - 10 * Math.cos(angle + Math.PI / 6)
                    },${endY - 10 * Math.sin(angle + Math.PI / 6)}`}
                    fill="var(--brand)"
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
                />
              );
            }
          })}

          {/* Draw Nodes */}
          {Array.from({ length: numNodes }, (_, i) => i).map((node) => {
            const pos = nodePositions[node];
            if (!pos) return null;

            return (
              <g key={`node-${node}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="25"
                  fill="var(--panel)"
                  stroke="var(--brand)"
                  strokeWidth="2"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--fg)"
                  fontSize="16"
                  fontWeight="600"
                >
                  {node}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Representations */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Edge List */}
        {(representation === "all" || representation === "edge") && (
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "var(--panel)" }}
          >
            <h4
              className="font-semibold mb-3 text-sm"
              style={{ color: "var(--fg)" }}
            >
              📝 Edge List
            </h4>
            <div className="space-y-2">
              <div
                className="text-xs font-mono p-2 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                Space: O(E) = {edges.length} edges
              </div>
              {edges.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  No edges yet
                </p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {edges.map((edge, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm p-2 rounded"
                      style={{ backgroundColor: "var(--bg)" }}
                    >
                      <span
                        className="font-mono"
                        style={{ color: "var(--fg)" }}
                      >
                        {edge.from} → {edge.to}
                      </span>
                      <button
                        onClick={() => handleRemoveEdge(idx)}
                        className="text-xs px-2 py-1 rounded hover:opacity-80"
                        style={{ backgroundColor: "#ef4444", color: "white" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Adjacency Matrix */}
        {(representation === "all" || representation === "matrix") && (
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "var(--panel)" }}
          >
            <h4
              className="font-semibold mb-3 text-sm"
              style={{ color: "var(--fg)" }}
            >
              🔲 Adjacency Matrix
            </h4>
            <div className="space-y-2">
              <div
                className="text-xs font-mono p-2 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                Space: O(N²) = {numNodes}×{numNodes} = {numNodes * numNodes}
              </div>
              <div className="overflow-auto max-h-48">
                <table
                  className="text-xs font-mono border-collapse"
                  style={{ color: "var(--fg)" }}
                >
                  <tbody>
                    {adjacencyMatrix.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="p-1.5 text-center border"
                            style={{
                              backgroundColor:
                                cell === 1 ? "var(--brand)" : "var(--bg)",
                              color: cell === 1 ? "white" : "var(--fg)",
                              borderColor: "var(--muted)",
                              minWidth: "28px",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Adjacency List */}
        {(representation === "all" || representation === "list") && (
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "var(--panel)" }}
          >
            <h4
              className="font-semibold mb-3 text-sm"
              style={{ color: "var(--fg)" }}
            >
              📋 Adjacency List ⭐
            </h4>
            <div className="space-y-2">
              <div
                className="text-xs font-mono p-2 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                Space: O(V+E) = {numNodes}+{edges.length * (isDirected ? 1 : 2)}
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {Array.from({ length: numNodes }, (_, i) => i).map((node) => (
                  <div
                    key={node}
                    className="text-sm p-2 rounded font-mono"
                    style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
                  >
                    {node}: [{adjacencyList.get(node)?.join(", ") || ""}]
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 When to Use:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Edge List:</strong> Compact. Good for edge-centric
            algorithms (Kruskal's MST)
          </li>
          <li>
            • <strong>Adjacency Matrix:</strong> O(1) edge lookup. Best for
            dense graphs
          </li>
          <li>
            • <strong>Adjacency List:</strong> ⭐ Most used! Space-efficient,
            perfect for DFS/BFS
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GraphRepresentationVisualizer;
