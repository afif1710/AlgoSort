import { useState } from "react";

type Entry = {
  key: string;
  value: number;
};

export default function HashMapVisualizer() {
  const [map, setMap] = useState<Map<string, number>>(
    new Map([
      ["apple", 5],
      ["banana", 3],
      ["orange", 7],
    ])
  );
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [searchResult, setSearchResult] = useState<string>("");
  const [highlightKey, setHighlightKey] = useState<string>("");
  const [lastAction, setLastAction] = useState("");

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const hashFunction = (key: string): number => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % 10;
    }
    return hash;
  };

  const insert = async () => {
    if (!keyInput.trim()) return;

    const key = keyInput.trim();
    const value = parseInt(valueInput) || 0;
    const hash = hashFunction(key);

    setHighlightKey(key);
    setLastAction(`Computing hash("${key}") = ${hash}`);
    await sleep(800);

    const newMap = new Map(map);
    const isUpdate = newMap.has(key);
    newMap.set(key, value);
    setMap(newMap);

    setLastAction(
      isUpdate
        ? `Updated "${key}" = ${value}`
        : `Inserted "${key}" = ${value} at bucket ${hash}`
    );
    await sleep(1000);

    setHighlightKey("");
    setKeyInput("");
    setValueInput("");
  };

  const search = async () => {
    if (!searchKey.trim()) return;

    const key = searchKey.trim();
    const hash = hashFunction(key);

    setHighlightKey(key);
    setLastAction(`Searching for "${key}"... hash = ${hash}`);
    await sleep(800);

    if (map.has(key)) {
      setSearchResult(`Found: "${key}" = ${map.get(key)}`);
      setLastAction(`Found "${key}" in bucket ${hash}`);
    } else {
      setSearchResult(`Key "${key}" not found`);
      setLastAction(`Key "${key}" not in map`);
    }

    await sleep(1500);
    setHighlightKey("");
    setSearchKey("");
  };

  const remove = async (key: string) => {
    setHighlightKey(key);
    const hash = hashFunction(key);
    setLastAction(`Removing "${key}" from bucket ${hash}`);
    await sleep(800);

    const newMap = new Map(map);
    newMap.delete(key);
    setMap(newMap);

    setLastAction(`Deleted "${key}"`);
    await sleep(800);
    setHighlightKey("");
  };

  const clear = () => {
    setMap(new Map());
    setLastAction("Cleared all entries");
    setSearchResult("");
  };

  // Group entries by hash bucket
  const buckets: { [bucket: number]: Entry[] } = {};
  map.forEach((value, key) => {
    const hash = hashFunction(key);
    if (!buckets[hash]) buckets[hash] = [];
    buckets[hash].push({ key, value });
  });

  return (
    <div className="card p-4 space-y-4 mt-4">
      <h4 className="font-semibold">Hash Map Visualization</h4>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Insert / Update</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="px-3 py-2 border rounded flex-1 bg-[var(--panel)] text-[var(--fg)]"
            />
            <input
              type="number"
              placeholder="Value"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              className="px-3 py-2 border rounded w-24 bg-[var(--panel)] text-[var(--fg)]"
            />
            <button className="btn" onClick={insert}>
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Key to search"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="px-3 py-2 border rounded flex-1 bg-[var(--panel)] text-[var(--fg)]"
            />
            <button className="btn-outline" onClick={search}>
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="btn-outline text-sm"
          onClick={clear}
          disabled={map.size === 0}
        >
          Clear All
        </button>
      </div>

      {lastAction && (
        <div className="text-sm bg-brand/10 px-3 py-2 rounded">
          <span className="font-semibold">{lastAction}</span>
        </div>
      )}

      {searchResult && (
        <div className="text-sm bg-green-500/10 px-3 py-2 rounded border border-green-500/20">
          <span className="font-semibold text-green-600 dark:text-green-400">
            {searchResult}
          </span>
        </div>
      )}

      <div className="bg-[var(--panel)] p-4 rounded-lg min-h-[300px]">
        {map.size === 0 ? (
          <div className="text-center text-[var(--muted)] py-12">
            Map is empty
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[var(--muted)] mb-4">
              Hash Table (10 buckets)
            </div>

            <div className="grid gap-2">
              {[...Array(10)].map((_, bucket) => (
                <div key={bucket} className="flex items-start gap-3">
                  <div className="bg-slate-600 text-white px-3 py-2 rounded font-mono text-sm min-w-[60px] text-center">
                    [{bucket}]
                  </div>

                  <div className="flex-1 min-h-[40px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded p-2">
                    {buckets[bucket] ? (
                      <div className="flex flex-wrap gap-2">
                        {buckets[bucket].map((entry) => (
                          <div
                            key={entry.key}
                            className={`px-3 py-2 rounded-lg shadow flex items-center gap-2 transition-all ${
                              highlightKey === entry.key
                                ? "ring-4 ring-yellow-400 bg-yellow-100 dark:bg-yellow-900"
                                : "bg-brand text-white"
                            }`}
                          >
                            <span className="font-semibold">{entry.key}</span>
                            <span className="text-white/60">:</span>
                            <span className="font-bold">{entry.value}</span>
                            <button
                              onClick={() => remove(entry.key)}
                              className="ml-2 text-white/80 hover:text-white text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">empty</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-[var(--muted)] space-y-1">
        <p>• Hash function converts keys to bucket indices (0-9)</p>
        <p>• O(1) average time for insert, search, and delete</p>
        <p>• Collisions: multiple keys in same bucket (handled by chaining)</p>
        <p>• Current size: {map.size} entries</p>
      </div>
    </div>
  );
}
