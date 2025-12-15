import { useState } from "react";

export default function MergeSortVisualizer() {
  const [array, setArray] = useState<number[]>([38, 27, 43, 3, 9, 82, 10]);
  const [sorting, setSorting] = useState(false);
  const [highlights, setHighlights] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);

  const shuffle = () => {
    const newArray = Array.from(
      { length: 8 },
      () => Math.floor(Math.random() * 100) + 10
    );
    setArray(newArray);
    setHighlights([]);
    setSorted([]);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const mergeSortHelper = async (
    arr: number[],
    start: number,
    end: number
  ): Promise<void> => {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);

    // Highlight divide phase
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setHighlights(range);
    await sleep(600);

    await mergeSortHelper(arr, start, mid);
    await mergeSortHelper(arr, mid + 1, end);
    await merge(arr, start, mid, end);
  };

  const merge = async (
    arr: number[],
    start: number,
    mid: number,
    end: number
  ) => {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);

    let i = 0,
      j = 0,
      k = start;

    // Highlight merging range
    const mergeRange = Array.from(
      { length: end - start + 1 },
      (_, idx) => start + idx
    );
    setHighlights(mergeRange);
    await sleep(400);

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      setArray([...arr]);
      await sleep(300);
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      setArray([...arr]);
      await sleep(300);
      i++;
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      setArray([...arr]);
      await sleep(300);
      j++;
      k++;
    }

    setSorted((prev) => [...new Set([...prev, ...mergeRange])]);
    setHighlights([]);
  };

  const mergeSort = async () => {
    setSorting(true);
    setSorted([]);
    setHighlights([]);

    const arr = [...array];
    await mergeSortHelper(arr, 0, arr.length - 1);

    setSorted(Array.from({ length: arr.length }, (_, i) => i));
    setSorting(false);
  };

  const getBarColor = (index: number) => {
    if (sorted.includes(index)) return "bg-green-500";
    if (highlights.includes(index)) return "bg-yellow-400";
    return "bg-brand";
  };

  const maxValue = Math.max(...array);

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Merge Sort Visualization</h4>

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={mergeSort} disabled={sorting}>
          {sorting ? "Sorting..." : "Play Merge Sort"}
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
          <span>Currently Merging</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Merged</span>
        </div>
      </div>

      <div className="text-sm text-[var(--muted)]">
        <p>• Divides array into halves recursively</p>
        <p>• Merges sorted halves back together</p>
        <p>• O(n log n) time complexity - very efficient!</p>
      </div>
    </div>
  );
}
