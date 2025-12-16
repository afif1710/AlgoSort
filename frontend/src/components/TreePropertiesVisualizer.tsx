import React, { useState } from "react";
import SpeedControl from "./SpeedControl"; // ✅ STEP 1: Import added

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

type VisualizationMode = "path-sum" | "diameter" | "lca" | "left-leaves";

const TreePropertiesVisualizer: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>(
    "5,4,8,11,null,13,4,7,2,null,null,null,1"
  );
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [mode, setMode] = useState<VisualizationMode>("path-sum");
  const [targetSum, setTargetSum] = useState<string>("22");
  const [node1Val, setNode1Val] = useState<string>("5");
  const [node2Val, setNode2Val] = useState<string>("1");
  const [highlightedPath, setHighlightedPath] = useState<Set<number>>(
    new Set()
  );
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);
  const [result, setResult] = useState<string>("");
  const [animating, setAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // ✅ STEP 2: State added

  const buildTree = (values: string[]): TreeNode | null => {
    if (values.length === 0 || values[0] === "null") return null;

    const root: TreeNode = {
      val: parseInt(values[0]),
      left: null,
      right: null,
    };
    const queue: TreeNode[] = [root];
    let i = 1;

    while (queue.length > 0 && i < values.length) {
      const node = queue.shift()!;

      if (i < values.length && values[i] !== "null") {
        node.left = { val: parseInt(values[i]), left: null, right: null };
        queue.push(node.left);
      }
      i++;

      if (i < values.length && values[i] !== "null") {
        node.right = { val: parseInt(values[i]), left: null, right: null };
        queue.push(node.right);
      }
      i++;
    }

    return root;
  };

  const calculatePositions = (
    node: TreeNode | null,
    x: number,
    y: number,
    offset: number
  ): void => {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left)
      calculatePositions(node.left, x - offset, y + 80, offset / 2);
    if (node.right)
      calculatePositions(node.right, x + offset, y + 80, offset / 2);
  };

  // ✅ STEP 3: Updated sleep function
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const hasPathSumAnimation = async (
    node: TreeNode | null,
    remaining: number,
    path: Set<number>
  ): Promise<boolean> => {
    if (!node) return false;

    path.add(node.val);
    setHighlightedPath(new Set(path));
    setHighlightedNode(node.val);
    await sleep(600);

    // Leaf node
    if (!node.left && !node.right) {
      if (remaining === node.val) {
        setResult(`✅ Found path with sum ${targetSum}!`);
        return true;
      }
      path.delete(node.val);
      setHighlightedPath(new Set(path));
      await sleep(400);
      return false;
    }

    const newRemaining = remaining - node.val;

    if (await hasPathSumAnimation(node.left, newRemaining, new Set(path))) {
      return true;
    }

    if (await hasPathSumAnimation(node.right, newRemaining, new Set(path))) {
      return true;
    }

    path.delete(node.val);
    setHighlightedPath(new Set(path));
    await sleep(400);
    return false;
  };

  const calculateDiameter = (
    node: TreeNode | null
  ): { diameter: number; height: number } => {
    if (!node) return { diameter: 0, height: 0 };

    const left = calculateDiameter(node.left);
    const right = calculateDiameter(node.right);

    const currentDiameter = left.height + right.height;
    const maxDiameter = Math.max(
      currentDiameter,
      left.diameter,
      right.diameter
    );

    return {
      diameter: maxDiameter,
      height: 1 + Math.max(left.height, right.height),
    };
  };

  const findLCA = (
    node: TreeNode | null,
    p: number,
    q: number
  ): TreeNode | null => {
    if (!node || node.val === p || node.val === q) {
      return node;
    }

    const left = findLCA(node.left, p, q);
    const right = findLCA(node.right, p, q);

    if (left && right) return node;
    return left || right;
  };

  const sumLeftLeaves = (
    node: TreeNode | null,
    isLeft: boolean = false
  ): number => {
    if (!node) return 0;

    // If it's a left leaf
    if (isLeft && !node.left && !node.right) {
      return node.val;
    }

    return sumLeftLeaves(node.left, true) + sumLeftLeaves(node.right, false);
  };

  const handleBuildTree = () => {
    const values = inputValue.split(",").map((v) => v.trim());
    const newTree = buildTree(values);
    if (newTree) {
      calculatePositions(newTree, 300, 40, 120);
      setTree(newTree);
      setHighlightedPath(new Set());
      setHighlightedNode(null);
      setResult("");
    }
  };

  const handleVisualize = async () => {
    if (!tree || animating) return;
    setAnimating(true);
    setHighlightedPath(new Set());
    setHighlightedNode(null);
    setResult("");

    try {
      if (mode === "path-sum") {
        const target = parseInt(targetSum);
        if (isNaN(target)) {
          setResult("❌ Please enter valid target sum");
          return;
        }
        const found = await hasPathSumAnimation(tree, target, new Set());
        if (!found) {
          setResult(`❌ No path with sum ${target} found`);
        }
      } else if (mode === "diameter") {
        const { diameter } = calculateDiameter(tree);
        setResult(`📏 Diameter of tree: ${diameter} edges`);
      } else if (mode === "lca") {
        const p = parseInt(node1Val);
        const q = parseInt(node2Val);
        if (isNaN(p) || isNaN(q)) {
          setResult("❌ Please enter valid node values");
          return;
        }
        const lca = findLCA(tree, p, q);
        if (lca) {
          setHighlightedNode(lca.val);
          setResult(`🔍 LCA of ${p} and ${q} is: ${lca.val}`);
        } else {
          setResult(`❌ One or both nodes not found`);
        }
      } else if (mode === "left-leaves") {
        const sum = sumLeftLeaves(tree);
        // Highlight left leaves
        const highlightLeftLeaves = (
          node: TreeNode | null,
          isLeft: boolean = false
        ) => {
          if (!node) return;
          if (isLeft && !node.left && !node.right) {
            setHighlightedPath((prev) => new Set([...prev, node.val]));
          }
          highlightLeftLeaves(node.left, true);
          highlightLeftLeaves(node.right, false);
        };
        highlightLeftLeaves(tree);
        setResult(`🍃 Sum of left leaves: ${sum}`);
      }
    } finally {
      setAnimating(false);
    }
  };

  const renderEdges = (node: TreeNode | null): JSX.Element[] => {
    if (!node) return [];
    const edges: JSX.Element[] = [];

    if (node.left && node.x !== undefined && node.y !== undefined) {
      const isInPath =
        highlightedPath.has(node.val) && highlightedPath.has(node.left.val);
      edges.push(
        <line
          key={`edge-${node.val}-${node.left.val}`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke={isInPath ? "var(--brand)" : "var(--fg)"}
          strokeWidth={isInPath ? "3" : "2"}
          opacity={isInPath ? "1" : "0.3"}
        />
      );
      edges.push(...renderEdges(node.left));
    }

    if (node.right && node.x !== undefined && node.y !== undefined) {
      const isInPath =
        highlightedPath.has(node.val) && highlightedPath.has(node.right.val);
      edges.push(
        <line
          key={`edge-${node.val}-${node.right.val}`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke={isInPath ? "var(--brand)" : "var(--fg)"}
          strokeWidth={isInPath ? "3" : "2"}
          opacity={isInPath ? "1" : "0.3"}
        />
      );
      edges.push(...renderEdges(node.right));
    }

    return edges;
  };

  const renderNodes = (node: TreeNode | null): JSX.Element[] => {
    if (!node || node.x === undefined || node.y === undefined) return [];
    const nodes: JSX.Element[] = [];

    const isHighlighted = highlightedNode === node.val;
    const isInPath = highlightedPath.has(node.val);

    let fillColor = "var(--panel)";
    let strokeColor = "var(--brand)";
    let textColor = "var(--fg)";

    if (isHighlighted) {
      fillColor = "#10b981";
      textColor = "white";
      strokeColor = "#059669";
    } else if (isInPath) {
      fillColor = "var(--brand)";
      textColor = "white";
    }

    nodes.push(
      <g key={`node-${node.val}-${node.x}-${node.y}`}>
        <circle
          cx={node.x}
          cy={node.y}
          r={25}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
          style={{ transition: "all 0.3s ease" }}
        />
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize="16"
          fontWeight="600"
        >
          {node.val}
        </text>
      </g>
    );

    if (node.left) nodes.push(...renderNodes(node.left));
    if (node.right) nodes.push(...renderNodes(node.right));

    return nodes;
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
          Tree Properties & Path Algorithms
        </h3>

        <div className="space-y-3">
          {/* ✅ STEP 4: Speed Control Component Added */}
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Enter tree values (level-order):
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="5,4,8,11,null,13,4,7,2"
              className="w-full px-4 py-2 rounded border"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                borderColor: "var(--brand)",
              }}
            />
          </div>

          <button
            onClick={handleBuildTree}
            className="build-tree-btn px-4 py-2 rounded font-medium"
            style={{ backgroundColor: "var(--brand)", color: "white" }}
          >
            Build Tree
          </button>

          {tree && (
            <>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Select Algorithm:
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setMode("path-sum")}
                    className="tree-example-btn px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor:
                        mode === "path-sum"
                          ? "var(--brand)"
                          : "var(--card-hover-bg)",
                      color: mode === "path-sum" ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                    }}
                  >
                    Path Sum
                  </button>
                  <button
                    onClick={() => setMode("diameter")}
                    className="tree-example-btn px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor:
                        mode === "diameter"
                          ? "var(--brand)"
                          : "var(--card-hover-bg)",
                      color: mode === "diameter" ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                    }}
                  >
                    Diameter
                  </button>
                  <button
                    onClick={() => setMode("lca")}
                    className="tree-example-btn px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor:
                        mode === "lca"
                          ? "var(--brand)"
                          : "var(--card-hover-bg)",
                      color: mode === "lca" ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                    }}
                  >
                    LCA
                  </button>
                  <button
                    onClick={() => setMode("left-leaves")}
                    className="tree-example-btn px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor:
                        mode === "left-leaves"
                          ? "var(--brand)"
                          : "var(--card-hover-bg)",
                      color: mode === "left-leaves" ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                    }}
                  >
                    Left Leaves Sum
                  </button>
                </div>
              </div>

              {mode === "path-sum" && (
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: "var(--fg)" }}
                  >
                    Target Sum:
                  </label>
                  <input
                    type="number"
                    value={targetSum}
                    onChange={(e) => setTargetSum(e.target.value)}
                    placeholder="22"
                    className="w-full px-4 py-2 rounded border"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--fg)",
                      borderColor: "var(--brand)",
                    }}
                  />
                </div>
              )}

              {mode === "lca" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label
                      className="block text-sm mb-2"
                      style={{ color: "var(--fg)" }}
                    >
                      Node 1:
                    </label>
                    <input
                      type="number"
                      value={node1Val}
                      onChange={(e) => setNode1Val(e.target.value)}
                      placeholder="5"
                      className="w-full px-4 py-2 rounded border"
                      style={{
                        backgroundColor: "var(--bg)",
                        color: "var(--fg)",
                        borderColor: "var(--brand)",
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      className="block text-sm mb-2"
                      style={{ color: "var(--fg)" }}
                    >
                      Node 2:
                    </label>
                    <input
                      type="number"
                      value={node2Val}
                      onChange={(e) => setNode2Val(e.target.value)}
                      placeholder="1"
                      className="w-full px-4 py-2 rounded border"
                      style={{
                        backgroundColor: "var(--bg)",
                        color: "var(--fg)",
                        borderColor: "var(--brand)",
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleVisualize}
                disabled={animating}
                className="build-tree-btn px-6 py-2 rounded font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#10b981",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                {animating ? "Visualizing..." : "Visualize"}
              </button>

              {result && (
                <div
                  className="p-4 rounded text-sm font-medium"
                  style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
                >
                  {result}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {tree && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--panel)" }}
        >
          <svg
            width="600"
            height="400"
            style={{ width: "100%", maxWidth: "600px" }}
          >
            {renderEdges(tree)}
            {renderNodes(tree)}
          </svg>
          <div
            className="mt-4 flex gap-4 text-sm"
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
              <span>Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "#10b981" }}
              ></div>
              <span>Result/LCA</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "var(--brand)" }}
              ></div>
              <span>Path/Highlighted</span>
            </div>
          </div>
        </div>
      )}

      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Algorithms:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4">
          <li>
            • <strong>Path Sum:</strong> DFS with backtracking to find
            root-to-leaf path
          </li>
          <li>
            • <strong>Diameter:</strong> Longest path between any two nodes
          </li>
          <li>
            • <strong>LCA:</strong> Lowest Common Ancestor of two nodes
          </li>
          <li>
            • <strong>Left Leaves:</strong> Sum all leaf nodes that are left
            children
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TreePropertiesVisualizer;
