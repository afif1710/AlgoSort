import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface TreeNode {
  id: number;
  children: number[];
  value: number;
}

const DPOnTreesVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<TreeNode[]>([
    { id: 0, children: [1, 2], value: 3 },
    { id: 1, children: [3], value: 2 },
    { id: 2, children: [4], value: 5 },
    { id: 3, children: [], value: 1 },
    { id: 4, children: [], value: 4 },
  ]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<number>>(new Set());
  const [dpValues, setDpValues] = useState<Map<string, number>>(new Map());
  const [message, setMessage] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<
    "independent-set" | "diameter" | "subtree-sum"
  >("independent-set");

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const getNodePosition = (id: number) => {
    const positions: Record<number, { x: number; y: number }> = {
      0: { x: 200, y: 50 },
      1: { x: 120, y: 140 },
      2: { x: 280, y: 140 },
      3: { x: 80, y: 230 },
      4: { x: 280, y: 230 },
    };
    return positions[id] || { x: 200, y: 150 };
  };

  const maxIndependentSet = async (
    node: number,
    parent: number,
    included: boolean
  ) => {
    setCurrentNode(node);
    setMessage(
      `Computing dp[${node}][${included ? "included" : "excluded"}]...`
    );
    await sleep(600);

    const key = `${node}-${included}`;
    if (dpValues.has(key)) {
      setMessage(`Using cached value for node ${node}`);
      await sleep(400);
      return dpValues.get(key)!;
    }

    let result = 0;

    if (included) {
      // Node is included, children cannot be
      result = nodes[node].value;
      setSelectedNodes(new Set([...Array.from(selectedNodes), node]));
      await sleep(400);

      for (const child of nodes[node].children) {
        if (child !== parent) {
          const childResult = await maxIndependentSet(child, node, false);
          result += childResult;
        }
      }
    } else {
      // Node not included, try both for children
      for (const child of nodes[node].children) {
        if (child !== parent) {
          const includeChild = await maxIndependentSet(child, node, true);
          const excludeChild = await maxIndependentSet(child, node, false);
          result += Math.max(includeChild, excludeChild);
        }
      }
    }

    dpValues.set(key, result);
    setDpValues(new Map(dpValues));
    setMessage(
      `dp[${node}][${included ? "included" : "excluded"}] = ${result}`
    );
    await sleep(500);

    return result;
  };

  const runMaxIndependentSet = async () => {
    if (animating) return;
    setAnimating(true);
    setDpValues(new Map());
    setSelectedNodes(new Set());
    setMessage("Computing Maximum Independent Set...");
    await sleep(800);

    const includeRoot = await maxIndependentSet(0, -1, true);
    const excludeRoot = await maxIndependentSet(0, -1, false);
    const result = Math.max(includeRoot, excludeRoot);

    setCurrentNode(null);
    setMessage(`✅ Maximum Independent Set value: ${result}`);
    await sleep(1500);
    setAnimating(false);
  };

  const computeDiameter = async (
    node: number,
    parent: number
  ): Promise<number> => {
    setCurrentNode(node);
    setMessage(`Computing max depth from node ${node}...`);
    await sleep(500);

    let maxDepth1 = 0;
    let maxDepth2 = 0;

    for (const child of nodes[node].children) {
      if (child !== parent) {
        const childDepth = (await computeDiameter(child, node)) + 1;

        if (childDepth > maxDepth1) {
          maxDepth2 = maxDepth1;
          maxDepth1 = childDepth;
        } else if (childDepth > maxDepth2) {
          maxDepth2 = childDepth;
        }
      }
    }

    const diameterThroughNode = maxDepth1 + maxDepth2;
    const currentBest = dpValues.get("diameter") || 0;
    if (diameterThroughNode > currentBest) {
      dpValues.set("diameter", diameterThroughNode);
      setDpValues(new Map(dpValues));
    }

    setMessage(
      `Node ${node}: max depths ${maxDepth1}, ${maxDepth2}. Diameter through node: ${diameterThroughNode}`
    );
    await sleep(600);

    return maxDepth1;
  };

  const runDiameter = async () => {
    if (animating) return;
    setAnimating(true);
    setDpValues(new Map([["diameter", 0]]));
    setMessage("Computing Tree Diameter...");
    await sleep(800);

    await computeDiameter(0, -1);

    const diameter = dpValues.get("diameter") || 0;
    setCurrentNode(null);
    setMessage(`✅ Tree Diameter: ${diameter} edges`);
    await sleep(1500);
    setAnimating(false);
  };

  const computeSubtreeSum = async (
    node: number,
    parent: number
  ): Promise<number> => {
    setCurrentNode(node);
    setMessage(`Computing subtree sum for node ${node}...`);
    await sleep(500);

    let sum = nodes[node].value;

    for (const child of nodes[node].children) {
      if (child !== parent) {
        const childSum = await computeSubtreeSum(child, node);
        sum += childSum;
      }
    }

    dpValues.set(`sum-${node}`, sum);
    setDpValues(new Map(dpValues));
    setMessage(`Subtree sum at node ${node} = ${sum}`);
    await sleep(500);

    return sum;
  };

  const runSubtreeSum = async () => {
    if (animating) return;
    setAnimating(true);
    setDpValues(new Map());
    setMessage("Computing Subtree Sums...");
    await sleep(800);

    await computeSubtreeSum(0, -1);

    setCurrentNode(null);
    setMessage(`✅ All subtree sums computed!`);
    await sleep(1500);
    setAnimating(false);
  };

  const runAlgorithm = () => {
    if (algorithm === "independent-set") {
      runMaxIndependentSet();
    } else if (algorithm === "diameter") {
      runDiameter();
    } else if (algorithm === "subtree-sum") {
      runSubtreeSum();
    }
  };

  const reset = () => {
    setCurrentNode(null);
    setSelectedNodes(new Set());
    setDpValues(new Map());
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
          DP on Trees Visualizer
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setAlgorithm("independent-set");
                  reset();
                }}
                className="px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    algorithm === "independent-set"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color:
                    algorithm === "independent-set" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                Max Independent Set
              </button>
              <button
                onClick={() => {
                  setAlgorithm("diameter");
                  reset();
                }}
                className="px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    algorithm === "diameter"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: algorithm === "diameter" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                Tree Diameter
              </button>
              <button
                onClick={() => {
                  setAlgorithm("subtree-sum");
                  reset();
                }}
                className="px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor:
                    algorithm === "subtree-sum"
                      ? "var(--brand)"
                      : "var(--card-hover-bg)",
                  color: algorithm === "subtree-sum" ? "white" : "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              >
                Subtree Sums
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
            {animating ? "Running..." : "Run Algorithm"}
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

          {/* DP Values */}
          {dpValues.size > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                DP Table:
              </label>
              <div
                className="p-3 rounded max-h-32 overflow-y-auto"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {Array.from(dpValues.entries()).map(([key, value]) => (
                  <div
                    key={key}
                    className="text-xs font-mono mb-1"
                    style={{ color: "var(--fg)" }}
                  >
                    {key}: {value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tree Visualization */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          Tree Structure
        </h3>
        <svg
          width="400"
          height="280"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          {/* Edges */}
          {nodes.map((node) =>
            node.children.map((child) => {
              const fromPos = getNodePosition(node.id);
              const toPos = getNodePosition(child);
              return (
                <line
                  key={`edge-${node.id}-${child}`}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="var(--brand)"
                  strokeWidth="2"
                  opacity="0.5"
                />
              );
            })
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = getNodePosition(node.id);
            const isCurrent = currentNode === node.id;
            const isSelected = selectedNodes.has(node.id);

            let fillColor = "var(--panel)";
            let strokeColor = "var(--brand)";

            if (isCurrent) {
              fillColor = "#fbbf24";
            } else if (isSelected) {
              fillColor = "#10b981";
            }

            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="30"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="3"
                />
                <text
                  x={pos.x}
                  y={pos.y - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="18"
                  fontWeight="600"
                >
                  {node.id}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                >
                  ({node.value})
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
            <span>Regular</span>
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
              style={{ backgroundColor: "#10b981" }}
            ></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 Tree DP Patterns:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>
            • <strong>Max Independent Set:</strong> dp[node][include/exclude] -
            no adjacent nodes
          </li>
          <li>
            • <strong>Tree Diameter:</strong> Track two deepest paths through
            each node
          </li>
          <li>
            • <strong>Subtree Sums:</strong> Aggregate children's results
            bottom-up
          </li>
          <li>
            • <strong>Time:</strong> O(n) - visit each node once in DFS
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DPOnTreesVisualizer;
