import { useState } from "react";
import SpeedControl from "./SpeedControl";

export default function SelectionSortVisualizer() {
  const [array, setArray] = useState<number[]>([64, 25, 12, 22, 11]);
  const [sorting, setSorting] = useState(false);
  const [currentMin, setCurrentMin] = useState<number>(-1);
  const [comparing, setComparing] = useState<number>(-1);
  const [sorted, setSorted] = useState<number[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const shuffle = () => {
    const newArray = Array.from(
      { length: 7 },
      () => Math.floor(Math.random() * 100) + 10
    );
    setArray(newArray);
    setCurrentMin(-1);
    setComparing(-1);
    setSorted([]);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const selectionSort = async () => {
    setSorting(true);
    setSorted([]);

    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      setCurrentMin(minIdx);
      await sleep(500);

      for (let j = i + 1; j < n; j++) {
        setComparing(j);
        await sleep(300);

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          setCurrentMin(minIdx);
          await sleep(300);
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        await sleep(500);
      }

      setSorted((prev) => [...prev, i]);
      setCurrentMin(-1);
      setComparing(-1);
    }

    setSorted(Array.from({ length: n }, (_, i) => i));
    setSorting(false);
  };

  const getBarColor = (index: number) => {
    if (sorted.includes(index)) return "bg-green-500";
    if (index === currentMin) return "bg-red-500";
    if (index === comparing) return "bg-yellow-400";
    return "bg-brand";
  };

  const maxValue = Math.max(...array);

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Selection Sort Visualization</h4>

      <SpeedControl speed={animationSpeed} onSpeedChange={setAnimationSpeed} />

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={selectionSort} disabled={sorting}>
          {sorting ? "Sorting..." : "Play Selection Sort"}
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
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Current Minimum</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Sorted</span>
        </div>
      </div>

      <div className="text-sm text-[var(--muted)]">
        <p>• Finds the minimum element in unsorted portion (red)</p>
        <p>• Swaps it with the first unsorted element</p>
        <p>• Sorted elements turn green and stay in place</p>
      </div>
    </div>
  );
}
