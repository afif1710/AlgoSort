import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentViz, setCurrentViz] = useState(0);

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentViz((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-16 max-w-4xl animate-fade-in">
        {/* Main Title with Gradient */}
        <h1
          className="text-5xl md:text-7xl font-bold mb-4"
          style={{
            background:
              "linear-gradient(135deg, var(--brand) 0%, #a855f7 50%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            paddingBottom: "0.2em",
          }}
        >
          AlgoSort
        </h1>

        <h2
          className="text-2xl md:text-4xl font-semibold"
          style={{ color: "var(--fg)" }}
        >
          Master Data Structures & Algorithms
        </h2>

        <p
          className="text-lg md:text-xl max-w-2xl mx-auto"
          style={{ color: "var(--muted)" }}
        >
          Interactive tutorials, visual animations, and practice
          problems—organized by level so you can learn faster
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Link
            to="/tutorials"
            className="btn px-8 py-4 text-lg font-semibold rounded-lg transition-transform hover:scale-105"
          >
            Start Learning →
          </Link>
          <Link
            to="/problems"
            className="btn-outline px-8 py-4 text-lg font-semibold rounded-lg transition-transform hover:scale-105"
          >
            Practice Problems
          </Link>
        </div>
      </div>

      {/* Interactive Carousel Cards */}
      <div className="w-full max-w-5xl mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sorting Card */}
          <div
            className="card p-8 text-center cursor-pointer"
            style={{
              transform: currentViz === 0 ? "scale(1.05)" : "scale(1)",
              opacity: currentViz === 0 ? 1 : 0.7,
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={() => setCurrentViz(0)}
          >
            <div className="text-5xl mb-4">📊</div>
            <h3
              className="text-xl font-bold mb-3"
              style={{ color: "var(--fg)" }}
            >
              Sorting Algorithms
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Bubble, Selection, Merge, Quick Sort
            </p>

            {/* Animated Bars */}
            <div className="flex gap-2 justify-center items-end h-24">
              {[60, 90, 40, 100, 70, 50, 85].map((height, i) => (
                <div
                  key={i}
                  className="w-3 rounded-t transition-all duration-700"
                  style={{
                    height: currentViz === 0 ? `${height}%` : "20%",
                    backgroundColor:
                      currentViz === 0 ? "var(--brand)" : "var(--muted)",
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Trees Card */}
          <div
            className="card p-8 text-center cursor-pointer"
            style={{
              transform: currentViz === 1 ? "scale(1.05)" : "scale(1)",
              opacity: currentViz === 1 ? 1 : 0.7,
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={() => setCurrentViz(1)}
          >
            <div className="text-5xl mb-4">🌳</div>
            <h3
              className="text-xl font-bold mb-3"
              style={{ color: "var(--fg)" }}
            >
              Tree Structures
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Binary Trees, BST, Traversals, BFS
            </p>

            {/* Animated Tree */}
            <div className="flex flex-col items-center gap-2 h-24 justify-center">
              <div
                className="w-8 h-8 rounded-full transition-all duration-500"
                style={{
                  backgroundColor:
                    currentViz === 1 ? "var(--brand)" : "var(--muted)",
                  opacity: currentViz === 1 ? 1 : 0.4,
                }}
              />
              <div className="flex gap-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor:
                        currentViz === 1 ? "var(--brand)" : "var(--muted)",
                      opacity: currentViz === 1 ? 0.8 : 0.3,
                      transitionDelay: `${(i + 1) * 200}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor:
                        currentViz === 1 ? "var(--brand)" : "var(--muted)",
                      opacity: currentViz === 1 ? 0.6 : 0.2,
                      transitionDelay: `${(i + 3) * 200}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Graphs Card */}
          <div
            className="card p-8 text-center cursor-pointer"
            style={{
              transform: currentViz === 2 ? "scale(1.05)" : "scale(1)",
              opacity: currentViz === 2 ? 1 : 0.7,
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={() => setCurrentViz(2)}
          >
            <div className="text-5xl mb-4">🕸️</div>
            <h3
              className="text-xl font-bold mb-3"
              style={{ color: "var(--fg)" }}
            >
              Graph Algorithms
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              DFS, BFS, Dijkstra, Topological Sort
            </p>

            {/* Animated Graph Network */}
            <div className="relative h-24 flex items-center justify-center">
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * 72 * Math.PI) / 180;
                const x = Math.cos(angle) * 35;
                const y = Math.sin(angle) * 35;
                return (
                  <div
                    key={i}
                    className="absolute w-6 h-6 rounded-full transition-all duration-500"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: "translate(-50%, -50%)",
                      backgroundColor:
                        currentViz === 2 ? "var(--brand)" : "var(--muted)",
                      opacity: currentViz === 2 ? 1 : 0.4,
                      transitionDelay: `${i * 150}ms`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-2 justify-center mt-6">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setCurrentViz(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor:
                  currentViz === i ? "var(--brand)" : "var(--muted)",
                opacity: currentViz === i ? 1 : 0.4,
                transform: currentViz === i ? "scale(1.5)" : "scale(1)",
              }}
              aria-label={`View ${["Sorting", "Trees", "Graphs"][i]}`}
            />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex gap-12 flex-wrap justify-center text-center">
        <div className="space-y-2">
          <div
            className="text-4xl md:text-5xl font-bold"
            style={{ color: "var(--brand)" }}
          >
            31+
          </div>
          <div
            className="text-sm md:text-base"
            style={{ color: "var(--muted)" }}
          >
            Interactive Topics
          </div>
        </div>
        <div className="space-y-2">
          <div
            className="text-4xl md:text-5xl font-bold"
            style={{ color: "var(--brand)" }}
          >
            30+
          </div>
          <div
            className="text-sm md:text-base"
            style={{ color: "var(--muted)" }}
          >
            Visual Animations
          </div>
        </div>
        <div className="space-y-2">
          <div
            className="text-4xl md:text-5xl font-bold"
            style={{ color: "var(--brand)" }}
          >
            200+
          </div>
          <div
            className="text-sm md:text-base"
            style={{ color: "var(--muted)" }}
          >
            Practice Problems
          </div>
        </div>
      </div>
    </div>
  );
}
