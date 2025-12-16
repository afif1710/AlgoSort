import React, { useState } from "react";
import SpeedControl from "./SpeedControl"; // ✅ STEP 1: Import added

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

const BSTVisualizer: React.FC = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [deleteValue, setDeleteValue] = useState<string>("");
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [searchPath, setSearchPath] = useState<Set<number>>(new Set());
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // ✅ STEP 2: State added

  const insertNode = (root: TreeNode | null, val: number): TreeNode => {
    if (!root) {
      return { val, left: null, right: null };
    }
    if (val < root.val) {
      root.left = insertNode(root.left, val);
    } else if (val > root.val) {
      root.right = insertNode(root.right, val);
    }
    return root;
  };

  const searchNode = async (
    root: TreeNode | null,
    target: number,
    path: Set<number> = new Set()
  ): Promise<boolean> => {
    if (!root) {
      setMessage(`❌ Value ${target} not found in BST`);
      return false;
    }

    path.add(root.val);
    setSearchPath(new Set(path));
    setHighlightedNode(root.val);
    await sleep(600);

    if (root.val === target) {
      setMessage(`✅ Found ${target}!`);
      return true;
    }

    if (target < root.val) {
      setMessage(`${target} < ${root.val}, searching left...`);
      await sleep(400);
      return searchNode(root.left, target, path);
    } else {
      setMessage(`${target} > ${root.val}, searching right...`);
      await sleep(400);
      return searchNode(root.right, target, path);
    }
  };

  const findMin = (root: TreeNode): TreeNode => {
    while (root.left) {
      root = root.left;
    }
    return root;
  };

  const deleteNode = (root: TreeNode | null, key: number): TreeNode | null => {
    if (!root) return null;

    if (key < root.val) {
      root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
      root.right = deleteNode(root.right, key);
    } else {
      // Node with one child or no child
      if (!root.left) return root.right;
      if (!root.right) return root.left;

      // Node with two children: get inorder successor
      const minNode = findMin(root.right);
      root.val = minNode.val;
      root.right = deleteNode(root.right, minNode.val);
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

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) {
      setMessage("❌ Please enter a valid number");
      return;
    }

    const newTree = insertNode(tree, val);
    calculatePositions(newTree, 300, 40, 120);
    setTree({ ...newTree });
    setMessage(`✅ Inserted ${val} into BST`);
    setInputValue("");
    setHighlightedNode(null);
    setSearchPath(new Set());
  };

  const handleSearch = async () => {
    const val = parseInt(searchValue);
    if (isNaN(val)) {
      setMessage("❌ Please enter a valid number");
      return;
    }
    if (!tree) {
      setMessage("❌ Tree is empty");
      return;
    }

    setSearchPath(new Set());
    setMessage(`🔍 Searching for ${val}...`);
    await searchNode(tree, val);

    setTimeout(() => {
      setHighlightedNode(null);
      setSearchPath(new Set());
    }, 2000 / animationSpeed);
  };

  const handleDelete = () => {
    const val = parseInt(deleteValue);
    if (isNaN(val)) {
      setMessage("❌ Please enter a valid number");
      return;
    }
    if (!tree) {
      setMessage("❌ Tree is empty");
      return;
    }

    const newTree = deleteNode(tree, val);
    if (newTree) {
      calculatePositions(newTree, 300, 40, 120);
    }
    setTree(newTree);
    setMessage(`✅ Deleted ${val} from BST`);
    setDeleteValue("");
    setHighlightedNode(null);
    setSearchPath(new Set());
  };

  const loadExample = () => {
    let exampleTree: TreeNode = { val: 8, left: null, right: null };
    [3, 10, 1, 6, 14, 4, 7].forEach((val) => {
      exampleTree = insertNode(exampleTree, val);
    });
    calculatePositions(exampleTree, 300, 40, 120);
    setTree(exampleTree);
    setMessage("✅ Loaded example BST: [8,3,10,1,6,14,4,7]");
    setHighlightedNode(null);
    setSearchPath(new Set());
  };

  const clearTree = () => {
    setTree(null);
    setMessage("🗑️ Tree cleared");
    setHighlightedNode(null);
    setSearchPath(new Set());
  };

  const renderEdges = (node: TreeNode | null): JSX.Element[] => {
    if (!node) return [];
    const edges: JSX.Element[] = [];

    if (node.left && node.x !== undefined && node.y !== undefined) {
      const isInPath =
        searchPath.has(node.val) && searchPath.has(node.left.val);
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
        searchPath.has(node.val) && searchPath.has(node.right.val);
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
    const isInPath = searchPath.has(node.val);

    let fillColor = "var(--panel)";
    let strokeColor = "var(--brand)";
    let textColor = "var(--fg)";

    if (isHighlighted) {
      fillColor = "#fbbf24";
      textColor = "white";
      strokeColor = "#f59e0b";
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
          Interactive BST Operations
        </h3>

        <div className="space-y-4">
          {/* ✅ STEP 4: Speed Control Component Added */}
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Insert */}
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleInsert()}
              placeholder="Enter value to insert"
              className="flex-1 px-4 py-2 rounded border"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                borderColor: "var(--brand)",
              }}
            />
            <button
              onClick={handleInsert}
              className="build-tree-btn px-4 py-2 rounded font-medium"
              style={{ backgroundColor: "var(--brand)", color: "white" }}
            >
              Insert
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="number"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter value to search"
              className="flex-1 px-4 py-2 rounded border"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                borderColor: "var(--brand)",
              }}
            />
            <button
              onClick={handleSearch}
              className="tree-example-btn px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
              }}
            >
              Search
            </button>
          </div>

          {/* Delete */}
          <div className="flex gap-2">
            <input
              type="number"
              value={deleteValue}
              onChange={(e) => setDeleteValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleDelete()}
              placeholder="Enter value to delete"
              className="flex-1 px-4 py-2 rounded border"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                borderColor: "var(--brand)",
              }}
            />
            <button
              onClick={handleDelete}
              className="tree-example-btn px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
              }}
            >
              Delete
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={loadExample}
              className="tree-example-btn px-4 py-2 rounded text-sm"
              style={{
                backgroundColor: "var(--card-hover-bg)",
                color: "var(--fg)",
              }}
            >
              Load Example BST
            </button>
            <button
              onClick={clearTree}
              className="tree-example-btn px-4 py-2 rounded text-sm"
              style={{
                backgroundColor: "var(--card-hover-bg)",
                color: "var(--fg)",
              }}
            >
              Clear Tree
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className="p-3 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
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
                style={{ backgroundColor: "#fbbf24" }}
              ></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "var(--brand)" }}
              ></div>
              <span>Path</span>
            </div>
          </div>
        </div>
      )}

      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Tip:</strong> In a BST, left children are always smaller
          and right children are always larger. Watch the search animation
          follow this property!
        </p>
      </div>
    </div>
  );
};

export default BSTVisualizer;
