import React, { useState } from "react";

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

const BinaryTreeVisualizer: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("1,2,3,4,5,null,6");
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [treeHeight, setTreeHeight] = useState<number>(0);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Build tree from level-order array (LeetCode format)
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

  // Calculate node positions for visualization
  const calculatePositions = (
    node: TreeNode | null,
    x: number,
    y: number,
    offset: number
  ): void => {
    if (!node) return;

    node.x = x;
    node.y = y;

    if (node.left) {
      calculatePositions(node.left, x - offset, y + 80, offset / 2);
    }
    if (node.right) {
      calculatePositions(node.right, x + offset, y + 80, offset / 2);
    }
  };

  // Count total nodes
  const countNodes = (node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  };

  // Calculate tree height
  const calculateHeight = (node: TreeNode | null): number => {
    if (!node) return 0;
    return (
      1 + Math.max(calculateHeight(node.left), calculateHeight(node.right))
    );
  };

  // Render tree connections (edges)
  const renderEdges = (node: TreeNode | null): JSX.Element[] => {
    if (!node) return [];
    const edges: JSX.Element[] = [];

    if (node.left && node.x !== undefined && node.y !== undefined) {
      edges.push(
        <line
          key={`edge-${node.val}-${node.left.val}`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke="var(--fg)"
          strokeWidth="2"
          opacity="0.3"
        />
      );
      edges.push(...renderEdges(node.left));
    }

    if (node.right && node.x !== undefined && node.y !== undefined) {
      edges.push(
        <line
          key={`edge-${node.val}-${node.right.val}`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke="var(--fg)"
          strokeWidth="2"
          opacity="0.3"
        />
      );
      edges.push(...renderEdges(node.right));
    }

    return edges;
  };

  // Render tree nodes
  const renderNodes = (node: TreeNode | null): JSX.Element[] => {
    if (!node || node.x === undefined || node.y === undefined) return [];
    const nodes: JSX.Element[] = [];

    nodes.push(
      <g key={`node-${node.val}-${node.x}-${node.y}`}>
        <circle
          cx={node.x}
          cy={node.y}
          r={25}
          fill={hoveredNode === node.val ? "var(--brand)" : "var(--panel)"}
          stroke="var(--brand)"
          strokeWidth="2"
          style={{
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={() => setHoveredNode(node.val)}
          onMouseLeave={() => setHoveredNode(null)}
        />
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={hoveredNode === node.val ? "white" : "var(--fg)"}
          fontSize="16"
          fontWeight="600"
          style={{ pointerEvents: "none" }}
        >
          {node.val}
        </text>
      </g>
    );

    if (node.left) nodes.push(...renderNodes(node.left));
    if (node.right) nodes.push(...renderNodes(node.right));

    return nodes;
  };

  const handleBuildTree = () => {
    const values = inputValue.split(",").map((v) => v.trim());
    const newTree = buildTree(values);

    if (newTree) {
      calculatePositions(newTree, 300, 40, 120);
      setTree(newTree);
      setNodeCount(countNodes(newTree));
      setTreeHeight(calculateHeight(newTree));
    }
  };

  const loadExample = (example: string) => {
    const examples: { [key: string]: string } = {
      perfect: "1,2,3,4,5,6,7",
      skewed: "1,2,null,3,null,4",
      balanced: "5,3,8,1,4,7,9",
      complete: "1,2,3,4,5,6",
    };
    setInputValue(examples[example]);
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
          Interactive Binary Tree Builder
        </h3>

        <div className="space-y-3">
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Enter values (level-order, comma-separated, use 'null' for empty):
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="1,2,3,4,5,null,6"
              className="w-full px-4 py-2 rounded border"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                borderColor: "var(--brand)",
              }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleBuildTree}
              className="build-tree-btn px-4 py-2 rounded font-medium transition-all duration-300"
              style={{
                backgroundColor: "var(--brand)",
                color: "white",
              }}
            >
              Build Tree
            </button>
            <button
              onClick={() => loadExample("perfect")}
              className="tree-example-btn px-3 py-2 rounded text-sm transition-all duration-300"
              style={{
                backgroundColor: "var(--card-hover-bg)",
                color: "var(--fg)",
              }}
            >
              Perfect Tree
            </button>
            <button
              onClick={() => loadExample("balanced")}
              className="tree-example-btn px-3 py-2 rounded text-sm transition-all duration-300"
              style={{
                backgroundColor: "var(--card-hover-bg)",
                color: "var(--fg)",
              }}
            >
              Balanced Tree
            </button>
            <button
              onClick={() => loadExample("skewed")}
              className="tree-example-btn px-3 py-2 rounded text-sm transition-all duration-300"
              style={{
                backgroundColor: "var(--card-hover-bg)",
                color: "var(--fg)",
              }}
            >
              Skewed Tree
            </button>
            <button
              onClick={() => loadExample("complete")}
              className="tree-example-btn px-3 py-2 rounded text-sm transition-all duration-300"
              style={{
                backgroundColor: "var(--card-hover-bg)",
                color: "var(--fg)",
              }}
            >
              Complete Tree
            </button>
          </div>
        </div>

        {tree && (
          <div
            className="mt-4 flex gap-6 text-sm"
            style={{ color: "var(--fg)" }}
          >
            <div>
              <span className="font-semibold">Total Nodes:</span> {nodeCount}
            </div>
            <div>
              <span className="font-semibold">Tree Height:</span> {treeHeight}
            </div>
          </div>
        )}
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
        </div>
      )}

      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>Tip:</strong> Hover over nodes to highlight them. Try
          different examples to see perfect, balanced, skewed, and complete
          binary trees!
        </p>
      </div>
    </div>
  );
};

export default BinaryTreeVisualizer;
