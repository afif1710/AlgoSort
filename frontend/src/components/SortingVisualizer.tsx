import { useState } from "react";
import SpeedControl from "./SpeedControl";

export default function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90]);
  const [sorting, setSorting] = useState(false);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const shuffle = () => {
    const newArray = Array.from(
      { length: 8 },
      () => Math.floor(Math.random() * 100) + 10
    );
    setArray(newArray);
    setComparing([]);
    setSorted([]);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const bubbleSort = async () => {
    setSorting(true);
    setComparing([]);
    setSorted([]);

    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        await sleep(400);

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await sleep(400);
        }
      }
      setSorted((prev) => [...prev, n - i - 1]);
    }

    setComparing([]);
    setSorted(Array.from({ length: n }, (_, i) => i));
    setSorting(false);
  };

  const getBarColor = (index: number) => {
    if (sorted.includes(index)) return "bg-green-500";
    if (comparing.includes(index)) return "bg-yellow-400";
    return "bg-brand";
  };

  const maxValue = Math.max(...array);

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Bubble Sort Visualization</h4>

      <SpeedControl speed={animationSpeed} onSpeedChange={setAnimationSpeed} />

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={bubbleSort} disabled={sorting}>
          {sorting ? "Sorting..." : "Play Bubble Sort"}
        </button>
        <button className="btn-outline" onClick={shuffle} disabled={sorting}>
          Shuffle
        </button>
      </div>

      <div className="bg-[var(--panel)] p-6 rounded-lg min-h-[280px] flex items-end justify-center gap-2">
        {array.map((value, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div
              className={`${getBarColor(
                idx
              )} transition-all duration-300 w-12 rounded-t-lg`}
              style={{
                height: `${(value / maxValue) * 200}px`,
                minHeight: "20px",
              }}
            />
            <span className="text-xs font-semibold">{value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Sorted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-brand rounded"></div>
          <span>Unsorted</span>
        </div>
      </div>

      <div className="text-sm text-[var(--muted)]">
        <p>
          • Watch how bubble sort compares adjacent elements and swaps them if
          they're in wrong order
        </p>
        <p>
          • Each pass moves the largest unsorted element to its correct position
        </p>
        <p>• Yellow bars show elements being compared right now</p>
      </div>
    </div>
  );
}
