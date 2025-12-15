import data from '../data/leetcodeProblems.json'

export default function Problems() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Problems (LeetCode)</h2>

      {Object.entries(data).map(([topic, list]) => (
        <section key={topic} className="space-y-3">
          <h3 className="text-xl font-semibold">{topic}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(list as any[]).map((p, idx) => (
              <div key={idx} className="card p-4">
                <a className="font-semibold link" href={p.url} target="_blank" rel="noreferrer">
                  {p.title}
                </a>
                <div className="text-sm text-[var(--muted)]">{p.difficulty}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
