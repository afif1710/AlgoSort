import { useParams } from "react-router-dom";
import topics from "../data/topics.json";
import leetcode from "../data/leetcodeProblems.json";
import quizzes from "../data/quizzes.json";
import Quiz from "../components/Quiz";
import SortingVisualizer from "../components/SortingVisualizer";
import GraphBFSVisualizer from "../components/GraphBFSVisualizer";
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
import TwoPointerVisualizer from '../components/TwoPointerVisualizer'
import SlidingWindowVisualizer from '../components/SlidingWindowVisualizer'



type LeetProblem = { title: string; url: string; difficulty: string };

export default function TopicPage() {
  const { slug } = useParams();
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) return <div>Topic not found.</div>;

  // Pull problems by the topic's category from leetcodeProblems.json
  const topicProblems: LeetProblem[] =
    (leetcode as Record<string, LeetProblem[]>)[topic.category] || [];

  const qset = (quizzes as any)[topic.slug] || [];

  return (
    <div className="space-y-6">
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
        {topic.slug === "graph-bfs" && <GraphBFSVisualizer />}
        {topic.slug === "queue-basics" && <QueueVisualizer />}
        {topic.slug === "stack-basics" && <StackVisualizer />}
        {topic.slug === "heap-basics" && <HeapVisualizer />}
        {topic.slug === "linked-list-basics" && <LinkedListVisualizer />}
        {topic.slug === "hashmap-basics" && <HashMapVisualizer />}
        {topic.slug === "heap-basics" && <MaxHeapVisualizer />}
        {topic.slug === 'array-two-pointer' && <TwoPointerVisualizer />}
        {topic.slug === 'array-sliding-window' && <SlidingWindowVisualizer />}


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
  );
}
