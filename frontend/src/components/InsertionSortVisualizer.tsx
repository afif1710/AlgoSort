import { useState } from "react";
import SpeedControl from "./SpeedControl";

export default function InsertionSortVisualizer() {
  const [array, setArray] = useState<number[]>([12, 11, 13, 5, 6]);
  const [sorting, setSorting] = useState(false);
  const [key, setKey] = useState<number>(-1);
  const [sorted, setSorted] = useState<number[]>([0]);
  const [comparing, setComparing] = useState<number>(-1);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const shuffle = () => {
    const newArray = Array.from(
      { length: 7 },
      () => Math.floor(Math.random() * 100) + 10
    );
    setArray(newArray);
    setKey(-1);
    setSorted([0]);
    setComparing(-1);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  const insertionSort = async () => {
    setSorting(true);
    setSorted([0]);

    const arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      const keyValue = arr[i];
      setKey(i);
      await sleep(500);

      let j = i - 1;

      while (j >= 0 && arr[j] > keyValue) {
        setComparing(j);
        await sleep(300);

        arr[j + 1] = arr[j];
        setArray([...arr]);
        await sleep(300);
        j--;
      }

      arr[j + 1] = keyValue;
      setArray([...arr]);
      setSorted((prev) => [...prev, i]);
      setKey(-1);
      setComparing(-1);
      await sleep(400);
    }

    setSorting(false);
  };

  const getBarColor = (index: number) => {
    if (index === key) return "bg-purple-500";
    if (index === comparing) return "bg-yellow-400";
    if (sorted.includes(index)) return "bg-green-500";
    return "bg-brand";
  };

  const maxValue = Math.max(...array);

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Insertion Sort Visualization</h4>

      <SpeedControl speed={animationSpeed} onSpeedChange={setAnimationSpeed} />

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={insertionSort} disabled={sorting}>
          {sorting ? "Sorting..." : "Play Insertion Sort"}
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
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>Key (being inserted)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>Comparing/Shifting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Sorted Portion</span>
        </div>
      </div>

      <div className="text-sm text-[var(--muted)]">
        <p>• Purple bar is the key being inserted into sorted portion</p>
        <p>• Shifts elements right to make space for the key</p>
        <p>• Like sorting playing cards in your hand</p>
      </div>
    </div>
  );
}
