import { useEffect, useMemo, useRef, useState } from 'react'

type Node = { id: string, x: number, y: number }
type Edge = { from: string, to: string }

const sample = {
  nodes: [
    { id: 'A', x: 80, y: 60 }, { id: 'B', x: 240, y: 40 }, { id: 'C', x: 220, y: 120 },
    { id: 'D', x: 400, y: 70 }, { id: 'E', x: 400, y: 160 }
  ] as Node[],
  edges: [
    { from: 'A', to:'B' }, { from: 'A', to:'C' }, { from: 'B', to:'D' }, { from: 'C', to:'E' }, { from:'B', to:'C' }
  ] as Edge[]
}

export default function GraphBFSVisualizer() {
  const [visited, setVisited] = useState<string[]>([])
  const [queueSnap, setQueueSnap] = useState<string[]>([])
  const svgRef = useRef<SVGSVGElement | null>(null)

  const adj = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const n of sample.nodes) map.set(n.id, [])
    for (const e of sample.edges) {
      map.get(e.from)!.push(e.to)
      map.get(e.to)?.push(e.from) // undirected for demo
    }
    for (const [k, v] of map) map.set(k, Array.from(new Set(v)))
    return map
  }, [])

  async function runBFS(start = 'A') {
    const vis = new Set<string>()
    const q: string[] = []
    vis.add(start); q.push(start)
    setVisited([start]); setQueueSnap([start])
    while (q.length) {
      const u = q.shift()!
      await new Promise(r => setTimeout(r, 600))
      for (const v of adj.get(u) || []) {
        if (!vis.has(v)) {
          vis.add(v); q.push(v)
          setVisited(prev => [...prev, v])
          setQueueSnap(q.slice())
          await new Promise(r => setTimeout(r, 450))
        }
      }
    }
  }

  useEffect(() => {
    // no-op; visual is purely SVG-driven by state
  }, [visited, queueSnap])

  function nodeColor(id: string) {
    return visited.includes(id) ? '#22c55e' : '#94a3b8'
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <button className="btn" onClick={() => { setVisited([]); setQueueSnap([]); runBFS('A') }}>Play BFS</button>
        <span className="text-sm text-[var(--muted)]">Visited: {visited.join(' → ') || '—'}</span>
      </div>
      <svg ref={svgRef} className="w-full" viewBox="0 0 500 220">
        {sample.edges.map((e, i) => {
          const a = sample.nodes.find(n => n.id === e.from)!
          const b = sample.nodes.find(n => n.id === e.to)!
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#334155" strokeWidth="2" />
        })}
        {sample.nodes.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="22" fill={nodeColor(n.id)} />
            <text x={n.x} y={n.y+5} textAnchor="middle" fontWeight="700" fill="white">{n.id}</text>
          </g>
        ))}
      </svg>
      <div className="text-sm">Queue: <span className="font-mono">{queueSnap.join(' | ') || 'empty'}</span></div>
    </div>
  )
}
