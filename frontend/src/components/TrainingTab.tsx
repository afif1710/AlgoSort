// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import { useState, useEffect } from "react";
import quizzes from "../data/topicQuizzes.json";
import { getQuizStat, saveQuizStat } from "../utils/storage";

interface MCQQuestion {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface TrueFalseQuestion {
  id: string;
  type: "true_false";
  question: string;
  correctAnswer: boolean;
  explanation?: string;
}

interface ShortQuestion {
  id: string;
  type: "short";
  question: string;
  correctAnswer: string;
  explanation?: string;
}

type QuizQuestion = MCQQuestion | TrueFalseQuestion | ShortQuestion;

interface Props {
  topicSlug: string;
}

export default function TrainingTab({ topicSlug }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [stats, setStats] = useState<{
    bestPercent: number;
    attempts: number;
  } | null>(null);

  useEffect(() => {
    const map = quizzes as unknown as Record<string, QuizQuestion[]>;
    const qs = map[topicSlug] ?? [];
    setQuestions(qs); // ← ADD THIS LINE
    setAnswers({});
    setSubmitted(false);
    setScore({ correct: 0, total: 0 });
    const savedStats = getQuizStat(topicSlug);
    setStats(
      savedStats
        ? { bestPercent: savedStats.bestPercent, attempts: savedStats.attempts }
        : null
    );
  }, [topicSlug]);

  const handleAnswer = (qId: string, value: any) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      const userAns = answers[q.id];
      if (q.type === "mcq" && userAns === q.correctIndex) correct++;
      if (q.type === "true_false" && userAns === q.correctAnswer) correct++;
      if (q.type === "short") {
        const normalized = (userAns || "").trim().toLowerCase();
        const expected = q.correctAnswer.trim().toLowerCase();
        if (normalized === expected) correct++;
      }
    });
    const total = questions.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    setScore({ correct, total });
    setSubmitted(true);

    const existing = getQuizStat(topicSlug);
    const newStat = {
      bestPercent: Math.max(existing?.bestPercent || 0, percent),
      lastPercent: percent,
      attempts: (existing?.attempts || 0) + 1,
      lastAttemptAt: new Date().toISOString(),
    };
    saveQuizStat(topicSlug, newStat);
    setStats({ bestPercent: newStat.bestPercent, attempts: newStat.attempts });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore({ correct: 0, total: 0 });
  };

  if (questions.length === 0) {
    return (
      <div className="card p-6 text-center" style={{ color: "var(--muted)" }}>
        No quiz available for this topic yet.
      </div>
    );
  }

  const isCorrect = (q: QuizQuestion) => {
    const userAns = answers[q.id];
    if (q.type === "mcq") return userAns === q.correctIndex;
    if (q.type === "true_false") return userAns === q.correctAnswer;
    if (q.type === "short") {
      return (
        (userAns || "").trim().toLowerCase() ===
        q.correctAnswer.trim().toLowerCase()
      );
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="flex gap-4 text-sm" style={{ color: "var(--muted)" }}>
          <span>Best: {stats.bestPercent}%</span>
          <span>Attempts: {stats.attempts}</span>
        </div>
      )}

      {questions.map((q, idx) => (
        <div
          key={q.id}
          className="card p-4 space-y-3"
          style={{
            borderColor: submitted
              ? isCorrect(q)
                ? "#22c55e"
                : "#ef4444"
              : undefined,
            borderWidth: submitted ? "2px" : undefined,
          }}
        >
          <div className="font-medium">
            {idx + 1}. {q.question}
          </div>

          {q.type === "mcq" && (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded"
                  style={{
                    background:
                      submitted && i === q.correctIndex
                        ? "rgba(34,197,94,0.2)"
                        : submitted &&
                          answers[q.id] === i &&
                          i !== q.correctIndex
                        ? "rgba(239,68,68,0.2)"
                        : answers[q.id] === i
                        ? "var(--card-hover-bg)"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === i}
                    onChange={() => handleAnswer(q.id, i)}
                    disabled={submitted}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === "true_false" && (
            <div className="flex gap-4">
              {[true, false].map((val) => (
                <label
                  key={String(val)}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded"
                  style={{
                    background:
                      submitted && val === q.correctAnswer
                        ? "rgba(34,197,94,0.2)"
                        : submitted &&
                          answers[q.id] === val &&
                          val !== q.correctAnswer
                        ? "rgba(239,68,68,0.2)"
                        : answers[q.id] === val
                        ? "var(--card-hover-bg)"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === val}
                    onChange={() => handleAnswer(q.id, val)}
                    disabled={submitted}
                  />
                  <span>{val ? "True" : "False"}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === "short" && (
            <div>
              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
                disabled={submitted}
                placeholder="Type your answer..."
                className="w-full px-3 py-2 rounded"
              />
              {submitted && (
                <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Correct answer: {q.correctAnswer}
                </div>
              )}
            </div>
          )}

          {submitted && q.explanation && (
            <div
              className="text-sm p-2 rounded"
              style={{ background: "var(--panel)", color: "var(--muted)" }}
            >
              💡 {q.explanation}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <button onClick={handleSubmit} className="btn px-6 py-2">
          Submit Quiz
        </button>
      ) : (
        <div className="space-y-4">
          <div
            className="card p-4 text-center text-xl font-bold"
            style={{
              color: score.correct === score.total ? "#22c55e" : "var(--brand)",
            }}
          >
            Score: {score.correct}/{score.total} (
            {Math.round((score.correct / score.total) * 100)}%)
          </div>
          <button onClick={handleReset} className="btn-outline px-6 py-2">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
