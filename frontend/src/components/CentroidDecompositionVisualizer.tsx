import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface TreeExample {
  name: string;
  nodes: number;
  edges: Array<[number, number]>;
  nodePositions: { [key: number]: { x: number; y: number } };
}

const CentroidDecompositionVisualizer: React.FC = () => {
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [centroids, setCentroids] = useState<number[]>([]);
  const [currentCentroid, setCurrentCentroid] = useState<number>(-1);
  const [selectedExample, setSelectedExample] = useState<number>(0);
  const [decompositionEdges, setDecompositionEdges] = useState<
    Array<[number, number]>
  >([]);

  const examples: TreeExample[] = [
    {
      name: "Linear",
      nodes: 5,
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      nodePositions: {
        0: { x: 50, y: 150 },
        1: { x: 130, y: 150 },
        2: { x: 210, y: 150 },
        3: { x: 290, y: 150 },
        4: { x: 370, y: 150 },
      },
    },
    {
      name: "Star",
      nodes: 5,
      edges: [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      nodePositions: {
        0: { x: 210, y: 150 },
        1: { x: 130, y: 80 },
        2: { x: 290, y: 80 },
        3: { x: 130, y: 220 },
        4: { x: 290, y: 220 },
      },
    },
    {
      name: "Balanced",
      nodes: 7,
      edges: [
        [0, 1],
        [0, 2],
        [1, 3],
        [1, 4],
        [2, 5],
        [2, 6],
      ],
      nodePositions: {
        0: { x: 210, y: 50 },
        1: { x: 110, y: 130 },
        2: { x: 310, y: 130 },
        3: { x: 60, y: 210 },
        4: { x: 160, y: 210 },
        5: { x: 260, y: 210 },
        6: { x: 360, y: 210 },
      },
    },
  ];

  const currentExample = examples[selectedExample];

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const buildAdjList = () => {
    const adj: number[][] = Array.from(
      { length: currentExample.nodes },
      () => []
    );
    for (const [u, v] of currentExample.edges) {
      adj[u].push(v);
      adj[v].push(u);
    }
    return adj;
  };

  const getSubtreeSize = (
    u: number,
    p: number,
    adj: number[][],
    removed: Set<number>,
    sizes: number[]
  ): number => {
    sizes[u] = 1;
    for (const v of adj[u]) {
      if (v !== p && !removed.has(v)) {
        sizes[u] += getSubtreeSize(v, u, adj, removed, sizes);
      }
    }
    return sizes[u];
  };

  const findCentroid = (
    u: number,
    p: number,
    treeSize: number,
    adj: number[][],
    removed: Set<number>,
    sizes: number[]
  ): number => {
    for (const v of adj[u]) {
      if (v !== p && !removed.has(v)) {
        if (sizes[v] > treeSize / 2) {
          return findCentroid(v, u, treeSize, adj, removed, sizes);
        }
      }
    }
    return u;
  };

  const decompose = async (
    u: number,
    parent: number,
    adj: number[][],
    removedSet: Set<number>,
    centroidList: number[],
    decompEdges: Array<[number, number]>
  ) => {
    const sizes = new Array(currentExample.nodes).fill(0);
    const treeSize = getSubtreeSize(u, -1, adj, removedSet, sizes);

    setMessage(`Finding centroid in component of size ${treeSize}...`);
    await sleep(1000);

    const centroid = findCentroid(u, -1, treeSize, adj, removedSet, sizes);

    setCurrentCentroid(centroid);
    centroidList.push(centroid);
    setCentroids([...centroidList]);

    if (parent !== -1) {
      decompEdges.push([parent, centroid]);
      setDecompositionEdges([...decompEdges]);
    }

    setMessage(`Found centroid: ${centroid}`);
    await sleep(1500);

    removedSet.add(centroid);
    setRemoved(new Set(removedSet));
    setMessage(`Removing centroid ${centroid}, decomposing components...`);
    await sleep(1200);

    for (const v of adj[centroid]) {
      if (!removedSet.has(v)) {
        await decompose(
          v,
          centroid,
          adj,
          removedSet,
          centroidList,
          decompEdges
        );
      }
    }
  };

  const buildDecomposition = async () => {
    setAnimating(true);
    setRemoved(new Set());
    setCentroids([]);
    setCurrentCentroid(-1);
    setDecompositionEdges([]);
    setMessage("Starting centroid decomposition...");
    await sleep(1000);

    const adj = buildAdjList();
    const removedSet = new Set<number>();
    const centroidList: number[] = [];
    const decompEdges: Array<[number, number]> = [];

    await decompose(0, -1, adj, removedSet, centroidList, decompEdges);

    setCurrentCentroid(-1);
    setMessage(
      `✅ Decomposition complete! Found ${centroidList.length} centroids.`
    );
    setAnimating(false);
  };

  const changeExample = (index: number) => {
    if (animating) return;
    setSelectedExample(index);
    setRemoved(new Set());
    setCentroids([]);
    setCurrentCentroid(-1);
    setDecompositionEdges([]);
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
          Centroid Decomposition Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Example Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Select Tree:
            </label>
            <div className="flex gap-2">
              {examples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => changeExample(idx)}
                  disabled={animating}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor:
                      selectedExample === idx
                        ? "var(--brand)"
                        : "var(--card-hover-bg)",
                    color: selectedExample === idx ? "white" : "var(--fg)",
                    cursor: animating ? "not-allowed" : "pointer",
                    border: "2px solid var(--brand)",
                  }}
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {/* Build Button */}
          <button
            onClick={buildDecomposition}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Decomposing..." : "Build Centroid Decomposition"}
          </button>

          {/* Message */}
          {message && (
            <div
              className="p-3 rounded text-sm font-medium text-center"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
          )}

          {/* Original Tree */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Original Tree:
            </label>
            <svg
              width="420"
              height="280"
              style={{
                backgroundColor: "var(--bg)",
                border: "2px solid var(--brand)",
                borderRadius: "8px",
              }}
            >
              {/* Draw edges */}
              {currentExample.edges.map(([u, v], idx) => {
                const uPos = currentExample.nodePositions[u];
                const vPos = currentExample.nodePositions[v];
                const uRemoved = removed.has(u);
                const vRemoved = removed.has(v);

                return (
                  <line
                    key={idx}
                    x1={uPos.x}
                    y1={uPos.y}
                    x2={vPos.x}
                    y2={vPos.y}
                    stroke={uRemoved || vRemoved ? "#64748b" : "var(--muted)"}
                    strokeWidth="2"
                    opacity={uRemoved || vRemoved ? 0.3 : 1}
                  />
                );
              })}

              {/* Draw nodes */}
              {Array.from({ length: currentExample.nodes }).map((_, node) => {
                const pos = currentExample.nodePositions[node];
                const isRemoved = removed.has(node);
                const isCurrent = currentCentroid === node;
                const isCentroid = centroids.includes(node);

                return (
                  <g key={node}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="22"
                      fill={
                        isCurrent
                          ? "#fbbf24"
                          : isCentroid
                          ? "#10b981"
                          : isRemoved
                          ? "#64748b"
                          : "var(--brand)"
                      }
                      stroke="white"
                      strokeWidth="3"
                      opacity={isRemoved && !isCurrent ? 0.3 : 1}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      style={{
                        fill: "white",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {node}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div
              className="mt-3 text-xs flex gap-4"
              style={{ color: "var(--fg)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: "#10b981" }}
                ></div>
                <span>Centroid</span>
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
                  style={{ backgroundColor: "#64748b", opacity: 0.3 }}
                ></div>
                <span>Removed</span>
              </div>
            </div>
          </div>

          {/* Decomposition Tree */}
          {decompositionEdges.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Decomposition Tree (parent-child relationships):
              </label>
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                {centroids.map((centroid, idx) => {
                  const children = decompositionEdges
                    .filter(([parent]) => parent === centroid)
                    .map(([, child]) => child);

                  return (
                    <div key={idx} className="mb-2 font-mono text-sm">
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>
                        Node {centroid}:
                      </span>{" "}
                      {children.length > 0 ? (
                        <span>children = [{children.join(", ")}]</span>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>leaf</span>
                      )}
                    </div>
                  );
                })}
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
        <p className="font-semibold mb-2">💡 Centroid Decomposition:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>
            • <strong>Centroid</strong>: node whose removal creates components ≤
            n/2
          </li>
          <li>• Recursively find centroids in each component</li>
          <li>• Creates tree of depth O(log n)</li>
          <li>• Any path passes through O(log n) centroids</li>
          <li>
            • Applications: distance queries, path counting, k-closest nodes
          </li>
          <li>• Time: O(n log n) to build</li>
        </ul>
      </div>
    </div>
  );
};

export default CentroidDecompositionVisualizer;
