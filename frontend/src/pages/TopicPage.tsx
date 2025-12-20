import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import topics from "../data/topics.json";
import leetcode from "../data/leetcodeProblems.json";
import quizzes from "../data/quizzes.json";
import Quiz from "../components/Quiz";
import SortingVisualizer from "../components/SortingVisualizer";
import QueueVisualizer from "../components/QueueVisualizer";
import HeapVisualizer from "../components/HeapVisualizer";
import SelectionSortVisualizer from "../components/SelectionSortVisualizer";
import InsertionSortVisualizer from "../components/InsertionSortVisualizer";
import MergeSortVisualizer from "../components/MergeSortVisualizer";
import QuickSortVisualizer from "../components/QuickSortVisualizer";
import StackVisualizer from "../components/StackVisualizer";
import LinkedListVisualizer from "../components/LinkedListVisualizer";
import HashMapVisualizer from "../components/HashMapVisualizer";
import MaxHeapVisualizer from "../components/MaxHeapVisualizer";
import TwoPointerVisualizer from "../components/TwoPointerVisualizer";
import SlidingWindowVisualizer from "../components/SlidingWindowVisualizer";
import BinaryTreeVisualizer from "../components/BinaryTreeVisualizer";
import TreeTraversalVisualizer from "../components/TreeTraversalVisualizer";
import BSTVisualizer from "../components/BSTVisualizer";
import LevelOrderVisualizer from "../components/LevelOrderVisualizer";
import TreePropertiesVisualizer from "../components/TreePropertiesVisualizer";
import GraphRepresentationVisualizer from "../components/GraphRepresentationVisualizer";
import GraphDFSVisualizer from "../components/GraphDFSVisualizer";
import GraphBFSVisualizer from "../components/GraphBFSVisualizer";
import DijkstraVisualizer from "../components/DijkstraVisualizer";
import TopologicalSortVisualizer from "../components/TopologicalSortVisualizer";
import DPIntroVisualizer from "../components/DPIntroVisualizer";
import DP1DSequenceVisualizer from "../components/DP1DSequenceVisualizer";
import DPKnapsackVisualizer from "../components/DPKnapsackVisualizer";
import DPStringsVisualizer from "../components/DPStringsVisualizer";
import BinarySearchBasicsVisualizer from "../components/BinarySearchBasicsVisualizer";
import BinarySearchAdvancedVisualizer from "../components/BinarySearchAdvancedVisualizer";
import GreedyAlgorithmsVisualizer from "../components/GreedyAlgorithmsVisualizer";
import BacktrackingBasicsVisualizer from "../components/BacktrackingBasicsVisualizer";
import BitManipulationBasicsVisualizer from "../components/BitManipulationBasicsVisualizer";
import TrieVisualizer from "../components/TrieVisualizer";
import UnionFindVisualizer from "../components/UnionFindVisualizer";
import SegmentTreeVisualizer from "../components/SegmentTreeVisualizer";
import BitmaskDPVisualizer from "../components/BitmaskDPVisualizer";
import DPOnTreesVisualizer from "../components/DPOnTreesVisualizer";
import StateMachineDPVisualizer from "../components/StateMachineDPVisualizer";
import MSTVisualizer from "../components/MSTVisualizer";
import BellmanFordVisualizer from "../components/BellmanFordVisualizer";
import FloydWarshallVisualizer from "../components/FloydWarshallVisualizer";
import SCCVisualizer from "../components/SCCVisualizer";
import KMPVisualizer from "../components/KMPVisualizer";
import ManacherVisualizer from "../components/ManacherVisualizer";
import NimGameVisualizer from "../components/NimGameVisualizer";
import ConvexHullVisualizer from "../components/ConvexHullVisualizer";
import SubsetGrayCodeVisualizer from "../components/SubsetGrayCodeVisualizer";
import ModularArithmeticVisualizer from "../components/ModularArithmeticVisualizer";
import MoAlgorithmVisualizer from "../components/MoAlgorithmVisualizer";
import NQueensVisualizer from "../components/NQueensVisualizer";
import SudokuVisualizer from "../components/SudokuVisualizer";
import PalindromePartitionVisualizer from "../components/PalindromePartitionVisualizer";
import TwoSATVisualizer from "../components/TwoSATVisualizer";
import HLDVisualizer from "../components/HLDVisualizer";
import SuffixArrayVisualizer from "../components/SuffixArrayVisualizer";
import CentroidDecompositionVisualizer from "../components/CentroidDecompositionVisualizer";

type LeetProblem = { title: string; url: string; difficulty: string };

export default function TopicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(timer);
  }, [slug]);

  const topic = topics.find((t) => t.slug === slug);
  if (!topic) return <div>Topic not found.</div>;

  const problemKeyMap: Record<string, string> = {
    "binary-trees-intro": "Binary Trees Introduction",
    "tree-traversals-dfs": "Tree Traversals (DFS)",
    "binary-search-trees": "Binary Search Trees",
    "level-order-traversal": "Level Order Traversal (BFS)",
    "tree-properties-paths": "Tree Properties & Paths",
    "graph-representation": "Graph Representation",
    "graph-dfs": "Graph DFS",
    "graph-bfs": "Graph BFS",
    "shortest-path-dijkstra": "Shortest Path Dijkstra",
    "topological-sort": "Topological Sort",
    "dp-introduction": "Dynamic Programming Introduction",
    "dp-1d-sequence": "1D Sequence DP",
    "dp-knapsack": "Knapsack DP",
    "dp-strings": "String DP",
    "trie-prefix-tree": "Trie (Prefix Tree)",
    "union-find-dsu": "Union Find (Disjoint Set Union)",
    "segment-tree": "Segment Tree",
    "fenwick-tree-bit": "Binary Indexed Tree (Fenwick Tree)",
    "monotonic-stack-queue": "Monotonic Stack & Queue",
    "sparse-table": "Sparse Table",
    "bitmask-dp": "Bitmask DP",
    "dp-on-trees": "DP on Trees",
    "state-machine-dp": "State Machine DP",
    "digit-dp": "Digit DP",
    "dp-optimizations": "DP Optimizations",
    "minimum-spanning-tree": "Minimum Spanning Tree",
    "advanced-shortest-path": "Advanced Shortest Path",
    "strongly-connected-components": "Strongly Connected Components",
    "network-flow": "Network Flow",
    "articulation-points-bridges": "Articulation Points & Bridges",
    "pattern-matching-algorithms": "Pattern Matching Algorithms",
    "advanced-string-processing": "Advanced String Processing",
    "game-theory": "Game Theory",
    "bit-manipulation-advanced": "Bit Manipulation Advanced",
    "computational-geometry": "Computational Geometry",
    "advanced-mathematics": "Advanced Mathematics",
    "advanced-range-queries": "Advanced Range Queries",
    "advanced-backtracking": "Advanced Backtracking",
    "2-sat": "2-SAT (Boolean Satisfiability)",
    "heavy-light-decomposition": "Heavy-Light Decomposition",
    "suffix-arrays": "Suffix Arrays",
    "centroid-decomposition": "Centroid Decomposition",
  };

  const problemKey = problemKeyMap[topic.slug] || topic.category;
  const topicProblems: LeetProblem[] =
    (leetcode as Record<string, LeetProblem[]>)[problemKey] || [];

  const qset = (quizzes as any)[topic.slug] || [];

  return (
    // ✅ ADDED: py-6 wrapper for padding
    <div className="py-6">
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/tutorials")}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all"
            style={{
              backgroundColor: "var(--card-hover-bg)",
              color: "var(--fg)",
              border: "1px solid var(--brand)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brand)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--card-hover-bg)";
              e.currentTarget.style.color = "var(--fg)";
            }}
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>

        <header className="space-y-1">
          <div className="text-sm text-[var(--muted)]">
            {topic.level} • {topic.category}
          </div>
          <h1 className="text-3xl font-bold">{topic.title}</h1>
          <p className="text-[var(--muted)]">{topic.summary}</p>
        </header>

        <section className="card p-4 space-y-3">
          <h3 className="font-semibold">Concept</h3>
          {topic.content.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}

          {/* Visualizations */}
          {topic.slug === "sorting-basics" && <SortingVisualizer />}
          {topic.slug === "bubble-sort" && <SortingVisualizer />}
          {topic.slug === "selection-sort" && <SelectionSortVisualizer />}
          {topic.slug === "insertion-sort" && <InsertionSortVisualizer />}
          {topic.slug === "merge-sort" && <MergeSortVisualizer />}
          {topic.slug === "quick-sort" && <QuickSortVisualizer />}
          {topic.slug === "queue-basics" && <QueueVisualizer />}
          {topic.slug === "stack-basics" && <StackVisualizer />}
          {topic.slug === "heap-basics" && <HeapVisualizer />}
          {topic.slug === "linked-list-basics" && <LinkedListVisualizer />}
          {topic.slug === "hashmap-basics" && <HashMapVisualizer />}
          {topic.slug === "heap-basics" && <MaxHeapVisualizer />}
          {topic.slug === "array-two-pointer" && <TwoPointerVisualizer />}
          {topic.slug === "array-sliding-window" && <SlidingWindowVisualizer />}
          {topic.slug === "binary-trees-intro" && <BinaryTreeVisualizer />}
          {topic.slug === "tree-traversals-dfs" && <TreeTraversalVisualizer />}
          {topic.slug === "binary-search-trees" && <BSTVisualizer />}
          {topic.slug === "level-order-traversal" && <LevelOrderVisualizer />}
          {topic.slug === "tree-properties-paths" && (
            <TreePropertiesVisualizer />
          )}
          {topic.slug === "graph-representation" && (
            <GraphRepresentationVisualizer />
          )}
          {topic.slug === "graph-dfs" && <GraphDFSVisualizer />}
          {topic.slug === "graph-bfs" && <GraphBFSVisualizer />}
          {topic.slug === "shortest-path-dijkstra" && <DijkstraVisualizer />}
          {topic.slug === "topological-sort" && <TopologicalSortVisualizer />}
          {topic.slug === "dp-introduction" && <DPIntroVisualizer />}
          {topic.slug === "dp-1d-sequence" && <DP1DSequenceVisualizer />}
          {topic.slug === "dp-knapsack" && <DPKnapsackVisualizer />}
          {topic.slug === "dp-strings" && <DPStringsVisualizer />}
          {topic.slug === "binary-search-basics" && (
            <BinarySearchBasicsVisualizer />
          )}

          {topic.slug === "binary-search-advanced" && (
            <BinarySearchAdvancedVisualizer />
          )}
          {topic.slug === "greedy-algorithms" && <GreedyAlgorithmsVisualizer />}
          {topic.slug === "backtracking-basics" && (
            <BacktrackingBasicsVisualizer />
          )}
          {topic.slug === "bit-manipulation-basics" && (
            <BitManipulationBasicsVisualizer />
          )}
          {topic.slug === "trie-prefix-tree" && <TrieVisualizer />}
          {topic.slug === "union-find-dsu" && <UnionFindVisualizer />}
          {topic.slug === "segment-tree" && <SegmentTreeVisualizer />}
          {topic.slug === "bitmask-dp" && <BitmaskDPVisualizer />}
          {topic.slug === "dp-on-trees" && <DPOnTreesVisualizer />}
          {topic.slug === "state-machine-dp" && <StateMachineDPVisualizer />}
          {topic.slug === "minimum-spanning-tree" && <MSTVisualizer />}
          {topic.slug === "advanced-shortest-path" && (
            <div className="space-y-4">
              <BellmanFordVisualizer />
              <FloydWarshallVisualizer />
            </div>
          )}

          {topic.slug === "strongly-connected-components" && <SCCVisualizer />}
          {topic.slug === "pattern-matching-algorithms" && <KMPVisualizer />}
          {topic.slug === "advanced-string-processing" && (
            <ManacherVisualizer />
          )}
          {topic.slug === "game-theory" && <NimGameVisualizer />}
          {topic.slug === "bit-manipulation-advanced" && (
            <SubsetGrayCodeVisualizer />
          )}
          {topic.slug === "computational-geometry" && <ConvexHullVisualizer />}
          {topic.slug === "advanced-mathematics" && (
            <ModularArithmeticVisualizer />
          )}
          {topic.slug === "advanced-range-queries" && <MoAlgorithmVisualizer />}
          {topic.slug === "advanced-backtracking" && (
            <>
              <NQueensVisualizer />
              <SudokuVisualizer />
              <PalindromePartitionVisualizer />
            </>
          )}
          {topic.slug === "2-sat" && <TwoSATVisualizer />}
          {topic.slug === "heavy-light-decomposition" && <HLDVisualizer />}
          {topic.slug === "suffix-arrays" && <SuffixArrayVisualizer />}
          {topic.slug === "centroid-decomposition" && (
            <CentroidDecompositionVisualizer />
          )}
        </section>

        <section className="card p-4 space-y-3">
          <h3 className="font-semibold">Example Code</h3>
          <pre className="bg-[var(--panel)] p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{topic.example.code}</code>
          </pre>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Practice Problems</h3>
          {topicProblems.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No curated problems yet for this topic.
            </p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3">
              {topicProblems.map((p, idx) => (
                <li key={idx} className="card p-3">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium link"
                  >
                    {p.title}
                  </a>
                  <div className="text-sm text-[var(--muted)]">
                    {p.difficulty}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {qset.length > 0 && (
          <section>
            <Quiz questions={qset as any} storageKey={`quiz:${topic.slug}`} />
          </section>
        )}
      </div>
    </div>
  );
}
