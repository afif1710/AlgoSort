// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.

/**
 * Number-theory helpers for CRT and related visualizers.
 * Pure, stateless, unit-testable.
 */

// ── Basics ──────────────────────────────────────────────────────────

/** Euclidean GCD. */
export function gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b !== 0) { [a, b] = [b, a % b]; }
    return a;
}

/** Extended GCD: returns {g, x, y} with a*x + b*y = g. */
export function egcd(a: number, b: number): { g: number; x: number; y: number } {
    if (b === 0) return { g: a, x: 1, y: 0 };
    const r = egcd(b, a % b);
    return { g: r.g, x: r.y, y: r.x - Math.floor(a / b) * r.y };
}

/** Normalize x into [0, m). */
export function modNormalize(x: number, m: number): number {
    return ((x % m) + m) % m;
}

/** Modular inverse of a mod m. Returns null when gcd(a,m)≠1. */
export function modInverse(a: number, m: number): number | null {
    const { g, x } = egcd(modNormalize(a, m), m);
    if (g !== 1) return null;
    return modNormalize(x, m);
}

// ── CRT ─────────────────────────────────────────────────────────────

export interface Congruence { a: number; m: number }
export interface CRTResult { a: number; m: number }

/**
 * Merge two congruences x≡a1(mod m1), x≡a2(mod m2).
 * Works for non-coprime moduli — returns null if inconsistent.
 *
 * Algorithm:
 *   a1 + m1*t ≡ a2 (mod m2)
 *   m1*t ≡ a2−a1 (mod m2)
 *   let g = gcd(m1,m2), if (a2−a1)%g ≠ 0 → no solution
 *   else t ≡ ((a2−a1)/g) * inv(m1/g, m2/g)  (mod m2/g)
 *   merged modulus = lcm(m1,m2) = m1*m2/g
 */
export function crtPair(a1: number, m1: number, a2: number, m2: number): CRTResult | null {
    a1 = modNormalize(a1, m1);
    a2 = modNormalize(a2, m2);
    const g = gcd(m1, m2);
    if ((a2 - a1) % g !== 0) return null;          // inconsistent

    const m1g = m1 / g;
    const m2g = m2 / g;
    const diff = (a2 - a1) / g;
    const inv = modInverse(m1g, m2g);              // m1/g and m2/g are coprime
    if (inv === null) return null;                   // should not happen

    const t = modNormalize(diff * inv, m2g);
    const lcm = m1 * m2g;                           // = lcm(m1,m2)
    const sol = modNormalize(a1 + m1 * t, lcm);

    return { a: sol, m: lcm };
}

/**
 * Solve a system of congruences by pair-wise merging.
 * Returns null if system is inconsistent.
 */
export function crtSolve(congruences: Congruence[]): CRTResult | null {
    if (congruences.length === 0) return null;
    let cur: CRTResult = { a: modNormalize(congruences[0].a, congruences[0].m), m: congruences[0].m };
    for (let i = 1; i < congruences.length; i++) {
        const merged = crtPair(cur.a, cur.m, congruences[i].a, congruences[i].m);
        if (!merged) return null;
        cur = merged;
    }
    return cur;
}

// ── CRT step-by-step (for visualizer) ───────────────────────────────

export interface CRTStep {
    idx: number;            // which congruence was merged (1-indexed pair step)
    a1: number; m1: number; // LHS at that point
    a2: number; m2: number; // new congruence being merged
    g: number;              // gcd(m1,m2)
    consistent: boolean;
    resultA: number;
    resultM: number;
    explanation: string;
}

/**
 * Produce a log of merge steps for CRT, suitable for step-by-step display.
 */
export function crtSteps(congruences: Congruence[]): CRTStep[] {
    if (congruences.length <= 1) return [];
    const steps: CRTStep[] = [];
    let cur: CRTResult = { a: modNormalize(congruences[0].a, congruences[0].m), m: congruences[0].m };

    for (let i = 1; i < congruences.length; i++) {
        const c = congruences[i];
        const a2 = modNormalize(c.a, c.m);
        const g = gcd(cur.m, c.m);
        const merged = crtPair(cur.a, cur.m, a2, c.m);

        if (!merged) {
            steps.push({
                idx: i, a1: cur.a, m1: cur.m, a2, m2: c.m, g,
                consistent: false, resultA: 0, resultM: 0,
                explanation: `No solution: (${a2} − ${cur.a}) = ${a2 - cur.a} is not divisible by gcd(${cur.m}, ${c.m}) = ${g}.`,
            });
            return steps;
        }

        const lcm = merged.m;
        steps.push({
            idx: i, a1: cur.a, m1: cur.m, a2, m2: c.m, g,
            consistent: true, resultA: merged.a, resultM: lcm,
            explanation:
                g === 1
                    ? `Coprime: M=${cur.m}×${c.m}=${lcm}. Mi=${lcm / cur.m} for eq1, Mi=${lcm / c.m} for eq2. x ≡ ${merged.a} (mod ${lcm}).`
                    : `Non-coprime: gcd=${g}, lcm=${lcm}. Merged x ≡ ${merged.a} (mod ${lcm}).`,
        });
        cur = merged;
    }
    return steps;
}
