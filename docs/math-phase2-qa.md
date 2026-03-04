# Math Phase 2 — QA Checklist

## Build Verification
- [ ] `npm run build` completes with zero errors
- [ ] Build logs show separate chunks for `ExpectedValueSimulatorVisualizer`, `InclusionExclusionVisualizer`, and `ModularArithmeticPlaygroundVisualizer`.

## Expected Value Simulator (`/math/linearity-of-expectation` or `/math/indicator-variables`)
- [ ] Visualizer renders correctly in the Learn tab.
- [ ] Scenario toggle: Dice Sum, Coin Flips, Coupon Collector.
- [ ] "Run" button starts the Monte Carlo simulation; Running Mean plot updates in real-time.
- [ ] "+500 Trials" button adds batches manually.
- [ ] Theoretical E[X] displays corrected based on parameters (e.g., n=3 dice -> E[X]=10.5).
- [ ] Error (abs(Empirical - Theoretical)) decreases/converges as trials increase.
- [ ] LOE explanation text at bottom updates per scenario.
- [ ] Reset button clears simulation state.
- [ ] Status line (aria-live) announces trial count and result.

## Inclusion-Exclusion Visualizer (`/math/inclusion-exclusion`)
- [ ] "Formula Mode": Inputting |A|, |B|, |A∩B| updates the union result and step breakdown.
- [ ] "Universe Mode": 30 dots grid renders; clicking dots toggles membership and updates counts.
- [ ] "2 Sets" and "3 Sets" toggles work; membership bits adjust to match.
- [ ] PIE Step-by-Step: "Step" button highlights current term (add/subtract) with color-coded markers (+ is green, - is red).
- [ ] Final union result matches the formula verification.
- [ ] Status line (aria-live) announces each step's action and running total.

## Modular Arithmetic Playground (`/math/modular-arithmetic`)
- [ ] Residue Clock: Displays points around a circle based on modulus m (2-30).
- [ ] Addition Mode: 0, a, 2a... sequence highlights on the clock and in the table.
- [ ] Power Mode: a^k mod m highlights cycle; Fermat's little theorem logic visible in info box.
- [ ] GCD / Inverse Badges: Correctly identifies if inverse exists (gcd=1) and displays the inverse value.
- [ ] Negative Norm: x=-4 mod 7 correctly calculates to 3.
- [ ] Clock Interaction: Clicking a node in the sequence highlights it and its step number.
- [ ] Status line (aria-live) announces current calculation (e.g., "3^2 ≡ 2 mod 7").

## Content Enrichment
- [ ] Linearity of Expectation: Micro-checks (LOE independence, simulation convergence) are answerable and show hints.
- [ ] Indicator Variables: Micro-checks (E[I]=P(A), sum of coins) are present.
- [ ] Inclusion-Exclusion: Micro-checks (PIE signs, basic cardinality) work.
- [ ] Modular Arithmetic: Micro-checks (negative mod, inverse existence, cycles) work.

## Performance & UX
- [ ] Tab switching (Learn -> Practice -> Notes) preserves the "Learn" scroll position/visualizer state.
- [ ] Mobile check: 2D clock and Universe dot grid don't overflow small screens.
- [ ] Dark/Light mode: All math text and visualizer icons are clearly visible.
