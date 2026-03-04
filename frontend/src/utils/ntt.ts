// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.

/**
 * NTT (Number Theoretic Transform) for polynomial convolution.
 * Visualisation-first: supports lengths up to 1024, UI uses ≤ 32.
 * Modulus = 998244353, primitive root = 3.
 * Pure, stateless, unit-testable.
 */

const MOD = 998244353;
const PRIM_ROOT = 3;

// ── Modular helpers ─────────────────────────────────────────────────

/** (a * b) % mod — uses BigInt to avoid overflow for mod ≈ 10^9. */
function mulmod(a: number, b: number, mod: number): number {
    return Number(BigInt(a) * BigInt(b) % BigInt(mod));
}

/** Modular exponentiation. */
function powmod(base: number, exp: number, mod: number): number {
    let result = 1;
    base %= mod;
    if (base < 0) base += mod;
    while (exp > 0) {
        if (exp & 1) result = mulmod(result, base, mod);
        exp >>= 1;
        base = mulmod(base, base, mod);
    }
    return result;
}

/** Modular inverse via Fermat (mod must be prime). */
function modinv(a: number, mod: number): number {
    return powmod(a, mod - 2, mod);
}

// ── Bit reversal ────────────────────────────────────────────────────

function bitReverse(arr: number[]): number[] {
    const n = arr.length;
    const out = [...arr];
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { [out[i], out[j]] = [out[j], out[i]]; }
    }
    return out;
}

// ── Core NTT ────────────────────────────────────────────────────────

/**
 * In-place NTT on array `a` (length must be power of 2).
 * If `invert` is true, computes inverse NTT.
 * Returns the transformed array (same reference).
 */
export function ntt(a: number[], invert: boolean): number[] {
    const n = a.length;
    a = bitReverse(a);

    for (let len = 2; len <= n; len <<= 1) {
        const w = invert
            ? modinv(powmod(PRIM_ROOT, (MOD - 1) / len, MOD), MOD)
            : powmod(PRIM_ROOT, (MOD - 1) / len, MOD);
        const half = len >> 1;
        for (let i = 0; i < n; i += len) {
            let wn = 1;
            for (let j = 0; j < half; j++) {
                const u = a[i + j];
                const v = mulmod(a[i + j + half], wn, MOD);
                a[i + j] = (u + v) % MOD;
                a[i + j + half] = (u - v + MOD) % MOD;
                wn = mulmod(wn, w, MOD);
            }
        }
    }

    if (invert) {
        const ninv = modinv(n, MOD);
        for (let i = 0; i < n; i++) a[i] = mulmod(a[i], ninv, MOD);
    }
    return a;
}

/**
 * Polynomial convolution via NTT.
 * Returns c where c[k] = Σ a[i]*b[k-i]  (mod 998244353).
 */
export function convolution(a: number[], b: number[]): number[] {
    const resultLen = a.length + b.length - 1;
    let n = 1;
    while (n < resultLen) n <<= 1;

    const fa = ntt([...a, ...new Array(n - a.length).fill(0)], false);
    const fb = ntt([...b, ...new Array(n - b.length).fill(0)], false);

    const fc = fa.map((v, i) => mulmod(v, fb[i], MOD));
    const result = ntt(fc, true);

    return result.slice(0, resultLen);
}

/** Naive O(n²) convolution for correctness comparison. */
export function naiveConvolution(a: number[], b: number[]): number[] {
    const n = a.length + b.length - 1;
    const c = new Array(n).fill(0);
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            c[i + j] = (c[i + j] + mulmod(a[i], b[j], MOD)) % MOD;
        }
    }
    return c;
}

// ── Step-by-step NTT stages (for visualizer) ────────────────────────

export interface ButterflyOp {
    stage: number;        // 0-indexed stage (log2 levels)
    i: number;            // first index
    j: number;            // second index (i + half)
    w: number;            // twiddle factor used
    uBefore: number;
    vBefore: number;
    uAfter: number;
    vAfter: number;
}

export interface NTTStageLog {
    stage: number;
    len: number;           // butterfly span at this stage
    butterflies: ButterflyOp[];
    arrayAfter: number[];
}

/**
 * Run NTT and return stage-by-stage log suitable for animated display.
 */
export function nttWithStages(input: number[], invert: boolean): { stages: NTTStageLog[]; bitReversed: number[]; result: number[] } {
    const n = input.length;
    let a = bitReverse(input);
    const reversed = [...a];
    const stages: NTTStageLog[] = [];

    let stageIdx = 0;
    for (let len = 2; len <= n; len <<= 1) {
        const w = invert
            ? modinv(powmod(PRIM_ROOT, (MOD - 1) / len, MOD), MOD)
            : powmod(PRIM_ROOT, (MOD - 1) / len, MOD);
        const half = len >> 1;
        const butterflies: ButterflyOp[] = [];

        for (let i = 0; i < n; i += len) {
            let wn = 1;
            for (let j = 0; j < half; j++) {
                const u = a[i + j];
                const v = mulmod(a[i + j + half], wn, MOD);
                a[i + j] = (u + v) % MOD;
                a[i + j + half] = (u - v + MOD) % MOD;
                butterflies.push({
                    stage: stageIdx,
                    i: i + j,
                    j: i + j + half,
                    w: wn,
                    uBefore: u,
                    vBefore: a[i + j + half] === (u - v + MOD) % MOD ? v : v, // v before butterfly
                    uAfter: a[i + j],
                    vAfter: a[i + j + half],
                });
                wn = mulmod(wn, w, MOD);
            }
        }

        stages.push({ stage: stageIdx, len, butterflies, arrayAfter: [...a] });
        stageIdx++;
    }

    if (invert) {
        const ninv = modinv(n, MOD);
        for (let i = 0; i < n; i++) a[i] = mulmod(a[i], ninv, MOD);
        stages.push({ stage: stageIdx, len: n, butterflies: [], arrayAfter: [...a] });
    }

    return { stages, bitReversed: reversed, result: [...a] };
}

export { MOD, PRIM_ROOT, powmod, modinv, mulmod };
