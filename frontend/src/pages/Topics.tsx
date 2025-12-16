import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import topics from "../data/topics.json";

export default function Topics() {
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    // ✅ ADDED: py-6 wrapper for padding
    <div className="py-6 min-h-screen">
      {/* Level Navigation - Dynamic Position */}
      <div
        className={`level-nav-container ${isScrolled ? "scrolled" : ""}`}
        style={{
          backgroundColor: isScrolled
            ? "rgba(129, 140, 248, 0.15)"
            : "rgba(var(--bg-rgb), 0.8)",
          borderBottom: isScrolled ? "2px solid var(--brand)" : "none",
          boxShadow: isScrolled
            ? "0 6px 20px rgba(99, 102, 241, 0.25)"
            : "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => scrollToSection("beginner")}
              className="level-nav-btn px-8 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300"
              style={{
                backgroundColor: "var(--panel)",
                color: "var(--fg)",
                border: "2px solid var(--brand)",
              }}
            >
              Beginner
            </button>
            <button
              onClick={() => scrollToSection("intermediate")}
              className="level-nav-btn px-8 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300"
              style={{
                backgroundColor: "var(--panel)",
                color: "var(--fg)",
                border: "2px solid var(--brand)",
              }}
            >
              Intermediate
            </button>
            <button
              onClick={() => scrollToSection("advanced")}
              className="level-nav-btn px-8 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300"
              style={{
                backgroundColor: "var(--panel)",
                color: "var(--fg)",
                border: "2px solid var(--brand)",
              }}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2
          className="text-3xl font-bold mb-16 text-center"
          style={{ color: "var(--fg)" }}
        >
          Master Data Structures & Algorithms
        </h2>

        <div className="space-y-24">
          {levels.map((level) => {
            const levelTopics = topics.filter((t) => t.level === level);
            const categories: Record<string, typeof topics> = {};

            levelTopics.forEach((t) => {
              if (!categories[t.category]) categories[t.category] = [];
              categories[t.category].push(t);
            });

            if (levelTopics.length === 0) return null;

            return (
              <section
                key={level}
                id={level.toLowerCase()}
                className="scroll-mt-32"
              >
                {/* Level Badge */}
                <div className="flex justify-center mb-12">
                  <div
                    className="px-16 py-5 rounded-2xl text-3xl font-bold shadow-xl"
                    style={{
                      backgroundColor: "var(--brand)",
                      color: "white",
                    }}
                  >
                    {level}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-10">
                  {Object.entries(categories).map(([category, list]) => (
                    <div key={category}>
                      <h4
                        className="text-xl font-semibold mb-6 pb-2 border-b-2"
                        style={{
                          color: "var(--fg)",
                          borderBottomColor: "var(--brand)",
                        }}
                      >
                        {category}
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {list.map((t) => (
                          <Link
                            to={`/tutorials/${t.slug}`}
                            key={t.slug}
                            className="topic-card p-6 rounded-xl cursor-pointer group transition-all duration-300"
                            style={{
                              backgroundColor: "var(--panel)",
                              border: "1px solid transparent",
                            }}
                          >
                            <div
                              className="font-bold text-lg mb-3 transition-colors duration-300"
                              style={{ color: "var(--fg)" }}
                            >
                              {t.title}
                            </div>
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: "var(--muted)" }}
                            >
                              {t.summary}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
