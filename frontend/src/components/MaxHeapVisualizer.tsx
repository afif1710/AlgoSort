import { useState } from 'react'

export default function MaxHeapVisualizer() {
  const [heap, setHeap] = useState<number[]>([90, 85, 70, 60, 75, 50, 40])
  const [inputVal, setInputVal] = useState('')

  const insert = () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 100)
    const newHeap = [...heap, val]
    heapifyUp(newHeap, newHeap.length - 1)
    setHeap(newHeap)
    setInputVal('')
  }

  const extractMax = () => {
    if (heap.length === 0) return
    const newHeap = [...heap]
    newHeap[0] = newHeap[newHeap.length - 1]
    newHeap.pop()
    if (newHeap.length > 0) heapifyDown(newHeap, 0)
    setHeap(newHeap)
  }

  const heapifyUp = (arr: number[], idx: number) => {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2)
      if (arr[idx] <= arr[parent]) break
      ;[arr[idx], arr[parent]] = [arr[parent], arr[idx]]
      idx = parent
    }
  }

  const heapifyDown = (arr: number[], idx: number) => {
    const n = arr.length
    while (true) {
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      let largest = idx

      if (left < n && arr[left] > arr[largest]) largest = left
      if (right < n && arr[right] > arr[largest]) largest = right
      if (largest === idx) break

      ;[arr[idx], arr[largest]] = [arr[largest], arr[idx]]
      idx = largest
    }
  }

  const renderTree = () => {
    if (heap.length === 0) return null

    const levels: number[][] = []
    let levelStart = 0
    let levelSize = 1

    while (levelStart < heap.length) {
      levels.push(heap.slice(levelStart, levelStart + levelSize))
      levelStart += levelSize
      levelSize *= 2
    }

    return (
      <div className="space-y-4">
        {levels.map((level, i) => (
          <div key={i} className="flex justify-center gap-4">
            {level.map((val, j) => (
              <div key={j} className="relative">
                <div
                  className={`px-4 py-2 rounded-lg font-bold ${
                    i === 0 ? 'bg-red-500 text-white' : 'bg-brand text-white'
                  }`}
                >
                  {val}
                </div>
                
                {/* Draw lines to children */}
                {i < levels.length - 1 && (
                  <svg
                    className="absolute top-full left-1/2 -translate-x-1/2"
                    width="80"
                    height="30"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Left child line */}
                    {2 * (levelStart + j) + 1 < heap.length && (
                      <line
                        x1="0"
                        y1="0"
                        x2="-30"
                        y2="30"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-brand/50"
                      />
                    )}
                    {/* Right child line */}
                    {2 * (levelStart + j) + 2 < heap.length && (
                      <line
                        x1="0"
                        y1="0"
                        x2="30"
                        y2="30"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-brand/50"
                      />
                    )}
                  </svg>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Max-Heap Visualization</h4>
      
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="number"
          placeholder="Value"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          className="px-3 py-2 border rounded w-24 bg-[var(--panel)] text-[var(--fg)]"
        />
        <button className="btn" onClick={insert}>Insert</button>
        <button className="btn-outline" onClick={extractMax} disabled={heap.length === 0}>
          Extract Max
        </button>
      </div>

      <div className="bg-[var(--panel)] p-6 rounded-lg min-h-[250px]">
        {heap.length === 0 ? (
          <div className="text-center text-[var(--muted)] py-12">Heap is empty</div>
        ) : (
          <div className="overflow-x-auto pb-4">
            {renderTree()}
          </div>
        )}
      </div>

      <div className="text-sm text-[var(--muted)] space-y-1">
        <p>• Root (red) is always the maximum element</p>
        <p>• Parent ≥ Children (Max-Heap property)</p>
        <p>• Size: {heap.length} elements | Max: {heap[0] || 'none'}</p>
        <p>• Insert: O(log n), Extract Max: O(log n)</p>
      </div>

      <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
          Array Representation:
        </div>
        <div className="flex flex-wrap gap-2">
          {heap.map((val, idx) => (
            <div key={idx} className="text-xs">
              <span className="text-[var(--muted)]">[{idx}]</span>{' '}
              <span className="font-bold">{val}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-[var(--muted)] mt-2">
          For node at index i: left child = 2i+1, right child = 2i+2, parent = (i-1)/2
        </div>
      </div>
    </div>
  )
}
