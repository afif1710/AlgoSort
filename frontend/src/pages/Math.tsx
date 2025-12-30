import { Link } from "react-router-dom";
import mathTopics from "../data/mathTopics.json";

interface MathTopic {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  summary: string;
  tags: string[];
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
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: color, color: "white" }}
              >
                {topic.difficulty}
              </span>
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
