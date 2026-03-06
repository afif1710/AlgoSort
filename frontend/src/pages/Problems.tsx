// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import data from "../data/leetcodeProblems.json";
import Seo from "../components/seo/Seo";

export default function Problems() {
  const [searchParams] = useSearchParams();
  const focusTitle = searchParams.get("focus");
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (focusTitle && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        if (highlightedRef.current) {
          highlightedRef.current.style.boxShadow = "";
          highlightedRef.current.style.borderColor = "";
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [focusTitle]);

  return (
    <div className="py-6 space-y-6">
      <Seo 
        title="Practice Problems | AlgoSort"
        description="Curated LeetCode problems organized by concept to help you practice and test your Data Structures & Algorithms knowledge."
        canonical="https://algo-sort-cyan.vercel.app/problems"
      />
      <h2 className="text-2xl font-bold">Problems (LeetCode)</h2>

      {Object.entries(data).map(([topic, list]) => (
        <section key={topic} className="space-y-3">
          <h3 className="text-xl font-semibold">{topic}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(list as any[]).map((p, idx) => {
              const isHighlighted =
                focusTitle && p.title === decodeURIComponent(focusTitle);
              return (
                <div
                  key={idx}
                  ref={isHighlighted ? highlightedRef : null}
                  className="card p-4 transition-all"
                  style={{
                    boxShadow: isHighlighted
                      ? "0 0 0 3px var(--brand), 0 0 20px rgba(99, 102, 241, 0.4)"
                      : undefined,
                    borderColor: isHighlighted ? "var(--brand)" : undefined,
                  }}
                >
                  <a
                    className="font-semibold link"
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.title}
                  </a>
                  <div className="text-sm text-[var(--muted)]">
                    {p.difficulty}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
