import { useState } from "react";

export default function HeapVisualizer() {
  const [heap, setHeap] = useState<number[]>([1, 3, 5, 7, 9, 11, 13]);
  const [inputVal, setInputVal] = useState("");

  const insert = () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 100);
    const newHeap = [...heap, val];
    heapifyUp(newHeap, newHeap.length - 1);
    setHeap(newHeap);
    setInputVal("");
  };

  const extractMin = () => {
    if (heap.length === 0) return;
    const newHeap = [...heap];
    newHeap[0] = newHeap[newHeap.length - 1];
    newHeap.pop();
    if (newHeap.length > 0) heapifyDown(newHeap, 0);
    setHeap(newHeap);
  };

  const heapifyUp = (arr: number[], idx: number) => {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (arr[idx] >= arr[parent]) break;
      [arr[idx], arr[parent]] = [arr[parent], arr[idx]];
      idx = parent;
    }
  };

  const heapifyDown = (arr: number[], idx: number) => {
    const n = arr.length;
    while (true) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      let smallest = idx;

      if (left < n && arr[left] < arr[smallest]) smallest = left;
      if (right < n && arr[right] < arr[smallest]) smallest = right;
      if (smallest === idx) break;
      [arr[idx], arr[smallest]] = [arr[smallest], arr[idx]];
      idx = smallest;
    }
  };

  const renderTree = () => {
    if (heap.length === 0) return null;

    const levels: number[][] = [];
    let levelStart = 0;
    let levelSize = 1;

    while (levelStart < heap.length) {
      levels.push(heap.slice(levelStart, levelStart + levelSize));
      levelStart += levelSize;
      levelSize *= 2;
    }

    return (
      <div className="space-y-4">
        {levels.map((level, i) => (
          <div key={i} className="flex justify-center gap-4">
            {level.map((val, j) => (
              <div
                key={j}
                className={`px-4 py-2 rounded-lg font-bold ${
                  i === 0 ? "bg-green-500 text-white" : "bg-brand text-white"
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card p-4 space-y-4">
      <h4 className="font-semibold">Min-Heap Visualization</h4>

      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="number"
          placeholder="Value"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="px-3 py-2 border rounded w-24"
        />
        <button className="btn" onClick={insert}>
          Insert
        </button>
        <button
          className="btn-outline"
          onClick={extractMin}
          disabled={heap.length === 0}
        >
          Extract Min
        </button>
      </div>

      <div className="bg-[var(--panel)] p-6 rounded-lg min-h-[200px]">
        {heap.length === 0 ? (
          <div className="text-center text-[var(--muted)]">Heap is empty</div>
        ) : (
          renderTree()
        )}
      </div>

      <div className="text-sm text-[var(--muted)]">
        <p>• Root (green) is always the minimum element</p>
        <p>• Parent ≤ Children (Min-Heap property)</p>
        <p>
          • Size: {heap.length} elements | Min: {heap[0]}
        </p>
      </div>
    </div>
  );
}
