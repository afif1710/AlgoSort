import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const NQueensVisualizer: React.FC = () => {
  const [n, setN] = useState<number>(4);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [board, setBoard] = useState<number[][]>([]);
  const [solutions, setSolutions] = useState<number[][][]>([]);
  const [currentRow, setCurrentRow] = useState<number>(-1);
  const [message, setMessage] = useState<string>("");
  const [attackedCells, setAttackedCells] = useState<Set<string>>(new Set());

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const solveNQueens = async () => {
    setAnimating(true);
    setSolutions([]);
    setMessage(`Solving ${n}-Queens problem...`);
    await sleep(1000);

    const newBoard = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    setBoard([...newBoard]);

    const cols = new Set<number>();
    const diag1 = new Set<number>();
    const diag2 = new Set<number>();
    const allSolutions: number[][][] = [];

    const updateAttacked = (row: number, col: number) => {
      const attacked = new Set<string>();
      // Column
      for (let r = 0; r < n; r++) {
        attacked.add(`${r},${col}`);
      }
      // Diagonals
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i - j === row - col || i + j === row + col) {
            attacked.add(`${i},${j}`);
          }
        }
      }
      setAttackedCells(attacked);
    };

    const backtrack = async (row: number): Promise<void> => {
      if (row === n) {
        allSolutions.push(newBoard.map((r) => [...r]));
        setSolutions([...allSolutions]);
        setMessage(`✅ Solution ${allSolutions.length} found!`);
        await sleep(1500);
        return;
      }

      setCurrentRow(row);
      setMessage(`Trying row ${row}...`);
      await sleep(800);

      for (let col = 0; col < n; col++) {
        const d1 = row - col;
        const d2 = row + col;

        if (!cols.has(col) && !diag1.has(d1) && !diag2.has(d2)) {
          // Place queen
          newBoard[row][col] = 1;
          setBoard([...newBoard]);
          updateAttacked(row, col);

          cols.add(col);
          diag1.add(d1);
          diag2.add(d2);

          setMessage(`Placed queen at (${row}, ${col})`);
          await sleep(1000);

          await backtrack(row + 1);

          // Remove queen (backtrack)
          newBoard[row][col] = 0;
          setBoard([...newBoard]);
          setAttackedCells(new Set());

          cols.delete(col);
          diag1.delete(d1);
          diag2.delete(d2);

          setMessage(`Backtracking from (${row}, ${col})`);
          await sleep(800);
        }
      }
    };

    await backtrack(0);

    setCurrentRow(-1);
    setAttackedCells(new Set());
    setMessage(
      `✅ Complete! Found ${allSolutions.length} solution(s) for ${n}-Queens`
    );
    setAnimating(false);
  };

  const reset = () => {
    setBoard([]);
    setSolutions([]);
    setCurrentRow(-1);
    setAttackedCells(new Set());
    setMessage("");
  };

  const handleNChange = (newN: number) => {
    if (animating) return;
    setN(newN);
    reset();
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
          N-Queens Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* N Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Board Size (N):
            </label>
            <div className="flex gap-2">
              {[4, 5, 6, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => handleNChange(size)}
                  disabled={animating}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor:
                      n === size ? "var(--brand)" : "var(--card-hover-bg)",
                    color: n === size ? "white" : "var(--fg)",
                    cursor: animating ? "not-allowed" : "pointer",
                    border: "2px solid var(--brand)",
                  }}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Solve Button */}
          <button
            onClick={solveNQueens}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Solving..." : `Solve ${n}-Queens`}
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

          {/* Board */}
          {board.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Current Board:
              </label>
              <div
                className="inline-block p-2 rounded"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {board.map((row, i) => (
                  <div key={i} className="flex">
                    {row.map((cell, j) => {
                      const isAttacked = attackedCells.has(`${i},${j}`);
                      const hasQueen = cell === 1;
                      const isCurrentRow = i === currentRow;

                      return (
                        <div
                          key={j}
                          className="flex items-center justify-center font-bold text-lg"
                          style={{
                            width: `${Math.max(40, 300 / n)}px`,
                            height: `${Math.max(40, 300 / n)}px`,
                            backgroundColor: hasQueen
                              ? "#10b981"
                              : isAttacked
                              ? "#ef444420"
                              : (i + j) % 2 === 0
                              ? "var(--panel)"
                              : "var(--bg)",
                            color: hasQueen ? "white" : "var(--fg)",
                            border: isCurrentRow
                              ? "2px solid #fbbf24"
                              : "1px solid var(--bg)",
                          }}
                        >
                          {hasQueen ? "♛" : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solutions */}
          {solutions.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Solutions Found ({solutions.length}):
              </label>
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {solutions.map((sol, idx) => (
                  <div key={idx}>
                    <div
                      className="text-xs mb-1"
                      style={{ color: "var(--muted)" }}
                    >
                      Solution {idx + 1}
                    </div>
                    <div
                      className="inline-block p-1 rounded"
                      style={{ backgroundColor: "var(--bg)" }}
                    >
                      {sol.map((row, i) => (
                        <div key={i} className="flex">
                          {row.map((cell, j) => (
                            <div
                              key={j}
                              className="flex items-center justify-center text-xs"
                              style={{
                                width: "20px",
                                height: "20px",
                                backgroundColor:
                                  cell === 1
                                    ? "#10b981"
                                    : (i + j) % 2 === 0
                                    ? "var(--panel)"
                                    : "var(--bg)",
                                color: cell === 1 ? "white" : "transparent",
                              }}
                            >
                              {cell === 1 ? "♛" : ""}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
        <p className="font-semibold mb-2">💡 N-Queens Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Place queens row by row using backtracking</li>
          <li>• Track attacked columns and diagonals in O(1)</li>
          <li>• Prune branches early when conflicts detected</li>
          <li>• Time: O(N!) but much faster with pruning</li>
          <li>• Classic constraint satisfaction problem</li>
        </ul>
      </div>
    </div>
  );
};

export default NQueensVisualizer;
