// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useMemo, useCallback } from "react";
import {
  convolution,
  naiveConvolution,
  nttWithStages,
  MOD,
} from "../../../utils/ntt";

type ArraySize = 4 | 8 | 16;
const SIZES: ArraySize[] = [4, 8, 16];

function randomArr(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10));
}

const ConvolutionNTTVisualizer: React.FC = () => {
  const [size, setSize] = useState<ArraySize>(8);
  const [arrA, setArrA] = useState<number[]>(() => randomArr(8));
  const [arrB, setArrB] = useState<number[]>(() => randomArr(8));
  const [stageIdx, setStageIdx] = useState(-1);
  const [showNaive, setShowNaive] = useState(false);
  const [status, setStatus] = useState("Enter polynomials A and B, then step through NTT stages.");

  const safeA = arrA.slice(0, size);
  const safeB = arrB.slice(0, size);

  const [computedResult, setComputedResult] = useState<{ naive: number[]; ntt: number[] } | null>(null);
  const [nttLog, setNttLog] = useState<{ bitReversed: number[]; stages: any[] } | null>(null);

  const match = useMemo(() => {
    if (!computedResult) return false;
    const { naive, ntt } = computedResult;
    if (naive.length !== ntt.length) return false;
    return naive.every((v, i) => v === ntt[i]);
  }, [computedResult]);

  const totalStages = nttLog ? nttLog.stages.length : 0;

  const handleResize = (s: ArraySize) => {
    setSize(s);
    setArrA(randomArr(s));
    setArrB(randomArr(s));
    setStageIdx(-1);
    setShowNaive(false);
    setStatus("Arrays randomized. Step through NTT or compute naive.");
  };

  const handleRandomize = () => {
    setArrA(randomArr(size));
    setArrB(randomArr(size));
    setStageIdx(-1);
    setNttLog(null);
    setComputedResult(null);
    setShowNaive(false);
    setStatus("Arrays randomized.");
  };

  const ensureComputed = useCallback(() => {
    if (!nttLog) {
      let n = 1;
      while (n < 2 * size) n <<= 1;
      const padded = [...safeA, ...new Array(n - safeA.length).fill(0)];
      const log = nttWithStages(padded, false);
      setNttLog(log);
      setComputedResult({
        naive: naiveConvolution(safeA, safeB),
        ntt: convolution(safeA, safeB)
      });
      return log;
    }
    return nttLog;
  }, [nttLog, safeA, safeB, size]);

  const handleStep = () => {
    const activeLog = ensureComputed();
    const nextTotal = activeLog.stages.length;
    const next = stageIdx + 1;
    if (next >= nextTotal) {
      setStageIdx(nextTotal);
      setStatus(`NTT forward transform complete. ${nextTotal} stages (log₂ n).`);
      return;
    }
    setStageIdx(next);
    const st = activeLog.stages[next];
    setStatus(`Stage ${next + 1}/${nextTotal}: butterfly span = ${st.len}, ${st.butterflies.length} butterflies.`);
  };

  const handleRunAll = () => {
    const activeLog = ensureComputed();
    const nextTotal = activeLog.stages.length;
    setStageIdx(nextTotal);
    // Use timeout to allow setComputedResult to propagate if needed, 
    // but match is used in UI so it's fine.
    setStatus(`NTT complete. ${nextTotal} stages.`);
  };

  const handleReset = () => {
    setStageIdx(-1);
    setShowNaive(false);
    setStatus("Reset. Step through NTT or compute naive.");
  };

  const updateCell = useCallback((which: "A" | "B", idx: number, val: number) => {
    const setter = which === "A" ? setArrA : setArrB;
    setter((prev) => {
      const next = [...prev];
      next[idx] = Math.max(0, Math.min(999, val));
      return next;
    });
    setStageIdx(-1);
    setNttLog(null);
    setComputedResult(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg space-y-5" style={{ backgroundColor: "var(--panel)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
          ⊛ Polynomial Convolution (NTT)
        </h3>

        {/* Size selector */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs" style={{ color: "var(--muted)" }}>Array size:</span>
          {SIZES.map((s) => (
            <button key={s} onClick={() => handleResize(s)}
              className="px-3 py-1 rounded text-sm font-medium"
              style={{
                backgroundColor: size === s ? "var(--brand)" : "var(--card-hover-bg)",
                color: size === s ? "white" : "var(--fg)", border: "2px solid var(--brand)",
              }}>{s}</button>
          ))}
          <button onClick={handleRandomize}
            className="px-3 py-1 text-xs rounded"
            style={{ backgroundColor: "var(--card-hover-bg)", border: "1px solid var(--brand)", color: "var(--fg)" }}>
            🔀 Random
          </button>
        </div>

        {/* Input arrays */}
        <div className="grid md:grid-cols-2 gap-4">
          {(["A", "B"] as const).map((label) => {
            const arr = label === "A" ? safeA : safeB;
            return (
              <div key={label}>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--fg)" }}>
                  Polynomial {label} (coefficients):
                </p>
                <div className="flex flex-wrap gap-1">
                  {arr.map((v, i) => (
                    <input key={i} type="number" value={v} min={0} max={999}
                      onChange={(e) => updateCell(label, i, +e.target.value || 0)}
                      className="w-12 px-1 py-0.5 rounded text-xs text-center font-mono"
                      aria-label={`${label}[${i}]`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleStep} disabled={stageIdx >= totalStages}
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{
              backgroundColor: stageIdx >= totalStages ? "#64748b" : "#3b82f6",
              color: "white", cursor: stageIdx >= totalStages ? "not-allowed" : "pointer",
            }}>Step NTT →</button>
          <button onClick={handleRunAll}
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{ backgroundColor: "#10b981", color: "white" }}>Run NTT</button>
          <button onClick={() => setShowNaive(true)}
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{ backgroundColor: "#8b5cf6", color: "white" }}>Compute Naive</button>
          <button onClick={handleReset}
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{ backgroundColor: "#ef4444", color: "white" }}>Reset</button>
        </div>

        {/* NTT Stage visualization */}
        {stageIdx >= 0 && nttLog && (
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: "var(--fg)" }}>
              NTT Forward Stages (on polynomial A, padded to {nttLog.bitReversed.length}):
            </p>

            {/* Bit-reversed initial */}
            <div className="p-2 rounded" style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.15)" }}>
              <p className="text-[10px]" style={{ color: "var(--muted)" }}>After bit-reversal:</p>
              <div className="flex gap-1 flex-wrap">
                {nttLog.bitReversed.map((v: number, i: number) => (
                  <span key={i} className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "var(--card-hover-bg)", color: "var(--fg)" }}>{v}</span>
                ))}
              </div>
            </div>

            {/* Completed stages */}
            {nttLog.stages.slice(0, Math.min(stageIdx + 1, totalStages)).map((st: any) => (
              <div key={st.stage} className="p-2 rounded"
                style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.15)" }}>
                <p className="text-[10px] font-medium" style={{ color: "var(--brand)" }}>
                  Stage {st.stage + 1}: span={st.len}, {st.butterflies.length} butterflies
                </p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {st.arrayAfter.map((v: number, i: number) => (
                    <span key={i} className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "var(--card-hover-bg)", color: "var(--fg)" }}>{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Naive grid (small n only) */}
        {showNaive && size <= 8 && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.2)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--fg)" }}>
              Naive O(n²) multiplication grid:
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs font-mono" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th className="px-1 py-0.5" style={{ color: "var(--muted)" }}>×</th>
                    {safeB.map((v, j) => (
                      <th key={j} className="px-2 py-0.5" style={{ color: "#8b5cf6" }}>b{j}={v}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeA.map((a, i) => (
                    <tr key={i}>
                      <td className="px-2 py-0.5 font-bold" style={{ color: "#3b82f6" }}>a{i}={a}</td>
                      {safeB.map((b, j) => (
                        <td key={j} className="px-2 py-0.5 text-center"
                          style={{ color: "var(--fg)", backgroundColor: "var(--panel)" }}>
                          {(a * b) % MOD}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result comparison */}
        {(showNaive || stageIdx >= totalStages) && computedResult && (
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: "var(--fg)" }}>
              Convolution result (A ⊛ B), length {computedResult.naive.length}:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {showNaive && computedResult && (
                <div className="p-2 rounded" style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.15)" }}>
                  <p className="text-[10px]" style={{ color: "#8b5cf6" }}>Naive O(n²):</p>
                  <div className="flex gap-1 flex-wrap">
                    {computedResult.naive.map((v, i) => (
                      <span key={i} className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>{v}</span>
                    ))}
                  </div>
                </div>
              )}
              {stageIdx >= totalStages && computedResult && (
                <div className="p-2 rounded" style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.15)" }}>
                  <p className="text-[10px]" style={{ color: "var(--brand)" }}>NTT O(n log n):</p>
                  <div className="flex gap-1 flex-wrap">
                    {computedResult.ntt.map((v, i) => (
                      <span key={i} className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "var(--brand)" }}>{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {showNaive && stageIdx >= totalStages && (
              <div className="p-3 rounded-lg text-center text-sm font-bold"
                style={{
                  backgroundColor: match ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  border: `2px solid ${match ? "#22c55e" : "#ef4444"}`,
                  color: match ? "#22c55e" : "#ef4444",
                }}>
                {match ? "✅ NTT result matches naive — correct!" : "❌ Mismatch detected"}
              </div>
            )}
          </div>
        )}

        {/* Complexity note */}
        <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--bg)", color: "var(--muted)", border: "1px solid rgba(148,163,184,.2)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--fg)" }}>💡 Why NTT?</p>
          <p>Naive polynomial multiplication is O(n²). NTT transforms both polynomials in O(n log n), does point-wise multiply in O(n), then inverse-NTT in O(n log n). Total: O(n log n) vs O(n²). Modulus {MOD.toLocaleString()} and primitive root 3 are the CP standard.</p>
        </div>

        {/* Status */}
        <div className="p-3 rounded text-sm font-medium"
          style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
          aria-live="polite" aria-atomic="true">
          {status}
        </div>
      </div>
    </div>
  );
};

export default ConvolutionNTTVisualizer;
