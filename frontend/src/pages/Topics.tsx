import { Link } from 'react-router-dom'
import topics from '../data/topics.json'

export default function Topics() {
  const levels = ['Beginner', 'Intermediate', 'Advanced']
  
  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-bold">Tutorials by Level</h2>
      
      {levels.map(level => {
        // Get all topics for this level
        const levelTopics = topics.filter(t => t.level === level)
        
        // Group by category
        const categories: Record<string, typeof topics> = {}
        levelTopics.forEach(t => {
          if (!categories[t.category]) categories[t.category] = []
          categories[t.category].push(t)
        })
        
        if (levelTopics.length === 0) return null
        
        return (
          <section key={level} className="space-y-8">
            {/* Clean Centered Level Heading - No Lines */}
            <div className="flex justify-center py-8">
              <h3 className="bg-brand text-white px-12 py-4 text-4xl font-bold rounded-xl shadow-2xl">
                {level}
              </h3>
            </div>
            
            {Object.entries(categories).map(([category, list]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-xl font-semibold border-b border-slate-700 pb-2">
                  {category}
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map(t => (
                    <Link 
                      to={`/topics/${t.slug}`} 
                      key={t.slug} 
                      className="card p-4 cursor-pointer group"
                    >
                      <div className="font-semibold text-lg mb-2 group-hover:text-brand transition-colors">
                        {t.title}
                      </div>
                      <p className="text-sm text-[var(--muted)]">{t.summary}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}
