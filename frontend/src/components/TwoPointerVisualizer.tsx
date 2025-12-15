import { useState } from 'react'

type Pattern = 'reverse' | 'pair-sum' | 'remove-duplicates' | 'fast-slow'

export default function TwoPointerVisualizer() {
  const [array, setArray] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8])
  const [left, setLeft] = useState<number>(-1)
  const [right, setRight] = useState<number>(-1)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<string>('')
  const [pattern, setPattern] = useState<Pattern>('reverse')

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const shuffle = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 50) + 1).sort((a, b) => a - b)
    setArray(newArray)
    setLeft(-1)
    setRight(-1)
    setResult('')
  }

  const reverseArray = async () => {
    setRunning(true)
    setResult('Reversing array using two pointers...')
    const arr = [...array]
    let l = 0
    let r = arr.length - 1

    while (l < r) {
      setLeft(l)
      setRight(r)
      await sleep(800)

      // Swap
      ;[arr[l], arr[r]] = [arr[r], arr[l]]
      setArray([...arr])
      setResult(`Swapped arr[${l}]=${arr[l]} with arr[${r}]=${arr[r]}`)
      await sleep(800)

      l++
      r--
    }

    setLeft(-1)
    setRight(-1)
    setResult('Array reversed!')
    setRunning(false)
  }

  const findPairSum = async () => {
    setRunning(true)
    setResult('Finding pair that sums to target...')
    const target = Math.floor(array.length * 5) // Dynamic target
    const arr = [...array]
    let l = 0
    let r = arr.length - 1
    let found = false

    setResult(`Finding two numbers that sum to ${target}`)
    await sleep(1000)

    while (l < r) {
      setLeft(l)
      setRight(r)
      const sum = arr[l] + arr[r]
      setResult(`Checking: arr[${l}]=${arr[l]} + arr[${r}]=${arr[r]} = ${sum}`)
      await sleep(1000)

      if (sum === target) {
        setResult(`Found! arr[${l}]=${arr[l]} + arr[${r}]=${arr[r]} = ${target}`)
        found = true
        break
      } else if (sum < target) {
        setResult(`${sum} < ${target}, move left pointer right →`)
        await sleep(800)
        l++
      } else {
        setResult(`${sum} > ${target}, move right pointer left ←`)
        await sleep(800)
        r--
      }
    }

    if (!found) {
      setResult(`No pair found that sums to ${target}`)
      setLeft(-1)
      setRight(-1)
    }

    setRunning(false)
  }

  const removeDuplicates = async () => {
    setRunning(true)
    setResult('Removing duplicates from sorted array...')
    const arr = [...array]
    let slow = 0
    let fast = 1

    setLeft(slow)
    setRight(fast)
    await sleep(1000)

    while (fast < arr.length) {
      setLeft(slow)
      setRight(fast)
      setResult(`Comparing arr[${slow}]=${arr[slow]} with arr[${fast}]=${arr[fast]}`)
      await sleep(800)

      if (arr[slow] !== arr[fast]) {
        slow++
        arr[slow] = arr[fast]
        setArray([...arr])
        setResult(`Found different element, moved to position ${slow}`)
        await sleep(800)
      } else {
        setResult(`Duplicate found, skip it`)
        await sleep(600)
      }

      fast++
    }

    const uniqueArray = arr.slice(0, slow + 1)
    setArray(uniqueArray)
    setLeft(-1)
    setRight(-1)
    setResult(`Removed duplicates! New length: ${uniqueArray.length}`)
    setRunning(false)
  }

  const fastSlowPointer = async () => {
    setRunning(true)
    setResult('Using fast and slow pointers (finding middle)...')
    const arr = [...array]
    let slow = 0
    let fast = 0

    while (fast < arr.length - 1) {
      setLeft(slow)
      setRight(fast)
      setResult(`Slow at ${slow}, Fast at ${fast}`)
      await sleep(800)

      slow++
      fast += 2

      if (fast >= arr.length) {
        fast = arr.length - 1
      }
    }

    setLeft(slow)
    setRight(-1)
    setResult(`Middle element found at index ${slow}: ${arr[slow]}`)
    setRunning(false)
  }

  const runPattern = () => {
    switch (pattern) {
      case 'reverse':
        reverseArray()
        break
      case 'pair-sum':
        findPairSum()
        break
      case 'remove-duplicates':
        removeDuplicates()
        break
      case 'fast-slow':
        fastSlowPointer()
        break
    }
  }

  const getBarColor = (index: number) => {
    if (index === left && index === right) return 'bg-purple-500'
    if (index === left) return 'bg-blue-500'
    if (index === right) return 'bg-red-500'
    return 'bg-brand'
  }

  const getLabel = (index: number) => {
    if (index === left && index === right) return 'Both'
    if (index === left) return pattern === 'fast-slow' ? 'Slow' : 'Left'
    if (index === right) return pattern === 'fast-slow' ? 'Fast' : 'Right'
    return ''
  }

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Two Pointer Technique Visualization</h4>

      <div className="space-y-2">
        <label className="text-sm font-medium">Select Pattern:</label>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            className={`px-3 py-2 rounded text-sm ${
              pattern === 'reverse' ? 'bg-brand text-white' : 'btn-outline'
            }`}
            onClick={() => setPattern('reverse')}
            disabled={running}
          >
            Reverse Array
          </button>
          <button
            className={`px-3 py-2 rounded text-sm ${
              pattern === 'pair-sum' ? 'bg-brand text-white' : 'btn-outline'
            }`}
            onClick={() => setPattern('pair-sum')}
            disabled={running}
          >
            Two Sum (Sorted)
          </button>
          <button
            className={`px-3 py-2 rounded text-sm ${
              pattern === 'remove-duplicates' ? 'bg-brand text-white' : 'btn-outline'
            }`}
            onClick={() => setPattern('remove-duplicates')}
            disabled={running}
          >
            Remove Duplicates
          </button>
          <button
            className={`px-3 py-2 rounded text-sm ${
              pattern === 'fast-slow' ? 'bg-brand text-white' : 'btn-outline'
            }`}
            onClick={() => setPattern('fast-slow')}
            disabled={running}
          >
            Fast & Slow
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={runPattern} disabled={running}>
          {running ? 'Running...' : 'Run'}
        </button>
        <button className="btn-outline" onClick={shuffle} disabled={running}>
          Shuffle
        </button>
      </div>

      {result && (
        <div className="text-sm bg-brand/10 px-3 py-2 rounded">
          <span className="font-semibold">{result}</span>
        </div>
      )}

      <div className="bg-[var(--panel)] p-6 rounded-lg min-h-[280px] flex flex-col items-center justify-center gap-4">
        <div className="flex items-end justify-center gap-2 flex-wrap">
          {array.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div
                className={`${getBarColor(idx)} transition-all duration-300 w-12 rounded-t-lg flex items-end justify-center pb-2 text-white font-bold relative`}
                style={{
                  height: `${Math.max(value * 3, 40)}px`,
                  minHeight: '40px'
                }}
              >
                {getLabel(idx) && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                    {getLabel(idx)} ↓
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold">{value}</span>
                <span className="text-xs text-[var(--muted)]">[{idx}]</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>{pattern === 'fast-slow' ? 'Slow Pointer' : 'Left Pointer'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>{pattern === 'fast-slow' ? 'Fast Pointer' : 'Right Pointer'}</span>
        </div>
      </div>

      <div className="text-sm text-[var(--muted)] space-y-1">
        {pattern === 'reverse' && (
          <>
            <p>• Left pointer starts at beginning, right at end</p>
            <p>• Swap elements and move pointers toward center</p>
            <p>• Time: O(n), Space: O(1)</p>
          </>
        )}
        {pattern === 'pair-sum' && (
          <>
            <p>• Works on sorted arrays only</p>
            <p>• If sum too small, move left right; if too large, move right left</p>
            <p>• Time: O(n), Space: O(1)</p>
          </>
        )}
        {pattern === 'remove-duplicates' && (
          <>
            <p>• Slow pointer tracks unique elements</p>
            <p>• Fast pointer scans for next different element</p>
            <p>• Time: O(n), Space: O(1)</p>
          </>
        )}
        {pattern === 'fast-slow' && (
          <>
            <p>• Fast pointer moves 2 steps, slow moves 1 step</p>
            <p>• When fast reaches end, slow is at middle</p>
            <p>• Also used for cycle detection in linked lists</p>
          </>
        )}
      </div>
    </div>
  )
}
