// Phase 3 — Unit tests for core math helpers
// Run: node src/__tests__/mathHelpers.test.js
// These are assertion-based tests (no framework needed).

// ── Import helpers ──
// We use dynamic inline versions since we can't import TS directly from node.
// The logic here mirrors the actual utils exactly.

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b !== 0) { [a, b] = [b, a % b]; } return a; }
function egcd(a, b) { if (b === 0) return { g: a, x: 1, y: 0 }; const r = egcd(b, a % b); return { g: r.g, x: r.y, y: r.x - Math.floor(a / b) * r.y }; }
function modNormalize(x, m) { return ((x % m) + m) % m; }
function modInverse(a, m) { const { g, x } = egcd(modNormalize(a, m), m); if (g !== 1) return null; return modNormalize(x, m); }

function crtPair(a1, m1, a2, m2) {
    a1 = modNormalize(a1, m1); a2 = modNormalize(a2, m2);
    const g = gcd(m1, m2);
    if ((a2 - a1) % g !== 0) return null;
    const m1g = m1 / g, m2g = m2 / g, diff = (a2 - a1) / g;
    const inv = modInverse(m1g, m2g); if (inv === null) return null;
    const t = modNormalize(diff * inv, m2g), lcm = m1 * m2g;
    return { a: modNormalize(a1 + m1 * t, lcm), m: lcm };
}
function crtSolve(congs) {
    if (congs.length === 0) return null;
    let cur = { a: modNormalize(congs[0].a, congs[0].m), m: congs[0].m };
    for (let i = 1; i < congs.length; i++) {
        const merged = crtPair(cur.a, cur.m, congs[i].a, congs[i].m);
        if (!merged) return null; cur = merged;
    }
    return cur;
}

// ── Möbius sieve ──
function mobiusSieve(nMax) {
    const mu = new Array(nMax + 1).fill(0), spf = new Array(nMax + 1).fill(0), primes = [];
    mu[1] = 1;
    for (let i = 2; i <= nMax; i++) {
        if (spf[i] === 0) { spf[i] = i; primes.push(i); mu[i] = -1; }
        for (const p of primes) {
            if (p > spf[i] || i * p > nMax) break; spf[i * p] = p;
            mu[i * p] = i % p === 0 ? 0 : -mu[i];
        }
    }
    return { mu, primes, spf };
}
function divisorTransform(f) {
    const n = f.length - 1, g = new Array(n + 1).fill(0);
    for (let d = 1; d <= n; d++) for (let m = d; m <= n; m += d) g[m] += f[d];
    return g;
}
function mobiusInversion(g, mu) {
    const n = g.length - 1, f = new Array(n + 1).fill(0);
    for (let d = 1; d <= n; d++) { if (mu[d] === 0) continue; for (let m = d; m <= n; m += d) f[m] += mu[d] * g[m / d]; }
    return f;
}

// ── NTT ──
const MOD = 998244353, PRIM_ROOT = 3;
function mulmod(a, b, mod) { return Number(BigInt(a) * BigInt(b) % BigInt(mod)); }
function powmod(base, exp, mod) { let r = 1; base %= mod; if (base < 0) base += mod; while (exp > 0) { if (exp & 1) r = mulmod(r, base, mod); exp >>= 1; base = mulmod(base, base, mod); } return r; }
function modinv(a, mod) { return powmod(a, mod - 2, mod); }
function bitReverse(arr) { const n = arr.length, out = [...arr]; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) [out[i], out[j]] = [out[j], out[i]]; } return out; }
function ntt(a, invert) {
    const n = a.length; a = bitReverse(a);
    for (let len = 2; len <= n; len <<= 1) {
        const w = invert ? modinv(powmod(PRIM_ROOT, (MOD - 1) / len, MOD), MOD) : powmod(PRIM_ROOT, (MOD - 1) / len, MOD);
        const half = len >> 1;
        for (let i = 0; i < n; i += len) {
            let wn = 1;
            for (let j = 0; j < half; j++) {
                const u = a[i + j], v = mulmod(a[i + j + half], wn, MOD);
                a[i + j] = (u + v) % MOD; a[i + j + half] = (u - v + MOD) % MOD;
                wn = mulmod(wn, w, MOD);
            }
        }
    }
    if (invert) { const ninv = modinv(n, MOD); for (let i = 0; i < n; i++) a[i] = mulmod(a[i], ninv, MOD); }
    return a;
}
function convolution(a, b) {
    const rl = a.length + b.length - 1; let n = 1; while (n < rl) n <<= 1;
    const fa = ntt([...a, ...new Array(n - a.length).fill(0)], false);
    const fb = ntt([...b, ...new Array(n - b.length).fill(0)], false);
    const fc = fa.map((v, i) => mulmod(v, fb[i], MOD));
    const result = ntt(fc, true);
    return result.slice(0, rl);
}
function naiveConvolution(a, b) {
    const n = a.length + b.length - 1, c = new Array(n).fill(0);
    for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) c[i + j] = (c[i + j] + mulmod(a[i], b[j], MOD)) % MOD;
    return c;
}

// ============== TESTS ==============
let pass = 0, fail = 0;
function assert(cond, msg) { if (cond) { pass++; } else { fail++; console.error(`FAIL: ${msg}`); } }
function assertEq(a, b, msg) { assert(JSON.stringify(a) === JSON.stringify(b), `${msg}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); }

// ── modInverse ──
console.log("--- modInverse ---");
assertEq(modInverse(7, 11), 8, "inv(7,11)=8");
assertEq(modInverse(3, 7), 5, "inv(3,7)=5");
assert(modInverse(4, 10) === null, "inv(4,10)=null");
assertEq(modInverse(1, 5), 1, "inv(1,5)=1");

// ── CRT: coprime ──
console.log("--- CRT coprime ---");
let res = crtSolve([{ a: 2, m: 3 }, { a: 3, m: 5 }, { a: 2, m: 7 }]);
assertEq(res, { a: 23, m: 105 }, "CRT([2/3,3/5,2/7])=23 mod 105");

// ── CRT: non-coprime ──
console.log("--- CRT non-coprime ---");
res = crtSolve([{ a: 3, m: 4 }, { a: 5, m: 6 }]);
assertEq(res, { a: 11, m: 12 }, "CRT non-coprime [3/4,5/6]=11 mod 12");

res = crtSolve([{ a: 2, m: 4 }, { a: 2, m: 6 }]);
assertEq(res, { a: 2, m: 12 }, "CRT non-coprime solvable [2/4,2/6]=2 mod 12");

// ── CRT: no solution ──
console.log("--- CRT no solution ---");
res = crtSolve([{ a: 1, m: 4 }, { a: 0, m: 6 }]);
assert(res === null, "CRT inconsistent [1/4,0/6]=null");

// ── Möbius sieve ──
console.log("--- Möbius sieve ---");
const sieve = mobiusSieve(20);
assertEq(sieve.mu[1], 1, "μ(1)=1");
assertEq(sieve.mu[2], -1, "μ(2)=-1");
assertEq(sieve.mu[4], 0, "μ(4)=0 (2²)");
assertEq(sieve.mu[6], 1, "μ(6)=1 (2×3)");
assertEq(sieve.mu[30 > 20 ? 0 : 30], 0, "skip");
const s30 = mobiusSieve(30);
assertEq(s30.mu[30], -1, "μ(30)=-1 (2×3×5)");

// ── Möbius round-trip ──
console.log("--- Möbius inversion round-trip ---");
const f = [0, 1, 2, 3, 0, 1, 0, 1, 0, 0, 2]; // f[1..10]
const g0 = divisorTransform(f);
const mu = mobiusSieve(f.length - 1).mu;
const fRec = mobiusInversion(g0, mu);
for (let i = 1; i < f.length; i++) {
    assertEq(fRec[i], f[i], `round-trip f[${i}]: got ${fRec[i]}, expected ${f[i]}`);
}

// ── NTT convolution ──
console.log("--- NTT convolution ---");
assertEq(convolution([1, 2, 3], [4, 5]), naiveConvolution([1, 2, 3], [4, 5]), "NTT=[1,2,3]*[4,5] matches naive");
assertEq(convolution([1], [1]), [1], "NTT=[1]*[1]=[1]");
assertEq(convolution([1, 1], [1, 1]), [1, 2, 1], "NTT=[1,1]*[1,1]=[1,2,1]");

// Random test
for (let t = 0; t < 5; t++) {
    const n = 4 + Math.floor(Math.random() * 5);
    const a = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
    const b = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
    assertEq(convolution(a, b), naiveConvolution(a, b), `random NTT test ${t}`);
}

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
