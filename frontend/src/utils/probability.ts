// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.

/**
 * Pure-logic helpers for probability / expected-value visualizers.
 * Stateless — no side effects, fully unit-testable.
 */

// ── Expected Value (theoretical) ───────────────────────────────────

/** Theoretical E[sum of n fair d-sided dice]. */
export function evDiceSum(n: number, sides = 6): number {
    return n * (sides + 1) / 2;
}

/** Theoretical E[heads in n fair coin flips]. */
export function evCoinFlips(n: number): number {
    return n * 0.5;
}

/** Theoretical E[trials until all k coupons collected"] (coupon collector). */
export function evCouponCollector(k: number): number {
    let ev = 0;
    for (let i = 1; i <= k; i++) ev += k / i;
    return ev;
}

// ── Monte Carlo simulation helpers ─────────────────────────────────

/** Roll a single d-sided die. */
export function rollDie(sides = 6): number {
    return Math.floor(Math.random() * sides) + 1;
}

/** Simulate one trial of "sum of n dice". */
export function simulateDiceSum(n: number, sides = 6): number {
    let total = 0;
    for (let i = 0; i < n; i++) total += rollDie(sides);
    return total;
}

/** Simulate one trial of "heads in n flips". */
export function simulateCoinFlips(n: number): number {
    let heads = 0;
    for (let i = 0; i < n; i++) if (Math.random() < 0.5) heads++;
    return heads;
}

/** Simulate one trial of coupon collector (k types). Returns number of trials. */
export function simulateCouponCollector(k: number): number {
    const seen = new Set<number>();
    let trials = 0;
    while (seen.size < k) {
        seen.add(Math.floor(Math.random() * k));
        trials++;
    }
    return trials;
}

/**
 * Run `batchSize` trials of the given scenario and return {newMean, newCount}.
 * `prevSum` and `prevCount` allow incremental accumulation.
 */
export function runBatch(
    scenario: "dice" | "coins" | "coupon",
    params: { n: number; sides?: number; k?: number },
    batchSize: number,
    prevSum: number,
    prevCount: number,
): { newSum: number; newCount: number; batchMean: number } {
    let sum = prevSum;
    for (let i = 0; i < batchSize; i++) {
        if (scenario === "dice") sum += simulateDiceSum(params.n, params.sides ?? 6);
        else if (scenario === "coins") sum += simulateCoinFlips(params.n);
        else sum += simulateCouponCollector(params.k ?? params.n);
    }
    const newCount = prevCount + batchSize;
    return { newSum: sum, newCount, batchMean: newCount > 0 ? sum / newCount : 0 };
}

// ── Inclusion-Exclusion helpers ─────────────────────────────────────

/**
 * Compute |A ∪ B| via PIE (2 sets).
 */
export function pie2(a: number, b: number, ab: number): number {
    return a + b - ab;
}

/**
 * Compute |A ∪ B ∪ C| via PIE (3 sets).
 */
export function pie3(
    a: number, b: number, c: number,
    ab: number, ac: number, bc: number,
    abc: number,
): number {
    return a + b + c - ab - ac - bc + abc;
}

/**
 * Compute |A ∪ B ∪ C ∪ D| via PIE (4 sets).
 */
export function pie4(
    a: number, b: number, c: number, d: number,
    ab: number, ac: number, ad: number, bc: number, bd: number, cd: number,
    abc: number, abd: number, acd: number, bcd: number,
    abcd: number,
): number {
    return (
        a + b + c + d
        - ab - ac - ad - bc - bd - cd
        + abc + abd + acd + bcd
        - abcd
    );
}

/**
 * PIE step-by-step breakdown for display.
 * Returns an ordered list of {label, sign, value, running} per term.
 */
export interface PieStep {
    label: string;
    sign: "+" | "-";
    value: number;
    running: number;
}

export function pieSteps2(
    a: number, b: number, ab: number,
): PieStep[] {
    let r = 0;
    const steps: PieStep[] = [];
    r += a; steps.push({ label: "|A|", sign: "+", value: a, running: r });
    r += b; steps.push({ label: "|B|", sign: "+", value: b, running: r });
    r -= ab; steps.push({ label: "|A∩B|", sign: "-", value: ab, running: r });
    return steps;
}

export function pieSteps3(
    a: number, b: number, c: number,
    ab: number, ac: number, bc: number, abc: number,
): PieStep[] {
    let r = 0;
    const steps: PieStep[] = [];
    r += a; steps.push({ label: "|A|", sign: "+", value: a, running: r });
    r += b; steps.push({ label: "|B|", sign: "+", value: b, running: r });
    r += c; steps.push({ label: "|C|", sign: "+", value: c, running: r });
    r -= ab; steps.push({ label: "|A∩B|", sign: "-", value: ab, running: r });
    r -= ac; steps.push({ label: "|A∩C|", sign: "-", value: ac, running: r });
    r -= bc; steps.push({ label: "|B∩C|", sign: "-", value: bc, running: r });
    r += abc; steps.push({ label: "|A∩B∩C|", sign: "+", value: abc, running: r });
    return steps;
}

export function pieSteps4(
    a: number, b: number, c: number, d: number,
    ab: number, ac: number, ad: number, bc: number, bd: number, cd: number,
    abc: number, abd: number, acd: number, bcd: number,
    abcd: number,
): PieStep[] {
    let r = 0;
    const steps: PieStep[] = [];
    // Singles (+)
    r += a; steps.push({ label: "|A|", sign: "+", value: a, running: r });
    r += b; steps.push({ label: "|B|", sign: "+", value: b, running: r });
    r += c; steps.push({ label: "|C|", sign: "+", value: c, running: r });
    r += d; steps.push({ label: "|D|", sign: "+", value: d, running: r });
    // Pairs (-)
    r -= ab; steps.push({ label: "|A∩B|", sign: "-", value: ab, running: r });
    r -= ac; steps.push({ label: "|A∩C|", sign: "-", value: ac, running: r });
    r -= ad; steps.push({ label: "|A∩D|", sign: "-", value: ad, running: r });
    r -= bc; steps.push({ label: "|B∩C|", sign: "-", value: bc, running: r });
    r -= bd; steps.push({ label: "|B∩D|", sign: "-", value: bd, running: r });
    r -= cd; steps.push({ label: "|C∩D|", sign: "-", value: cd, running: r });
    // Triples (+)
    r += abc; steps.push({ label: "|A∩B∩C|", sign: "+", value: abc, running: r });
    r += abd; steps.push({ label: "|A∩B∩D|", sign: "+", value: abd, running: r });
    r += acd; steps.push({ label: "|A∩C∩D|", sign: "+", value: acd, running: r });
    r += bcd; steps.push({ label: "|B∩C∩D|", sign: "+", value: bcd, running: r });
    // Quadruple (-)
    r -= abcd; steps.push({ label: "|A∩B∩C∩D|", sign: "-", value: abcd, running: r });
    return steps;
}

// ── Modular Arithmetic helpers ──────────────────────────────────────

/** Normalize any integer x to [0, m). */
export function normalizeMod(x: number, m: number): number {
    return ((x % m) + m) % m;
}

/** O(log min(a,b)) GCD via Euclidean algorithm. */
export function gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b !== 0) { [a, b] = [b, a % b]; }
    return a;
}

/**
 * Extended GCD: returns {g, x, y} such that a*x + b*y = g.
 */
export function extGcd(a: number, b: number): { g: number; x: number; y: number } {
    if (b === 0) return { g: a, x: 1, y: 0 };
    const { g, x, y } = extGcd(b, a % b);
    return { g, x: y, y: x - Math.floor(a / b) * y };
}

/**
 * Modular inverse of a mod m. Returns null if gcd(a,m) !== 1.
 */
export function modInverse(a: number, m: number): number | null {
    const { g, x } = extGcd(normalizeMod(a, m), m);
    if (g !== 1) return null;
    return normalizeMod(x, m);
}

/** Build the addition sequence: 0, a, 2a, 3a, ... mod m until cycle. */
export function additionSequence(a: number, m: number): number[] {
    const seq: number[] = [];
    const seen = new Set<number>();
    let cur = 0;
    while (!seen.has(cur)) {
        seen.add(cur);
        seq.push(cur);
        cur = (cur + a) % m;
    }
    return seq;
}

/** Build the power sequence: a^0, a^1, a^2, ... mod m until cycle. */
export function powerSequence(a: number, m: number): number[] {
    const seq: number[] = [];
    const seen = new Set<number>();
    let cur = 1;
    while (!seen.has(cur)) {
        seen.add(cur);
        seq.push(cur);
        cur = (cur * a) % m;
    }
    return seq;
}

/** Build full multiplication table mod m for values 0..m-1. */
export function multTable(a: number, m: number): number[] {
    return Array.from({ length: m }, (_, i) => (i * a) % m);
}
