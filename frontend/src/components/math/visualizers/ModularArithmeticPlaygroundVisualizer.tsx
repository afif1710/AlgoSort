// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import React, { useState, useMemo } from "react";
import {
  normalizeMod,
  gcd,
  modInverse,
  additionSequence,
  powerSequence,
  multTable,
} from "../../../utils/probability";

type OpType = "addition" | "multiplication" | "power";

const OP_OPTIONS: { id: OpType; label: string; desc: string }[] = [
  { id: "addition", label: "+ Addition", desc: "0, a, 2a, 3a, … mod m" },
  { id: "multiplication", label: "× Multiplication", desc: "0·a, 1·a, 2·a, … mod m" },
  { id: "power", label: "^ Power", desc: "a⁰, a¹, a², … mod m" },
];

// SVG clock params
const CLOCK_R = 90;
const CX = 110;
const CY = 110;

function polarToXY(index: number, total: number, r: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

const ModularArithmeticPlaygroundVisualizer: React.FC = () => {
  const [m, setM] = useState(7);
  const [a, setA] = useState(3);
  const [op, setOp] = useState<OpType>("addition");
  const [rawX, setRawX] = useState("-4");
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [status, setStatus] = useState("Adjust m and a to explore modular patterns.");

  const safeM = Math.max(2, Math.min(50, m));
  const safeA = normalizeMod(a, safeM);

  // Build sequence
  const sequence = useMemo(() => {
    if (op === "addition") return additionSequence(safeA, safeM);
    if (op === "multiplication") return multTable(safeA, safeM);
    return powerSequence(safeA, safeM);
  }, [op, safeA, safeM]);

  const g = gcd(safeA, safeM);
  const inv = modInverse(safeA, safeM);

  // Normalize negative input
  const normalizedX = normalizeMod(parseInt(rawX) || 0, safeM);

  // Build status description for sequence
  const seqSummary = useMemo(() => {
    if (op === "addition") {
      const cycleLen = sequence.length;
      return `Addition by ${safeA} mod ${safeM}: cycles through ${cycleLen} element${cycleLen !== 1 ? "s" : ""}. gcd(${safeA}, ${safeM}) = ${g}; cycle length = ${safeM / g}.`;
    }
    if (op === "multiplication") {
      return `x · ${safeA} mod ${safeM} for x = 0..${safeM - 1}. gcd(${safeA}, ${safeM}) = ${g}${inv !== null ? `; inverse exists: ${safeA}⁻¹ ≡ ${inv} (mod ${safeM})` : "; no inverse (gcd ≠ 1)"}.`;
    }
    const cycleLen = sequence.length;
    return `Powers of ${safeA} mod ${safeM}: cycle length = ${cycleLen}. ${g === 1 ? `Fermat little: ${safeA}^(${safeM}-1) ≡ 1 (mod ${safeM}) if ${safeM} prime.` : `gcd(${safeA}, ${safeM}) = ${g} ≠ 1; not coprime.`}`;
  }, [op, safeA, safeM, g, inv, sequence.length]);

  const handleHighlight = (idx: number) => {
    setHighlightIdx(idx === highlightIdx ? null : idx);
    const val = sequence[idx];
    setStatus(
      op === "addition"
        ? `${idx} × ${safeA} ≡ ${val} (mod ${safeM})`
        : op === "multiplication"
        ? `${idx} × ${safeA} ≡ ${val} (mod ${safeM})`
        : `${safeA}^${idx} ≡ ${val} (mod ${safeM})`
    );
  };

  const clockNodes = Array.from({ length: safeM }, (_, i) => {
    const pos = polarToXY(i, safeM, CLOCK_R);
    const isInSequence = sequence.includes(i);
    const seqIndex = sequence.indexOf(i);
    const isHighlighted = highlightIdx !== null && sequence[highlightIdx] === i;
    return { i, pos, isInSequence, seqIndex, isHighlighted };
  });

  // Draw arrows for sequence (consecutive pairs)
  const arrows = sequence.slice(0, Math.min(sequence.length, 20)).map((val, idx) => {
    if (idx === 0) return null;
    const from = polarToXY(sequence[idx - 1], safeM, CLOCK_R * 0.75);
    const to = polarToXY(val, safeM, CLOCK_R * 0.75);
    return { from, to, idx };
  }).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg space-y-5" style={{ backgroundColor: "var(--panel)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
          🔢 Modular Arithmetic Playground
        </h3>

        {/* Op selector */}
        <div className="flex gap-2 flex-wrap">
          {OP_OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => { setOp(o.id); setHighlightIdx(null); setStatus("Explore the new operation below."); }}
              className="px-3 py-1.5 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: op === o.id ? "var(--brand)" : "var(--card-hover-bg)",
                color: op === o.id ? "white" : "var(--fg)",
                border: "2px solid var(--brand)",
              }}
              aria-label={`Select operation: ${o.label}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          {OP_OPTIONS.find((o) => o.id === op)?.desc}
        </p>

        {/* Parameters */}
        <div className="flex flex-wrap gap-6 items-end">
          <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--fg)" }}>
            m (modulus) = {safeM}
            <input
              type="range" min={2} max={30} value={safeM}
              onChange={(e) => { setM(+e.target.value); setHighlightIdx(null); }}
              className="w-40"
              aria-label="Modulus m"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--fg)" }}>
            a (parameter) = {safeA}
            <input
              type="range" min={0} max={safeM - 1} value={safeA}
              onChange={(e) => { setA(+e.target.value); setHighlightIdx(null); }}
              className="w-40"
              aria-label="Parameter a"
            />
          </label>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className="text-xs px-3 py-1 rounded font-mono"
            style={{
              backgroundColor: `rgba(${g === 1 ? "34,197,94" : "239,68,68"},0.15)`,
              color: g === 1 ? "#22c55e" : "#ef4444",
              border: `1px solid ${g === 1 ? "#22c55e" : "#ef4444"}`,
            }}
          >
            gcd({safeA}, {safeM}) = {g} → {g === 1 ? "coprime ✓" : "not coprime ✗"}
          </span>
          {inv !== null ? (
            <span
              className="text-xs px-3 py-1 rounded font-mono"
              style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid #22c55e" }}
            >
              {safeA}⁻¹ ≡ {inv} (mod {safeM}) — verify: {safeA} × {inv} ≡ {(safeA * inv) % safeM} (mod {safeM})
            </span>
          ) : (
            <span
              className="text-xs px-3 py-1 rounded font-mono"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef4444" }}
            >
              No inverse exists (gcd ≠ 1)
            </span>
          )}
          <span
            className="text-xs px-3 py-1 rounded font-mono"
            style={{ backgroundColor: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid #8b5cf6" }}
          >
            cycle length = {sequence.length}
          </span>
        </div>

        {/* Main visualization: Clock + Sequence */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Residue clock */}
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>
              Residue Clock (click node to inspect)
            </p>
            <svg width={220} height={220} viewBox="0 0 220 220" className="w-full max-w-[220px]">
              {/* Dashed arrows (sequence path, max 20) */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--brand)" />
                </marker>
              </defs>
              {arrows.map((arr) => arr && (
                <line
                  key={arr.idx}
                  x1={arr.from.x} y1={arr.from.y}
                  x2={arr.to.x} y2={arr.to.y}
                  stroke="var(--brand)" strokeWidth={1} strokeOpacity={0.35}
                  markerEnd="url(#arrow)"
                />
              ))}

              {/* Nodes */}
              {clockNodes.map(({ i, pos, isInSequence, seqIndex, isHighlighted }) => (
                <g
                  key={i}
                  onClick={() => isInSequence ? handleHighlight(seqIndex) : undefined}
                  style={{ cursor: isInSequence ? "pointer" : "default" }}
                >
                  <circle
                    cx={pos.x} cy={pos.y} r={14}
                    fill={
                      isHighlighted
                        ? "#f59e0b"
                        : isInSequence
                        ? "var(--brand)"
                        : "var(--card-hover-bg)"
                    }
                    stroke={isInSequence ? "var(--brand)" : "rgba(148,163,184,.4)"}
                    strokeWidth={2}
                    fillOpacity={isInSequence ? 1 : 0.5}
                  />
                  <text
                    x={pos.x} y={pos.y + 4}
                    textAnchor="middle" fontSize={11} fontWeight="bold"
                    fill={isInSequence ? "white" : "var(--muted)"}
                  >
                    {i}
                  </text>
                </g>
              ))}
              {/* Center label */}
              <text x={CX} y={CY - 8} textAnchor="middle" fontSize={10} fill="var(--muted)">mod</text>
              <text x={CX} y={CY + 8} textAnchor="middle" fontSize={16} fontWeight="bold" fill="var(--brand)">{safeM}</text>
            </svg>
          </div>

          {/* Sequence table */}
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>
              Sequence (click row to highlight):
            </p>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(148,163,184,.25)" }}
            >
              <div
                className="grid text-xs font-medium px-3 py-2"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--muted)",
                  gridTemplateColumns: "2rem 1fr 1fr",
                }}
              >
                <span>#</span>
                <span>
                  {op === "power" ? `${safeA}^k` : op === "addition" ? `k·${safeA}` : `k·${safeA}`}
                </span>
                <span>mod {safeM}</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {sequence.map((val, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleHighlight(idx)}
                    className="grid cursor-pointer px-3 py-1.5 text-sm font-mono transition-all"
                    style={{
                      gridTemplateColumns: "2rem 1fr 1fr",
                      backgroundColor:
                        highlightIdx === idx
                          ? "rgba(99,102,241,0.15)"
                          : idx % 2 === 0
                          ? "var(--bg)"
                          : "var(--panel)",
                      color: highlightIdx === idx ? "var(--brand)" : "var(--fg)",
                      borderLeft: highlightIdx === idx ? "3px solid var(--brand)" : "3px solid transparent",
                    }}
                    aria-label={`Step ${idx}: result ${val}`}
                  >
                    <span style={{ color: "var(--muted)" }}>{idx}</span>
                    <span>
                      {op === "power"
                        ? `${safeA}^${idx}`
                        : `${idx}·${safeA}`}
                    </span>
                    <span className="font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Negative mod normalizer */}
        <div
          className="p-4 rounded-lg space-y-2"
          style={{ backgroundColor: "var(--bg)", border: "1px solid rgba(148,163,184,.25)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>
            🔧 Negative Mod Normalizer
          </p>
          <div className="flex gap-3 items-center flex-wrap">
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--fg)" }}>
              x =
              <input
                type="number"
                value={rawX}
                onChange={(e) => setRawX(e.target.value)}
                className="w-24 px-2 py-1 rounded text-sm"
                aria-label="Input value x"
              />
            </label>
            <div
              className="px-3 py-1.5 rounded text-sm font-mono"
              style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
            >
              ((x % {safeM}) + {safeM}) % {safeM} = <strong style={{ color: "var(--brand)" }}>{normalizedX}</strong>
            </div>
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            In most languages, <code>x % m</code> can be negative when x &lt; 0. Use <code>((x % m) + m) % m</code> to always get a value in [0, m).
          </p>
        </div>

        {/* Sequence summary */}
        <div
          className="p-3 rounded text-sm"
          style={{ backgroundColor: "var(--bg)", color: "var(--muted)", border: "1px solid rgba(148,163,184,.2)" }}
        >
          {seqSummary}
        </div>

        {/* Status */}
        <div
          className="p-3 rounded text-sm font-medium"
          style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </div>
      </div>
    </div>
  );
};

export default ModularArithmeticPlaygroundVisualizer;
