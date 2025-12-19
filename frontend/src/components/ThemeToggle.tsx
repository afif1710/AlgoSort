import { useTheme } from "../utils/theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <select
        className="btn-outline"
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
        aria-label="Theme"
      >
        <option value="light">☀️ Light</option>
        <option value="gray">🌫️ Gray</option>
        <option value="dark">🌙 Navy</option>
        <option value="midnight">🌃 Midnight</option>
        <option value="sunset">🌅 Sunset</option>
        <option value="dracula">🧛 Dracula</option>
        <option value="nord">❄️ Nord</option>
      </select>
    </div>
  );
}
