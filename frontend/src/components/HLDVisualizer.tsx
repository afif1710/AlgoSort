import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface TreeExample {
  name: string;
  nodes: number;
  edges: Array<[number, number]>;
  nodeValues: number[];
  nodePositions: { [key: number]: { x: number; y: number } };
}

const HLDVisualizer: React.FC = () => {
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [subtreeSizes, setSubtreeSizes] = useState<number[]>([]);
  const [heavyEdges, setHeavyEdges] = useState<Set<string>>(new Set());
  const [chains, setChains] = useState<number[]>([]);
  const [currentNode, setCurrentNode] = useState<number>(-1);
  const [selectedExample, setSelectedExample] = useState<number>(0);

  const examples: TreeExample[] = [
    {
      name: "Linear Chain",
      nodes: 5,
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      nodeValues: [5, 4, 3, 2, 1],
      nodePositions: {
        0: { x: 50, y: 150 },
        1: { x: 130, y: 150 },
        2: { x: 210, y: 150 },
        3: { x: 290, y: 150 },
        4: { x: 370, y: 150 },
      },
    },
    {
      name: "Balanced Tree",
      nodes: 7,
      edges: [
        [0, 1],
        [0, 2],
        [1, 3],
        [1, 4],
        [2, 5],
        [2, 6],
      ],
      nodeValues: [10, 5, 5, 2, 2, 2, 2],
      nodePositions: {
        0: { x: 200, y: 40 },
        1: { x: 100, y: 120 },
        2: { x: 300, y: 120 },
        3: { x: 50, y: 200 },
        4: { x: 150, y: 200 },
        5: { x: 250, y: 200 },
        6: { x: 350, y: 200 },
      },
    },
    {
      name: "Skewed Tree",
      nodes: 6,
      edges: [
        [0, 1],
        [0, 2],
        [1, 3],
        [1, 4],
        [4, 5],
      ],
      nodeValues: [6, 4, 1, 1, 2, 1],
      nodePositions: {
        0: { x: 200, y: 40 },
        1: { x: 120, y: 110 },
        2: { x: 300, y: 110 },
        3: { x: 60, y: 180 },
        4: { x: 180, y: 180 },
        5: { x: 180, y: 250 },
      },
    },
  ];

  const currentExample = examples[selectedExample];

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const buildHLD = async () => {
    setAnimating(true);
    setHeavyEdges(new Set());
    setChains([]);
    setSubtreeSizes([]);
    setCurrentNode(-1);
    setMessage("Starting Heavy-Light Decomposition...");
    await sleep(1000);

    const { nodes, edges } = currentExample;

    // Build adjacency list
    const adj: number[][] = Array.from({ length: nodes }, () => []);
    for (const [u, v] of edges) {
      adj[u].push(v);
      adj[v].push(u);
    }

    const sizes = new Array(nodes).fill(0);
    const parent = new Array(nodes).fill(-1);

    // DFS to compute subtree sizes
    setMessage("Computing subtree sizes...");
    await sleep(1000);

    const dfsSize = async (u: number, p: number): Promise<number> => {
      setCurrentNode(u);
      await sleep(600);

      parent[u] = p;
      sizes[u] = 1;

      for (const v of adj[u]) {
        if (v !== p) {
          sizes[u] += await dfsSize(v, u);
        }
      }

      setSubtreeSizes([...sizes]);
      setMessage(`Node ${u}: subtree size = ${sizes[u]}`);
      await sleep(800);

      return sizes[u];
    };

    await dfsSize(0, -1);
    setCurrentNode(-1);

    setMessage("Identifying heavy edges (edge to largest subtree)...");
    await sleep(1500);

    // Mark heavy edges
    const heavy = new Set<string>();
    const chainId = new Array(nodes).fill(-1);
    let currentChain = 0;

    const markHeavy = async (u: number, p: number, chain: number) => {
      setCurrentNode(u);
      chainId[u] = chain;
      setChains([...chainId]);
      await sleep(600);

      let maxChild = -1;
      let maxSize = 0;

      for (const v of adj[u]) {
        if (v !== p && sizes[v] > maxSize) {
          maxSize = sizes[v];
          maxChild = v;
        }
      }

      if (maxChild !== -1) {
        const edgeKey = `${Math.min(u, maxChild)},${Math.max(u, maxChild)}`;
        heavy.add(edgeKey);
        setHeavyEdges(new Set(heavy));
        setMessage(
          `Node ${u}: heavy edge to node ${maxChild} (size ${sizes[maxChild]})`
        );
        await sleep(1000);

        await markHeavy(maxChild, u, chain);
      }

      for (const v of adj[u]) {
        if (v !== p && v !== maxChild) {
          currentChain++;
          setMessage(`Starting new chain ${currentChain} at node ${v}`);
          await sleep(800);
          await markHeavy(v, u, currentChain);
        }
      }
    };

    await markHeavy(0, -1, 0);
    setCurrentNode(-1);

    setMessage(
      `✅ HLD Complete! ${heavy.size} heavy edges, ${currentChain + 1} chains`
    );
    setAnimating(false);
  };

  const changeExample = (index: number) => {
    if (animating) return;
    setSelectedExample(index);
    setHeavyEdges(new Set());
    setChains([]);
    setSubtreeSizes([]);
    setCurrentNode(-1);
    setMessage("");
  };

  const getNodeRadius = (node: number): number => {
    if (subtreeSizes.length === 0) return 20;
    const baseSize = 15;
    const maxSize = Math.max(...subtreeSizes);
    return baseSize + (subtreeSizes[node] / maxSize) * 15;
  };

  const getChainColor = (chainId: number): string => {
    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ];
    return colors[chainId % colors.length];
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
          Heavy-Light Decomposition Visualizer
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
              Select Tree Example:
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
                        ? "#10b981"
                        : "var(--card-hover-bg)",
                    color: selectedExample === idx ? "white" : "var(--fg)",
                    cursor: animating ? "not-allowed" : "pointer",
                    border: "2px solid #10b981",
                  }}
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {/* Build Button */}
          <button
            onClick={buildHLD}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "var(--brand)",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Building HLD..." : "Build Heavy-Light Decomposition"}
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

          {/* Tree Visualization */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Tree Structure{" "}
              <span style={{ color: "var(--muted)", fontSize: "11px" }}>
                (node size = subtree size)
              </span>
              :
            </label>
            <svg
              width="420"
              height="300"
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
                const edgeKey = `${Math.min(u, v)},${Math.max(u, v)}`;
                const isHeavy = heavyEdges.has(edgeKey);

                return (
                  <line
                    key={idx}
                    x1={uPos.x}
                    y1={uPos.y}
                    x2={vPos.x}
                    y2={vPos.y}
                    stroke={isHeavy ? "#10b981" : "#64748b"}
                    strokeWidth={isHeavy ? "5" : "2"}
                    strokeDasharray={isHeavy ? "0" : "5,5"}
                  />
                );
              })}

              {/* Draw nodes */}
              {Array.from({ length: currentExample.nodes }).map((_, node) => {
                const pos = currentExample.nodePositions[node];
                const radius = getNodeRadius(node);
                const isCurrent = currentNode === node;
                const chainColor =
                  chains[node] !== undefined
                    ? getChainColor(chains[node])
                    : "#64748b";

                return (
                  <g key={node}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={
                        isCurrent
                          ? "#fbbf24"
                          : chains.length > 0
                          ? chainColor
                          : "#64748b"
                      }
                      stroke="white"
                      strokeWidth="3"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 3}
                      textAnchor="middle"
                      style={{
                        fill: "white",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {node}
                    </text>
                    {subtreeSizes.length > 0 && (
                      <text
                        x={pos.x}
                        y={pos.y + 10}
                        textAnchor="middle"
                        style={{ fill: "white", fontSize: "11px" }}
                      >
                        ({subtreeSizes[node]})
                      </text>
                    )}
                    {chains.length > 0 && (
                      <text
                        x={pos.x}
                        y={pos.y + radius + 15}
                        textAnchor="middle"
                        style={{
                          fill: "var(--fg)",
                          fontSize: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        C{chains[node]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            <div
              className="mt-3 text-xs flex gap-4 flex-wrap"
              style={{ color: "var(--fg)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-1"
                  style={{ backgroundColor: "#10b981", height: "4px" }}
                ></div>
                <span>Heavy edges</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-1"
                  style={{
                    backgroundColor: "#64748b",
                    height: "2px",
                    backgroundImage:
                      "repeating-linear-gradient(90deg, #64748b 0, #64748b 5px, transparent 5px, transparent 10px)",
                  }}
                ></div>
                <span>Light edges</span>
              </div>
              {currentNode !== -1 && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: "#fbbf24" }}
                  ></div>
                  <span>Current node</span>
                </div>
              )}
            </div>
          </div>

          {/* Chain Info */}
          {chains.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Heavy Chains:
              </label>
              <div className="flex gap-2 flex-wrap">
                {Array.from(new Set(chains)).map((chainId) => {
                  const nodesInChain = chains
                    .map((c, idx) => (c === chainId ? idx : -1))
                    .filter((x) => x !== -1);

                  return (
                    <div
                      key={chainId}
                      className="px-3 py-2 rounded text-sm"
                      style={{
                        backgroundColor: getChainColor(chainId),
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Chain {chainId}: [{nodesInChain.join(" → ")}]
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
        <p className="font-semibold mb-2">💡 Heavy-Light Decomposition:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>
            • <strong>Node size</strong> represents subtree size
          </li>
          <li>
            • <strong>Heavy edge</strong> (solid): edge to child with largest
            subtree
          </li>
          <li>
            • <strong>Light edge</strong> (dashed): all other edges
          </li>
          <li>
            • <strong>Heavy chains</strong>: paths of consecutive heavy edges
          </li>
          <li>• Any root-to-leaf path crosses ≤ log n chains</li>
          <li>• Path queries: O(log² n) using segment trees</li>
          <li>
            • Try different examples to see how structure affects decomposition!
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HLDVisualizer;
