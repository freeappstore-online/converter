import { useState } from "react";

type Category = "Length" | "Weight" | "Temperature" | "Volume" | "Speed";

const categories: Category[] = ["Length", "Weight", "Temperature", "Volume", "Speed"];

const units: Record<Category, string[]> = {
  Length: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
  Weight: ["mg", "g", "kg", "lb", "oz"],
  Temperature: ["\u00b0C", "\u00b0F", "K"],
  Volume: ["ml", "L", "gal", "fl oz", "cup"],
  Speed: ["m/s", "km/h", "mph", "knots"],
};

const lengthToM: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000,
  in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
};

const weightToG: Record<string, number> = {
  mg: 0.001, g: 1, kg: 1000, lb: 453.592, oz: 28.3495,
};

const volumeToMl: Record<string, number> = {
  ml: 1, L: 1000, gal: 3785.41, "fl oz": 29.5735, cup: 236.588,
};

const speedToMs: Record<string, number> = {
  "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704, knots: 0.514444,
};

function convert(category: Category, from: string, to: string, value: number): number {
  if (from === to) return value;

  if (category === "Temperature") {
    let celsius: number;
    if (from === "\u00b0C") celsius = value;
    else if (from === "\u00b0F") celsius = (value - 32) * (5 / 9);
    else celsius = value - 273.15;

    if (to === "\u00b0C") return celsius;
    if (to === "\u00b0F") return celsius * (9 / 5) + 32;
    return celsius + 273.15;
  }

  const tables: Record<string, Record<string, number>> = {
    Length: lengthToM,
    Weight: weightToG,
    Volume: volumeToMl,
    Speed: speedToMs,
  };
  const table = tables[category]!;
  return (value * table[from]!) / table[to]!;
}

function formatResult(n: number): string {
  if (!isFinite(n)) return "---";
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.001 && n !== 0)) {
    return n.toExponential(4);
  }
  return parseFloat(n.toPrecision(6)).toString();
}

const defaultUnits: Record<Category, [string, string]> = {
  Length: ["km", "mi"],
  Weight: ["kg", "lb"],
  Temperature: ["\u00b0C", "\u00b0F"],
  Volume: ["L", "gal"],
  Speed: ["km/h", "mph"],
};

const categoryIcons: Record<Category, string> = {
  Length: "\u2194\ufe0f",
  Weight: "\u2696\ufe0f",
  Temperature: "\ud83c\udf21\ufe0f",
  Volume: "\ud83e\uddea",
  Speed: "\ud83d\udca8",
};

export function App() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState(defaultUnits.Length[0]);
  const [toUnit, setToUnit] = useState(defaultUnits.Length[1]);
  const [input, setInput] = useState("1");

  const value = parseFloat(input);
  const allConversions = isNaN(value)
    ? []
    : units[category]
        .filter((u) => u !== fromUnit)
        .map((u) => ({ unit: u, result: formatResult(convert(category, fromUnit, u, value)) }));

  const primaryResult = isNaN(value) ? "---" : formatResult(convert(category, fromUnit, toUnit, value));

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-paper)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--color-line)",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Converter
        </h1>
        <a
          href="https://freeappstore.online"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--color-muted)",
            fontSize: "0.75rem",
            textDecoration: "none",
          }}
        >
          Part of FreeAppStore — free forever
        </a>
      </header>

      <div style={{ maxWidth: "32rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => switchCategory(cat)}
              style={{
                borderRadius: "var(--radius-btn)",
                background: cat === category ? "var(--color-accent)" : "var(--color-panel)",
                color: cat === category ? "#fff" : "var(--color-muted)",
                border: cat === category ? "none" : "1px solid var(--color-line)",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {categoryIcons[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Input field */}
        <input
          type="number"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter value"
          style={{
            width: "100%",
            padding: "0.875rem 1rem",
            fontSize: "1.25rem",
            background: "var(--color-panel)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-line)",
            borderRadius: "var(--radius-card)",
            outline: "none",
            fontFamily: "var(--font-body)",
            marginBottom: "1rem",
          }}
        />

        {/* From / Swap / To row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              background: "var(--color-panel)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-line)",
              borderRadius: "var(--radius-btn)",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            {units[category].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          <button
            onClick={swap}
            aria-label="Swap units"
            style={{
              flexShrink: 0,
              width: "2.5rem",
              height: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--color-line)",
              borderRadius: "var(--radius-btn)",
              background: "var(--color-panel)",
              color: "var(--color-accent)",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>

          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              background: "var(--color-panel)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-line)",
              borderRadius: "var(--radius-btn)",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            {units[category].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Primary result */}
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            border: "1px solid var(--color-line)",
            borderRadius: "var(--radius-card)",
            background: "var(--color-panel)",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--color-ink)",
              marginBottom: "0.25rem",
            }}
          >
            {primaryResult}
          </div>
          <div style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>{toUnit}</div>
        </div>

        {/* All conversions */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              color: "var(--color-muted)",
            }}
          >
            All conversions
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
              gap: "0.5rem",
            }}
          >
            {allConversions.map(({ unit, result }) => (
              <div
                key={unit}
                onClick={() => setToUnit(unit)}
                style={{
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--color-line)",
                  borderRadius: "var(--radius-btn)",
                  background: unit === toUnit ? "var(--color-accent)" : "var(--color-panel)",
                  color: unit === toUnit ? "#fff" : "var(--color-ink)",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <div style={{ fontSize: "1.125rem", fontWeight: 600 }}>{result}</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: unit === toUnit ? "rgba(255,255,255,0.7)" : "var(--color-muted)",
                  }}
                >
                  {unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
