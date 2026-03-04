# Phase 3 QA — Elite Math Topics

This document outlines the manual and automated verification steps performed for Phase 3 (Elite CP Math).

## 1. Automated Verification (Math Helpers)
The core logic for Number Theory, Möbius, and NTT is verified via `src/__tests__/mathHelpers.test.js`.
- **Run command:** `node src/__tests__/mathHelpers.test.js`
- **Result:** 31/31 passed.
- **Coverage:** 
  - `modInverse`: Coprime and non-coprime cases.
  - `crtSolve`: Multiple congruences, coprime moduli, non-coprime moduli (merging), and no-solution handling.
  - `mobiusSieve`: Checked μ values for squarefree (1, -1) and non-squarefree (0) numbers up to 30.
  - `mobiusInversion`: Round-trip test (f -> g -> f_recovered) for random arrays.
  - `ntt`: Polynomial convolution vs naive O(N²) implementation for random small polynomials.

## 2. Visualizer Verification (Manual)

### 2.1 Chinese Remainder Theorem (CRT)
- **Navigation:** `/math/chinese-remainder-theorem` -> Tabs: Learn/Practice/Notes.
- **Input:** Test with $x \equiv 2 \pmod 3, x \equiv 3 \pmod 5$. Result should be $x \equiv 8 \pmod{15}$.
- **Edge Case:** Input $x \equiv 1 \pmod 4, x \equiv 0 \pmod 6$. Result should show "No Solution" or error because $gcd(4,6)=2$ and $(0-1)$ is not divisible by 2.
- **Interaction:** Add/Remove equations (up to 4). Observe step-by-step merge logs.

### 2.2 Möbius Function & Inversion
- **Navigation:** `/math/mobius-function-inversion`.
- **Panel A (Explorer):** Toggle through $n=1..200$. Verify factorization matches $\mu(n)$.
- **Panel B (Sandbox):** 
  - Change values in $f(n)$ array.
  - Observe $g(n)$ updating (divisor sum).
  - Observe $f'(n)$ updating (Möbius inversion of $g$).
  - Verify $f'(n) = f(n)$ for all $n$.
- **Heatmap:** Hover/Click on $\mu(n)$ squares (1=Green, -1=Red, 0=Gray).

### 2.3 Polynomial Convolution (NTT)
- **Navigation:** `/math/polynomial-convolution-ntt`.
- **Input:** Multiply $[1, 2]$ and $[3, 4]$. Result should be $[3, 10, 8]$.
- **NTT Process:** Click through stages (Forward NTT A, Forward NTT B, Pointwise Multiply, Inverse NTT).
- **Butterflies:** Hover over butterfly connections to see twiddle factors and values.
- **Comparison:** Ensure NTT result matches the Naive grid result.

## 3. Integration & Performance
- **Lazy Loading:** All three visualizers are separate JS chunks (`CRTVisualizer`, `MobiusInversionVisualizer`, `ConvolutionNTTVisualizer`).
- **Persistence:** Notes and Micro-checks for these topics are saved in `localStorage` under `algosort-math-...`.
- **Build:** `npm run build` succeeds without errors.
- **Responsive:** Visualizers use Flex/Grid layouts to handle smaller screens.

## 4. Content Verification
- [x] Topic slugs match `mathTopics.json`.
- [x] Pattern Recognition blocks added.
- [x] Worked examples with numbers included.
- [x] At least 6 practice problems per topic linked to CF/CSES/AtCoder.
- [x] Complexity analysis (honest feedback on visualizer limits vs algorithm).
