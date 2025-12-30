import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import topics from "../data/topics.json";
import leetcode from "../data/leetcodeProblems.json";
import mathTopics from "../data/mathTopics.json";

interface SearchResult {
  type: "tutorial" | "problem" | "math";
  title: string;
  slug?: string;
  category?: string;
  url?: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const lowerQ = q.toLowerCase();
    const found: SearchResult[] = [];

    // Search tutorials
    (topics as any[]).forEach((t) => {
      const inTitle = t.title.toLowerCase().includes(lowerQ);
      const inSummary = t.summary.toLowerCase().includes(lowerQ);
      const inContent = t.content.some((c: string) =>
        c.toLowerCase().includes(lowerQ)
      );
      if (inTitle || inSummary || inContent) {
        found.push({
          type: "tutorial",
          title: t.title,
          slug: t.slug,
          category: t.category,
        });
      }
    });

    // Search problems
    Object.entries(leetcode as Record<string, any[]>).forEach(
      ([category, problems]) => {
        problems.forEach((p) => {
          const inTitle = p.title.toLowerCase().includes(lowerQ);
          const inCategory = category.toLowerCase().includes(lowerQ);
          if (inTitle || inCategory) {
            found.push({
              type: "problem",
              title: p.title,
              category,
              url: p.url,
            });
          }
        });
      }
    );

    // Search math topics
    (mathTopics as any[]).forEach((m) => {
      const inTitle = m.title.toLowerCase().includes(lowerQ);
      const inSummary = m.summary.toLowerCase().includes(lowerQ);
      const inTags = m.tags.some((tag: string) =>
        tag.toLowerCase().includes(lowerQ)
      );
      if (inTitle || inSummary || inTags) {
        found.push({ type: "math", title: m.title, slug: m.slug });
      }
    });

    setResults(found.slice(0, 15));
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    if (result.type === "tutorial") {
      navigate(`/tutorials/${result.slug}`);
    } else if (result.type === "math") {
      navigate(`/math/${result.slug}`);
    } else if (result.type === "problem") {
      navigate(`/problems?focus=${encodeURIComponent(result.title)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const grouped = {
    tutorial: results.filter((r) => r.type === "tutorial"),
    problem: results.filter((r) => r.type === "problem"),
    math: results.filter((r) => r.type === "math"),
  };

  let globalIdx = -1;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search tutorials, problems, math..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-48 md:w-64 px-3 py-1.5 text-sm rounded-md"
        style={{
          background: "var(--panel)",
          border: "1px solid rgba(148,163,184,.35)",
          color: "var(--fg)",
        }}
      />
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full mt-1 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-50"
          style={{
            background: "var(--panel)",
            border: "1px solid rgba(148,163,184,.35)",
          }}
        >
          {grouped.tutorial.length > 0 && (
            <div>
              <div
                className="px-3 py-2 text-xs font-semibold uppercase"
                style={{ color: "var(--muted)" }}
              >
                Tutorials
              </div>
              {grouped.tutorial.map((r) => {
                globalIdx++;
                const idx = globalIdx;
                return (
                  <div
                    key={`t-${r.slug}`}
                    onClick={() => handleSelect(r)}
                    className="px-3 py-2 cursor-pointer text-sm"
                    style={{
                      background:
                        selectedIndex === idx ? "var(--brand)" : "transparent",
                      color: selectedIndex === idx ? "white" : "var(--fg)",
                    }}
                  >
                    {r.title}
                    <span className="ml-2 text-xs" style={{ opacity: 0.7 }}>
                      {r.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {grouped.problem.length > 0 && (
            <div>
              <div
                className="px-3 py-2 text-xs font-semibold uppercase"
                style={{ color: "var(--muted)" }}
              >
                Problems
              </div>
              {grouped.problem.map((r, i) => {
                globalIdx++;
                const idx = globalIdx;
                return (
                  <div
                    key={`p-${r.title}-${i}`}
                    onClick={() => handleSelect(r)}
                    className="px-3 py-2 cursor-pointer text-sm"
                    style={{
                      background:
                        selectedIndex === idx ? "var(--brand)" : "transparent",
                      color: selectedIndex === idx ? "white" : "var(--fg)",
                    }}
                  >
                    {r.title}
                    <span className="ml-2 text-xs" style={{ opacity: 0.7 }}>
                      {r.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {grouped.math.length > 0 && (
            <div>
              <div
                className="px-3 py-2 text-xs font-semibold uppercase"
                style={{ color: "var(--muted)" }}
              >
                Math
              </div>
              {grouped.math.map((r) => {
                globalIdx++;
                const idx = globalIdx;
                return (
                  <div
                    key={`m-${r.slug}`}
                    onClick={() => handleSelect(r)}
                    className="px-3 py-2 cursor-pointer text-sm"
                    style={{
                      background:
                        selectedIndex === idx ? "var(--brand)" : "transparent",
                      color: selectedIndex === idx ? "white" : "var(--fg)",
                    }}
                  >
                    {r.title}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
