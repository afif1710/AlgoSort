import { useEffect, useState } from 'react'

type Q = { id: string, prompt: string, choices: string[], answer: number, explanation?: string }

export default function Quiz({ questions, storageKey }:{ questions: Q[], storageKey: string }) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [show, setShow] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) setAnswers(JSON.parse(saved))
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(answers))
  }, [answers, storageKey])

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Quick Quiz</h3>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={()=> setShow(!show)}>{show? 'Hide' : 'Check answers'}</button>
          <button className="btn-outline" onClick={()=> { setAnswers({}); localStorage.removeItem(storageKey) }}>Reset</button>
        </div>
      </div>
      <div className="space-y-4">
        {questions.map(q => (
          <div key={q.id}>
            <p className="font-medium">{q.prompt}</p>
            <div className="mt-2 grid gap-2">
              {q.choices.map((c, i) => {
                const picked = answers[q.id] === i
                const correct = show && q.answer === i
                const incorrect = show && picked && q.answer !== i
                return (
                  <label key={i} className="flex items-center gap-2">
                    <input type="radio" name={q.id} checked={picked} onChange={()=> setAnswers(a => ({ ...a, [q.id]: i }))}/>
                    <span className={`rounded px-2 py-1 ${correct? 'bg-green-100 text-green-800' : ''} ${incorrect? 'bg-red-100 text-red-800' : ''}`}>{c}</span>
                  </label>
                )
              })}
            </div>
            {show && q.explanation && <p className="text-sm text-[var(--muted)] mt-1">{q.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
