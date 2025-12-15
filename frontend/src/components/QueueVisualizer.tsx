import { useState } from "react";

export default function QueueVisualizer() {
  const [queue, setQueue] = useState<number[]>([10, 20, 30]);
  const [inputVal, setInputVal] = useState("");

  const enqueue = () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 100);
    setQueue((prev) => [...prev, val]);
    setInputVal("");
  };

  const dequeue = () => {
    if (queue.length > 0) {
      setQueue((prev) => prev.slice(1));
    }
  };

  return (
    <div className="card p-4 space-y-4">
      <h4 className="font-semibold">Queue Visualization (FIFO)</h4>

      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="number"
          placeholder="Value"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="px-3 py-2 border rounded w-24"
        />
        <button className="btn" onClick={enqueue}>
          Enqueue (Add to Rear)
        </button>
        <button
          className="btn-outline"
          onClick={dequeue}
          disabled={queue.length === 0}
        >
          Dequeue (Remove from Front)
        </button>
      </div>

      <div className="bg-[var(--panel)] p-4 rounded-lg min-h-[120px] flex items-center justify-center">
        {queue.length === 0 ? (
          <span className="text-[var(--muted)]">Queue is empty</span>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-[var(--muted)]">Front →</span>
            {queue.map((val, idx) => (
              <div
                key={idx}
                className="bg-brand text-white px-4 py-3 rounded-lg font-bold text-lg shadow-lg"
                style={{
                  animation: idx === 0 ? "pulse 2s infinite" : undefined,
                }}
              >
                {val}
              </div>
            ))}
            <span className="text-sm text-[var(--muted)]">← Rear</span>
          </div>
        )}
      </div>

      <div className="text-sm text-[var(--muted)]">
        <p>• First element added is the first removed (FIFO)</p>
        <p>• Size: {queue.length} elements</p>
        <p>• Front: {queue[0] || "empty"}</p>
      </div>
    </div>
  );
}
