# Math Phase 1 — QA Checklist

## Build Verification
- [ ] `npm run build` completes with zero errors
- [ ] `npm run dev` starts successfully

## Existing Pages (must NOT break)
- [ ] `/` — Home page loads correctly
- [ ] `/tutorials` — Tutorial listing loads, all 3 levels visible
- [ ] `/tutorials/sorting-basics` — Topic page with Learn/Training/Notes tabs works
- [ ] `/tutorials/sorting-basics` — Sorting visualizer renders
- [ ] `/problems` — Problems page loads with all categories
- [ ] DSA Notes persist (type note on any DSA topic, navigate away, return)
- [ ] DSA Training/Quiz works on any topic with quizzes

## Math Listing Page (`/math`)
- [ ] All 22 topics render in cards
- [ ] Cards grouped by difficulty: Easy, Medium, Hard
- [ ] Frequency badges show for topics that have them
- [ ] Difficulty badges colored correctly (green/amber/red)
- [ ] Click on any card navigates to `/math/:slug`

## Math Topic Pages (`/math/:slug`)
- [ ] Back button navigates to `/math`
- [ ] Back button has hover animation (brand color fill)
- [ ] Header shows: difficulty badge, frequency badge, title, summary, tags
- [ ] Three tabs visible: Learn | Practice | Notes
- [ ] Default tab is Learn
- [ ] Tab switching has active indicator line

### Learn Tab
- [ ] Pattern Recognition block renders (for topics with `patterns`)
- [ ] Concept paragraphs render
- [ ] Example code renders in code block
- [ ] Bridges section renders (for topics with `bridges`)

### Practice Tab
- [ ] Practice problems list renders with platform badges
- [ ] Problem links open in new tab
- [ ] Difficulty and "Why" text display correctly
- [ ] Micro-checks render (for topics with `microChecks`)
- [ ] Micro-check answers validate correctly
- [ ] Micro-check attempts persist in localStorage

### Notes Tab
- [ ] Cheat Sheet card renders pitfalls + complexity (for topics that have them)
- [ ] Personal Notes textarea renders
- [ ] Auto-save works (type, wait 500ms, see "Saved at...")
- [ ] Notes persist after navigation
- [ ] Math notes use separate localStorage keys from DSA notes

## Visualizers
### Prefix Sum 1D (`/math/prefix-sum-1d`)
- [ ] Build mode: Play animates step-by-step
- [ ] Build mode: Step button advances one step
- [ ] Reset clears all state
- [ ] Speed control works (0.25x through 1x)
- [ ] Query mode: entering L,R and clicking Query shows result
- [ ] Status line updates at each step
- [ ] Status line has `aria-live="polite"`

### Prefix Sum 2D (`/math/prefix-sum-2d`)
- [ ] Input matrix displays correctly (4×4)
- [ ] Prefix matrix displays (5×5)
- [ ] Build animates cell-by-cell
- [ ] Query highlights rectangle in input matrix
- [ ] Inclusion-exclusion formula shown in status

### Difference Array (`/math/difference-array`)
- [ ] Add Update button works
- [ ] Multiple updates can be queued
- [ ] Update history shows color-coded badges
- [ ] Build Final animates prefix sum step-by-step
- [ ] Step button works for single-step build
- [ ] Difference array shows +/- values in color
- [ ] Reset clears everything

## Theme Compatibility
- [ ] Light theme — all math pages readable
- [ ] Dark theme — all math pages readable
- [ ] Other themes (midnight, sunset, dracula, nord) — spot check

## Responsive
- [ ] Math listing page looks correct on mobile (< 640px)
- [ ] Math topic page tabs don't overflow on mobile
- [ ] Visualizer controls wrap on narrow screens
- [ ] 2D grid doesn't overflow container
