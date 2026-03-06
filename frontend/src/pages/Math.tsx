// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import { Link } from "react-router-dom";
import mathTopics from "../data/mathTopics.json";
import Seo from "../components/seo/Seo";

interface MathTopic {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  summary: string;
  tags: string[];
  frequency?: "very-common" | "common" | "rare";
}

export default function Math() {
  const topics = mathTopics as MathTopic[];
  const easy = topics.filter((t) => t.difficulty === "Easy");
  const medium = topics.filter((t) => t.difficulty === "Medium");
  const hard = topics.filter((t) => t.difficulty === "Hard");

  const difficultyColors = {
    Easy: "#22c55e",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  };

  const frequencyStyles: Record<string, { bg: string; color: string }> = {
    "very-common": { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
    common: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    rare: { bg: "rgba(148,163,184,0.15)", color: "var(--muted)" },
  };

  const renderSection = (title: string, items: MathTopic[], color: string) => (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h3
          className="text-xl font-bold px-4 py-2 rounded-lg"
          style={{ backgroundColor: color, color: "white" }}
        >
          {title}
        </h3>
        <span style={{ color: "var(--muted)" }}>({items.length} topics)</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((topic) => (
          <Link
            key={topic.slug}
            to={`/math/${topic.slug}`}
            className="card p-4 space-y-2 hover:border-[var(--brand)] transition-all"
          >
            <div className="flex items-start justify-between">
              <h4 className="font-semibold" style={{ color: "var(--fg)" }}>
                {topic.title}
              </h4>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {topic.frequency && frequencyStyles[topic.frequency] && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: frequencyStyles[topic.frequency].bg,
                      color: frequencyStyles[topic.frequency].color,
                    }}
                  >
                    {topic.frequency}
                  </span>
                )}
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: color, color: "white" }}
                >
                  {topic.difficulty}
                </span>
              </div>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {topic.summary}
            </p>
            <div className="flex flex-wrap gap-1">
              {topic.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ background: "var(--panel)", color: "var(--muted)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="py-6 space-y-10">
      <Seo 
        title="Math for CP & DSA | AlgoSort"
        description="Master essential mathematical concepts for competitive programming and technical interviews."
        canonical="https://algo-sort-cyan.vercel.app/math"
      />
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: "var(--fg)" }}>
          Math for CP/DSA
        </h1>
        <p style={{ color: "var(--muted)" }}>
          Essential mathematical concepts for competitive programming and DSA
          interviews
        </p>
      </header>

      {renderSection("Easy", easy, difficultyColors.Easy)}
      {renderSection("Medium", medium, difficultyColors.Medium)}
      {renderSection("Hard", hard, difficultyColors.Hard)}
    </div>
  );
}
