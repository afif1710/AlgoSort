// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import mathTopics from "../data/mathTopics.json";
import PatternBlock from "../components/math/PatternBlock";
import PracticeList from "../components/math/PracticeList";
import MathNotesTab from "../components/math/MathNotesTab";
import MicroCheck from "../components/math/MicroCheck";
import TeachingBlock, { TeachingData } from "../components/math/TeachingBlock";

// Lazy-loaded visualizers
const PrefixSum1DVisualizer = lazy(
  () => import("../components/math/visualizers/PrefixSum1DVisualizer")
);
const PrefixSum2DVisualizer = lazy(
  () => import("../components/math/visualizers/PrefixSum2DVisualizer")
);
const DifferenceArrayVisualizer = lazy(
  () => import("../components/math/visualizers/DifferenceArrayVisualizer")
);
const ExpectedValueSimulatorVisualizer = lazy(
  () => import("../components/math/visualizers/ExpectedValueSimulatorVisualizer")
);
const InclusionExclusionVisualizer = lazy(
  () => import("../components/math/visualizers/InclusionExclusionVisualizer")
);
const ModularArithmeticPlaygroundVisualizer = lazy(
  () => import("../components/math/visualizers/ModularArithmeticPlaygroundVisualizer")
);
const CRTVisualizer = lazy(
  () => import("../components/math/visualizers/CRTVisualizer")
);
const MobiusInversionVisualizer = lazy(
  () => import("../components/math/visualizers/MobiusInversionVisualizer")
);
const ConvolutionNTTVisualizer = lazy(
  () => import("../components/math/visualizers/ConvolutionNTTVisualizer")
);

const visualizerMap: Record<string, React.LazyExoticComponent<React.FC>> = {
  "prefix-1d": PrefixSum1DVisualizer,
  "prefix-2d": PrefixSum2DVisualizer,
  "diff-array": DifferenceArrayVisualizer,
  "expected-value-sim": ExpectedValueSimulatorVisualizer,
  "inclusion-exclusion": InclusionExclusionVisualizer,
  "modular-playground": ModularArithmeticPlaygroundVisualizer,
  "crt": CRTVisualizer,
  "mobius": MobiusInversionVisualizer,
  "convolution-ntt": ConvolutionNTTVisualizer,
};

interface MathTopic {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  summary: string;
  tags: string[];
  content: string[];
  example: { language: string; code: string };
  // Structured Teaching (Phase 4)
  teaching?: TeachingData;
  // Phase 1 extensions (optional)
  prerequisites?: string[];
  frequency?: string;
  patterns?: Array<{ ifYouSee: string[]; think: string; why: string }>;
  pitfalls?: string[];
  complexities?: { time: string; space: string; note?: string };
  bridges?: Array<{ to: string; example: string; link?: string }>;
  problems?: Array<{
    platform: string;
    title: string;
    url: string;
    difficulty?: string;
    why: string;
  }>;
  visualizers?: Array<{ key: string; enabled: boolean }>;
  microChecks?: Array<{ question: string; answer: string; hint?: string }>;
}

type TabType = "learn" | "code" | "practice" | "notes";

const VisualizerFallback = () => (
  <div
    className="p-8 rounded-lg text-center animate-pulse"
    style={{ backgroundColor: "var(--panel)", color: "var(--muted)" }}
  >
    Loading visualizer...
  </div>
);

export default function MathTopicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("learn");

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab("learn");
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

  const tabs: { id: TabType; label: string }[] = [
    { id: "learn", label: "Learn" },
    { id: "code", label: "Example Code" },
    { id: "practice", label: "Practice problems" },
    { id: "notes", label: "Notes" },
  ];

  const enabledVisualizers = (topic.visualizers || []).filter((v) => v.enabled);

  return (
    <div className="py-6 space-y-6">
      {/* Back button */}
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

      {/* Header */}
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
          {topic.frequency && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background:
                  topic.frequency === "very-common"
                    ? "rgba(34,197,94,0.15)"
                    : topic.frequency === "common"
                    ? "rgba(245,158,11,0.15)"
                    : "rgba(148,163,184,0.15)",
                color:
                  topic.frequency === "very-common"
                    ? "#22c55e"
                    : topic.frequency === "common"
                    ? "#f59e0b"
                    : "var(--muted)",
              }}
            >
              {topic.frequency}
            </span>
          )}
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

      {/* Tabs */}
      <div
        className="flex gap-2 border-b overflow-x-auto scrollbar-hide whitespace-nowrap"
        style={{ borderColor: "rgba(148,163,184,.35)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 text-sm font-medium transition-all relative flex-shrink-0"
            style={{
              color: activeTab === tab.id ? "var(--brand)" : "var(--muted)",
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: "var(--brand)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ─── Learn Tab ─── */}
      {activeTab === "learn" && (
        <>
          {/* Pattern Recognition */}
          {topic.patterns && topic.patterns.length > 0 && (
            <section className="card p-4">
              <PatternBlock patterns={topic.patterns} />
            </section>
          )}

          {/* Concept / Teaching Block */}
          {topic.teaching ? (
            <TeachingBlock teaching={topic.teaching} />
          ) : (
            <section className="card p-4 space-y-3">
              <h3 className="font-semibold">Concept</h3>
              {topic.content.map((p, i) => (
                <p key={i} style={{ color: "var(--fg)" }}>
                  {p}
                </p>
              ))}
            </section>
          )}

          {/* Visualizers */}
          {enabledVisualizers.length > 0 && (
            <section className="space-y-4">
              {enabledVisualizers.map((v) => {
                const Component = visualizerMap[v.key];
                if (!Component) return null;
                return (
                  <Suspense key={v.key} fallback={<VisualizerFallback />}>
                    <Component />
                  </Suspense>
                );
              })}
            </section>
          )}

          {/* Bridges */}
          {topic.bridges && topic.bridges.length > 0 && (
            <section className="card p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span>🔗</span> Related Topics
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {topic.bridges.map((b, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: "var(--bg)",
                      border: "1px solid rgba(148,163,184,.25)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: "rgba(99,102,241,0.15)",
                          color: "var(--brand)",
                        }}
                      >
                        {b.to}
                      </span>
                    </div>
                    <div style={{ color: "var(--fg)" }}>{b.example}</div>
                    {b.link && (
                      <a href={b.link} className="text-xs link mt-1 block">
                        View topic →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ─── Code Tab ─── */}
      {activeTab === "code" && (
        <section className="card p-4 space-y-3">
          <h3 className="font-semibold text-lg">
            Example Implementation ({topic.example.language})
          </h3>
          <p className="text-sm text-[var(--muted)]">
            A clean, optimized version in {topic.example.language} covering the core algorithm.
          </p>
          <pre className="bg-[var(--panel)] p-4 rounded-lg overflow-x-auto border" style={{ borderColor: 'rgba(148,163,184,0.1)' }}>
            <code className="text-sm">{topic.example.code}</code>
          </pre>
        </section>
      )}

      {/* ─── Practice Tab ─── */}
      {activeTab === "practice" && (
        <div className="space-y-6">
          <PracticeList problems={topic.problems || []} />
          {topic.microChecks && topic.microChecks.length > 0 && (
            <MicroCheck topicSlug={topic.slug} checks={topic.microChecks} />
          )}
        </div>
      )}

      {/* ─── Notes Tab ─── */}
      {activeTab === "notes" && (
        <MathNotesTab
          topicSlug={topic.slug}
          pitfalls={topic.pitfalls}
          complexities={topic.complexities}
        />
      )}
    </div>
  );
}
