// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.

/**
 * Möbius function, sieve, divisor-sum / Möbius-inversion helpers.
 * Pure, stateless, unit-testable.
 * UI cap: N ≤ 200 (but generic implementation).
 */

// ── Sieve ───────────────────────────────────────────────────────────

export interface MobiusSieveResult {
    mu: number[];       // mu[0]=0, mu[1]=1, mu[n]=±1 or 0
    primes: number[];
    spf: number[];      // smallest prime factor
}

/**
 * Compute μ(n) for n = 0..nMax using a linear sieve.
 *
 * μ(1)=1.
 * μ(n)=0  if n has a squared prime factor.
 * μ(n)=(-1)^k if n is a product of k distinct primes.
 */
export function mobiusSieve(nMax: number): MobiusSieveResult {
    const mu = new Array<number>(nMax + 1).fill(0);
    const spf = new Array<number>(nMax + 1).fill(0);
    const primes: number[] = [];

    mu[1] = 1;
    for (let i = 2; i <= nMax; i++) {
        if (spf[i] === 0) {           // i is prime
            spf[i] = i;
            primes.push(i);
            mu[i] = -1;                 // single distinct prime
        }
        for (const p of primes) {
            if (p > spf[i] || i * p > nMax) break;
            spf[i * p] = p;
            if (i % p === 0) {
                mu[i * p] = 0;            // squared factor
            } else {
                mu[i * p] = -mu[i];
            }
        }
    }
    return { mu, primes, spf };
}

// ── Divisor helpers ─────────────────────────────────────────────────

/** Return sorted list of divisors of n (trial-division). */
export function divisorsOf(n: number): number[] {
    if (n <= 0) return [];
    const small: number[] = [];
    const large: number[] = [];
    for (let d = 1; d * d <= n; d++) {
        if (n % d === 0) {
            small.push(d);
            if (d !== n / d) large.push(n / d);
        }
    }
    return [...small, ...large.reverse()];
}

/** Precompute divisors[n] for n = 0..nMax. */
export function precomputeDivisors(nMax: number): number[][] {
    const divs: number[][] = Array.from({ length: nMax + 1 }, () => []);
    for (let d = 1; d <= nMax; d++) {
        for (let m = d; m <= nMax; m += d) {
            divs[m].push(d);
        }
    }
    return divs;
}

// ── Divisor (Dirichlet) transform ───────────────────────────────────

/**
 * g(n) = Σ_{d|n} f(d).
 * Input f[1..n], output g[1..n].   f[0] and g[0] are unused.
 */
export function divisorTransform(f: number[]): number[] {
    const n = f.length - 1;
    const g = new Array<number>(n + 1).fill(0);
    for (let d = 1; d <= n; d++) {
        for (let m = d; m <= n; m += d) {
            g[m] += f[d];
        }
    }
    return g;
}

/**
 * Möbius inversion: given g, recover f where g(n) = Σ_{d|n} f(d).
 * f(n) = Σ_{d|n} μ(d) · g(n/d).
 */
export function mobiusInversion(g: number[], mu: number[]): number[] {
    const n = g.length - 1;
    const f = new Array<number>(n + 1).fill(0);
    for (let d = 1; d <= n; d++) {
        if (mu[d] === 0) continue;
        for (let m = d; m <= n; m += d) {
            f[m] += mu[d] * g[m / d];
        }
    }
    return f;
}

// ── Step-by-step for visualizer ─────────────────────────────────────

export interface DivisorStep {
    n: number;
    divisor: number;
    fValue: number;
    running: number;
}

/** Compute g(n) = Σ_{d|n} f(d) step-by-step for a single n. */
export function divisorTransformSteps(n: number, f: number[]): { steps: DivisorStep[]; result: number } {
    const divs = divisorsOf(n);
    let running = 0;
    const steps: DivisorStep[] = [];
    for (const d of divs) {
        const val = d < f.length ? f[d] : 0;
        running += val;
        steps.push({ n, divisor: d, fValue: val, running });
    }
    return { steps, result: running };
}

export interface InversionStep {
    n: number;
    divisor: number;      // d that divides n
    muD: number;           // μ(d)
    gValue: number;        // g(n/d)
    contribution: number;  // μ(d)*g(n/d)
    running: number;
}

/** Compute f(n) = Σ_{d|n} μ(d)·g(n/d) step-by-step for a single n. */
export function inversionSteps(n: number, g: number[], mu: number[]): { steps: InversionStep[]; result: number } {
    const divs = divisorsOf(n);
    let running = 0;
    const steps: InversionStep[] = [];
    for (const d of divs) {
        const nd = n / d;
        const muD = d < mu.length ? mu[d] : 0;
        const gVal = nd < g.length ? g[nd] : 0;
        const contrib = muD * gVal;
        running += contrib;
        steps.push({ n, divisor: d, muD, gValue: gVal, contribution: contrib, running });
    }
    return { steps, result: running };
}

/**
 * Factorize n into its prime factors as a string, e.g. "2² × 3".
 */
export function factorizeString(n: number, spf: number[]): string {
    if (n <= 1) return n.toString();
    const factors: Map<number, number> = new Map();
    let v = n;
    while (v > 1 && v < spf.length) {
        const p = spf[v];
        factors.set(p, (factors.get(p) || 0) + 1);
        v /= p;
    }
    if (v > 1) factors.set(v, (factors.get(v) || 0) + 1);

    const sup: Record<number, string> = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
    return [...factors.entries()]
        .sort(([a], [b]) => a - b)
        .map(([p, e]) => e === 1 ? `${p}` : `${p}${String(e).split("").map(c => sup[+c] || c).join("")}`)
        .join(" × ");
}
