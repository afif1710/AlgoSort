import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const SegmentTreeVisualizer: React.FC = () => {
  const [array, setArray] = useState<number[]>([1, 3, 5, 7, 9, 11]);
  const [tree, setTree] = useState<number[]>([]);
  const [inputArray, setInputArray] = useState<string>("1,3,5,7,9,11");
  const [queryL, setQueryL] = useState<string>("");
  const [queryR, setQueryR] = useState<string>("");
  const [updateIdx, setUpdateIdx] = useState<string>("");
  const [updateVal, setUpdateVal] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(
    new Set()
  );
  const [message, setMessage] = useState<string>("");
  const [queryResult, setQueryResult] = useState<number | null>(null);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  // Build segment tree
  const buildTree = (arr: number[]) => {
    const n = arr.length;
    const segTree = Array(4 * n).fill(0);

    const build = (node: number, start: number, end: number) => {
      if (start === end) {
        segTree[node] = arr[start];
      } else {
        const mid = Math.floor((start + end) / 2);
        const leftChild = 2 * node + 1;
        const rightChild = 2 * node + 2;
        build(leftChild, start, mid);
        build(rightChild, mid + 1, end);
        segTree[node] = segTree[leftChild] + segTree[rightChild];
      }
    };

    build(0, 0, n - 1);
    return segTree;
  };

  const handleBuild = () => {
    try {
      const arr = inputArray.split(",").map((x) => parseInt(x.trim()));
      if (arr.some(isNaN) || arr.length < 2 || arr.length > 8) {
        alert("Please enter 2-8 valid numbers separated by commas");
        return;
      }
      setArray(arr);
      const newTree = buildTree(arr);
      setTree(newTree);
      setMessage(
        `✅ Segment tree built! Tree has ${newTree.length} nodes for ${arr.length} elements.`
      );
      setHighlightedNodes(new Set());
      setQueryResult(null);
    } catch (e) {
      alert("Invalid input format");
    }
  };

  const queryTree = async (
    node: number,
    start: number,
    end: number,
    L: number,
    R: number
  ): Promise<number> => {
    setHighlightedNodes(new Set([node]));
    await sleep(400);

    // No overlap
    if (R < start || L > end) {
      return 0;
    }

    // Complete overlap
    if (L <= start && end <= R) {
      setMessage(
        `Node ${node} [${start},${end}] completely overlaps query [${L},${R}]. Using sum: ${tree[node]}`
      );
      await sleep(600);
      return tree[node];
    }

    // Partial overlap
    setMessage(
      `Node ${node} [${start},${end}] partially overlaps query [${L},${R}]. Querying children...`
    );
    await sleep(600);

    const mid = Math.floor((start + end) / 2);
    const leftSum = await queryTree(2 * node + 1, start, mid, L, R);
    const rightSum = await queryTree(2 * node + 2, mid + 1, end, L, R);
    return leftSum + rightSum;
  };

  const handleQuery = async () => {
    const L = parseInt(queryL);
    const R = parseInt(queryR);

    if (isNaN(L) || isNaN(R) || L < 0 || R >= array.length || L > R) {
      alert(`Please enter valid range [0-${array.length - 1}]`);
      return;
    }

    if (tree.length === 0) {
      alert("Please build tree first!");
      return;
    }

    setAnimating(true);
    setHighlightedNodes(new Set());
    setQueryResult(null);
    setMessage(`Querying range [${L}, ${R}]...`);
    await sleep(500);

    const result = await queryTree(0, 0, array.length - 1, L, R);

    setQueryResult(result);
    setMessage(`✅ Sum of range [${L}, ${R}] = ${result}`);
    setAnimating(false);
    await sleep(1000);
    setHighlightedNodes(new Set());
  };

  const updateTree = (
    node: number,
    start: number,
    end: number,
    idx: number,
    value: number,
    newTree: number[]
  ) => {
    if (start === end) {
      newTree[node] = value;
    } else {
      const mid = Math.floor((start + end) / 2);
      const leftChild = 2 * node + 1;
      const rightChild = 2 * node + 2;

      if (idx <= mid) {
        updateTree(leftChild, start, mid, idx, value, newTree);
      } else {
        updateTree(rightChild, mid + 1, end, idx, value, newTree);
      }

      newTree[node] = newTree[leftChild] + newTree[rightChild];
    }
  };

  const handleUpdate = async () => {
    const idx = parseInt(updateIdx);
    const val = parseInt(updateVal);

    if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= array.length) {
      alert(`Please enter valid index [0-${array.length - 1}] and value`);
      return;
    }

    if (tree.length === 0) {
      alert("Please build tree first!");
      return;
    }

    setAnimating(true);
    setMessage(`Updating index ${idx} to value ${val}...`);
    await sleep(500);

    const newArray = [...array];
    newArray[idx] = val;
    const newTree = [...tree];
    updateTree(0, 0, array.length - 1, idx, val, newTree);

    setArray(newArray);
    setTree(newTree);
    setMessage(
      `✅ Updated array[${idx}] = ${val}. Tree updated in O(log n) time.`
    );
    setAnimating(false);
    setUpdateIdx("");
    setUpdateVal("");
  };

  const loadExample = (type: string) => {
    if (type === "small") {
      setInputArray("2,4,6,8");
    } else if (type === "medium") {
      setInputArray("1,3,5,7,9,11");
    } else if (type === "large") {
      setInputArray("10,20,30,40,50,60,70,80");
    }
  };

  // Simple tree visualization (level order)
  const getTreeLevels = () => {
    if (tree.length === 0) return [];
    const levels: number[][] = [];
    let level = 0;
    let idx = 0;

    while (idx < tree.length && level < 4) {
      const levelSize = Math.pow(2, level);
      const levelNodes: number[] = [];
      for (let i = 0; i < levelSize && idx < tree.length; i++, idx++) {
        if (tree[idx] !== 0) {
          levelNodes.push(idx);
        }
      }
      if (levelNodes.length > 0) {
        levels.push(levelNodes);
      }
      level++;
    }

    return levels;
  };

  const treeLevels = getTreeLevels();

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
          Segment Tree Visualizer (Range Sum)
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Build Tree */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Array (comma-separated, 2-8 numbers):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputArray}
                onChange={(e) => setInputArray(e.target.value)}
                placeholder="e.g., 1,3,5,7,9,11"
                className="flex-1 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <button
                onClick={handleBuild}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: "var(--brand)", color: "white" }}
              >
                Build Tree
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample("small")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Small (4 elements)
              </button>
              <button
                onClick={() => loadExample("medium")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Medium (6 elements)
              </button>
              <button
                onClick={() => loadExample("large")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Large (8 elements)
              </button>
            </div>
          </div>

          {/* Range Query */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Range Sum Query [L, R]:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={queryL}
                onChange={(e) => setQueryL(e.target.value)}
                placeholder="L"
                min="0"
                max={array.length - 1}
                className="w-20 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <input
                type="number"
                value={queryR}
                onChange={(e) => setQueryR(e.target.value)}
                placeholder="R"
                min="0"
                max={array.length - 1}
                className="w-20 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <button
                onClick={handleQuery}
                disabled={animating || tree.length === 0}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#10b981",
                  color: "white",
                  cursor:
                    animating || tree.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Query
              </button>
            </div>
          </div>

          {/* Update */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Update Element:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={updateIdx}
                onChange={(e) => setUpdateIdx(e.target.value)}
                placeholder="Index"
                min="0"
                max={array.length - 1}
                className="w-20 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <input
                type="number"
                value={updateVal}
                onChange={(e) => setUpdateVal(e.target.value)}
                placeholder="New Value"
                className="w-24 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <button
                onClick={handleUpdate}
                disabled={animating || tree.length === 0}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#f59e0b",
                  color: "white",
                  cursor:
                    animating || tree.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Update
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
              {queryResult !== null && (
                <div
                  className="mt-2 text-lg font-bold"
                  style={{ color: "#10b981" }}
                >
                  Result: {queryResult}
                </div>
              )}
            </div>
          )}

          {/* Current Array */}
          {array.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Current Array:
              </label>
              <div className="flex gap-2 flex-wrap">
                {array.map((val, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-xs text-[var(--muted)]">[{idx}]</div>
                    <div
                      className="px-3 py-1 rounded font-mono text-sm"
                      style={{
                        backgroundColor: "var(--brand)",
                        color: "white",
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tree Visualization */}
      {tree.length > 0 && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--panel)" }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--fg)" }}
          >
            Segment Tree Structure
          </h3>
          <div className="overflow-x-auto">
            <div
              className="p-4 rounded"
              style={{ backgroundColor: "var(--bg)", minHeight: "200px" }}
            >
              {treeLevels.map((level, levelIdx) => (
                <div key={levelIdx} className="flex justify-center gap-4 mb-6">
                  {level.map((nodeIdx) => (
                    <div
                      key={nodeIdx}
                      className="flex flex-col items-center transition-all duration-300"
                      style={{
                        transform: highlightedNodes.has(nodeIdx)
                          ? "scale(1.1)"
                          : "scale(1)",
                      }}
                    >
                      <div
                        className="px-4 py-2 rounded font-mono text-sm font-bold"
                        style={{
                          backgroundColor: highlightedNodes.has(nodeIdx)
                            ? "#fbbf24"
                            : "var(--brand)",
                          color: "white",
                          minWidth: "50px",
                          textAlign: "center",
                        }}
                      >
                        {tree[nodeIdx]}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: "var(--muted)" }}
                      >
                        node {nodeIdx}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm" style={{ color: "var(--fg)" }}>
            <p className="font-semibold">Tree Structure:</p>
            <ul className="mt-2 space-y-1 ml-4 text-xs">
              <li>• Each node stores the sum of its segment</li>
              <li>• Left child: 2*i+1, Right child: 2*i+2</li>
              <li>• Leaf nodes represent individual array elements</li>
              <li>• Internal nodes represent merged segments</li>
            </ul>
          </div>
        </div>
      )}

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 Segment Tree Operations:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • <strong>Build:</strong> O(n) - construct tree from array
          </li>
          <li>
            • <strong>Range Query:</strong> O(log n) - find sum/min/max in range
            [L,R]
          </li>
          <li>
            • <strong>Update:</strong> O(log n) - modify single element and
            update path to root
          </li>
          <li>
            • <strong>Space:</strong> O(4n) - tree stored in array of size 4*n
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SegmentTreeVisualizer;
