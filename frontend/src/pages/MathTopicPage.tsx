import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import mathTopics from "../data/mathTopics.json";

interface MathTopic {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  summary: string;
  tags: string[];
  content: string[];
  example: {
    language: string;
    code: string;
  };
}

export default function MathTopicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const topic = (mathTopics as MathTopic[]).find((t) => t.slug === slug);

  if (!topic) {
    return (
      <div className="py-6 text-center">
        <h2 className="text-2xl font-bold">Topic not found</h2>
        <button onClick={() => navigate("/math")} className="btn mt-4">
          Back to Math Topics
        </button>
      </div>
    );
  }

  const difficultyColors = {
    Easy: "#22c55e",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate("/math")}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all"
          style={{
            backgroundColor: "var(--card-hover-bg)",
            color: "var(--fg)",
            border: "1px solid var(--brand)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brand)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--card-hover-bg)";
            e.currentTarget.style.color = "var(--fg)";
          }}
        >
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <span
            className="text-sm px-3 py-1 rounded font-medium"
            style={{
              backgroundColor: difficultyColors[topic.difficulty],
              color: "white",
            }}
          >
            {topic.difficulty}
          </span>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Math for CP/DSA
          </span>
        </div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--fg)" }}>
          {topic.title}
        </h1>
        <p style={{ color: "var(--muted)" }}>{topic.summary}</p>
        <div className="flex flex-wrap gap-2">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded"
              style={{ background: "var(--panel)", color: "var(--brand)" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <section className="card p-4 space-y-3">
        <h3 className="font-semibold">Concept</h3>
        {topic.content.map((p, i) => (
          <p key={i} style={{ color: "var(--fg)" }}>
            {p}
          </p>
        ))}
      </section>

      <section className="card p-4 space-y-3">
        <h3 className="font-semibold">
          Example Code ({topic.example.language})
        </h3>
        <pre className="bg-[var(--panel)] p-4 rounded-lg overflow-x-auto">
          <code className="text-sm">{topic.example.code}</code>
        </pre>
      </section>
    </div>
  );
}
