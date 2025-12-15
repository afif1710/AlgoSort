import React, { useState } from 'react';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

type TraversalType = 'inorder' | 'preorder' | 'postorder';

const TreeTraversalVisualizer: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('1,2,3,4,5,null,6');
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [traversalType, setTraversalType] = useState<TraversalType>('inorder');
  const [traversalResult, setTraversalResult] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());

  const buildTree = (values: string[]): TreeNode | null => {
    if (values.length === 0 || values[0] === 'null') return null;

    const root: TreeNode = { val: parseInt(values[0]), left: null, right: null };
    const queue: TreeNode[] = [root];
    let i = 1;

    while (queue.length > 0 && i < values.length) {
      const node = queue.shift()!;

      if (i < values.length && values[i] !== 'null') {
        node.left = { val: parseInt(values[i]), left: null, right: null };
        queue.push(node.left);
      }
      i++;

      if (i < values.length && values[i] !== 'null') {
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
    if (node.left) calculatePositions(node.left, x - offset, y + 80, offset / 2);
    if (node.right) calculatePositions(node.right, x + offset, y + 80, offset / 2);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const inorderTraversal = async (node: TreeNode | null, result: number[]): Promise<void> => {
    if (!node) return;
    await inorderTraversal(node.left, result);
    setCurrentNode(node.val);
    await sleep(800);
    result.push(node.val);
    setTraversalResult([...result]);
    setVisitedNodes(prev => new Set([...prev, node.val]));
    await sleep(400);
    await inorderTraversal(node.right, result);
  };

  const preorderTraversal = async (node: TreeNode | null, result: number[]): Promise<void> => {
    if (!node) return;
    setCurrentNode(node.val);
    await sleep(800);
    result.push(node.val);
    setTraversalResult([...result]);
    setVisitedNodes(prev => new Set([...prev, node.val]));
    await sleep(400);
    await preorderTraversal(node.left, result);
    await preorderTraversal(node.right, result);
  };

  const postorderTraversal = async (node: TreeNode | null, result: number[]): Promise<void> => {
    if (!node) return;
    await postorderTraversal(node.left, result);
    await postorderTraversal(node.right, result);
    setCurrentNode(node.val);
    await sleep(800);
    result.push(node.val);
    setTraversalResult([...result]);
    setVisitedNodes(prev => new Set([...prev, node.val]));
    await sleep(400);
  };

  const handleBuildTree = () => {
    const values = inputValue.split(',').map(v => v.trim());
    const newTree = buildTree(values);
    if (newTree) {
      calculatePositions(newTree, 300, 40, 120);
      setTree(newTree);
      setTraversalResult([]);
      setVisitedNodes(new Set());
      setCurrentNode(null);
    }
  };

  const handleTraverse = async () => {
    if (!tree || animating) return;
    setAnimating(true);
    setTraversalResult([]);
    setVisitedNodes(new Set());
    setCurrentNode(null);

    const result: number[] = [];
    if (traversalType === 'inorder') {
      await inorderTraversal(tree, result);
    } else if (traversalType === 'preorder') {
      await preorderTraversal(tree, result);
    } else {
      await postorderTraversal(tree, result);
    }

    setCurrentNode(null);
    setAnimating(false);
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

    const isCurrentNode = currentNode === node.val;
    const isVisited = visitedNodes.has(node.val);

    let fillColor = 'var(--panel)';
    let strokeColor = 'var(--brand)';
    let textColor = 'var(--fg)';

    if (isCurrentNode) {
      fillColor = '#fbbf24'; // Amber for current
      textColor = 'white';
      strokeColor = '#f59e0b';
    } else if (isVisited) {
      fillColor = 'var(--brand)';
      textColor = 'white';
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
          style={{ transition: 'all 0.3s ease' }}
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
      <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--panel)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--fg)' }}>
          Interactive DFS Traversal Visualizer
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--fg)' }}>
              Enter values (level-order, use 'null' for empty):
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="1,2,3,4,5,null,6"
              className="w-full px-4 py-2 rounded border"
              style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                borderColor: 'var(--brand)'
              }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleBuildTree}
              className="build-tree-btn px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: 'var(--brand)',
                color: 'white'
              }}
            >
              Build Tree
            </button>
          </div>

          {tree && (
            <>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--fg)' }}>
                  Select Traversal Type:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTraversalType('inorder')}
                    className={`tree-example-btn px-4 py-2 rounded text-sm transition-all duration-300 ${
                      traversalType === 'inorder' ? 'font-bold' : ''
                    }`}
                    style={{
                      backgroundColor: traversalType === 'inorder' ? 'var(--brand)' : 'var(--card-hover-bg)',
                      color: traversalType === 'inorder' ? 'white' : 'var(--fg)',
                      border: '2px solid var(--brand)'
                    }}
                  >
                    Inorder (L-Root-R)
                  </button>
                  <button
                    onClick={() => setTraversalType('preorder')}
                    className={`tree-example-btn px-4 py-2 rounded text-sm transition-all duration-300 ${
                      traversalType === 'preorder' ? 'font-bold' : ''
                    }`}
                    style={{
                      backgroundColor: traversalType === 'preorder' ? 'var(--brand)' : 'var(--card-hover-bg)',
                      color: traversalType === 'preorder' ? 'white' : 'var(--fg)',
                      border: '2px solid var(--brand)'
                    }}
                  >
                    Preorder (Root-L-R)
                  </button>
                  <button
                    onClick={() => setTraversalType('postorder')}
                    className={`tree-example-btn px-4 py-2 rounded text-sm transition-all duration-300 ${
                      traversalType === 'postorder' ? 'font-bold' : ''
                    }`}
                    style={{
                      backgroundColor: traversalType === 'postorder' ? 'var(--brand)' : 'var(--card-hover-bg)',
                      color: traversalType === 'postorder' ? 'white' : 'var(--fg)',
                      border: '2px solid var(--brand)'
                    }}
                  >
                    Postorder (L-R-Root)
                  </button>
                </div>
              </div>

              <button
                onClick={handleTraverse}
                disabled={animating}
                className="build-tree-btn px-6 py-2 rounded font-medium"
                style={{
                  backgroundColor: animating ? '#64748b' : '#10b981',
                  color: 'white',
                  cursor: animating ? 'not-allowed' : 'pointer'
                }}
              >
                {animating ? 'Traversing...' : 'Start Traversal'}
              </button>
            </>
          )}

          {traversalResult.length > 0 && (
            <div className="mt-4 p-4 rounded" style={{ backgroundColor: 'var(--bg)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--fg)' }}>
                Traversal Order:
              </p>
              <div className="flex gap-2 flex-wrap">
                {traversalResult.map((val, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded font-mono"
                    style={{
                      backgroundColor: 'var(--brand)',
                      color: 'white'
                    }}
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {tree && (
        <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--panel)' }}>
          <svg width="600" height="400" style={{ width: '100%', maxWidth: '600px' }}>
            {renderEdges(tree)}
            {renderNodes(tree)}
          </svg>
          <div className="mt-4 flex gap-4 text-sm" style={{ color: 'var(--fg)' }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--panel)', border: '2px solid var(--brand)' }}></div>
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--brand)' }}></div>
              <span>Visited</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeTraversalVisualizer;
