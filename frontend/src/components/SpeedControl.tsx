import React from "react";

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({
  speed,
  onSpeedChange,
}) => {
  const speeds = [0.25, 0.5, 0.75, 1];

  return (
    <div>
      <label className="block text-sm mb-2" style={{ color: "var(--fg)" }}>
        Animation Speed:
      </label>
      <div className="flex gap-2 flex-wrap">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className="px-3 py-1.5 rounded text-xs font-medium transition-all"
            style={{
              backgroundColor:
                speed === s ? "var(--brand)" : "var(--card-hover-bg)",
              color: speed === s ? "white" : "var(--fg)",
              border: "2px solid var(--brand)",
            }}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeedControl;
