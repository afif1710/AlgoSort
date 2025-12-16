import { Link } from "react-router-dom";
import SortingVisualizer from "../components/SortingVisualizer";
import GraphBFSVisualizer from "../components/GraphBFSVisualizer";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] pt-15 py-6">
      <div className="space-y-6 w-full">
        <section className="grid lg:grid-cols-2 gap-6 items-start">
          {" "}
          {/* ✅ items-start instead of items-center */}
          {/* Text Section - LEFT */}
          <div className="space-y-3 pt-60">
            <h1 className="text-3xl font-bold">
              Master Data Structures & Algorithms
            </h1>
            <p className="text-[var(--muted)]">
              Interactive tutorials, visual animations, and a built-in code
              sandbox—organized by level so you can learn faster.
            </p>
            <div className="flex gap-2">
              <Link to="/tutorials" className="btn">
                Start Learning
              </Link>
              <Link to="/problems" className="btn-outline">
                Practice Problems
              </Link>
            </div>
          </div>
          {/* Visualizers - RIGHT */}
          <div className="grid gap-4">
            <SortingVisualizer />
            <GraphBFSVisualizer />
          </div>
        </section>
      </div>
    </div>
  );
}
