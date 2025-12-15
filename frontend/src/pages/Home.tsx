import { Link } from 'react-router-dom'
import SortingVisualizer from '../components/SortingVisualizer'
import GraphBFSVisualizer from '../components/GraphBFSVisualizer'

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="grid lg:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Master Data Structures & Algorithms</h1>
          <p className="text-[var(--muted)]">Interactive tutorials, visual animations, and a built-in code sandbox—organized by level so you can learn faster.</p>
          <div className="flex gap-2">
            <Link to="/topics" className="btn">Start Learning</Link>
            <Link to="/practice" className="btn-outline">Practice Problems</Link>
          </div>
        </div>
        <div className="grid gap-4">
          <SortingVisualizer />
          <GraphBFSVisualizer />
        </div>
      </section>
    </div>
  )
}
