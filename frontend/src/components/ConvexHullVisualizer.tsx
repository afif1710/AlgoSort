import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

interface Point {
  x: number;
  y: number;
}

const ConvexHullVisualizer: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 100, y: 100 },
    { x: 200, y: 50 },
    { x: 300, y: 100 },
    { x: 250, y: 200 },
    { x: 150, y: 180 },
    { x: 200, y: 150 },
  ]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [hull, setHull] = useState<Point[]>([]);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [message, setMessage] = useState<string>("");
  const [stack, setStack] = useState<Point[]>([]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const crossProduct = (O: Point, A: Point, B: Point): number => {
    return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
  };

  const distance = (A: Point, B: Point): number => {
    return Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2);
  };

  const runGrahamScan = async () => {
    setAnimating(true);
    setHull([]);
    setStack([]);
    setMessage("Starting Graham Scan...");
    await sleep(1000);

    if (points.length < 3) {
      setMessage("Need at least 3 points!");
      setAnimating(false);
      return;
    }

    // Find lowest point
    const start = points.reduce((min, p) =>
      p.y < min.y || (p.y === min.y && p.x < min.x) ? p : min
    );
    setCurrentPoint(start);
    setMessage(`Starting point (lowest): (${start.x}, ${start.y})`);
    await sleep(1500);

    // Sort by polar angle
    const sorted = [...points.filter((p) => p !== start)].sort((a, b) => {
      const cp = crossProduct(start, a, b);
      if (cp === 0) {
        return distance(start, a) - distance(start, b);
      }
      return cp > 0 ? -1 : 1;
    });
    sorted.unshift(start);

    setMessage("Points sorted by polar angle");
    await sleep(1500);

    // Build hull
    const hullStack: Point[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const point = sorted[i];
      setCurrentPoint(point);
      setMessage(`Processing point (${point.x}, ${point.y})`);
      await sleep(800);

      while (
        hullStack.length > 1 &&
        crossProduct(
          hullStack[hullStack.length - 2],
          hullStack[hullStack.length - 1],
          point
        ) <= 0
      ) {
        const removed = hullStack.pop()!;
        setStack([...hullStack]);
        setMessage(`Removed (${removed.x}, ${removed.y}) - makes right turn`);
        await sleep(800);
      }

      hullStack.push(point);
      setStack([...hullStack]);
      setMessage(`Added (${point.x}, ${point.y}) to hull`);
      await sleep(800);
    }

    setHull([...hullStack]);
    setCurrentPoint(null);
    setMessage(`✅ Convex hull complete! ${hullStack.length} points`);
    setAnimating(false);
  };

  const addPoint = (e: React.MouseEvent<SVGSVGElement>) => {
    if (animating) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([...points, { x, y }]);
    setHull([]);
    setStack([]);
    setMessage("");
  };

  const clearPoints = () => {
    if (animating) return;
    setPoints([]);
    setHull([]);
    setStack([]);
    setMessage("");
  };

  const randomPoints = () => {
    if (animating) return;
    const newPoints: Point[] = [];
    for (let i = 0; i < 8; i++) {
      newPoints.push({
        x: 50 + Math.random() * 300,
        y: 50 + Math.random() * 250,
      });
    }
    setPoints(newPoints);
    setHull([]);
    setStack([]);
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
          Convex Hull Visualizer (Graham Scan)
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={runGrahamScan}
              disabled={animating || points.length < 3}
              className="flex-1 px-4 py-2 rounded font-medium text-sm"
              style={{
                backgroundColor:
                  animating || points.length < 3 ? "#64748b" : "#10b981",
                color: "white",
                cursor:
                  animating || points.length < 3 ? "not-allowed" : "pointer",
              }}
            >
              {animating ? "Running..." : "Run Graham Scan"}
            </button>
            <button
              onClick={randomPoints}
              disabled={animating}
              className="px-4 py-2 rounded font-medium text-sm"
              style={{
                backgroundColor: animating ? "#64748b" : "var(--brand)",
                color: "white",
                cursor: animating ? "not-allowed" : "pointer",
              }}
            >
              Random Points
            </button>
            <button
              onClick={clearPoints}
              disabled={animating}
              className="px-4 py-2 rounded font-medium text-sm"
              style={{
                backgroundColor: animating ? "#64748b" : "#ef4444",
                color: "white",
                cursor: animating ? "not-allowed" : "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className="p-3 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
          )}

          {/* Canvas */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Click to add points ({points.length} points):
            </label>
            <svg
              width="400"
              height="300"
              onClick={addPoint}
              style={{
                backgroundColor: "var(--bg)",
                border: "2px solid var(--brand)",
                borderRadius: "8px",
                cursor: animating ? "not-allowed" : "crosshair",
                width: "100%",
                maxWidth: "400px",
              }}
            >
              {/* Draw hull polygon */}
              {hull.length > 2 && (
                <polygon
                  points={hull.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(16, 185, 129, 0.1)"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              )}

              {/* Draw hull edges in progress */}
              {stack.length > 1 &&
                stack.map((p, i) => {
                  if (i === 0) return null;
                  return (
                    <line
                      key={i}
                      x1={stack[i - 1].x}
                      y1={stack[i - 1].y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })}

              {/* Draw points */}
              {points.map((point, idx) => {
                const isOnHull = hull.some(
                  (p) => p.x === point.x && p.y === point.y
                );
                const isInStack = stack.some(
                  (p) => p.x === point.x && p.y === point.y
                );
                const isCurrent =
                  currentPoint &&
                  currentPoint.x === point.x &&
                  currentPoint.y === point.y;

                let color = "var(--brand)";
                let radius = 5;

                if (isCurrent) {
                  color = "#fbbf24";
                  radius = 7;
                } else if (isOnHull) {
                  color = "#10b981";
                  radius = 6;
                } else if (isInStack) {
                  color = "#3b82f6";
                  radius = 6;
                }

                return (
                  <circle
                    key={idx}
                    cx={point.x}
                    cy={point.y}
                    r={radius}
                    fill={color}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>

            <div
              className="mt-2 text-xs flex gap-4"
              style={{ color: "var(--fg)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#10b981" }}
                ></div>
                <span>Hull points</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#fbbf24" }}
                ></div>
                <span>Current point</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "var(--brand)" }}
                ></div>
                <span>Other points</span>
              </div>
            </div>
          </div>

          {/* Hull Info */}
          {hull.length > 0 && (
            <div
              className="p-3 rounded"
              style={{
                backgroundColor: "#10b98120",
                border: "2px solid #10b981",
              }}
            >
              <div className="font-semibold mb-2" style={{ color: "#10b981" }}>
                Convex Hull ({hull.length} points):
              </div>
              <div className="text-sm font-mono" style={{ color: "var(--fg)" }}>
                {hull
                  .map((p, i) => `(${Math.round(p.x)}, ${Math.round(p.y)})`)
                  .join(" → ")}
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
        <p className="font-semibold mb-2">💡 Graham Scan Algorithm:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Find lowest point (starting point)</li>
          <li>• Sort remaining points by polar angle</li>
          <li>• Scan points, removing those that make right turns</li>
          <li>• Uses cross product to detect turn direction</li>
          <li>• Time: O(n log n), Space: O(n)</li>
        </ul>
      </div>
    </div>
  );
};

export default ConvexHullVisualizer;
