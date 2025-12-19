import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const UnionFindVisualizer: React.FC = () => {
  const [numNodes, setNumNodes] = useState<number>(8);
  const [parent, setParent] = useState<number[]>(
    Array.from({ length: 8 }, (_, i) => i)
  );
  const [rank, setRank] = useState<number[]>(Array(8).fill(0));
  const [node1, setNode1] = useState<string>("");
  const [node2, setNode2] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(
    new Set()
  );
  const [message, setMessage] = useState<string>("");
  const [findPath, setFindPath] = useState<number[]>([]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const reset = () => {
    setParent(Array.from({ length: numNodes }, (_, i) => i));
    setRank(Array(numNodes).fill(0));
    setHighlightedNodes(new Set());
    setMessage("");
    setFindPath([]);
  };

  const findWithAnimation = async (x: number): Promise<number> => {
    const path: number[] = [x];
    let current = x;

    setMessage(`Finding root of node ${x}...`);

    while (parent[current] !== current) {
      setHighlightedNodes(new Set([current]));
      await sleep(500);
      current = parent[current];
      path.push(current);
    }

    setFindPath(path);
    setMessage(`Root found: ${current}. Path length: ${path.length}`);
    await sleep(800);

    // Path compression animation
    if (path.length > 1) {
      setMessage(`Applying path compression...`);
      const newParent = [...parent];
      for (let i = 0; i < path.length - 1; i++) {
        newParent[path[i]] = current;
        setParent([...newParent]);
        setHighlightedNodes(new Set([path[i], current]));
        await sleep(400);
      }
      setMessage(
        `Path compression complete! All nodes now point directly to root ${current}.`
      );
    }

    return current;
  };

  const handleUnion = async () => {
    const n1 = parseInt(node1);
    const n2 = parseInt(node2);

    if (
      isNaN(n1) ||
      isNaN(n2) ||
      n1 < 0 ||
      n1 >= numNodes ||
      n2 < 0 ||
      n2 >= numNodes
    ) {
      alert(`Please enter valid node numbers (0-${numNodes - 1})`);
      return;
    }

    if (animating) return;
    setAnimating(true);
    setHighlightedNodes(new Set());
    setFindPath([]);

    // Find roots
    const root1 = await findWithAnimation(n1);
    await sleep(500);
    const root2 = await findWithAnimation(n2);
    await sleep(500);

    if (root1 === root2) {
      setMessage(
        `Nodes ${n1} and ${n2} are already in the same set! (root: ${root1})`
      );
      setHighlightedNodes(new Set([root1]));
    } else {
      setMessage(`Merging sets with roots ${root1} and ${root2}...`);
      setHighlightedNodes(new Set([root1, root2]));
      await sleep(800);

      const newParent = [...parent];
      const newRank = [...rank];

      // Union by rank
      if (newRank[root1] < newRank[root2]) {
        newParent[root1] = root2;
        setMessage(
          `Attaching smaller tree (root ${root1}) under larger tree (root ${root2})`
        );
      } else if (newRank[root1] > newRank[root2]) {
        newParent[root2] = root1;
        setMessage(
          `Attaching smaller tree (root ${root2}) under larger tree (root ${root1})`
        );
      } else {
        newParent[root2] = root1;
        newRank[root1]++;
        setMessage(
          `Equal rank! Attaching ${root2} under ${root1} and increasing rank.`
        );
      }

      setParent(newParent);
      setRank(newRank);
      await sleep(800);
      setMessage(
        `✅ Union complete! Nodes ${n1} and ${n2} are now in the same set.`
      );
    }

    await sleep(1000);
    setHighlightedNodes(new Set());
    setFindPath([]);
    setNode1("");
    setNode2("");
    setAnimating(false);
  };

  const handleFind = async () => {
    const n = parseInt(node1);
    if (isNaN(n) || n < 0 || n >= numNodes) {
      alert(`Please enter valid node number (0-${numNodes - 1})`);
      return;
    }

    if (animating) return;
    setAnimating(true);
    await findWithAnimation(n);
    await sleep(1000);
    setHighlightedNodes(new Set());
    setFindPath([]);
    setNode1("");
    setAnimating(false);
  };

  const loadExample = (type: string) => {
    reset();
    if (type === "simple") {
      const p = [0, 0, 1, 1, 4, 4, 5, 5];
      setParent(p);
      setMessage("Loaded: Two separate components {0,1,2,3} and {4,5,6,7}");
    } else if (type === "complex") {
      const p = [1, 2, 2, 2, 5, 6, 6, 6];
      setParent(p);
      setMessage("Loaded: Complex tree structure");
    }
  };

  // Get node positions in circular layout
  const getNodePosition = (i: number) => {
    const centerX = 200;
    const centerY = 175;
    const radius = 120;
    const angle = (i * 2 * Math.PI) / numNodes - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
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
          Union-Find (Disjoint Set Union) Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

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
              min="4"
              max="10"
              value={numNodes}
              onChange={(e) => {
                const n = parseInt(e.target.value);
                setNumNodes(n);
                reset();
              }}
              className="w-full"
            />
          </div>

          {/* Union Operation */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Union Operation:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={node1}
                onChange={(e) => setNode1(e.target.value)}
                placeholder="Node 1"
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
                value={node2}
                onChange={(e) => setNode2(e.target.value)}
                placeholder="Node 2"
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
                onClick={handleUnion}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "var(--brand)",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                Union
              </button>
              <button
                onClick={handleFind}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#10b981",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                Find Root
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
            <div className="flex gap-2">
              <button
                onClick={() => loadExample("simple")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Two Components
              </button>
              <button
                onClick={() => loadExample("complex")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Complex Tree
              </button>
              <button
                onClick={reset}
                className="px-3 py-2 rounded text-sm"
                style={{ backgroundColor: "#ef4444", color: "white" }}
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className="p-4 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
          )}

          {/* Parent Array */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Parent Array:
            </label>
            <div className="flex gap-2 flex-wrap">
              {parent.map((p, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs text-[var(--muted)]">i={i}</div>
                  <div
                    className="px-3 py-1 rounded font-mono text-sm"
                    style={{
                      backgroundColor: highlightedNodes.has(i)
                        ? "#fbbf24"
                        : "var(--brand)",
                      color: "white",
                    }}
                  >
                    {p}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rank Array */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Rank Array:
            </label>
            <div className="flex gap-2 flex-wrap">
              {rank.map((r, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs text-[var(--muted)]">i={i}</div>
                  <div
                    className="px-3 py-1 rounded font-mono text-sm"
                    style={{
                      backgroundColor: "var(--card-hover-bg)",
                      color: "var(--fg)",
                    }}
                  >
                    {r}
                  </div>
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
          Union-Find Forest
        </h3>
        <svg
          width="400"
          height="350"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          {/* Edges (parent pointers) */}
          {Array.from({ length: numNodes }).map((_, i) => {
            if (parent[i] === i) return null; // Skip self-loops
            const fromPos = getNodePosition(i);
            const toPos = getNodePosition(parent[i]);
            const isInPath =
              findPath.includes(i) && findPath.includes(parent[i]);

            return (
              <line
                key={`edge-${i}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isInPath ? "#fbbf24" : "var(--brand)"}
                strokeWidth={isInPath ? "3" : "2"}
                opacity="0.6"
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Arrow marker */}
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
          </defs>

          {/* Nodes */}
          {Array.from({ length: numNodes }).map((_, i) => {
            const pos = getNodePosition(i);
            const isRoot = parent[i] === i;
            const isHighlighted = highlightedNodes.has(i);
            const isInPath = findPath.includes(i);

            let fillColor = "var(--panel)";
            let strokeColor = "var(--brand)";

            if (isRoot) {
              fillColor = "#10b981";
              strokeColor = "#059669";
            } else if (isHighlighted || isInPath) {
              fillColor = "#fbbf24";
              strokeColor = "#f59e0b";
            }

            return (
              <g key={`node-${i}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="25"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="3"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="600"
                >
                  {i}
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
              style={{ backgroundColor: "#10b981" }}
            ></div>
            <span>Root (parent[i] = i)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#fbbf24" }}
            ></div>
            <span>Active/Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: "var(--panel)",
                border: "2px solid var(--brand)",
              }}
            ></div>
            <span>Regular Node</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Union-Find Operations:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Find:</strong> Follow parent pointers until reaching root
            (node where parent[i] = i)
          </li>
          <li>
            • <strong>Path Compression:</strong> Make all nodes on path point
            directly to root
          </li>
          <li>
            • <strong>Union by Rank:</strong> Attach smaller tree under larger
            tree to keep balanced
          </li>
          <li>
            • <strong>Time Complexity:</strong> O(α(n)) ≈ O(1) with both
            optimizations
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UnionFindVisualizer;
