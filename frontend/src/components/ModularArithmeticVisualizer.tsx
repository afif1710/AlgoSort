import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const ModularArithmeticVisualizer: React.FC = () => {
  const [base, setBase] = useState<number>(3);
  const [exponent, setExponent] = useState<number>(13);
  const [modulo, setModulo] = useState<number>(1000000007);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [mode, setMode] = useState<"power" | "inverse" | "gcd">("power");

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const fastPower = async () => {
    setAnimating(true);
    setSteps([]);
    setResult(null);

    const logs: string[] = [];
    logs.push(`Computing ${base}^${exponent} mod ${modulo}`);
    setSteps([...logs]);
    await sleep(1000);

    let res = 1;
    let b = base % modulo;
    let exp = exponent;

    logs.push(`Initial: result = 1, base = ${b}, exponent = ${exp}`);
    setSteps([...logs]);
    await sleep(1000);

    let step = 1;
    while (exp > 0) {
      logs.push(`\n--- Step ${step} ---`);
      logs.push(`Exponent = ${exp} (binary: ${exp.toString(2)})`);

      if (exp % 2 === 1) {
        res = (res * b) % modulo;
        logs.push(`✓ Exponent is ODD: multiply result by ${b}`);
        logs.push(
          `  result = (${(res / b) | 0} × ${b}) mod ${modulo} = ${res}`
        );
      } else {
        logs.push(`  Exponent is EVEN: skip multiplication`);
      }

      setSteps([...logs]);
      await sleep(1200);

      exp = Math.floor(exp / 2);
      if (exp > 0) {
        const oldB = b;
        b = (b * b) % modulo;
        logs.push(`Square base: ${oldB}² mod ${modulo} = ${b}`);
        logs.push(`Remaining exponent: ${exp}`);
        setSteps([...logs]);
        await sleep(1200);
      }

      step++;
    }

    logs.push(`\n✅ Final Result: ${base}^${exponent} mod ${modulo} = ${res}`);
    setSteps([...logs]);
    setResult(res);
    setAnimating(false);
  };

  const modInverse = async () => {
    setAnimating(true);
    setSteps([]);
    setResult(null);

    const logs: string[] = [];
    logs.push(`Finding modular inverse of ${base} mod ${modulo}`);
    logs.push(`Using Fermat's Little Theorem: a^(-1) ≡ a^(p-2) mod p`);
    setSteps([...logs]);
    await sleep(1500);

    logs.push(`\nComputing ${base}^(${modulo}-2) mod ${modulo}`);
    logs.push(`= ${base}^${modulo - 2} mod ${modulo}`);
    setSteps([...logs]);
    await sleep(1500);

    // Use fast power
    const inv = await computeFastPower(base, modulo - 2, modulo, logs);

    logs.push(`\n✅ Modular Inverse: ${base}^(-1) ≡ ${inv} (mod ${modulo})`);
    logs.push(
      `\nVerification: (${base} × ${inv}) mod ${modulo} = ${
        (base * inv) % modulo
      }`
    );
    setSteps([...logs]);
    setResult(inv);
    setAnimating(false);
  };

  const computeGCD = async () => {
    setAnimating(true);
    setSteps([]);
    setResult(null);

    const logs: string[] = [];
    logs.push(`Computing GCD(${base}, ${exponent}) using Euclidean Algorithm`);
    setSteps([...logs]);
    await sleep(1000);

    let a = base;
    let b = exponent;
    let step = 1;

    while (b !== 0) {
      logs.push(`\n--- Step ${step} ---`);
      logs.push(`gcd(${a}, ${b})`);

      const remainder = a % b;
      logs.push(`${a} = ${b} × ${Math.floor(a / b)} + ${remainder}`);
      logs.push(`So gcd(${a}, ${b}) = gcd(${b}, ${remainder})`);

      setSteps([...logs]);
      await sleep(1500);

      a = b;
      b = remainder;
      step++;
    }

    logs.push(`\n✅ GCD(${base}, ${exponent}) = ${a}`);
    setSteps([...logs]);
    setResult(a);
    setAnimating(false);
  };

  const computeFastPower = async (
    b: number,
    exp: number,
    mod: number,
    logs: string[]
  ): Promise<number> => {
    let res = 1;
    let base = b % mod;
    let e = exp;

    while (e > 0) {
      if (e % 2 === 1) {
        res = (res * base) % mod;
      }
      e = Math.floor(e / 2);
      if (e > 0) {
        base = (base * base) % mod;
      }
    }

    return res;
  };

  const run = () => {
    if (mode === "power") {
      fastPower();
    } else if (mode === "inverse") {
      modInverse();
    } else {
      computeGCD();
    }
  };

  const reset = () => {
    setSteps([]);
    setResult(null);
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
          Modular Arithmetic Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Mode Selection */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Algorithm:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setMode("power");
                  reset();
                }}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    mode === "power" ? "#10b981" : "var(--card-hover-bg)",
                  color: mode === "power" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                  border: "2px solid #10b981",
                }}
              >
                Fast Power
              </button>
              <button
                onClick={() => {
                  setMode("inverse");
                  reset();
                }}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    mode === "inverse" ? "#3b82f6" : "var(--card-hover-bg)",
                  color: mode === "inverse" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                  border: "2px solid #3b82f6",
                }}
              >
                Mod Inverse
              </button>
              <button
                onClick={() => {
                  setMode("gcd");
                  reset();
                }}
                disabled={animating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor:
                    mode === "gcd" ? "#f59e0b" : "var(--card-hover-bg)",
                  color: mode === "gcd" ? "white" : "var(--fg)",
                  cursor: animating ? "not-allowed" : "pointer",
                  border: "2px solid #f59e0b",
                }}
              >
                GCD
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                {mode === "gcd" ? "First Number (a):" : "Base:"}
              </label>
              <input
                type="number"
                value={base}
                onChange={(e) => setBase(parseInt(e.target.value) || 1)}
                disabled={animating}
                className="w-full px-3 py-2 rounded font-mono"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              />
            </div>
            {mode !== "inverse" && (
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--fg)" }}
                >
                  {mode === "gcd" ? "Second Number (b):" : "Exponent:"}
                </label>
                <input
                  type="number"
                  value={exponent}
                  onChange={(e) => setExponent(parseInt(e.target.value) || 1)}
                  disabled={animating}
                  className="w-full px-3 py-2 rounded font-mono"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    border: "2px solid var(--brand)",
                  }}
                />
              </div>
            )}
          </div>

          {mode !== "gcd" && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Modulo:
              </label>
              <input
                type="number"
                value={modulo}
                onChange={(e) => setModulo(parseInt(e.target.value) || 1)}
                disabled={animating}
                className="w-full px-3 py-2 rounded font-mono"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  border: "2px solid var(--brand)",
                }}
              />
            </div>
          )}

          {/* Run Button */}
          <button
            onClick={run}
            disabled={animating}
            className="w-full px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: animating ? "#64748b" : "#10b981",
              color: "white",
              cursor: animating ? "not-allowed" : "pointer",
            }}
          >
            {animating
              ? "Computing..."
              : `Compute ${
                  mode === "power"
                    ? "Power"
                    : mode === "inverse"
                    ? "Inverse"
                    : "GCD"
                }`}
          </button>

          {/* Result */}
          {result !== null && (
            <div
              className="p-4 rounded text-center"
              style={{ backgroundColor: "#10b981", color: "white" }}
            >
              <div className="text-sm mb-1">Result:</div>
              <div className="text-2xl font-bold font-mono">{result}</div>
            </div>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--fg)" }}
              >
                Computation Steps:
              </label>
              <div
                className="p-4 rounded max-h-96 overflow-y-auto font-mono text-xs"
                style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
              >
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="mb-1"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {step}
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
        <p className="font-semibold mb-2">
          💡{" "}
          {mode === "power"
            ? "Fast Exponentiation:"
            : mode === "inverse"
            ? "Modular Inverse:"
            : "Euclidean Algorithm:"}
        </p>
        <ul className="space-y-1 ml-4 text-xs">
          {mode === "power" ? (
            <>
              <li>• Binary exponentiation: O(log n) time</li>
              <li>• Square base repeatedly, multiply when bit is 1</li>
              <li>• Essential for large exponents (up to 10^18)</li>
              <li>• Prevents overflow using modular arithmetic</li>
            </>
          ) : mode === "inverse" ? (
            <>
              <li>• Fermat's Little Theorem: a^(-1) ≡ a^(p-2) mod p</li>
              <li>• Works only when p is prime</li>
              <li>• Used for modular division: a/b = a × b^(-1)</li>
              <li>• Time: O(log p) using fast exponentiation</li>
            </>
          ) : (
            <>
              <li>• Euclidean Algorithm: gcd(a,b) = gcd(b, a%b)</li>
              <li>• Time: O(log min(a,b)) - very efficient!</li>
              <li>• Foundation for Extended Euclidean Algorithm</li>
              <li>• Used in cryptography, number theory</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ModularArithmeticVisualizer;
