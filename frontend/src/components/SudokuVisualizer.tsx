import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const SudokuVisualizer: React.FC = () => {
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [board, setBoard] = useState<string[][]>([]);
  const [currentCell, setCurrentCell] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState<string>("");
  const [triedValues, setTriedValues] = useState<Set<string>>(new Set());

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  // Only 4x4 puzzles - much faster!
  const puzzles = [
    {
      name: "Easy",
      board: [
        ["1", ".", ".", "4"],
        [".", ".", "1", "."],
        [".", "3", ".", "."],
        ["4", ".", ".", "2"],
      ],
    },
    {
      name: "Medium",
      board: [
        [".", "2", ".", "."],
        [".", ".", ".", "1"],
        ["3", ".", ".", "."],
        [".", ".", "4", "."],
      ],
    },
    {
      name: "Hard",
      board: [
        [".", ".", ".", "4"],
        [".", ".", "3", "."],
        [".", "2", ".", "."],
        ["1", ".", ".", "."],
      ],
    },
  ];

  const [selectedPuzzle, setSelectedPuzzle] = useState(0);

  const isValid = (
    board: string[][],
    row: number,
    col: number,
    num: string
  ): boolean => {
    const n = 4;

    // Check row
    for (let x = 0; x < n; x++) {
      if (board[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < n; x++) {
      if (board[x][col] === num) return false;
    }

    // Check 2x2 box
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 2) * 2;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }

    return true;
  };

  const findMostConstrained = (board: string[][]): [number, number] | null => {
    const n = 4;
    let minCandidates = n + 1;
    let bestCell: [number, number] | null = null;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (board[i][j] === ".") {
          let candidates = 0;
          for (let num = 1; num <= n; num++) {
            if (isValid(board, i, j, num.toString())) {
              candidates++;
            }
          }
          if (candidates < minCandidates) {
            minCandidates = candidates;
            bestCell = [i, j];
          }
        }
      }
    }

    return bestCell;
  };

  const solveSudoku = async (board: string[][]): Promise<boolean> => {
    const cell = findMostConstrained(board);
    if (!cell) {
      setMessage("✅ Sudoku solved!");
      return true;
    }

    const [row, col] = cell;

    setCurrentCell([row, col]);
    setMessage(`Trying cell (${row}, ${col})...`);
    await sleep(500);

    for (let num = 1; num <= 4; num++) {
      const numStr = num.toString();

      setTriedValues(new Set([`${row},${col},${numStr}`]));
      setMessage(`Trying ${numStr} at (${row}, ${col})...`);
      await sleep(400);

      if (isValid(board, row, col, numStr)) {
        board[row][col] = numStr;
        setBoard([...board]);
        setMessage(`✓ Placed ${numStr} at (${row}, ${col})`);
        await sleep(500);

        if (await solveSudoku(board)) {
          return true;
        }

        // Backtrack
        board[row][col] = ".";
        setBoard([...board]);
        setMessage(`✗ Backtracking from (${row}, ${col})`);
        await sleep(500);
      } else {
        setMessage(`✗ ${numStr} invalid at (${row}, ${col})`);
        await sleep(300);
      }
    }

    setTriedValues(new Set());
    return false;
  };

  const solve = async () => {
    setAnimating(true);
    const puzzle = puzzles[selectedPuzzle].board.map((row) => [...row]);
    setBoard(puzzle);
    setMessage("Starting Sudoku solver...");
    await sleep(1000);

    const solved = await solveSudoku(puzzle);
    setCurrentCell(null);
    setTriedValues(new Set());

    if (!solved) {
      setMessage("❌ No solution exists!");
    }
    setAnimating(false);
  };

  const reset = () => {
    setBoard([]);
    setCurrentCell(null);
    setTriedValues(new Set());
    setMessage("");
  };

  const changePuzzle = (index: number) => {
    if (animating) return;
    setSelectedPuzzle(index);
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
          Sudoku Solver Visualizer (4×4)
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Puzzle Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Select Puzzle:
            </label>
            <div className="flex gap-2">
              {puzzles.map((puzzle, idx) => (
                <button
                  key={idx}
                  onClick={() => changePuzzle(idx)}
                  disabled={animating}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor:
                      selectedPuzzle === idx
                        ? "#10b981"
                        : "var(--card-hover-bg)",
                    color: selectedPuzzle === idx ? "white" : "var(--fg)",
                    cursor: animating ? "not-allowed" : "pointer",
                    border: "2px solid #10b981",
                  }}
                >
                  {puzzle.name}
                </button>
              ))}
            </div>
          </div>

          {/* Solve Button */}
          <button
            onClick={solve}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Solving..." : "Solve Sudoku"}
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
                4×4 Sudoku Board:
              </label>
              <div
                className="inline-block p-2 rounded"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {board.map((row, i) => (
                  <div key={i} className="flex">
                    {row.map((cell, j) => {
                      const isCurrent =
                        currentCell &&
                        currentCell[0] === i &&
                        currentCell[1] === j;
                      const isGiven =
                        puzzles[selectedPuzzle].board[i][j] !== ".";
                      const isTried = triedValues.has(`${i},${j},${cell}`);

                      return (
                        <div
                          key={j}
                          className="flex items-center justify-center font-bold"
                          style={{
                            width: "70px",
                            height: "70px",
                            fontSize: "24px",
                            backgroundColor: isCurrent
                              ? "#fbbf24"
                              : isTried
                              ? "#ef444420"
                              : isGiven
                              ? "var(--panel)"
                              : "var(--bg)",
                            color: isCurrent
                              ? "white"
                              : isGiven
                              ? "var(--brand)"
                              : "#10b981",
                            border: "1px solid var(--bg)",
                            borderLeft:
                              j % 2 === 0
                                ? "3px solid var(--brand)"
                                : undefined,
                            borderTop:
                              i % 2 === 0
                                ? "3px solid var(--brand)"
                                : undefined,
                          }}
                        >
                          {cell !== "." ? cell : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div
                className="mt-3 text-xs flex gap-4"
                style={{ color: "var(--fg)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "var(--brand)", opacity: 0.3 }}
                  ></div>
                  <span>Given numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span>Filled numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: "#fbbf24" }}
                  ></div>
                  <span>Current cell</span>
                </div>
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
        <p className="font-semibold mb-2">💡 Sudoku Solver Algorithm (4×4):</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• 4×4 grid with 2×2 boxes (numbers 1-4)</li>
          <li>• Find most constrained empty cell (fewest candidates)</li>
          <li>• Try each valid number for that cell</li>
          <li>• Check row, column, and 2×2 box constraints</li>
          <li>• Recursively solve remaining cells</li>
          <li>• Backtrack if no valid solution found</li>
          <li>• MCV heuristic makes it much faster! ⚡</li>
        </ul>
      </div>
    </div>
  );
};

export default SudokuVisualizer;
