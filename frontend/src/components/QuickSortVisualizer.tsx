import { useState } from "react";
import SpeedControl from "./SpeedControl";

export default function QuickSortVisualizer() {
  const [array, setArray] = useState<number[]>([10, 7, 8, 9, 1, 5]);
  const [sorting, setSorting] = useState(false);
  const [pivot, setPivot] = useState<number>(-1);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const shuffle = () => {
    const newArray = Array.from(
      { length: 8 },
      () => Math.floor(Math.random() * 100) + 10
    );
    setArray(newArray);
    setPivot(-1);
    setComparing([]);
    setSorted([]);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const partition = async (
    arr: number[],
    low: number,
    high: number
  ): Promise<number> => {
    const pivotValue = arr[high];
    setPivot(high);
    await sleep(500);

    let i = low - 1;

    for (let j = low; j < high; j++) {
      setComparing([j, high]);
      await sleep(400);

      if (arr[j] <= pivotValue) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
          await sleep(400);
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    await sleep(400);

    setPivot(-1);
    setComparing([]);
    return i + 1;
  };

  const quickSortHelper = async (
    arr: number[],
    low: number,
    high: number
  ): Promise<void> => {
    if (low < high) {
      const pi = await partition(arr, low, high);
      setSorted((prev) => [...prev, pi]);

      await quickSortHelper(arr, low, pi - 1);
      await quickSortHelper(arr, pi + 1, high);
    } else if (low === high) {
      setSorted((prev) => [...prev, low]);
    }
  };

  const quickSort = async () => {
    setSorting(true);
    setSorted([]);
    setPivot(-1);
    setComparing([]);

    const arr = [...array];
    await quickSortHelper(arr, 0, arr.length - 1);

    setSorted(Array.from({ length: arr.length }, (_, i) => i));
    setSorting(false);
  };

  const getBarColor = (index: number) => {
    if (sorted.includes(index)) return "bg-green-500";
    if (index === pivot) return "bg-red-500";
    if (comparing.includes(index)) return "bg-yellow-400";
    return "bg-brand";
  };

  const maxValue = Math.max(...array);

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Quick Sort Visualization</h4>

      <SpeedControl speed={animationSpeed} onSpeedChange={setAnimationSpeed} />

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={quickSort} disabled={sorting}>
          {sorting ? "Sorting..." : "Play Quick Sort"}
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
          <span>Pivot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>Comparing with Pivot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>In Correct Position</span>
        </div>
      </div>

      <div className="text-sm text-[var(--muted)]">
        <p>• Red bar is the pivot (partition element)</p>
        <p>• Elements smaller than pivot go left, larger go right</p>
        <p>• Recursively sorts left and right partitions</p>
      </div>
    </div>
  );
}
