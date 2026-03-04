// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.

/**
 * Pure-logic helpers for prefix-sum and difference-array visualizers.
 * Stateless functions — easy to test, no side effects.
 */

// ── 1D Prefix Sum ──────────────────────────────────────────────────

/** Build prefix[0..n] where prefix[0]=0 and prefix[i]=sum(arr[0..i-1]). */
export function buildPrefixSum1D(arr: number[]): number[] {
    const prefix: number[] = [0];
    for (let i = 0; i < arr.length; i++) {
        prefix.push(prefix[i] + arr[i]);
    }
    return prefix;
}

/** Sum of arr[l..r] (inclusive) via prefix array. */
export function queryPrefixSum1D(
    prefix: number[],
    l: number,
    r: number,
): number {
    return prefix[r + 1] - prefix[l];
}

// ── 2D Prefix Sum ──────────────────────────────────────────────────

/** Build 2D prefix matrix (rows+1 × cols+1, zero-padded row/col 0). */
export function buildPrefixSum2D(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0]?.length ?? 0;
    const prefix: number[][] = Array.from({ length: rows + 1 }, () =>
        new Array(cols + 1).fill(0),
    );
    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
            prefix[i][j] =
                matrix[i - 1][j - 1] +
                prefix[i - 1][j] +
                prefix[i][j - 1] -
                prefix[i - 1][j - 1];
        }
    }
    return prefix;
}

/** Sum of sub-rectangle (r1,c1)..(r2,c2) inclusive (0-indexed input coords). */
export function queryPrefixSum2D(
    prefix: number[][],
    r1: number,
    c1: number,
    r2: number,
    c2: number,
): number {
    return (
        prefix[r2 + 1][c2 + 1] -
        prefix[r1][c2 + 1] -
        prefix[r2 + 1][c1] +
        prefix[r1][c1]
    );
}

// ── Difference Array ───────────────────────────────────────────────

/** Create a zero-initialized difference array of given length. */
export function createDifferenceArray(length: number): number[] {
    return new Array(length).fill(0);
}

/** Apply range update: add `val` to indices [l..r] (inclusive). */
export function applyDifferenceUpdate(
    diff: number[],
    l: number,
    r: number,
    val: number,
): number[] {
    const d = [...diff];
    d[l] += val;
    if (r + 1 < d.length) d[r + 1] -= val;
    return d;
}

/** Build final array from difference array via prefix sum. */
export function buildFromDifference(diff: number[]): number[] {
    const result: number[] = [];
    let running = 0;
    for (const d of diff) {
        running += d;
        result.push(running);
    }
    return result;
}
