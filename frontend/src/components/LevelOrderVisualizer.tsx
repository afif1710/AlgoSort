import React, { useState } from "react";
import SpeedControl from "./SpeedControl"; // ✅ STEP 1: Import added

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  level?: number;
}

const LevelOrderVisualizer: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("3,9,20,null,null,15,7");
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [traversalResult, setTraversalResult] = useState<number[][]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [currentNodes, setCurrentNodes] = useState<Set<number>>(new Set());
  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [animating, setAnimating] = useState(false);
  const [queueState, setQueueState] = useState<number[]>([]);
  const [mode, setMode] = useState<"normal" | "zigzag" | "rightview">("normal");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // ✅ STEP 2: State added

  const buildTree = (values: string[]): TreeNode | null => {
    if (values.length === 0 || values[0] === "null") return null;

    const root: TreeNode = {
      val: parseInt(values[0]),
      left: null,
      right: null,
      level: 0,
    };
    const queue: TreeNode[] = [root];
    let i = 1;

    while (queue.length > 0 && i < values.length) {
      const node = queue.shift()!;

      if (i < values.length && values[i] !== "null") {
        node.left = {
          val: parseInt(values[i]),
          left: null,
          right: null,
          level: (node.level || 0) + 1,
        };
        queue.push(node.left);
      }
      i++;

      if (i < values.length && values[i] !== "null") {
        node.right = {
          val: parseInt(values[i]),
          left: null,
          right: null,
          level: (node.level || 0) + 1,
        };
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

  const levelOrderTraversal = async (root: TreeNode): Promise<number[][]> => {
    const result: number[][] = [];
    const queue: TreeNode[] = [root];
    setQueueState([root.val]);

    while (queue.length > 0) {
      await sleep(800);
      const levelSize = queue.length;
      const currentLevel: number[] = [];
      const levelNodes = new Set<number>();

      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift()!;
        currentLevel.push(node.val);
        levelNodes.add(node.val);

        setCurrentNodes(new Set([node.val]));
        await sleep(600);

        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }

      setQueueState(queue.map((n) => n.val));
      result.push(currentLevel);
      setTraversalResult([...result]);
      setVisitedNodes((prev) => new Set([...prev, ...levelNodes]));
      setCurrentLevel(result.length - 1);
      await sleep(400);
    }

    setCurrentNodes(new Set());
    return result;
  };

  const zigzagTraversal = async (root: TreeNode): Promise<number[][]> => {
    const result: number[][] = [];
    const queue: TreeNode[] = [root];
    let leftToRight = true;

    while (queue.length > 0) {
      await sleep(800);
      const levelSize = queue.length;
      const currentLevel: number[] = [];
      const levelNodes = new Set<number>();

      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift()!;
        currentLevel.push(node.val);
        levelNodes.add(node.val);

        setCurrentNodes(new Set([node.val]));
        await sleep(600);

        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }

      if (!leftToRight) {
        currentLevel.reverse();
      }

      result.push(currentLevel);
      setTraversalResult([...result]);
      setVisitedNodes((prev) => new Set([...prev, ...levelNodes]));
      setCurrentLevel(result.length - 1);
      leftToRight = !leftToRight;
      await sleep(400);
    }

    setCurrentNodes(new Set());
    return result;
  };

  const rightSideView = async (root: TreeNode): Promise<number[][]> => {
    const result: number[][] = [];
    const rightView: number[] = [];
    const queue: TreeNode[] = [root];

    while (queue.length > 0) {
      await sleep(800);
      const levelSize = queue.length;
      const currentLevel: number[] = [];
      const levelNodes = new Set<number>();

      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift()!;
        currentLevel.push(node.val);
        levelNodes.add(node.val);

        setCurrentNodes(new Set([node.val]));
        await sleep(600);

        // Last node in level
        if (i === levelSize - 1) {
          rightView.push(node.val);
        }

        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }

      result.push(currentLevel);
      setTraversalResult([...result]);
      setVisitedNodes((prev) => new Set([...prev, ...levelNodes]));
      setCurrentLevel(result.length - 1);
      await sleep(400);
    }

    setCurrentNodes(new Set());
    // Show right view as final result
    setTraversalResult([rightView]);
    return result;
  };

  const handleBuildTree = () => {
    const values = inputValue.split(",").map((v) => v.trim());
    const newTree = buildTree(values);
    if (newTree) {
      calculatePositions(newTree, 300, 40, 120);
      setTree(newTree);
      setTraversalResult([]);
      setVisitedNodes(new Set());
      setCurrentNodes(new Set());
      setCurrentLevel(-1);
      setQueueState([]);
    }
  };

  const handleTraverse = async () => {
    if (!tree || animating) return;
    setAnimating(true);
    setTraversalResult([]);
    setVisitedNodes(new Set());
    setCurrentNodes(new Set());
    setCurrentLevel(-1);

    if (mode === "normal") {
      await levelOrderTraversal(tree);
    } else if (mode === "zigzag") {
      await zigzagTraversal(tree);
    } else {
      await rightSideView(tree);
    }

    setAnimating(false);
    setQueueState([]);
  };

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

  const renderNodes = (node: TreeNode | null): JSX.Element[] => {
    if (!node || node.x === undefined || node.y === undefined) return [];
    const nodes: JSX.Element[] = [];

    const isCurrent = currentNodes.has(node.val);
    const isVisited = visitedNodes.has(node.val);

    let fillColor = "var(--panel)";
    let strokeColor = "var(--brand)";
    let textColor = "var(--fg)";

    if (isCurrent) {
      fillColor = "#fbbf24";
      textColor = "white";
      strokeColor = "#f59e0b";
    } else if (isVisited) {
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
          Interactive Level Order Traversal
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
              Enter values (level-order, use 'null' for empty):
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="3,9,20,null,null,15,7"
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
              className="build-tree-btn px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: "var(--brand)",
                color: "white",
              }}
            >
              Build Tree
            </button>
          </div>

          {tree && (
            <>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  Select Traversal Mode:
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setMode("normal")}
                    className={`tree-example-btn px-4 py-2 rounded text-sm transition-all duration-300`}
                    style={{
                      backgroundColor:
                        mode === "normal"
                          ? "var(--brand)"
                          : "var(--card-hover-bg)",
                      color: mode === "normal" ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                    }}
                  >
                    Normal BFS
                  </button>
                  <button
                    onClick={() => setMode("zigzag")}
                    className={`tree-example-btn px-4 py-2 rounded text-sm transition-all duration-300`}
                    style={{
                      backgroundColor:
                        mode === "zigzag"
                          ? "var(--brand)"
                          : "var(--card-hover-bg)",
                      color: mode === "zigzag" ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                    }}
                  >
                    Zigzag
                  </button>
                  <button
                    onClick={() => setMode("rightview")}
                    className={`tree-example-btn px-4 py-2 rounded text-sm transition-all duration-300`}
                    style={{
                      backgroundColor:
                        mode === "rightview"
                          ? "var(--brand)"
                          : "var(--card-hover-bg)",
                      color: mode === "rightview" ? "white" : "var(--fg)",
                      border: "2px solid var(--brand)",
                    }}
                  >
                    Right Side View
                  </button>
                </div>
              </div>

              <button
                onClick={handleTraverse}
                disabled={animating}
                className="build-tree-btn px-6 py-2 rounded font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#10b981",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                {animating ? "Traversing..." : "Start Traversal"}
              </button>
            </>
          )}

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
                {queueState.map((val, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded font-mono text-sm"
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                    }}
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          )}

          {traversalResult.length > 0 && (
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                {mode === "rightview"
                  ? "Right Side View:"
                  : "Level Order Result:"}
              </p>
              <div className="space-y-2">
                {traversalResult.map((level, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {mode === "rightview" ? "View:" : `Level ${idx}:`}
                    </span>
                    <div className="flex gap-2">
                      {level.map((val, vidx) => (
                        <span
                          key={vidx}
                          className="px-3 py-1 rounded font-mono text-sm"
                          style={{
                            backgroundColor: "var(--brand)",
                            color: "white",
                          }}
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
      )}

      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 How BFS Works:</strong> Uses a queue (FIFO) to process
          nodes level-by-level. Watch the queue state to see upcoming nodes!
        </p>
      </div>
    </div>
  );
};

export default LevelOrderVisualizer;
