// Script to enrich existing mathTopics.json and add new topics
const fs = require('fs');
const existing = JSON.parse(fs.readFileSync('src/data/mathTopics.json', 'utf8'));

// Enrichments for existing topics (keyed by slug)
const enrichments = {
    "modular-arithmetic": {
        frequency: "very-common",
        prerequisites: [],
        patterns: [
            { ifYouSee: ["large numbers", "answer mod 10^9+7"], think: "Modular arithmetic", why: "Prevents overflow while preserving correctness" },
            { ifYouSee: ["counting problems", "combinatorics"], think: "Mod at every step", why: "Intermediate values can overflow even 64-bit integers" }
        ],
        pitfalls: [
            "Forgetting to mod after subtraction can yield negative values — always add MOD before taking mod",
            "Division requires modular inverse, not regular division",
            "Using int instead of long long causes overflow before mod is applied"
        ],
        complexities: { time: "O(1) per operation", space: "O(1)" },
        problems: [
            { platform: "LeetCode", title: "Pow(x, n)", url: "https://leetcode.com/problems/powx-n/", difficulty: "Medium", why: "Direct application of modular exponentiation" },
            { platform: "Codeforces", title: "Ehab and a Special Coloring", url: "https://codeforces.com/problemset/problem/1174/A", difficulty: "1000", why: "Basic mod properties" },
            { platform: "CSES", title: "Exponentiation", url: "https://cses.fi/problemset/task/1095", why: "Classic modular exponentiation practice" }
        ],
        schemaVersion: 1
    },
    "gcd-lcm": {
        frequency: "very-common",
        prerequisites: ["modular-arithmetic"],
        patterns: [
            { ifYouSee: ["reduce fraction", "common factor"], think: "GCD to simplify", why: "GCD finds the largest shared divisor" },
            { ifYouSee: ["synchronization", "cycle alignment"], think: "LCM", why: "LCM finds when cycles re-align" }
        ],
        pitfalls: [
            "LCM overflow: compute a/gcd(a,b)*b instead of a*b/gcd(a,b)",
            "GCD(0,x) = x, not 0 — handle zero inputs"
        ],
        complexities: { time: "O(log min(a,b))", space: "O(1) iterative, O(log min(a,b)) recursive" },
        problems: [
            { platform: "LeetCode", title: "Greatest Common Divisor of Strings", url: "https://leetcode.com/problems/greatest-common-divisor-of-strings/", difficulty: "Easy", why: "GCD applied to string lengths" },
            { platform: "CSES", title: "Common Divisors", url: "https://cses.fi/problemset/task/1081", why: "Counting divisors with GCD thinking" }
        ],
        schemaVersion: 1
    },
    "prime-factorization": {
        frequency: "very-common",
        prerequisites: [],
        patterns: [
            { ifYouSee: ["count divisors", "number of factors"], think: "Prime factorize then (e1+1)(e2+1)...", why: "Divisor count formula from fundamental theorem" },
            { ifYouSee: ["multiple queries about factors"], think: "Sieve + SPF preprocessing", why: "O(log n) per query after O(n) precomputation" }
        ],
        pitfalls: ["Not checking remainder after loop — miss prime factors > sqrt(n)", "Using trial division for multiple large numbers — use SPF sieve instead"],
        complexities: { time: "O(√n) single, O(n log log n) sieve + O(log n) per query", space: "O(1) single, O(n) sieve" },
        problems: [
            { platform: "LeetCode", title: "Count Primes", url: "https://leetcode.com/problems/count-primes/", difficulty: "Medium", why: "Sieve application" },
            { platform: "CSES", title: "Sum of Divisors", url: "https://cses.fi/problemset/task/1082", why: "Requires understanding prime factorization deeply" }
        ],
        schemaVersion: 1
    },
    "fast-exponentiation": {
        frequency: "very-common",
        prerequisites: ["modular-arithmetic"],
        patterns: [
            { ifYouSee: ["compute a^b mod m", "large exponent"], think: "Binary exponentiation", why: "O(log b) instead of O(b)" },
            { ifYouSee: ["matrix power", "linear recurrence nth term"], think: "Matrix exponentiation (uses fast pow)", why: "Extends binary exp to matrices" }
        ],
        pitfalls: ["Off-by-one in Fermat's inverse: use pow(a, m-2, m) not pow(a, m-1, m)", "Base case: a^0 = 1, not 0"],
        complexities: { time: "O(log b)", space: "O(1) iterative" },
        problems: [
            { platform: "LeetCode", title: "Pow(x, n)", url: "https://leetcode.com/problems/powx-n/", difficulty: "Medium", why: "Direct fast pow implementation" },
            { platform: "CSES", title: "Exponentiation II", url: "https://cses.fi/problemset/task/1712", why: "Nested modular exponentiation" }
        ],
        schemaVersion: 1
    },
    "sieve-of-eratosthenes": {
        frequency: "very-common",
        prerequisites: ["prime-factorization"],
        patterns: [
            { ifYouSee: ["all primes up to N", "prime check for range"], think: "Sieve of Eratosthenes", why: "O(n log log n) bulk prime generation" },
            { ifYouSee: ["factor many numbers", "smallest/largest prime factor"], think: "Linear sieve with SPF", why: "O(n) sieve gives O(log n) factorization" }
        ],
        pitfalls: ["Starting inner loop from 2*p instead of p*p wastes time", "Memory limit for n > 10^7 — use segmented sieve"],
        complexities: { time: "O(n log log n)", space: "O(n)" },
        problems: [
            { platform: "LeetCode", title: "Count Primes", url: "https://leetcode.com/problems/count-primes/", difficulty: "Medium", why: "Classic sieve problem" },
            { platform: "CSES", title: "Counting Divisors", url: "https://cses.fi/problemset/task/1713", why: "SPF sieve for fast factorization" }
        ],
        schemaVersion: 1
    },
    "modular-inverse": {
        frequency: "very-common",
        prerequisites: ["modular-arithmetic", "fast-exponentiation", "gcd-lcm"],
        patterns: [
            { ifYouSee: ["division mod prime", "nCr mod p"], think: "Fermat's little theorem: a^(p-2) mod p", why: "Gives modular inverse when p is prime" },
            { ifYouSee: ["division mod non-prime"], think: "Extended GCD", why: "Works for any coprime modulus" }
        ],
        pitfalls: ["Inverse exists only when gcd(a,m)=1", "Using Fermat's theorem when m is not prime"],
        complexities: { time: "O(log m)", space: "O(1)" },
        problems: [
            { platform: "CSES", title: "Distributing Apples", url: "https://cses.fi/problemset/task/1716", why: "Requires nCr with mod inverse" }
        ],
        schemaVersion: 1
    },
    "ncr-mod-prime": {
        frequency: "very-common",
        prerequisites: ["modular-inverse", "fast-exponentiation"],
        patterns: [
            { ifYouSee: ["choose k from n", "binomial coefficient"], think: "Precompute fact[] and inv_fact[]", why: "O(1) per query after O(n) precomputation" },
            { ifYouSee: ["n up to 10^18, p small prime"], think: "Lucas' theorem", why: "Breaks into base-p digits" }
        ],
        pitfalls: ["nCr where r > n should return 0, not crash", "Precompute size must be >= max n+1"],
        complexities: { time: "O(n) precompute, O(1) per query", space: "O(n)" },
        problems: [
            { platform: "CSES", title: "Binomial Coefficients", url: "https://cses.fi/problemset/task/1079", why: "Direct nCr mod prime" },
            { platform: "LeetCode", title: "Unique Paths", url: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium", why: "Grid paths = nCr" }
        ],
        schemaVersion: 1
    },
    "pigeonhole-principle": {
        frequency: "common",
        prerequisites: [],
        patterns: [
            { ifYouSee: ["n+1 items in n boxes", "must repeat"], think: "Pigeonhole principle", why: "Guarantees at least one collision" },
            { ifYouSee: ["prefix sums mod n"], think: "Two prefix sums share same remainder", why: "n+1 sums, n remainders — pigeonhole" }
        ],
        pitfalls: ["Pigeonhole proves existence but doesn't construct the answer — combine with other techniques"],
        complexities: { time: "Depends on application", space: "Depends on application" },
        problems: [
            { platform: "LeetCode", title: "Find the Duplicate Number", url: "https://leetcode.com/problems/find-the-duplicate-number/", difficulty: "Medium", why: "Classic pigeonhole + cycle detection" }
        ],
        schemaVersion: 1
    },
    "inclusion-exclusion": {
        frequency: "common",
        prerequisites: ["prime-factorization"],
        patterns: [
            { ifYouSee: ["count elements NOT in any set", "union of sets"], think: "Inclusion-exclusion over subsets", why: "Alternating add/subtract avoids double counting" },
            { ifYouSee: ["Euler totient", "coprime count"], think: "IE with prime factors", why: "φ(n) uses inclusion-exclusion on prime divisors" }
        ],
        pitfalls: ["Forgetting the sign alternation — odd subsets add, even subtract", "2^n complexity — only feasible for small n (≤20)"],
        complexities: { time: "O(2^k) for k sets", space: "O(k)" },
        problems: [
            { platform: "CSES", title: "Counting Coprime Pairs", url: "https://cses.fi/problemset/task/2417", why: "IE with prime factors" },
            { platform: "LeetCode", title: "Ugly Number III", url: "https://leetcode.com/problems/ugly-number-iii/", difficulty: "Medium", why: "IE + binary search" }
        ],
        schemaVersion: 1
    },
    "chinese-remainder-theorem": {
        frequency: "rare",
        prerequisites: ["modular-inverse", "gcd-lcm"],
        patterns: [
            { ifYouSee: ["system of congruences", "multiple mod equations"], think: "CRT", why: "Combines separate modular solutions" },
            { ifYouSee: ["compute answer mod different primes then merge"], think: "CRT reconstruction", why: "Split large modulus into coprime factors" }
        ],
        pitfalls: ["Moduli must be pairwise coprime for standard CRT", "Overflow during M_i * y_i computation — use __int128 or Python"],
        complexities: { time: "O(k log max(m_i))", space: "O(k)" },
        problems: [
            { platform: "CSES", title: "Chinese Remainder Theorem", url: "https://cses.fi/dt/task/2174", why: "Direct CRT implementation" }
        ],
        schemaVersion: 1
    },
    "matrix-exponentiation": {
        frequency: "common",
        prerequisites: ["fast-exponentiation"],
        patterns: [
            { ifYouSee: ["linear recurrence", "find nth term in O(log n)"], think: "Matrix exponentiation", why: "Converts recurrence to matrix multiplication" },
            { ifYouSee: ["count paths of length k in graph"], think: "Adjacency matrix ^ k", why: "(A^k)[i][j] = paths of length k from i to j" }
        ],
        pitfalls: ["Matrix dimensions must match recurrence order", "Don't forget modular arithmetic inside matrix multiply"],
        complexities: { time: "O(k³ log n) for k×k matrix", space: "O(k²)" },
        problems: [
            { platform: "CSES", title: "Fibonacci Numbers", url: "https://cses.fi/problemset/task/1722", why: "Classic matrix exp for Fibonacci" },
            { platform: "CSES", title: "Graph Paths I", url: "https://cses.fi/problemset/task/1202", why: "Count paths via matrix power" }
        ],
        schemaVersion: 1
    },
    "probability-expected-value": {
        frequency: "common",
        prerequisites: ["modular-inverse"],
        patterns: [
            { ifYouSee: ["expected number of steps/trials"], think: "Linearity of expectation", why: "E[X+Y] = E[X]+E[Y] even if dependent" },
            { ifYouSee: ["geometric distribution", "keep trying until success"], think: "E = 1/p", why: "Expected trials for probability p" }
        ],
        pitfalls: ["Output probability as fraction mod prime: numerator * inverse(denominator)", "Don't confuse P(A∪B) with P(A)+P(B) when not disjoint"],
        complexities: { time: "Depends on application", space: "Depends on application" },
        problems: [
            { platform: "Codeforces", title: "Vasya and Magic Matrix", url: "https://codeforces.com/problemset/problem/1042/E", difficulty: "1900", why: "Expected value with sorting" }
        ],
        schemaVersion: 1
    }
};

// Apply enrichments
existing.forEach(topic => {
    if (enrichments[topic.slug]) {
        Object.assign(topic, enrichments[topic.slug]);
    }
});

// New topics
const newTopics = [
    {
        slug: "prefix-sum-1d",
        title: "Prefix Sum (1D)",
        difficulty: "Easy",
        summary: "Answer range sum queries in O(1) after O(n) preprocessing — the most fundamental technique in competitive programming.",
        tags: ["arrays", "prefix-sum", "range-query"],
        content: [
            "A prefix sum array stores cumulative sums: prefix[i] = arr[0] + arr[1] + ... + arr[i-1]. We set prefix[0] = 0.",
            "Building the prefix array takes O(n): prefix[i] = prefix[i-1] + arr[i-1].",
            "Range sum query arr[l..r] = prefix[r+1] - prefix[l]. This is O(1) per query after O(n) preprocessing.",
            "Prefix sums convert range problems into point problems — a very powerful reduction.",
            "The technique generalizes: prefix XOR for XOR queries, prefix product for product queries (with care for zeros).",
            "2D extension: preprocess a matrix for O(1) sub-rectangle sum queries using inclusion-exclusion.",
            "Difference array is the inverse: it converts range updates into point updates, then prefix sum recovers the array."
        ],
        example: {
            language: "python",
            code: "def build_prefix(arr):\n    prefix = [0]\n    for x in arr:\n        prefix.append(prefix[-1] + x)\n    return prefix\n\ndef query(prefix, l, r):\n    \"\"\"Sum of arr[l..r] inclusive\"\"\"\n    return prefix[r + 1] - prefix[l]\n\narr = [3, 1, 4, 1, 5, 9, 2, 6]\nprefix = build_prefix(arr)\nprint(f\"Sum [2..5] = {query(prefix, 2, 5)}\")  # 4+1+5+9 = 19\nprint(f\"Sum [0..7] = {query(prefix, 0, 7)}\")  # 31"
        },
        frequency: "very-common",
        prerequisites: [],
        patterns: [
            { ifYouSee: ["range sum query", "subarray sum"], think: "Prefix sum array", why: "O(1) per query after O(n) build" },
            { ifYouSee: ["count subarrays with sum = k"], think: "Prefix sum + hashmap", why: "prefix[j] - prefix[i] = k means subarray [i..j-1] sums to k" },
            { ifYouSee: ["equilibrium index", "left sum = right sum"], think: "Prefix sum from both ends", why: "Compare prefix[i] with total - prefix[i+1]" }
        ],
        pitfalls: [
            "Off-by-one: prefix has n+1 elements, query is prefix[r+1] - prefix[l], not prefix[r] - prefix[l-1]",
            "Integer overflow for large arrays — use long long / BigInt",
            "Prefix sum is static — if array changes, use BIT or segment tree"
        ],
        complexities: { time: "O(n) build, O(1) query", space: "O(n)", note: "Cannot handle updates efficiently; use BIT/segment tree for dynamic" },
        bridges: [
            { to: "Arrays", example: "Subarray sum problems on LeetCode", link: "/tutorials/array-sliding-window" },
            { to: "DP", example: "Many DP optimizations use prefix sums", link: "/tutorials/dp-1d-sequence" }
        ],
        problems: [
            { platform: "LeetCode", title: "Range Sum Query - Immutable", url: "https://leetcode.com/problems/range-sum-query-immutable/", difficulty: "Easy", why: "Direct prefix sum implementation" },
            { platform: "LeetCode", title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "Medium", why: "Prefix sum + hashmap pattern" },
            { platform: "LeetCode", title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", why: "Prefix and suffix products" },
            { platform: "CSES", title: "Static Range Sum Queries", url: "https://cses.fi/problemset/task/1646", why: "Classic prefix sum" },
            { platform: "Codeforces", title: "Greg and Array", url: "https://codeforces.com/problemset/problem/295/A", difficulty: "1400", why: "Prefix sum + difference array combo" },
            { platform: "LeetCode", title: "Continuous Subarray Sum", url: "https://leetcode.com/problems/continuous-subarray-sum/", difficulty: "Medium", why: "Prefix sum mod k + hashmap" }
        ],
        visualizers: [{ key: "prefix-1d", enabled: true }],
        microChecks: [
            { question: "Given arr = [2, 4, 6], what is prefix[3]?", answer: "12", hint: "prefix[3] = 2+4+6" },
            { question: "With prefix = [0, 2, 6, 12], what is sum(arr[1..2])?", answer: "10", hint: "prefix[3] - prefix[1] = 12 - 2" },
            { question: "What is the time complexity of a single range sum query using prefix sums?", answer: "O(1)", hint: "Just one subtraction" }
        ],
        schemaVersion: 1
    },
    {
        slug: "prefix-sum-2d",
        title: "Prefix Sum (2D)",
        difficulty: "Medium",
        summary: "Answer sub-rectangle sum queries in O(1) on a 2D matrix using inclusion-exclusion.",
        tags: ["arrays", "prefix-sum", "2d", "matrix"],
        content: [
            "2D prefix sum extends the 1D idea to matrices: P[i][j] stores the sum of all elements in the sub-rectangle from (0,0) to (i-1,j-1).",
            "Build formula: P[i][j] = M[i-1][j-1] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]. The subtraction avoids double-counting.",
            "Query formula (sum of rectangle (r1,c1) to (r2,c2)): P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1].",
            "This is the inclusion-exclusion principle applied to rectangles: add the whole, subtract two overlapping strips, add back the doubly-subtracted corner.",
            "Build takes O(rows × cols). Each query is O(1). The prefix matrix has dimensions (rows+1) × (cols+1) with zero-padded borders.",
            "Applications: image processing (integral images), 2D range queries in contest problems, maximum sum sub-rectangle."
        ],
        example: {
            language: "python",
            code: "def build_2d_prefix(matrix):\n    rows, cols = len(matrix), len(matrix[0])\n    P = [[0]*(cols+1) for _ in range(rows+1)]\n    for i in range(1, rows+1):\n        for j in range(1, cols+1):\n            P[i][j] = matrix[i-1][j-1] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]\n    return P\n\ndef query_2d(P, r1, c1, r2, c2):\n    return P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]\n\nmatrix = [[1,2,3],[4,5,6],[7,8,9]]\nP = build_2d_prefix(matrix)\nprint(f\"Sum (1,1)→(2,2) = {query_2d(P, 1, 1, 2, 2)}\")  # 5+6+8+9 = 28"
        },
        frequency: "common",
        prerequisites: ["prefix-sum-1d"],
        patterns: [
            { ifYouSee: ["2D grid", "rectangle sum query"], think: "2D prefix sum", why: "O(1) per query after O(n*m) build" },
            { ifYouSee: ["maximum sum sub-rectangle"], think: "2D prefix sum + Kadane's variant", why: "Fix two rows, reduce to 1D max subarray" }
        ],
        pitfalls: [
            "Inclusion-exclusion signs: it's +P -P -P +P, not all plus",
            "Off-by-one with 1-indexed vs 0-indexed coordinates — be consistent",
            "Memory: (n+1)*(m+1) matrix can be large for n,m ~ 10^4"
        ],
        complexities: { time: "O(n*m) build, O(1) query", space: "O(n*m)" },
        problems: [
            { platform: "LeetCode", title: "Range Sum Query 2D - Immutable", url: "https://leetcode.com/problems/range-sum-query-2d-immutable/", difficulty: "Medium", why: "Direct 2D prefix sum" },
            { platform: "LeetCode", title: "Maximal Square", url: "https://leetcode.com/problems/maximal-square/", difficulty: "Medium", why: "2D prefix sum variant with DP" },
            { platform: "CSES", title: "Forest Queries", url: "https://cses.fi/problemset/task/1652", why: "Classic 2D prefix sum on grid" }
        ],
        visualizers: [{ key: "prefix-2d", enabled: true }],
        microChecks: [
            { question: "In the 2D prefix query formula, how many terms are there?", answer: "4", hint: "Inclusion-exclusion: +1 -1 -1 +1" },
            { question: "What is the size of the prefix matrix for a 3×4 input?", answer: "4x5", hint: "Add 1 to each dimension for zero padding" }
        ],
        schemaVersion: 1
    },
    {
        slug: "difference-array",
        title: "Difference Array / Imos Method",
        difficulty: "Easy",
        summary: "Apply multiple range updates in O(1) each, then build the final array in O(n) — the inverse of prefix sum.",
        tags: ["arrays", "difference-array", "range-update", "imos"],
        content: [
            "A difference array is the inverse of prefix sum: it converts range updates into point updates.",
            "To add val to all elements in range [l, r]: diff[l] += val and diff[r+1] -= val. Each update is O(1).",
            "After all updates, compute the prefix sum of the difference array to get the final array. This takes O(n).",
            "Total complexity: O(q) for q updates + O(n) to build = O(q + n), vs O(q × n) for naive range updates.",
            "Also known as the 'Imos Method' in Japanese competitive programming — named after contest author imos.",
            "Extends to 2D: for rectangle updates on a grid, use a 2D difference array with 4 point operations per update.",
            "Key insight: prefix sum and difference array are inverse operations. Prefix sum of diff array = original. Diff of prefix = original."
        ],
        example: {
            language: "python",
            code: "def range_update(n, updates):\n    \"\"\"Apply multiple [l, r, val] updates efficiently\"\"\"\n    diff = [0] * (n + 1)\n    for l, r, val in updates:\n        diff[l] += val\n        if r + 1 <= n:\n            diff[r + 1] -= val\n    \n    # Build final array via prefix sum\n    result = []\n    running = 0\n    for i in range(n):\n        running += diff[i]\n        result.append(running)\n    return result\n\n# Example: array of size 8, three range updates\nupdates = [(1, 4, 3), (2, 6, 2), (0, 3, 1)]\nresult = range_update(8, updates)\nprint(f\"Final array: {result}\")  # [1, 4, 6, 6, 5, 2, 2, 0]"
        },
        frequency: "very-common",
        prerequisites: ["prefix-sum-1d"],
        patterns: [
            { ifYouSee: ["multiple range add/increment updates"], think: "Difference array", why: "O(1) per update instead of O(n)" },
            { ifYouSee: ["event scheduling", "overlapping intervals count"], think: "Sweep line with difference array", why: "Mark start +1 end -1, prefix sum gives count at each point" },
            { ifYouSee: ["2D range update on grid"], think: "2D difference array (4 operations per update)", why: "Extends 1D idea to rectangles" }
        ],
        pitfalls: [
            "Off-by-one: diff[r+1] -= val, not diff[r] -= val",
            "Array bounds: check r+1 < n before accessing diff[r+1]",
            "Difference array is one-shot — after building, you need to re-initialize for new updates"
        ],
        complexities: { time: "O(1) per update, O(n) build", space: "O(n)", note: "Cannot query before building; for online queries use BIT with range update" },
        bridges: [
            { to: "Arrays", example: "Sweep line problems", link: "/tutorials/array-two-pointer" }
        ],
        problems: [
            { platform: "LeetCode", title: "Corporate Flight Bookings", url: "https://leetcode.com/problems/corporate-flight-bookings/", difficulty: "Medium", why: "Direct difference array application" },
            { platform: "LeetCode", title: "Car Pooling", url: "https://leetcode.com/problems/car-pooling/", difficulty: "Medium", why: "Sweep line with difference array" },
            { platform: "Codeforces", title: "Greg and Array", url: "https://codeforces.com/problemset/problem/295/A", difficulty: "1400", why: "Nested difference arrays" },
            { platform: "CSES", title: "Range Update Queries", url: "https://cses.fi/problemset/task/1651", why: "Range update + point query" },
            { platform: "LeetCode", title: "Range Addition", url: "https://leetcode.com/problems/range-addition/", difficulty: "Medium", why: "Textbook difference array" }
        ],
        visualizers: [{ key: "diff-array", enabled: true }],
        microChecks: [
            { question: "To add 5 to range [2,6], what operations do we perform on diff[]?", answer: "diff[2]+=5, diff[7]-=5", hint: "diff[l]+=val, diff[r+1]-=val" },
            { question: "What is the relationship between prefix sum and difference array?", answer: "inverse", hint: "They are inverse operations of each other" }
        ],
        schemaVersion: 1
    },
    {
        slug: "catalan-numbers",
        title: "Catalan Numbers",
        difficulty: "Medium",
        summary: "C(n) counts valid parenthesizations, BST shapes, non-crossing partitions, and many more combinatorial structures.",
        tags: ["combinatorics", "catalan", "counting"],
        content: [
            "The nth Catalan number C(n) = C(2n, n) / (n+1) = (2n)! / ((n+1)! × n!). First few values: 1, 1, 2, 5, 14, 42, 132.",
            "Recurrence: C(n) = Σ C(i) × C(n-1-i) for i = 0 to n-1. This mirrors the structure of many divide-and-split problems.",
            "C(n) counts: valid parenthesizations of n pairs, number of BSTs with n nodes, triangulations of (n+2)-gon, monotonic lattice paths that don't cross the diagonal.",
            "The ballot problem: C(n) = C(2n, n) - C(2n, n+1). This is the reflection principle.",
            "Generating function: C(x) = (1 - √(1-4x)) / (2x). Asymptotically C(n) ~ 4^n / (n^(3/2) × √π).",
            "Computation: Use nCr(2n, n) * modular_inverse(n+1) for modular Catalan numbers."
        ],
        example: {
            language: "python",
            code: "MOD = 10**9 + 7\n\ndef catalan(n):\n    \"\"\"Compute nth Catalan number mod MOD\"\"\"\n    if n <= 1:\n        return 1\n    # C(n) = C(2n, n) / (n+1)\n    num = 1\n    den = 1\n    for i in range(n):\n        num = num * (2*n - i) % MOD\n        den = den * (i + 1) % MOD\n    return num * pow(den, MOD - 2, MOD) % MOD * pow(n + 1, MOD - 2, MOD) % MOD\n\nfor i in range(10):\n    print(f\"C({i}) = {catalan(i)}\")\n# 1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862"
        },
        frequency: "common",
        prerequisites: ["ncr-mod-prime", "modular-inverse"],
        patterns: [
            { ifYouSee: ["count valid parentheses sequences", "Dyck paths"], think: "Catalan number", why: "C(n) counts n-pair valid parenthesizations" },
            { ifYouSee: ["count BSTs with n keys", "triangulations"], think: "Catalan number", why: "Both are counted by C(n)" },
            { ifYouSee: ["non-crossing partitions", "ballot sequences"], think: "Catalan / reflection principle", why: "Catalan appears in many non-crossing counting problems" }
        ],
        pitfalls: ["Don't use the recurrence for large n — it's O(n²). Use the closed form with nCr.", "Remember C(0) = 1, not 0"],
        complexities: { time: "O(n) with precomputed factorials", space: "O(n)" },
        problems: [
            { platform: "LeetCode", title: "Unique Binary Search Trees", url: "https://leetcode.com/problems/unique-binary-search-trees/", difficulty: "Medium", why: "Directly counts BSTs = Catalan" },
            { platform: "LeetCode", title: "Generate Parentheses", url: "https://leetcode.com/problems/generate-parentheses/", difficulty: "Medium", why: "Enumerate Catalan-counted sequences" },
            { platform: "CSES", title: "Bracket Sequences I", url: "https://cses.fi/problemset/task/2064", why: "Count valid bracket sequences" }
        ],
        schemaVersion: 1
    },
    {
        slug: "stars-and-bars",
        title: "Stars and Bars",
        difficulty: "Medium",
        summary: "Count ways to distribute n identical items into k distinct bins — fundamental combinatorics technique.",
        tags: ["combinatorics", "counting", "distribution"],
        content: [
            "Stars and Bars answers: how many ways to put n identical balls into k distinct boxes? Answer: C(n+k-1, k-1).",
            "Visualization: n stars (items) and k-1 bars (dividers). Arrange them in a row. Stars between consecutive bars go to that box.",
            "With minimum constraints (each box ≥ 1): C(n-1, k-1). First place 1 in each box, then distribute remaining n-k.",
            "With upper bounds: use inclusion-exclusion. Subtract cases where any box exceeds its limit.",
            "Equivalently counts: solutions to x₁ + x₂ + ... + xₖ = n where xᵢ ≥ 0.",
            "This is one of the most frequently used formulas in competitive programming."
        ],
        example: {
            language: "python",
            code: "MOD = 10**9 + 7\nMAX = 200001\nfact = [1] * MAX\nfor i in range(1, MAX): fact[i] = fact[i-1] * i % MOD\ninv_fact = [1] * MAX\ninv_fact[MAX-1] = pow(fact[MAX-1], MOD-2, MOD)\nfor i in range(MAX-2, -1, -1): inv_fact[i] = inv_fact[i+1] * (i+1) % MOD\n\ndef nCr(n, r):\n    if r < 0 or r > n: return 0\n    return fact[n] * inv_fact[r] % MOD * inv_fact[n-r] % MOD\n\ndef stars_and_bars(n, k):\n    \"\"\"Ways to put n identical items into k distinct bins\"\"\"\n    return nCr(n + k - 1, k - 1)\n\nprint(f\"5 balls into 3 boxes: {stars_and_bars(5, 3)}\")  # C(7,2) = 21"
        },
        frequency: "very-common",
        prerequisites: ["ncr-mod-prime"],
        patterns: [
            { ifYouSee: ["distribute identical items", "x1+x2+...+xk = n"], think: "Stars and Bars: C(n+k-1, k-1)", why: "Counts non-negative integer solutions" },
            { ifYouSee: ["at least 1 per bin"], think: "C(n-1, k-1)", why: "Place 1 in each first, distribute rest" }
        ],
        pitfalls: ["Items must be identical — if distinct, use permutations instead", "Upper bound constraints require inclusion-exclusion on top"],
        complexities: { time: "O(1) with precomputed factorials", space: "O(n)" },
        problems: [
            { platform: "CSES", title: "Distributing Apples", url: "https://cses.fi/problemset/task/1716", why: "Direct stars and bars" },
            { platform: "Codeforces", title: "Ball Painting", url: "https://codeforces.com/problemset/problem/1031/E", difficulty: "2100", why: "Stars and bars with constraints" }
        ],
        schemaVersion: 1
    },
    {
        slug: "derangements",
        title: "Derangements",
        difficulty: "Medium",
        summary: "Count permutations where no element is in its original position. D(n) = (n-1)(D(n-1) + D(n-2)).",
        tags: ["combinatorics", "permutations", "derangement"],
        content: [
            "A derangement is a permutation where no element appears in its original position. D(n) counts derangements of n elements.",
            "Recurrence: D(n) = (n-1) × (D(n-1) + D(n-2)), with D(0) = 1, D(1) = 0.",
            "Closed form: D(n) = n! × Σ(-1)^k / k! for k = 0 to n. This is inclusion-exclusion on fixed points.",
            "Approximation: D(n) ≈ n!/e. The probability of a random permutation being a derangement approaches 1/e ≈ 0.3679.",
            "Formula: D(n) = floor(n!/e + 0.5) for exact computation (using floating point).",
            "Common in problems about gift exchanges, hat problems, and secret Santa scenarios."
        ],
        example: {
            language: "python",
            code: "MOD = 10**9 + 7\n\ndef derangements(n):\n    \"\"\"Count derangements of n elements mod MOD\"\"\"\n    if n == 0: return 1\n    if n == 1: return 0\n    dp = [0] * (n + 1)\n    dp[0] = 1\n    dp[1] = 0\n    for i in range(2, n + 1):\n        dp[i] = (i - 1) * (dp[i-1] + dp[i-2]) % MOD\n    return dp[n]\n\nfor i in range(8):\n    print(f\"D({i}) = {derangements(i)}\")\n# 1, 0, 1, 2, 9, 44, 265, 1854"
        },
        frequency: "common",
        prerequisites: ["ncr-mod-prime", "inclusion-exclusion"],
        patterns: [
            { ifYouSee: ["no element in original position", "complete rearrangement"], think: "Derangement count D(n)", why: "D(n) counts exactly these permutations" },
            { ifYouSee: ["exactly k elements stay fixed"], think: "C(n,k) × D(n-k)", why: "Choose which k stay, derange the rest" }
        ],
        pitfalls: ["D(0) = 1 (empty permutation is a derangement) — don't return 0", "For 'exactly k fixed points' problems, multiply C(n,k) by D(n-k)"],
        complexities: { time: "O(n)", space: "O(n), or O(1) with rolling variables" },
        problems: [
            { platform: "LeetCode", title: "Find the Derangement of An Array", url: "https://leetcode.com/problems/find-the-derangement-of-an-array/", difficulty: "Medium", why: "Direct derangement computation" },
            { platform: "CSES", title: "Christmas Party", url: "https://cses.fi/problemset/task/1717", why: "Classic derangement problem" }
        ],
        schemaVersion: 1
    },
    {
        slug: "submask-iteration",
        title: "Submask Iteration",
        difficulty: "Medium",
        summary: "Efficiently iterate over all submasks of a given bitmask in O(3^n) total across all masks.",
        tags: ["bitmask", "enumeration", "subset"],
        content: [
            "Given a bitmask m, we can iterate all submasks s of m (s ⊆ m) using: for s = m; s > 0; s = (s-1) & m.",
            "This generates all subsets of the set bits in m, in decreasing order. Don't forget to handle s = 0 separately.",
            "Total iterations across all masks 0..2^n - 1 is 3^n (not 4^n), because each bit is in one of 3 states: not in m, in m but not in s, in m and in s.",
            "This is the foundation of 'Sum over Subsets' (SOS) DP, a key technique for bitmask problems.",
            "Common use: when you need dp[mask] that depends on dp[submask] for all submasks of mask.",
            "The Zeta/Mobius transform over subsets is a related O(n × 2^n) technique for computing subset sums."
        ],
        example: {
            language: "python",
            code: "def iterate_submasks(mask):\n    \"\"\"Yield all submasks of mask (including mask itself, excluding 0)\"\"\"\n    s = mask\n    while s > 0:\n        yield s\n        s = (s - 1) & mask\n\n# Example: submasks of 0b1101 (13)\nmask = 0b1101  # {0, 2, 3}\nprint(f\"Submasks of {bin(mask)}:\")\nfor s in iterate_submasks(mask):\n    print(f\"  {bin(s)} = {s}\")\n# 1101, 1100, 1001, 1000, 0101, 0100, 0001\n\n# Total submasks = 2^(popcount(mask)) = 2^3 = 8 (including 0)"
        },
        frequency: "common",
        prerequisites: [],
        patterns: [
            { ifYouSee: ["DP over subsets where dp[mask] uses dp[submask]"], think: "Submask iteration", why: "Enumerate all submasks of each mask" },
            { ifYouSee: ["partition mask into two complementary submasks"], think: "Iterate submasks, complement is mask ^ submask", why: "Covers all ways to split a set into two parts" }
        ],
        pitfalls: ["Must handle submask = 0 separately — the loop for(s=m; s>0; s=(s-1)&m) skips 0", "Complexity is O(3^n) total, NOT O(4^n) — this matters for feasibility analysis"],
        complexities: { time: "O(3^n) total across all masks", space: "O(2^n) for DP table" },
        bridges: [
            { to: "DP", example: "Bitmask DP with subset dependencies", link: "/tutorials/bitmask-dp" }
        ],
        problems: [
            { platform: "Codeforces", title: "Compatible Numbers", url: "https://codeforces.com/problemset/problem/165/E", difficulty: "2200", why: "SOS DP using submask ideas" },
            { platform: "CSES", title: "Hamiltonian Flights", url: "https://cses.fi/problemset/task/1690", why: "Bitmask DP using submask iteration" }
        ],
        schemaVersion: 1
    },
    {
        slug: "subset-dp-identities",
        title: "Subset DP Identities",
        difficulty: "Hard",
        summary: "Key identities for Sum over Subsets (SOS) DP, Zeta/Möbius transforms on bitmasks.",
        tags: ["bitmask", "dp", "sos", "zeta-transform"],
        content: [
            "SOS DP computes for each mask: f[mask] = Σ a[sub] for all sub ⊆ mask. Naive is O(3^n), SOS DP does it in O(n × 2^n).",
            "SOS DP iterates over each bit position: for i in range(n): for mask in range(2^n): if mask has bit i: f[mask] += f[mask ^ (1<<i)].",
            "This is the Zeta transform (superset sum). The Möbius transform (inverse) uses subtraction instead of addition.",
            "Application: given a[mask], compute 'how many masks x are submasks of mask with a[x] > 0' for all masks simultaneously.",
            "Subset convolution: combine two functions over subsets respecting cardinality. Requires ranked Zeta transforms.",
            "These transforms are the bitmask analogue of prefix sums — just in higher dimensions."
        ],
        example: {
            language: "python",
            code: "def sos_dp(a, n):\n    \"\"\"Sum over subsets: f[mask] = sum of a[sub] for all sub ⊆ mask\"\"\"\n    f = a[:]\n    for i in range(n):\n        for mask in range(1 << n):\n            if mask & (1 << i):\n                f[mask] += f[mask ^ (1 << i)]\n    return f\n\n# Example: n=3, a[mask] = popcount(mask)\nn = 3\na = [bin(m).count('1') for m in range(1 << n)]\nf = sos_dp(a, n)\nprint(f\"a = {a}\")\nprint(f\"SOS = {f}\")\n# a    = [0, 1, 1, 2, 1, 2, 2, 3]\n# SOS  = [0, 1, 1, 4, 1, 4, 4, 12]"
        },
        frequency: "rare",
        prerequisites: ["submask-iteration"],
        patterns: [
            { ifYouSee: ["sum/count over all submasks for every mask"], think: "SOS DP / Zeta transform", why: "O(n × 2^n) instead of O(3^n)" },
            { ifYouSee: ["AND convolution", "number of pairs with x AND y = 0"], think: "SOS DP on complement", why: "Count submasks of complement" }
        ],
        pitfalls: ["Direction matters: superset sum vs subset sum require different loop orders", "Möbius inversion subtracts — don't add"],
        complexities: { time: "O(n × 2^n)", space: "O(2^n)" },
        problems: [
            { platform: "Codeforces", title: "Compatible Numbers", url: "https://codeforces.com/problemset/problem/165/E", difficulty: "2200", why: "Classic SOS DP" },
            { platform: "Codeforces", title: "Vowels", url: "https://codeforces.com/problemset/problem/383/E", difficulty: "2600", why: "SOS DP application" }
        ],
        schemaVersion: 1
    },
    {
        slug: "linearity-of-expectation",
        title: "Linearity of Expectation",
        difficulty: "Medium",
        summary: "E[X+Y] = E[X] + E[Y] — even when X and Y are dependent. The most powerful tool in probabilistic analysis.",
        tags: ["probability", "expected-value", "linearity"],
        content: [
            "Linearity of Expectation: E[X₁ + X₂ + ... + Xₙ] = E[X₁] + E[X₂] + ... + E[Xₙ]. Works ALWAYS, even for dependent variables.",
            "Strategy: decompose a complex random variable into simple indicator variables, compute each E[Xᵢ] independently, then sum.",
            "Indicator variable Xᵢ ∈ {0, 1}: E[Xᵢ] = P(Xᵢ = 1). This simplifies calculation enormously.",
            "Example: expected inversions in random permutation = Σ P(a[i] > a[j]) for all i < j. Each pair contributes 1/2. Total = n(n-1)/4.",
            "Coupon collector: expected time to collect all n types = n × H_n = n × (1 + 1/2 + ... + 1/n) ≈ n ln n.",
            "This technique lets you avoid computing full probability distributions — just sum individual expectations."
        ],
        example: {
            language: "python",
            code: "MOD = 10**9 + 7\n\ndef mod_inv(a, m=MOD):\n    return pow(a, m - 2, m)\n\ndef expected_inversions(n):\n    \"\"\"Expected inversions in random permutation of n\"\"\"\n    # Each pair (i,j) has prob 1/2 of being inverted\n    # Total pairs = n*(n-1)/2, expected = n*(n-1)/4\n    return n * (n - 1) % MOD * mod_inv(4) % MOD\n\ndef coupon_collector(n):\n    \"\"\"Expected trials to collect all n types\"\"\"\n    # E = n * (1/1 + 1/2 + ... + 1/n)\n    result = 0\n    for i in range(1, n + 1):\n        result = (result + n * mod_inv(i)) % MOD\n    return result\n\nprint(f\"Expected inversions (n=10): {expected_inversions(10)}\")\nprint(f\"Coupon collector (n=5): {coupon_collector(5)}\")"
        },
        frequency: "common",
        prerequisites: ["probability-expected-value", "modular-inverse"],
        patterns: [
            { ifYouSee: ["compute expected value of sum/count"], think: "Linearity of expectation", why: "Break into indicator variables, sum E[each]" },
            { ifYouSee: ["expected inversions", "expected distance"], think: "Pair contribution technique", why: "Each pair contributes independently to expectation" }
        ],
        pitfalls: ["LOE does NOT work for E[X × Y] — that requires independence", "Don't forget to output as fraction mod prime: numerator × denominator⁻¹"],
        complexities: { time: "Depends on decomposition", space: "Depends on application" },
        problems: [
            { platform: "Codeforces", title: "Vasya and Magic Matrix", url: "https://codeforces.com/problemset/problem/1042/E", difficulty: "1900", why: "LOE with sorting" },
            { platform: "AtCoder", title: "Dice Product", url: "https://atcoder.jp/contests/abc266/tasks/abc266_e", difficulty: "Medium", why: "Expected value with independence" }
        ],
        schemaVersion: 1
    },
    {
        slug: "indicator-variables",
        title: "Indicator Variables",
        difficulty: "Medium",
        summary: "Model events as 0/1 variables where E[X] = P(X=1) — the building block for linearity of expectation.",
        tags: ["probability", "expected-value", "indicator"],
        content: [
            "An indicator variable I_A for event A: I_A = 1 if A occurs, 0 otherwise. Then E[I_A] = P(A).",
            "Power: decompose count of events as X = Σ I_Aᵢ. Then E[X] = Σ P(Aᵢ) by linearity.",
            "Example: expected heads in n fair coin flips = Σ P(flip i is heads) = n × 0.5.",
            "Example: expected number of fixed points in random permutation = Σ P(σ(i)=i) = n × 1/n = 1.",
            "For variance: Var(X) = E[X²] - E[X]². For indicators: E[Xᵢ²] = E[Xᵢ] = P(Aᵢ) since 0² = 0, 1² = 1.",
            "Covariance of indicators: Cov(I_A, I_B) = P(A∩B) - P(A)P(B). Needed for variance calculations."
        ],
        example: {
            language: "python",
            code: "def expected_fixed_points(n):\n    \"\"\"Expected fixed points in random permutation of [1..n]\"\"\"\n    # Each element has 1/n chance of being fixed\n    # By LOE: E = n * (1/n) = 1\n    return 1  # Always 1, regardless of n!\n\ndef expected_records(n):\n    \"\"\"Expected number of left-to-right maxima in random permutation\"\"\"\n    # Element i is a record iff it's max of first i elements: prob = 1/i\n    # E = 1/1 + 1/2 + ... + 1/n = H_n\n    return sum(1/i for i in range(1, n+1))\n\nfor n in [5, 10, 100]:\n    print(f\"n={n}: fixed_pts=1, records≈{expected_records(n):.2f}\")\n# n=5: fixed_pts=1, records≈2.28\n# n=10: fixed_pts=1, records≈2.93\n# n=100: fixed_pts=1, records≈5.19"
        },
        frequency: "common",
        prerequisites: ["linearity-of-expectation"],
        patterns: [
            { ifYouSee: ["count of events happening", "how many satisfy condition"], think: "Indicator variables + LOE", why: "E[count] = sum of probabilities of each event" },
            { ifYouSee: ["expected number of elements with property"], think: "Sum P(element i has property)", why: "Each element is an independent indicator" }
        ],
        pitfalls: ["Indicators simplify E[X] but not P(X = k) — for distributions you need more work", "Independence is NOT required for LOE, but IS required for Var(X) = Σ Var(Xᵢ)"],
        complexities: { time: "O(n) for n indicators", space: "O(1)" },
        problems: [
            { platform: "Codeforces", title: "Random Events", url: "https://codeforces.com/problemset/problem/1461/D", difficulty: "1500", why: "Probability analysis with indicators" },
            { platform: "AtCoder", title: "Sum of f(A)", url: "https://atcoder.jp/contests/abc162/tasks/abc162_e", difficulty: "Medium", why: "Indicator variable decomposition" }
        ],
        schemaVersion: 1
    }
];

const final = [...existing, ...newTopics];
fs.writeFileSync('src/data/mathTopics.json', JSON.stringify(final, null, 2));
console.log(`Done! Total topics: ${final.length}`);
console.log(`Slugs: ${final.map(t => t.slug).join(', ')}`);
