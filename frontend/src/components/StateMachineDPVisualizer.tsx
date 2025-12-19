import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

type State = "rest" | "hold" | "sold";

interface StateData {
  value: number;
  day: number;
}

const StateMachineDPVisualizer: React.FC = () => {
  const [prices, setPrices] = useState<number[]>([1, 2, 3, 0, 2]);
  const [inputPrices, setInputPrices] = useState<string>("1,2,3,0,2");
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [currentState, setCurrentState] = useState<State>("rest");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [dpTable, setDpTable] = useState<{ [key: string]: StateData }>({});
  const [transitionHistory, setTransitionHistory] = useState<string[]>([]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const simulateStockCooldown = async () => {
    if (animating) return;
    setAnimating(true);
    setDpTable({});
    setTransitionHistory([]);
    setMessage("Starting Stock Trading with Cooldown simulation...");
    await sleep(1000);

    const n = prices.length;
    const dp: { [key: string]: number } = {};

    // Initialize day 0
    dp["0-rest"] = 0;
    dp["0-hold"] = -prices[0];
    dp["0-sold"] = 0;

    setCurrentDay(0);
    setCurrentState("hold");
    setDpTable({
      "0-rest": { value: 0, day: 0 },
      "0-hold": { value: -prices[0], day: 0 },
      "0-sold": { value: 0, day: 0 },
    });
    setMessage(`Day 0: Initial state. Can buy stock for $${prices[0]}`);
    await sleep(1500);

    // Process each day
    for (let i = 1; i < n; i++) {
      setCurrentDay(i);
      setMessage(`Processing Day ${i} (price: $${prices[i]})...`);
      await sleep(800);

      // Calculate HOLD state
      setCurrentState("hold");
      const holdFromHold = dp[`${i - 1}-hold`];
      const holdFromBuy = dp[`${i - 1}-rest`] - prices[i];
      dp[`${i}-hold`] = Math.max(holdFromHold, holdFromBuy);

      const holdTransition =
        holdFromHold >= holdFromBuy
          ? `HOLD → HOLD (rest): $${holdFromHold.toFixed(2)}`
          : `REST → HOLD (buy): $${holdFromBuy.toFixed(2)}`;

      setTransitionHistory((prev) => [...prev, `Day ${i}: ${holdTransition}`]);
      setMessage(`Day ${i} HOLD state: ${holdTransition}`);
      await sleep(1000);

      // Calculate SOLD state
      setCurrentState("sold");
      dp[`${i}-sold`] = dp[`${i - 1}-hold`] + prices[i];
      const soldTransition = `HOLD → SOLD (sell): $${dp[`${i}-sold`].toFixed(
        2
      )}`;
      setTransitionHistory((prev) => [...prev, `Day ${i}: ${soldTransition}`]);
      setMessage(`Day ${i} SOLD state: ${soldTransition}`);
      await sleep(1000);

      // Calculate REST state
      setCurrentState("rest");
      const restFromRest = dp[`${i - 1}-rest`];
      const restFromSold = dp[`${i - 1}-sold`];
      dp[`${i}-rest`] = Math.max(restFromRest, restFromSold);

      const restTransition =
        restFromRest >= restFromSold
          ? `REST → REST: $${restFromRest.toFixed(2)}`
          : `SOLD → REST (cooldown): $${restFromSold.toFixed(2)}`;

      setTransitionHistory((prev) => [...prev, `Day ${i}: ${restTransition}`]);
      setMessage(`Day ${i} REST state: ${restTransition}`);

      setDpTable({
        ...dpTable,
        [`${i}-hold`]: { value: dp[`${i}-hold`], day: i },
        [`${i}-sold`]: { value: dp[`${i}-sold`], day: i },
        [`${i}-rest`]: { value: dp[`${i}-rest`], day: i },
      });

      await sleep(1000);
    }

    const finalProfit = Math.max(dp[`${n - 1}-sold`], dp[`${n - 1}-rest`]);
    setMessage(
      `✅ Simulation complete! Max profit: $${finalProfit.toFixed(2)}`
    );
    setAnimating(false);
  };

  const handleSetPrices = () => {
    try {
      const newPrices = inputPrices.split(",").map((x) => parseInt(x.trim()));
      if (
        newPrices.some(isNaN) ||
        newPrices.length < 2 ||
        newPrices.length > 10
      ) {
        alert("Please enter 2-10 valid prices separated by commas");
        return;
      }
      setPrices(newPrices);
      setDpTable({});
      setTransitionHistory([]);
      setMessage("");
    } catch (e) {
      alert("Invalid input format");
    }
  };

  const loadExample = (type: string) => {
    setDpTable({});
    setTransitionHistory([]);
    setMessage("");
    if (type === "simple") {
      setPrices([1, 2, 3, 0, 2]);
      setInputPrices("1,2,3,0,2");
    } else if (type === "volatile") {
      setPrices([1, 4, 2, 7, 1, 6]);
      setInputPrices("1,4,2,7,1,6");
    } else if (type === "declining") {
      setPrices([5, 4, 3, 2, 1]);
      setInputPrices("5,4,3,2,1");
    }
  };

  const getStatePosition = (state: State) => {
    const positions: { [key in State]: { x: number; y: number } } = {
      hold: { x: 100, y: 100 },
      sold: { x: 300, y: 100 },
      rest: { x: 200, y: 220 },
    };
    return positions[state];
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
          State Machine DP: Stock with Cooldown
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Input Prices */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Stock Prices (comma-separated):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputPrices}
                onChange={(e) => setInputPrices(e.target.value)}
                placeholder="e.g., 1,2,3,0,2"
                className="flex-1 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
              />
              <button
                onClick={handleSetPrices}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: "var(--brand)", color: "white" }}
              >
                Set Prices
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
                onClick={() => loadExample("simple")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Simple
              </button>
              <button
                onClick={() => loadExample("volatile")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Volatile
              </button>
              <button
                onClick={() => loadExample("declining")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Declining
              </button>
            </div>
          </div>

          {/* Current Prices Display */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Current Prices:
            </label>
            <div className="flex gap-2 flex-wrap">
              {prices.map((price, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded text-sm font-mono"
                  style={{
                    backgroundColor:
                      idx === currentDay && animating
                        ? "#fbbf24"
                        : "var(--brand)",
                    color: "white",
                    fontWeight:
                      idx === currentDay && animating ? "bold" : "normal",
                  }}
                >
                  Day {idx}: ${price}
                </div>
              ))}
            </div>
          </div>

          {/* Run Simulation */}
          <button
            onClick={simulateStockCooldown}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating ? "Running Simulation..." : "Run Simulation"}
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

          {/* Transition History */}
          {transitionHistory.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Transition History:
              </label>
              <div
                className="p-3 rounded max-h-40 overflow-y-auto text-xs font-mono"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                {transitionHistory.map((transition, idx) => (
                  <div key={idx} className="mb-1">
                    {transition}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Machine Diagram */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          State Transition Diagram
        </h3>
        <svg
          width="400"
          height="280"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          {/* Transitions */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="var(--brand)" />
            </marker>
          </defs>

          {/* HOLD → SOLD */}
          <line
            x1="130"
            y1="100"
            x2="270"
            y2="100"
            stroke="var(--brand)"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x="200"
            y="90"
            textAnchor="middle"
            fill="var(--fg)"
            fontSize="11"
          >
            sell (+price)
          </text>

          {/* SOLD → REST */}
          <line
            x1="280"
            y1="130"
            x2="230"
            y2="200"
            stroke="var(--brand)"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x="270"
            y="170"
            textAnchor="middle"
            fill="var(--fg)"
            fontSize="11"
          >
            cooldown
          </text>

          {/* REST → HOLD */}
          <line
            x1="170"
            y1="210"
            x2="120"
            y2="130"
            stroke="var(--brand)"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x="130"
            y="170"
            textAnchor="middle"
            fill="var(--fg)"
            fontSize="11"
          >
            buy (-price)
          </text>

          {/* HOLD → HOLD (self loop) */}
          <path
            d="M 80,80 Q 60,60 80,100"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x="50"
            y="90"
            textAnchor="middle"
            fill="var(--fg)"
            fontSize="11"
          >
            rest
          </text>

          {/* REST → REST (self loop) */}
          <path
            d="M 180,240 Q 200,260 220,240"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x="200"
            y="270"
            textAnchor="middle"
            fill="var(--fg)"
            fontSize="11"
          >
            rest
          </text>

          {/* State Nodes */}
          {(["hold", "sold", "rest"] as State[]).map((state) => {
            const pos = getStatePosition(state);
            const isActive = currentState === state && animating;

            return (
              <g key={state}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="35"
                  fill={isActive ? "#fbbf24" : "var(--panel)"}
                  stroke={isActive ? "#f59e0b" : "var(--brand)"}
                  strokeWidth="3"
                />
                <text
                  x={pos.x}
                  y={pos.y - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isActive ? "white" : "var(--fg)"}
                  fontSize="14"
                  fontWeight="600"
                >
                  {state.toUpperCase()}
                </text>
                {Object.keys(dpTable).length > 0 && (
                  <text
                    x={pos.x}
                    y={pos.y + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isActive ? "white" : "var(--muted)"}
                    fontSize="10"
                  >
                    {dpTable[`${currentDay}-${state}`]
                      ? `$${dpTable[`${currentDay}-${state}`].value.toFixed(1)}`
                      : ""}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-4 text-sm" style={{ color: "var(--fg)" }}>
          <p className="font-semibold mb-2">State Definitions:</p>
          <ul className="ml-4 space-y-1 text-xs">
            <li>
              • <strong>HOLD:</strong> Currently holding stock
            </li>
            <li>
              • <strong>SOLD:</strong> Just sold stock (must cooldown next)
            </li>
            <li>
              • <strong>REST:</strong> No stock, can buy anytime
            </li>
          </ul>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p className="font-semibold mb-2">💡 State Machine DP Pattern:</p>
        <ul className="space-y-1 ml-4 text-xs">
          <li>• Define all possible states (hold, sold, rest, etc.)</li>
          <li>• Identify valid transitions between states</li>
          <li>• dp[day][state] = optimal value at day i in state s</li>
          <li>• Time: O(n × states × transitions), usually O(n)</li>
        </ul>
      </div>
    </div>
  );
};

export default StateMachineDPVisualizer;
