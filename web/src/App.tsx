import { useState } from "react";
import { Shell } from "./components/Shell";

type Category = "Length" | "Weight" | "Temperature" | "Volume" | "Speed";

const units: Record<Category, string[]> = {
  Length: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
  Weight: ["mg", "g", "kg", "lb", "oz"],
  Temperature: ["\u00b0C", "\u00b0F", "K"],
  Volume: ["ml", "L", "gal", "fl oz", "cup"],
  Speed: ["m/s", "km/h", "mph", "knots"],
};

// Length → meters
const lengthToM: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

// Weight → grams
const weightToG: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  lb: 453.592,
  oz: 28.3495,
};

// Volume → milliliters
const volumeToMl: Record<string, number> = {
  ml: 1,
  L: 1000,
  gal: 3785.41,
  "fl oz": 29.5735,
  cup: 236.588,
};

// Speed → m/s
const speedToMs: Record<string, number> = {
  "m/s": 1,
  "km/h": 1 / 3.6,
  mph: 0.44704,
  knots: 0.514444,
};

function convert(category: Category, from: string, to: string, value: number): number {
  if (from === to) return value;

  if (category === "Temperature") {
    // Convert to Celsius first, then to target
    let celsius: number;
    if (from === "\u00b0C") celsius = value;
    else if (from === "\u00b0F") celsius = (value - 32) * (5 / 9);
    else celsius = value - 273.15; // K

    if (to === "\u00b0C") return celsius;
    if (to === "\u00b0F") return celsius * (9 / 5) + 32;
    return celsius + 273.15; // K
  }

  if (category === "Length") {
    return (value * lengthToM[from]!) / lengthToM[to]!;
  }
  if (category === "Weight") {
    return (value * weightToG[from]!) / weightToG[to]!;
  }
  if (category === "Volume") {
    return (value * volumeToMl[from]!) / volumeToMl[to]!;
  }
  // Speed
  return (value * speedToMs[from]!) / speedToMs[to]!;
}

function formatResult(n: number): string {
  if (!isFinite(n)) return "---";
  // Use up to 6 significant digits, strip trailing zeros
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.001 && n !== 0)) {
    return n.toExponential(4);
  }
  return parseFloat(n.toPrecision(6)).toString();
}

const categories: Category[] = ["Length", "Weight", "Temperature", "Volume", "Speed"];

const defaultUnits: Record<Category, [string, string]> = {
  Length: ["km", "mi"],
  Weight: ["kg", "lb"],
  Temperature: ["\u00b0C", "\u00b0F"],
  Volume: ["L", "gal"],
  Speed: ["km/h", "mph"],
};

export default function App() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState(defaultUnits.Length[0]);
  const [toUnit, setToUnit] = useState(defaultUnits.Length[1]);
  const [input, setInput] = useState("1");

  const value = parseFloat(input);
  const result = isNaN(value) ? "" : formatResult(convert(category, fromUnit, toUnit, value));

  function switchCategory(cat: Category) {
    setCategory(cat);
    setFromUnit(defaultUnits[cat][0]);
    setToUnit(defaultUnits[cat][1]);
    setInput("1");
  }

  function swap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  const selectStyle: React.CSSProperties = {
    background: "var(--panel)",
    color: "var(--ink)",
    borderColor: "var(--line)",
    borderRadius: "0.75rem",
  };

  return (
    <Shell>
      <div className="max-w-lg mx-auto">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => switchCategory(cat)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                borderRadius: "0.75rem",
                background: cat === category ? "var(--accent)" : "var(--panel)",
                color: cat === category ? "#fff" : "var(--muted)",
                border: cat === category ? "none" : "1px solid var(--line)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-3 text-lg border outline-none focus:ring-2"
            style={{
              background: "var(--panel)",
              color: "var(--ink)",
              borderColor: "var(--line)",
              borderRadius: "1.25rem",
              // focus ring handled by Tailwind
            }}
            placeholder="Enter value"
          />
        </div>

        {/* From / Swap / To */}
        <div className="flex items-center gap-3 mb-8">
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="flex-1 px-4 py-3 border text-base"
            style={selectStyle}
          >
            {units[category].map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <button
            onClick={swap}
            className="shrink-0 w-10 h-10 flex items-center justify-center border transition-colors hover:opacity-80"
            style={{
              borderRadius: "0.75rem",
              borderColor: "var(--line)",
              background: "var(--panel)",
              color: "var(--accent)",
            }}
            aria-label="Swap units"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>

          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="flex-1 px-4 py-3 border text-base"
            style={selectStyle}
          >
            {units[category].map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Result */}
        <div
          className="text-center p-8 border"
          style={{
            borderRadius: "1.25rem",
            borderColor: "var(--line)",
            background: "var(--panel)",
          }}
        >
          <div
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
          >
            {result || "---"}
          </div>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            {toUnit}
          </div>
        </div>
      </div>
    </Shell>
  );
}
