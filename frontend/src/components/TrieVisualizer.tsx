import React, { useState } from "react";
import SpeedControl from "./SpeedControl";

const TrieVisualizer: React.FC = () => {
  const [words, setWords] = useState<string[]>(["cat", "car", "card", "dog"]);
  const [inputWord, setInputWord] = useState<string>("");
  const [searchWord, setSearchWord] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [operation, setOperation] = useState<"insert" | "search" | null>(null);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / animationSpeed));

  // Build trie structure for visualization
  const buildTrie = () => {
    const root: any = {};
    words.forEach((word) => {
      let node = root;
      word.split("").forEach((char) => {
        if (!node[char]) node[char] = {};
        node = node[char];
      });
      node.isEnd = true;
    });
    return root;
  };

  const trie = buildTrie();

  // Flatten trie for visualization
  const flattenTrie = (node: any, prefix = "", level = 0): any[] => {
    const result: any[] = [];
    Object.keys(node).forEach((key) => {
      if (key === "isEnd") return;
      const newPrefix = prefix + key;
      result.push({
        char: key,
        prefix: newPrefix,
        level,
        isEnd: node[key].isEnd,
      });
      result.push(...flattenTrie(node[key], newPrefix, level + 1));
    });
    return result;
  };

  const nodes = flattenTrie(trie);

  const handleInsert = async () => {
    if (!inputWord || animating) return;
    setAnimating(true);
    setOperation("insert");
    setHighlightedPath([]);
    setMessage(`Inserting "${inputWord}"...`);

    const path: string[] = [];
    for (let i = 0; i < inputWord.length; i++) {
      path.push(inputWord.substring(0, i + 1));
      setHighlightedPath([...path]);
      await sleep(600);
    }

    if (!words.includes(inputWord.toLowerCase())) {
      setWords([...words, inputWord.toLowerCase()]);
    }
    setMessage(`✅ "${inputWord}" inserted successfully!`);
    setHighlightedPath([]);
    setInputWord("");
    setAnimating(false);
  };

  const handleSearch = async () => {
    if (!searchWord || animating) return;
    setAnimating(true);
    setOperation("search");
    setHighlightedPath([]);
    setMessage(`Searching for "${searchWord}"...`);

    const path: string[] = [];
    let found = true;

    for (let i = 0; i < searchWord.length; i++) {
      path.push(searchWord.substring(0, i + 1));
      setHighlightedPath([...path]);
      await sleep(600);

      // Check if path exists in trie
      let node: any = trie;
      for (let j = 0; j <= i; j++) {
        if (!node[searchWord[j]]) {
          found = false;
          break;
        }
        node = node[searchWord[j]];
      }
      if (!found) break;
    }

    if (found && words.includes(searchWord.toLowerCase())) {
      setMessage(`✅ "${searchWord}" found in trie!`);
    } else {
      setMessage(`❌ "${searchWord}" not found in trie.`);
    }

    await sleep(1000);
    setHighlightedPath([]);
    setSearchWord("");
    setAnimating(false);
  };

  const handleRemoveWord = (word: string) => {
    setWords(words.filter((w) => w !== word));
  };

  const loadExample = (type: string) => {
    setHighlightedPath([]);
    setMessage("");
    if (type === "animals") {
      setWords(["cat", "cats", "dog", "dogs", "bird"]);
    } else if (type === "coding") {
      setWords(["code", "coder", "coding", "algorithm", "algo"]);
    } else if (type === "simple") {
      setWords(["a", "an", "and", "ant"]);
    }
  };

  // Calculate node positions
  const getNodePosition = (node: any) => {
    const baseX = 200;
    const baseY = 50;
    const levelGap = 60;
    const siblingGap = 80;

    return {
      x:
        baseX +
        ((node.level -
          nodes.filter(
            (n) => n.prefix === node.prefix.substring(0, node.prefix.length - 1)
          ).length) *
          siblingGap) /
          (node.level + 1),
      y: baseY + node.level * levelGap,
    };
  };

  return (
    <div className="space-y-4">
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          Trie (Prefix Tree) Visualizer
        </h3>

        <div className="space-y-4">
          <SpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />

          {/* Insert Word */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Insert Word:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value.toLowerCase())}
                placeholder="Enter word"
                className="flex-1 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
                onKeyPress={(e) => e.key === "Enter" && handleInsert()}
              />
              <button
                onClick={handleInsert}
                disabled={animating || !inputWord}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "var(--brand)",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                Insert
              </button>
            </div>
          </div>

          {/* Search Word */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Search Word:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value.toLowerCase())}
                placeholder="Enter word to search"
                className="flex-1 px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  borderColor: "var(--brand)",
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={animating || !searchWord}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: animating ? "#64748b" : "#10b981",
                  color: "white",
                  cursor: animating ? "not-allowed" : "pointer",
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Examples */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Load Examples:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample("simple")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Simple (a, an, and)
              </button>
              <button
                onClick={() => loadExample("animals")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Animals
              </button>
              <button
                onClick={() => loadExample("coding")}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--card-hover-bg)",
                  color: "var(--fg)",
                }}
              >
                Coding Terms
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className="p-4 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
            >
              {message}
            </div>
          )}

          {/* Current Words */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--fg)" }}
            >
              Words in Trie ({words.length}):
            </label>
            <div
              className="flex gap-2 flex-wrap max-h-32 overflow-y-auto p-2 rounded"
              style={{ backgroundColor: "var(--bg)" }}
            >
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded text-sm flex items-center gap-2"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                >
                  {word}
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="text-xs"
                    style={{ color: "white" }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Tree Representation */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--panel)" }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--fg)" }}
        >
          Tree Structure
        </h3>
        <div className="overflow-x-auto">
          <div
            className="p-4 rounded"
            style={{ backgroundColor: "var(--bg)", minHeight: "300px" }}
          >
            <div className="font-mono text-sm" style={{ color: "var(--fg)" }}>
              <div className="mb-2 font-bold">Root</div>
              {nodes.slice(0, 20).map((node, idx) => {
                const isHighlighted = highlightedPath.some(
                  (p) => node.prefix.startsWith(p) || p.startsWith(node.prefix)
                );
                return (
                  <div
                    key={idx}
                    className="transition-all duration-300"
                    style={{
                      marginLeft: `${node.level * 20}px`,
                      color: isHighlighted ? "#fbbf24" : "var(--fg)",
                      fontWeight: isHighlighted ? "bold" : "normal",
                      fontSize: isHighlighted ? "16px" : "14px",
                    }}
                  >
                    {node.char} {node.isEnd && "✓"}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="mt-4 flex gap-4 text-sm flex-wrap"
          style={{ color: "var(--fg)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "var(--fg)" }}
            ></div>
            <span>Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#fbbf24" }}
            ></div>
            <span>Active Path</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓ = End of Word</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{ backgroundColor: "var(--panel)", color: "var(--fg)" }}
      >
        <p>
          <strong>💡 How Trie Works:</strong>
        </p>
        <ul className="mt-2 space-y-1 ml-4 text-xs">
          <li>
            • Each node represents a character, path from root spells words
          </li>
          <li>• Insert/Search takes O(m) time where m = word length</li>
          <li>• Efficient for prefix matching and autocomplete systems</li>
          <li>• Saves space when words share common prefixes</li>
        </ul>
      </div>
    </div>
  );
};

export default TrieVisualizer;
