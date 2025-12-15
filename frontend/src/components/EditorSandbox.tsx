import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "../utils/theme";

const LANGS: Record<string, { label: string; jd?: string }> = {
  javascript: { label: "JavaScript" }, // client-only run (future)
  python: { label: "Python 3", jd: "python3" },
  cpp: { label: "C++ 17", jd: "cpp17" },
  c: { label: "C 17", jd: "c" },
  java: { label: "Java 11", jd: "java" },
};

type Props = {
  initialCode: string;
  initialLang?: keyof typeof LANGS;
  input?: string;
};

export default function EditorSandbox({
  initialCode,
  initialLang = "python",
  input = "",
}: Props) {
  const { theme } = useTheme();
  const [language, setLanguage] = useState<keyof typeof LANGS>(initialLang);
  const [code, setCode] = useState(initialCode);
  const [stdin, setStdin] = useState(input);
  const [running, setRunning] = useState(false);
  const [out, setOut] = useState("");

  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  async function runCode() {
    setRunning(true);
    setOut("");
    try {
      const body = {
        language: LANGS[language].jd || language,
        versionIndex: "0",
        code,
        input: stdin,
      };
      const res = await fetch(`${backend}/api/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setOut(
        (data.output || "") + (data.error ? `\n[error]\n${data.error}` : "")
      );
    } catch (e: any) {
      setOut("Execution failed: " + (e?.message || "Unknown error"));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="btn-outline bg-[var(--panel)] text-[var(--fg)]"
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
        >
          {Object.entries(LANGS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        <button className="btn" onClick={runCode} disabled={running}>
          {running ? "Running..." : "Run"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="min-h-[320px]">
          <Editor
            height="340px"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={(v) => setCode(v || "")}
            theme={theme === "dark" ? "vs-dark" : "vs"}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--muted)]">Standard Input</label>
          <textarea
            className="card p-2 min-h-[100px] bg-[var(--panel)] text-[var(--fg)]"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
          />

          <label className="text-sm text-[var(--muted)]">Output</label>
          <pre className="card p-3 min-h-[120px] overflow-auto whitespace-pre-wrap">
            {out}
          </pre>
        </div>
      </div>
    </div>
  );
}
