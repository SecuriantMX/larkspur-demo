type Datum = { label: string; value: number };

function niceMax(v: number, integer: boolean) {
  // Counts get whole-number gridlines: a max divisible by the four intervals.
  if (integer) return Math.max(4, Math.ceil(v / 4) * 4);
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

export function BarChart({
  data,
  format = (v) => String(v),
  labelEvery = 1,
  height = 200,
  title,
  integer = false,
}: {
  data: Datum[];
  format?: (v: number) => string;
  labelEvery?: number;
  height?: number;
  title: string;
  integer?: boolean;
}) {
  const width = 640;
  const pad = { top: 12, right: 8, bottom: 26, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0), integer);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const band = innerW / Math.max(data.length, 1);
  const barW = Math.max(2, band * 0.62);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const lastIndex = data.length - 1;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
          <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-soft)" className="tabular">
            {format(t)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = pad.left + i * band + (band - barW) / 2;
        const h = (d.value / max) * innerH;
        return (
          <g key={d.label + i}>
            <rect
              x={x}
              y={pad.top + innerH - h}
              width={barW}
              height={Math.max(h, 0)}
              rx={2}
              fill={i === lastIndex ? "var(--accent)" : "color-mix(in srgb, var(--accent) 45%, transparent)"}
            >
              <title>{`${d.label}: ${format(d.value)}`}</title>
            </rect>
            {(i % labelEvery === 0 || i === lastIndex) && (
              <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize={11} fill="var(--ink-soft)">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
