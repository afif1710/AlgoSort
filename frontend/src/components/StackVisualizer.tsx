import { useState } from 'react'

export default function StackVisualizer() {
  const [stack, setStack] = useState<number[]>([10, 20, 30])
  const [inputVal, setInputVal] = useState('')
  const [lastAction, setLastAction] = useState('')

  const push = () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 100)
    setStack(prev => [...prev, val])
    setLastAction(`Pushed ${val}`)
    setInputVal('')
  }

  const pop = () => {
    if (stack.length > 0) {
      const val = stack[stack.length - 1]
      setStack(prev => prev.slice(0, -1))
      setLastAction(`Popped ${val}`)
    }
  }

  const peek = () => {
    if (stack.length > 0) {
      setLastAction(`Top element: ${stack[stack.length - 1]}`)
    } else {
      setLastAction('Stack is empty')
    }
  }

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Stack Visualization (LIFO)</h4>
      
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="number"
          placeholder="Value"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          className="px-3 py-2 border rounded w-24 bg-[var(--panel)] text-[var(--fg)]"
        />
        <button className="btn" onClick={push}>Push (Add to Top)</button>
        <button className="btn-outline" onClick={pop} disabled={stack.length === 0}>
          Pop (Remove from Top)
        </button>
        <button className="btn-outline" onClick={peek} disabled={stack.length === 0}>
          Peek
        </button>
      </div>

      {lastAction && (
        <div className="text-sm bg-brand/10 px-3 py-2 rounded">
          Action: <span className="font-semibold">{lastAction}</span>
        </div>
      )}

      <div className="bg-[var(--panel)] p-6 rounded-lg min-h-[320px] flex flex-col-reverse items-center justify-start gap-2">
        {stack.length === 0 ? (
          <span className="text-[var(--muted)] my-auto">Stack is empty</span>
        ) : (
          <>
            {stack.map((val, idx) => (
              <div
                key={idx}
                className={`bg-brand text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg w-32 text-center transition-all ${
                  idx === stack.length - 1 ? 'ring-4 ring-yellow-400' : ''
                }`}
                style={{
                  animation: idx === stack.length - 1 ? 'pulse 2s infinite' : undefined
                }}
              >
                {val}
                {idx === stack.length - 1 && (
                  <div className="text-xs mt-1 text-yellow-300">← TOP</div>
                )}
              </div>
            ))}
            <div className="text-sm text-[var(--muted)] mt-2">↓ BOTTOM</div>
          </>
        )}
      </div>

      <div className="text-sm text-[var(--muted)] space-y-1">
        <p>• Last In First Out (LIFO) - like a stack of plates</p>
        <p>• Size: {stack.length} elements</p>
        <p>• Top element: {stack[stack.length - 1] || 'none'}</p>
        <p>• Push adds to top, Pop removes from top</p>
      </div>
    </div>
  )
}
