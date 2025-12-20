import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface Clause {
  a: number;
  aVal: boolean;
  b: number;
  bVal: boolean;
}

const TwoSATVisualizer: React.FC = () => {
  const [numVars] = useState<number>(3);
  const [clauses, setClauses] = useState<Clause[]>([
    { a: 0, aVal: true, b: 1, bVal: true },
    { a: 0, aVal: false, b: 2, bVal: true },
    { a: 1, aVal: false, b: 2, bVal: false },
  ]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [sccs, setSccs] = useState<number[]>([]);
  const [satisfiable, setSatisfiable] = useState<boolean | null>(null);
  const [assignment, setAssignment] = useState<boolean[]>([]);
  const [highlightEdges, setHighlightEdges] = useState<Set<string>>(new Set());

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const getNodeLabel = (node: number): string => {
    const varIdx = Math.floor(node / 2);
    const isNeg = node % 2 === 1;
    return isNeg ? `¬x${varIdx}` : `x${varIdx}`;
  };

  const solve = async () => {
    setAnimating(true);
    setSatisfiable(null);
    setAssignment([]);
    setSccs([]);
    setHighlightEdges(new Set());
    setMessage("Building implication graph...");
    await sleep(1000);

    // Build implication graph
    const g = new Map<number, number[]>();
    const rg = new Map<number, number[]>();
    const edges: Array<[number, number]> = [];

    for (let i = 0; i < 2 * numVars; i++) {
      g.set(i, []);
      rg.set(i, []);
    }

    for (const clause of clauses) {
      const notA = 2 * clause.a + (clause.aVal ? 1 : 0);
      const aNode = 2 * clause.a + (clause.aVal ? 0 : 1);
      const notB = 2 * clause.b + (clause.bVal ? 1 : 0);
      const bNode = 2 * clause.b + (clause.bVal ? 0 : 1);

      g.get(notA)!.push(bNode);
      rg.get(bNode)!.push(notA);
      edges.push([notA, bNode]);

      g.get(notB)!.push(aNode);
      rg.get(aNode)!.push(notB);
      edges.push([notB, aNode]);
    }

    // Animate edge creation
    for (const [from, to] of edges) {
      setHighlightEdges(new Set([`${from}-${to}`]));
      setMessage(`Adding edge: ${getNodeLabel(from)} → ${getNodeLabel(to)}`);
      await sleep(600);
    }
    setHighlightEdges(new Set());

    setMessage("Finding Strongly Connected Components...");
    await sleep(1500);

    // Kosaraju's algorithm
    const visited = new Set<number>();
    const finishOrder: number[] = [];

    const dfs1 = (node: number): void => {
      visited.add(node);
      for (const neighbor of g.get(node) || []) {
        if (!visited.has(neighbor)) {
          dfs1(neighbor);
        }
      }
      finishOrder.push(node);
    };

    for (let i = 0; i < 2 * numVars; i++) {
      if (!visited.has(i)) {
        dfs1(i);
      }
    }

    visited.clear();
    const sccId = new Array(2 * numVars).fill(-1);
    let currentScc = 0;

    const dfs2 = (node: number): void => {
      visited.add(node);
      sccId[node] = currentScc;
      for (const neighbor of rg.get(node) || []) {
        if (!visited.has(neighbor)) {
          dfs2(neighbor);
        }
      }
    };

    for (let i = finishOrder.length - 1; i >= 0; i--) {
      const node = finishOrder[i];
      if (!visited.has(node)) {
        dfs2(node);
        currentScc++;
      }
    }

    setSccs(sccId);
    setMessage(`Found ${currentScc} SCCs. Checking...`);
    await sleep(1500);

    // Check satisfiability
    for (let i = 0; i < numVars; i++) {
      const xi = 2 * i;
      const notXi = 2 * i + 1;

      if (sccId[xi] === sccId[notXi]) {
        setMessage(
          `❌ x${i} and ¬x${i} in same SCC ${sccId[xi]}! UNSATISFIABLE`
        );
        setSatisfiable(false);
        setAnimating(false);
        return;
      }
    }

    // Build assignment
    const assign: boolean[] = [];
    for (let i = 0; i < numVars; i++) {
      const xi = 2 * i;
      const notXi = 2 * i + 1;
      const value = sccId[xi] > sccId[notXi];
      assign.push(value);
    }

    setAssignment(assign);
    setSatisfiable(true);
    setMessage(`✅ SATISFIABLE!`);
    setAnimating(false);
  };

  const loadExample = (type: "sat" | "unsat") => {
    if (animating) return;

    if (type === "sat") {
      setClauses([
        { a: 0, aVal: true, b: 1, bVal: true },
        { a: 0, aVal: false, b: 2, bVal: true },
        { a: 1, aVal: false, b: 2, bVal: false },
      ]);
    } else {
      setClauses([
        { a: 0, aVal: true, b: 1, bVal: true },
        { a: 0, aVal: true, b: 1, bVal: false },
        { a: 0, aVal: false, b: 1, bVal: true },
        { a: 0, aVal: false, b: 1, bVal: false },
      ]);
    }

    setSatisfiable(null);
    setAssignment([]);
    setSccs([]);
    setHighlightEdges(new Set());
    setMessage("");
  };

  // Node positions in circular layout
  const getNodePosition = (node: number): { x: number; y: number } => {
    const totalNodes = 2 * numVars;
    const angle = (2 * Math.PI * node) / totalNodes - Math.PI / 2;
    const radius = 100;
    return {
      x: 200 + radius * Math.cos(angle),
      y: 150 + radius * Math.sin(angle),
    };
  };

  // Get all edges for visualization
  const getEdges = (): Array<[number, number]> => {
    const edges: Array<[number, number]> = [];
    for (const clause of clauses) {
      const notA = 2 * clause.a + (clause.aVal ? 1 : 0);
      const bNode = 2 * clause.b + (clause.bVal ? 0 : 1);
      const notB = 2 * clause.b + (clause.bVal ? 1 : 0);
      const aNode = 2 * clause.a + (clause.aVal ? 0 : 1);
      edges.push([notA, bNode], [notB, aNode]);
    }
    return edges;
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
          2-SAT Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Examples */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Load Example:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => loadExample("sat")}
                disabled={animating}
                className="flex-1 px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                ✓ Satisfiable
              </button>
              <button
                onClick={() => loadExample("unsat")}
                disabled={animating}
                className="flex-1 px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                ✗ Unsatisfiable
              </button>
            </div>
          </div>

          {/* Formula Display */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Formula:
            </label>
            <div
              className="p-3 rounded font-mono text-sm"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {clauses.map((clause, idx) => {
                const aStr = clause.aVal ? `x${clause.a}` : `¬x${clause.a}`;
                const bStr = clause.bVal ? `x${clause.b}` : `¬x${clause.b}`;
                return (
                  <span key={idx}>
                    ({aStr} ∨ {bStr}){idx < clauses.length - 1 ? " ∧ " : ""}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Solve Button */}
          <button
            onClick={solve}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "var(--brand)",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Solving..." : "Solve 2-SAT"}
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

          {/* Implication Graph Visualization */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Implication Graph:
            </label>
            <svg
              width="400"
              height="300"
              style={{
                backgroundColor: "var(--bg)",
                border: "2px solid var(--brand)",
                borderRadius: "8px",
              }}
            >
              {/* Draw edges */}
              {getEdges().map(([from, to], idx) => {
                const fromPos = getNodePosition(from);
                const toPos = getNodePosition(to);
                const isHighlighted = highlightEdges.has(`${from}-${to}`);

                // Calculate arrow
                const dx = toPos.x - fromPos.x;
                const dy = toPos.y - fromPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const ux = dx / dist;
                const uy = dy / dist;
                const arrowLen = 8;
                const endX = toPos.x - ux * 18;
                const endY = toPos.y - uy * 18;

                return (
                  <g key={idx}>
                    <line
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={endX}
                      y2={endY}
                      stroke={isHighlighted ? "#fbbf24" : "var(--muted)"}
                      strokeWidth={isHighlighted ? "3" : "1.5"}
                      markerEnd="url(#arrowhead)"
                    />
                    {/* Arrow head */}
                    <polygon
                      points={`${endX},${endY} ${
                        endX - arrowLen * ux - (arrowLen * uy) / 2
                      },${endY - arrowLen * uy + (arrowLen * ux) / 2} ${
                        endX - arrowLen * ux + (arrowLen * uy) / 2
                      },${endY - arrowLen * uy - (arrowLen * ux) / 2}`}
                      fill={isHighlighted ? "#fbbf24" : "var(--muted)"}
                    />
                  </g>
                );
              })}

              {/* Draw nodes */}
              {Array.from({ length: 2 * numVars }).map((_, node) => {
                const pos = getNodePosition(node);
                const sccColor =
                  sccs[node] !== undefined
                    ? `hsl(${(sccs[node] * 360) / Math.max(...sccs)}, 70%, 60%)`
                    : "var(--brand)";
                const varIdx = Math.floor(node / 2);
                const isNeg = node % 2 === 1;
                const hasConflict =
                  sccs.length > 0 &&
                  sccs[node] === sccs[node % 2 === 0 ? node + 1 : node - 1];

                return (
                  <g key={node}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="16"
                      fill={
                        hasConflict
                          ? "#ef4444"
                          : sccs.length > 0
                          ? sccColor
                          : "var(--brand)"
                      }
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      style={{
                        fill: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {isNeg ? `¬${varIdx}` : `x${varIdx}`}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
              {sccs.length > 0
                ? "Node colors represent different SCCs"
                : "Nodes: x₀, ¬x₀, x₁, ¬x₁, x₂, ¬x₂"}
            </div>
          </div>

          {/* Result */}
          {satisfiable === true && assignment.length > 0 && (
            <div
              className="p-4 rounded"
              style={{
                backgroundColor: "#10b98120",
                border: "2px solid #10b981",
              }}
            >
              <div
                className="font-semibold mb-3 text-center"
                style={{ color: "#10b981" }}
              >
                ✅ SATISFIABLE
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                {assignment.map((val, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded font-mono font-bold"
                    style={{
                      backgroundColor: val ? "#10b981" : "#64748b",
                      color: "white",
                    }}
                  >
                    x{idx} = {val ? "T" : "F"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {satisfiable === false && (
            <div
              className="p-4 rounded text-center"
              style={{
                backgroundColor: "#ef444420",
                border: "2px solid #ef4444",
              }}
            >
              <div className="font-bold text-lg" style={{ color: "#ef4444" }}>
                ❌ UNSATISFIABLE
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--fg)" }}>
                A variable and its negation are in the same SCC
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
        <p className="font-semibold mb-2">💡 2-SAT Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Convert (a ∨ b) to implications: ¬a → b and ¬b → a</li>
          <li>• Build implication graph with 2n nodes</li>
          <li>• Find SCCs (shown as node colors)</li>
          <li>• If xᵢ and ¬xᵢ in same SCC → UNSATISFIABLE</li>
          <li>• Otherwise assign based on SCC topological order</li>
          <li>• Time: O(n + m) - Linear! 🚀</li>
        </ul>
      </div>
    </div>
  );
};

export default TwoSATVisualizer;
