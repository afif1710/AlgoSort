import { useState } from "react";

type Node = {
  value: number;
  id: number;
};

export default function LinkedListVisualizer() {
  const [list, setList] = useState<Node[]>([
    { value: 10, id: 1 },
    { value: 20, id: 2 },
    { value: 30, id: 3 },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [lastAction, setLastAction] = useState("");
  const [nextId, setNextId] = useState(4);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const insertAtHead = async () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 100);
    const newNode = { value: val, id: nextId };
    setNextId((prev) => prev + 1);
    setList((prev) => [newNode, ...prev]);
    setLastAction(`Inserted ${val} at head`);
    setHighlightIndex(0);
    await sleep(1000);
    setHighlightIndex(-1);
    setInputVal("");
  };

  const insertAtTail = async () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 100);
    const newNode = { value: val, id: nextId };
    setNextId((prev) => prev + 1);
    setList((prev) => [...prev, newNode]);
    setLastAction(`Inserted ${val} at tail`);
    setHighlightIndex(list.length);
    await sleep(1000);
    setHighlightIndex(-1);
    setInputVal("");
  };

  const deleteHead = async () => {
    if (list.length > 0) {
      setHighlightIndex(0);
      await sleep(500);
      const val = list[0].value;
      setList((prev) => prev.slice(1));
      setLastAction(`Deleted head (${val})`);
      setHighlightIndex(-1);
    }
  };

  const deleteTail = async () => {
    if (list.length > 0) {
      setHighlightIndex(list.length - 1);
      await sleep(500);
      const val = list[list.length - 1].value;
      setList((prev) => prev.slice(0, -1));
      setLastAction(`Deleted tail (${val})`);
      setHighlightIndex(-1);
    }
  };

  const traverse = async () => {
    setLastAction("Traversing list...");
    for (let i = 0; i < list.length; i++) {
      setHighlightIndex(i);
      await sleep(600);
    }
    setHighlightIndex(-1);
    setLastAction("Traversal complete");
  };

  const reverse = async () => {
    setLastAction("Reversing list...");
    const reversed = [...list].reverse();

    for (let i = 0; i < list.length; i++) {
      setHighlightIndex(i);
      await sleep(400);
    }

    setList(reversed);
    setHighlightIndex(-1);
    setLastAction("List reversed!");
  };

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Linked List Visualization</h4>

      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="number"
          placeholder="Value"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="px-3 py-2 border rounded w-24 bg-[var(--panel)] text-[var(--fg)]"
        />
        <button className="btn text-sm" onClick={insertAtHead}>
          Insert at Head
        </button>
        <button className="btn text-sm" onClick={insertAtTail}>
          Insert at Tail
        </button>
        <button
          className="btn-outline text-sm"
          onClick={deleteHead}
          disabled={list.length === 0}
        >
          Delete Head
        </button>
        <button
          className="btn-outline text-sm"
          onClick={deleteTail}
          disabled={list.length === 0}
        >
          Delete Tail
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          className="btn-outline text-sm"
          onClick={traverse}
          disabled={list.length === 0}
        >
          Traverse
        </button>
        <button
          className="btn-outline text-sm"
          onClick={reverse}
          disabled={list.length === 0}
        >
          Reverse
        </button>
      </div>

      {lastAction && (
        <div className="text-sm bg-brand/10 px-3 py-2 rounded">
          Action: <span className="font-semibold">{lastAction}</span>
        </div>
      )}

      <div className="bg-[var(--panel)] p-6 rounded-lg min-h-[200px] flex items-center justify-center overflow-x-auto">
        {list.length === 0 ? (
          <span className="text-[var(--muted)]">List is empty (null)</span>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted)] font-semibold">
              HEAD →
            </span>

            {list.map((node, idx) => (
              <div key={node.id} className="flex items-center gap-3">
                <div
                  className={`relative transition-all duration-300 ${
                    idx === highlightIndex
                      ? "ring-4 ring-yellow-400 scale-110"
                      : ""
                  }`}
                >
                  <div className="bg-brand text-white rounded-lg shadow-lg flex flex-col">
                    <div className="px-5 py-3 border-b border-white/20">
                      <div className="text-xs text-white/60">Data</div>
                      <div className="font-bold text-xl">{node.value}</div>
                    </div>
                    <div className="px-5 py-2 bg-brand-dark rounded-b-lg">
                      <div className="text-xs text-white/60">Next</div>
                      <div className="text-sm font-mono">
                        {idx < list.length - 1 ? "→" : "null"}
                      </div>
                    </div>
                  </div>

                  {idx === 0 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-green-500 text-white px-2 py-1 rounded whitespace-nowrap">
                      Head
                    </div>
                  )}

                  {idx === list.length - 1 && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-red-500 text-white px-2 py-1 rounded whitespace-nowrap">
                      Tail
                    </div>
                  )}
                </div>

                {idx < list.length - 1 && (
                  <svg width="40" height="30" className="flex-shrink-0">
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3, 0 6"
                          fill="currentColor"
                          className="text-brand"
                        />
                      </marker>
                    </defs>
                    <line
                      x1="0"
                      y1="15"
                      x2="35"
                      y2="15"
                      stroke="currentColor"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      className="text-brand"
                    />
                  </svg>
                )}
              </div>
            ))}

            <span className="text-sm text-[var(--muted)] font-semibold">
              → null
            </span>
          </div>
        )}
      </div>

      <div className="text-sm text-[var(--muted)] space-y-1">
        <p>• Each node contains data and a pointer to the next node</p>
        <p>• Head is the first node, Tail points to null</p>
        <p>• Length: {list.length} nodes</p>
        <p>• Insert at head: O(1), Insert at tail: O(1) with tail pointer</p>
      </div>
    </div>
  );
}
