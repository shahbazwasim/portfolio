import { cn } from '@/lib/cn'
import type { ProjectArt, ProjectCategory } from '@/data/projects'

/**
 * Generated preview art for a case study.
 *
 * Every project gets a deterministic abstract rendering of the *kind* of
 * interface it was — a kanban board, a dashboard, a product grid, a game's
 * map or HUD — derived from its slug and category, or from an explicit `art`
 * hint on the screenshot. When a real screenshot exists at `src`, that
 * wins; otherwise this renders instead of a broken image, and reads as a
 * deliberate illustration rather than a missing asset.
 */

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Small deterministic PRNG so a project's art never changes between renders. */
function rng(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

type Palette = { a: string; b: string; c: string; dim: string; line: string }

function palette(hue: number): Palette {
  return {
    a: `hsl(${hue} 80% 60%)`,
    b: `hsl(${(hue + 45) % 360} 78% 62%)`,
    c: `hsl(${(hue + 300) % 360} 70% 64%)`,
    dim: `hsl(${hue} 30% 55% / 0.28)`,
    line: `hsl(${hue} 25% 60% / 0.16)`,
  }
}

/* -------------------------------------------------------------------------- */
/* Layout generators — each returns the inner content of a 400×250 viewBox     */
/* -------------------------------------------------------------------------- */

function KanbanArt(p: Palette, r: () => number) {
  const cols = [0, 1, 2, 3]
  return (
    <>
      <rect x="0" y="0" width="72" height="250" fill={p.dim} opacity="0.35" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="12" y={22 + i * 20} width={30 + r() * 28} height="7" rx="3.5" fill={p.line} />
      ))}
      {cols.map((c) => {
        const x = 88 + c * 78
        const cards = 2 + Math.floor(r() * 3)
        return (
          <g key={c}>
            <rect x={x} y="18" width="62" height="8" rx="4" fill={c === 1 ? p.a : p.line} opacity={c === 1 ? 0.9 : 1} />
            {Array.from({ length: cards }).map((_, i) => (
              <g key={i}>
                <rect
                  x={x}
                  y={36 + i * 42}
                  width="62"
                  height="34"
                  rx="6"
                  fill={p.dim}
                  opacity="0.5"
                  stroke={c === 1 && i === 0 ? p.a : p.line}
                  strokeWidth={c === 1 && i === 0 ? 1.4 : 0.8}
                />
                <rect x={x + 7} y={44 + i * 42} width={26 + r() * 22} height="4" rx="2" fill={p.line} />
                <rect x={x + 7} y={53 + i * 42} width={16 + r() * 14} height="4" rx="2" fill={p.line} opacity="0.6" />
                <circle cx={x + 53} cy={60 + i * 42} r="4.5" fill={i % 2 ? p.b : p.c} opacity="0.8" />
              </g>
            ))}
          </g>
        )
      })}
    </>
  )
}

function DashboardArt(p: Palette, r: () => number) {
  const bars = Array.from({ length: 9 }, () => 18 + r() * 62)
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={16 + i * 94} y="16" width="82" height="44" rx="7" fill={p.dim} opacity="0.45" stroke={p.line} />
          <rect x={26 + i * 94} y="26" width="34" height="5" rx="2.5" fill={p.line} />
          <rect x={26 + i * 94} y="38" width={22 + r() * 20} height="11" rx="3" fill={i === 0 ? p.a : i === 1 ? p.b : p.line} opacity={i < 2 ? 0.85 : 0.5} />
        </g>
      ))}
      <rect x="16" y="74" width="228" height="160" rx="8" fill={p.dim} opacity="0.35" stroke={p.line} />
      {bars.map((h, i) => (
        <rect key={i} x={32 + i * 23} y={214 - h} width="13" height={h} rx="3" fill={i === 5 ? p.a : p.line} opacity={i === 5 ? 0.95 : 0.65} />
      ))}
      <rect x="256" y="74" width="128" height="76" rx="8" fill={p.dim} opacity="0.35" stroke={p.line} />
      <circle cx="320" cy="112" r="26" fill="none" stroke={p.b} strokeWidth="9" strokeDasharray="120 45" strokeLinecap="round" />
      <rect x="256" y="158" width="128" height="76" rx="8" fill={p.dim} opacity="0.35" stroke={p.line} />
      <polyline
        points="266,220 288,204 306,212 326,186 348,196 374,172"
        fill="none"
        stroke={p.c}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )
}

function CommerceArt(p: Palette, r: () => number) {
  return (
    <>
      <rect x="0" y="0" width="400" height="26" fill={p.dim} opacity="0.4" />
      <rect x="14" y="10" width="42" height="6" rx="3" fill={p.a} opacity="0.8" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={280 + i * 34} y="10" width="24" height="6" rx="3" fill={p.line} />
      ))}
      <rect x="0" y="26" width="76" height="224" fill={p.dim} opacity="0.22" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="12" y={44 + i * 22} width={32 + r() * 26} height="6" rx="3" fill={p.line} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 92 + (i % 3) * 102
        const y = 42 + Math.floor(i / 3) * 106
        return (
          <g key={i}>
            <rect x={x} y={y} width="88" height="66" rx="7" fill={p.dim} opacity="0.5" stroke={i === 1 ? p.a : p.line} strokeWidth={i === 1 ? 1.4 : 0.8} />
            <circle cx={x + 44} cy={y + 30} r={14 + r() * 6} fill={i % 3 === 0 ? p.a : i % 3 === 1 ? p.b : p.c} opacity="0.45" />
            <rect x={x + 10} y={y + 74} width={44 + r() * 26} height="5" rx="2.5" fill={p.line} />
            <rect x={x + 10} y={y + 85} width="26" height="5" rx="2.5" fill={p.b} opacity="0.7" />
          </g>
        )
      })}
    </>
  )
}

function AIArt(p: Palette, r: () => number) {
  const nodes = [
    { x: 58, y: 60 }, { x: 58, y: 125 }, { x: 58, y: 190 },
    { x: 176, y: 92 }, { x: 176, y: 158 },
    { x: 300, y: 125 },
  ]
  return (
    <>
      {nodes.slice(0, 3).map((n, i) =>
        nodes.slice(3, 5).map((m, j) => (
          <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke={p.line} strokeWidth="1" />
        ))
      )}
      {nodes.slice(3, 5).map((n, i) => (
        <line key={i} x1={n.x} y1={n.y} x2={300} y2={125} stroke={p.a} strokeWidth="1.4" opacity="0.55" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={i === 5 ? 20 : 13} fill={p.dim} opacity="0.55" stroke={i === 5 ? p.a : p.line} strokeWidth={i === 5 ? 1.6 : 1} />
          <circle cx={n.x} cy={n.y} r={i === 5 ? 8 : 5} fill={i === 5 ? p.a : i < 3 ? p.c : p.b} opacity="0.9" />
        </g>
      ))}
      {/* Retrieved-chunk strip */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={332}
          y={54 + i * 38}
          width="54"
          height={26}
          rx="5"
          fill={p.dim}
          opacity={i === 0 ? 0.75 : 0.32}
          stroke={i === 0 ? p.a : p.line}
          strokeWidth={i === 0 ? 1.3 : 0.7}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={340} y={64 + i * 38} width={20 + r() * 22} height="4" rx="2" fill={p.line} />
      ))}
    </>
  )
}

function PipelineArt(p: Palette, r: () => number) {
  const stages = [0, 1, 2, 3, 4]
  return (
    <>
      <line x1="34" y1="125" x2="366" y2="125" stroke={p.line} strokeWidth="2" />
      {stages.map((i) => {
        const x = 40 + i * 80
        const ok = i < 3
        return (
          <g key={i}>
            <rect x={x} y="98" width="56" height="54" rx="9" fill={p.dim} opacity="0.55" stroke={ok ? p.a : p.line} strokeWidth={ok ? 1.5 : 0.9} />
            <circle cx={x + 28} cy="118" r="8" fill={ok ? p.a : p.line} opacity="0.85" />
            <rect x={x + 12} y="134" width="32" height="4" rx="2" fill={p.line} />
            <rect x={x + 16} y="143" width="24" height="3" rx="1.5" fill={p.line} opacity="0.6" />
          </g>
        )
      })}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={40 + i * 118} y="24" width="102" height="42" rx="7" fill={p.dim} opacity="0.3" stroke={p.line} />
          <rect x={52 + i * 118} y="36" width={38 + r() * 30} height="5" rx="2.5" fill={p.line} />
          <rect x={52 + i * 118} y="48" width={24 + r() * 20} height="5" rx="2.5" fill={i === 0 ? p.b : p.line} opacity="0.7" />
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={40 + i * 50} y={196 + r() * 6} width="38" height="8" rx="4" fill={i % 3 === 0 ? p.c : p.line} opacity="0.55" />
      ))}
    </>
  )
}

function MobileArt(p: Palette, r: () => number) {
  return (
    <>
      {[0, 1, 2].map((i) => {
        const x = 78 + i * 88
        const front = i === 1
        return (
          <g key={i} opacity={front ? 1 : 0.45}>
            <rect
              x={x}
              y={front ? 18 : 34}
              width="72"
              height={front ? 214 : 182}
              rx="12"
              fill={p.dim}
              opacity="0.55"
              stroke={front ? p.a : p.line}
              strokeWidth={front ? 1.5 : 0.9}
            />
            <rect x={x + 26} y={front ? 26 : 42} width="20" height="4" rx="2" fill={p.line} />
            <rect x={x + 10} y={front ? 44 : 58} width="52" height="34" rx="6" fill={front ? p.a : p.b} opacity="0.3" />
            {[0, 1, 2, 3].map((j) => (
              <g key={j}>
                <rect x={x + 10} y={(front ? 88 : 100) + j * 26} width={30 + r() * 20} height="5" rx="2.5" fill={p.line} />
                <rect x={x + 10} y={(front ? 98 : 110) + j * 26} width={20 + r() * 14} height="4" rx="2" fill={p.line} opacity="0.55" />
              </g>
            ))}
          </g>
        )
      })}
    </>
  )
}

function SystemArt(p: Palette, r: () => number) {
  const swatches = [p.a, p.b, p.c, p.a, p.b, p.c]
  return (
    <>
      {swatches.map((c, i) => (
        <rect key={i} x={20 + i * 62} y="20" width="50" height="50" rx="10" fill={c} opacity={0.24 + (i % 3) * 0.2} stroke={p.line} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={20 + i * 126} y="86" width="112" height="30" rx="15" fill={i === 0 ? p.a : p.dim} opacity={i === 0 ? 0.8 : 0.4} stroke={p.line} />
          <rect x={40 + i * 126} y="98" width={44 + r() * 24} height="6" rx="3" fill={i === 0 ? p.dim : p.line} opacity="0.9" />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="20" y={130 + i * 28} width="164" height="20" rx="5" fill={p.dim} opacity="0.32" stroke={p.line} />
          <rect x="30" y={137 + i * 28} width={54 + r() * 40} height="5" rx="2.5" fill={p.line} />
        </g>
      ))}
      <rect x="200" y="130" width="180" height="104" rx="8" fill={p.dim} opacity="0.3" stroke={p.line} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect
          key={i}
          x={214 + (i % 4) * 42}
          y={146 + Math.floor(i / 4) * 44}
          width="32"
          height="32"
          rx="6"
          fill={swatches[i % swatches.length]}
          opacity="0.3"
        />
      ))}
    </>
  )
}

function EditorArt(p: Palette, r: () => number) {
  return (
    <>
      <rect x="0" y="0" width="120" height="250" fill={p.dim} opacity="0.25" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <rect x="14" y={22 + i * 30} width="10" height="10" rx="2.5" fill={i === 2 ? p.a : p.line} opacity={i === 2 ? 0.9 : 0.6} />
          <rect x="32" y={25 + i * 30} width={36 + r() * 32} height="5" rx="2.5" fill={p.line} />
        </g>
      ))}
      <rect x="140" y="20" width={150 + r() * 40} height="12" rx="4" fill={p.a} opacity="0.6" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="140" y={48 + i * 15} width={130 + r() * 110} height="6" rx="3" fill={p.line} />
      ))}
      <rect x="140" y="146" width="244" height="52" rx="7" fill={p.b} opacity="0.16" stroke={p.line} />
      <circle cx="168" cy="172" r="13" fill={p.b} opacity="0.42" />
      <rect x="192" y="162" width="120" height="6" rx="3" fill={p.line} />
      <rect x="192" y="176" width="84" height="6" rx="3" fill={p.line} opacity="0.6" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={140 + i * 84} y="212" width="72" height="22" rx="5" fill={p.dim} opacity="0.4" stroke={p.line} />
      ))}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Game views — full-bleed, no browser chrome, because none of these are pages */
/* -------------------------------------------------------------------------- */

type Point = [number, number]

const f1 = (v: number) => v.toFixed(1)

/** Catmull-Rom spline through the points, emitted as cubic Bézier segments. */
function curve(pts: Point[], closed: boolean) {
  const n = pts.length
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [x0, y0] = at(i - 1)
    const [x1, y1] = at(i)
    const [x2, y2] = at(i + 1)
    const [x3, y3] = at(i + 2)
    d += `C${f1(x1 + (x2 - x0) / 6)},${f1(y1 + (y2 - y0) / 6)} ${f1(x2 - (x3 - x1) / 6)},${f1(y2 - (y3 - y1) / 6)} ${f1(x2)},${f1(y2)}`
  }
  return closed ? `${d}Z` : d
}

/** A jittered ring of points smoothed into an organic outline — coastlines, biomes. */
function blob(r: () => number, cx: number, cy: number, rx: number, ry: number, n: number, jitter: number) {
  return curve(
    Array.from({ length: n }, (_, i): Point => {
      const a = (i / n) * Math.PI * 2
      const k = 1 - jitter / 2 + r() * jitter
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
    }),
    true
  )
}

/*
 * Subpath builders. Each art below can render seven times on one case-study
 * page (hero, interface grid, related cards), so marks that share a style are
 * merged into a single <path> instead of dozens of elements. Same picture,
 * a fraction of the DOM.
 */

/** A circle as two arcs — also punches a hole when paired with evenodd. */
const ring = (x: number, y: number, R: number) =>
  `M${f1(x - R)},${f1(y)}a${f1(R)},${f1(R)} 0 1,0 ${f1(2 * R)},0a${f1(R)},${f1(R)} 0 1,0 ${f1(-2 * R)},0Z`

/** A bar with fully rounded ends. Expects w ≥ h. */
const pill = (x: number, y: number, w: number, h: number) => {
  const k = f1(h / 2)
  return `M${f1(x + h / 2)},${f1(y)}h${f1(w - h)}a${k},${k} 0 0 1 0,${f1(h)}h${f1(h - w)}a${k},${k} 0 0 1 0,${f1(-h)}Z`
}

/** A rect with corner radius k. */
const rrect = (x: number, y: number, w: number, h: number, k: number) =>
  `M${f1(x + k)},${f1(y)}h${f1(w - 2 * k)}a${k},${k} 0 0 1 ${k},${k}v${f1(h - 2 * k)}a${k},${k} 0 0 1 ${-k},${k}h${f1(2 * k - w)}a${k},${k} 0 0 1 ${-k},${-k}v${f1(2 * k - h)}a${k},${k} 0 0 1 ${k},${-k}Z`

/** A square-cornered rect, for marks too small for rounding to show. */
const box = (x: number, y: number, w: number, h: number) =>
  `M${f1(x)},${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`

/**
 * Top-down island minimap. The terrain is shared; the overlay says what the
 * map is *for* — a closing storm, enemy spawn pressure, or a learning route.
 */
function IslandArt(p: Palette, r: () => number, overlay: 'storm' | 'heat' | 'trail') {
  const cx = 200
  const cy = 125
  const coast = blob(r, cx, cy, 150, 92, 14, 0.28)
  const biomes = [
    blob(r, cx - 62 + r() * 24, cy - 22 + r() * 18, 50, 30, 9, 0.4),
    blob(r, cx + 44 + r() * 24, cy + 14 + r() * 18, 44, 27, 9, 0.4),
  ]
  // Kept well inside the smallest possible coastline so nothing lands in the sea.
  const inland = (): Point => {
    const a = r() * Math.PI * 2
    const t = 0.25 + r() * 0.75
    return [cx + Math.cos(a) * 92 * t, cy + Math.sin(a) * 54 * t]
  }
  const pois = Array.from({ length: 5 }, inland)
  const grid =
    [50, 100, 150, 200, 250, 300, 350].map((x) => `M${x},0V250`).join('') +
    [50, 100, 150, 200].map((y) => `M0,${y}H400`).join('')
  // Building footprints per point of interest; the second one is highlighted.
  const footprints = pois.map(([x, y]) =>
    [
      [-7, -6],
      [1, -7],
      [-5, 1],
      [3, 0],
    ]
      .map(([dx, dy]) => box(x + dx, y + dy, 4 + r() * 3, 4 + r() * 3))
      .join('')
  )

  return (
    <>
      <path d={grid} fill="none" stroke={p.line} strokeWidth="0.8" />

      {/* Surf, land, biomes */}
      <path d={coast} fill="none" stroke={p.a} strokeWidth="12" opacity="0.08" />
      <path d={coast} fill={p.dim} opacity="0.75" stroke={p.a} strokeWidth="1.3" strokeOpacity="0.55" />
      <path d={biomes[0]} fill={p.b} opacity="0.13" />
      <path d={biomes[1]} fill={p.c} opacity="0.12" />

      {/* Roads and points of interest */}
      <polyline
        points={pois.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ')}
        fill="none"
        stroke={p.line}
        strokeWidth="1.6"
        strokeDasharray="3 3"
      />
      <path d={footprints.filter((_, i) => i !== 1).join('')} fill={p.line} opacity="0.7" />
      <path d={footprints[1]} fill={p.a} opacity="0.95" />

      {overlay === 'storm' &&
        (() => {
          const sx = cx - 36 + r() * 72
          const sy = cy - 20 + r() * 40
          const R = 86 + r() * 18
          const nx = sx - 12 + r() * 24
          const ny = sy - 8 + r() * 16
          const players = Array.from({ length: 8 }, (_, i) => {
            const a = r() * Math.PI * 2
            const d = R * (0.2 + r() * 0.6)
            return { x: sx + Math.cos(a) * d, y: sy + Math.sin(a) * d, team: i % 2 }
          })
          const [me, ...others] = players
          const look = r() * Math.PI * 2
          const team = (t: number) =>
            others
              .filter((pl) => pl.team === t)
              .map((pl) => ring(pl.x, pl.y, 2.6))
              .join('')
          return (
            <>
              {/* Storm: everything outside the circle */}
              <path d={`M0,0H400V250H0Z${ring(sx, sy, R)}`} fillRule="evenodd" fill={p.c} opacity="0.17" />
              <circle cx={f1(sx)} cy={f1(sy)} r={f1(R)} fill="none" stroke={p.c} strokeWidth="1.6" opacity="0.85" />
              <circle cx={f1(nx)} cy={f1(ny)} r={f1(R * 0.48)} fill="none" stroke={p.a} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.9" />
              {/* Two teams, plus the viewer with a view cone */}
              <path
                d={`M${f1(me.x)},${f1(me.y)}L${f1(me.x + Math.cos(look - 0.38) * 30)},${f1(me.y + Math.sin(look - 0.38) * 30)}L${f1(me.x + Math.cos(look + 0.38) * 30)},${f1(me.y + Math.sin(look + 0.38) * 30)}Z`}
                fill={p.a}
                opacity="0.18"
              />
              <path d={team(0)} fill={p.a} />
              <path d={team(1)} fill={p.b} />
              <circle cx={f1(me.x)} cy={f1(me.y)} r="3.6" fill={p.a} stroke={p.a} strokeWidth="1.6" strokeOpacity="0.4" />
            </>
          )
        })()}

      {overlay === 'heat' &&
        (() => {
          // The squad holds near the middle; pressure arrives from every side.
          const hold: Point = [cx - 30 + r() * 60, cy - 14 + r() * 28]
          const turn = r() * Math.PI * 2
          const spawns = Array.from({ length: 4 }, (_, i): Point => {
            const a = turn + (i * Math.PI) / 2 + (r() - 0.5) * 0.6
            const d = 0.8 + r() * 0.25
            return [hold[0] + Math.cos(a) * 78 * d, hold[1] + Math.sin(a) * 44 * d]
          })
          // Three falloff bands per spawn; the first spawn is where the director pushes hardest.
          const bands = spawns.map((_, i) => [30, 19, 9].map((rad) => rad * (i === 0 ? 1.2 : 0.8 + r() * 0.3)))
          return (
            <>
              {[0.1, 0.16, 0.32].map((op, j) => (
                <path key={op} d={spawns.map(([x, y], i) => ring(x, y, bands[i][j])).join('')} fill={p.c} opacity={op} />
              ))}
              <path
                d={spawns.map(([x, y]) => `M${f1(x)},${f1(y)}L${f1(hold[0])},${f1(hold[1])}`).join('')}
                fill="none"
                stroke={p.c}
                strokeWidth="1.1"
                strokeDasharray="2 4"
                opacity="0.55"
              />
              <path d={spawns.map(([x, y]) => `M${f1(x)},${f1(y - 4.2)}l4.2,4.2l-4.2,4.2l-4.2,-4.2Z`).join('')} fill={p.c} />
              {/* The squad's hold point */}
              <circle cx={f1(hold[0])} cy={f1(hold[1])} r="15" fill="none" stroke={p.a} strokeWidth="1.3" strokeDasharray="3 2" />
              <path
                d={[0, 1, 2, 3].map((i) => ring(hold[0] - 6 + (i % 2) * 12, hold[1] - 5 + Math.floor(i / 2) * 10, 2.7)).join('')}
                fill={p.a}
              />
            </>
          )
        })()}

      {overlay === 'trail' &&
        (() => {
          const stops = Array.from({ length: 6 }, (_, i): Point => [
            cx - 112 + i * 45,
            cy + (i % 2 ? -1 : 1) * (14 + r() * 26),
          ])
          const done = 3
          const [hx, hy] = stops[done]
          const gate = ([x, y]: Point) => pill(x - 5, y - 19, 10, 4)
          return (
            <>
              <path d={curve(stops, false)} fill="none" stroke={p.line} strokeWidth="2.2" strokeDasharray="4 4" />
              <path d={curve(stops.slice(0, done + 1), false)} fill="none" stroke={p.a} strokeWidth="2.2" opacity="0.85" />
              {/* Stations — completed, current (ringed), upcoming — each under a gate marker */}
              <path d={stops.slice(0, done).map(([x, y]) => ring(x, y, 6.5)).join('')} fill={p.a} opacity="0.9" />
              <circle cx={f1(hx)} cy={f1(hy)} r="12" fill="none" stroke={p.b} strokeWidth="1.4" opacity="0.8" />
              <circle cx={f1(hx)} cy={f1(hy)} r="6.5" fill={p.b} opacity="0.9" />
              <path d={stops.slice(done + 1).map(([x, y]) => ring(x, y, 6.5)).join('')} fill={p.dim} stroke={p.line} />
              <path d={stops.slice(0, done).map(gate).join('')} fill={p.a} opacity="0.6" />
              <path d={stops.slice(done).map(gate).join('')} fill={p.line} />
            </>
          )
        })()}
    </>
  )
}

/** Isometric tycoon plots — built tiers rise off the grid, upgrades in progress float above. */
function PlotsArt(p: Palette, r: () => number) {
  const W = 30
  const H = 15
  const ox = 200
  const oy = 70
  const tiers = [p.a, p.b, p.c]
  const tiles: Point[] = []
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) tiles.push([i, j])
  // Painter's order: back of the grid first.
  tiles.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0])

  // Flat tiles never overlap a building, so they merge into one path drawn
  // first. Building faces keep painter's order. Floating UI sits above
  // everything, so it is collected by colour and drawn last.
  let ground = ''
  const buildings: React.ReactNode[] = []
  let track = ''
  const progress = ['', '', '']
  let coins = ''

  for (const [i, j] of tiles) {
    const x = ox + (i - j) * W
    const y = oy + (i + j) * H
    ground += `M${x},${y - H}L${x + W},${y}L${x},${y + H}L${x - W},${y}Z`
    const built = r() > 0.38
    const h = 8 + r() * 36
    const tier = Math.floor(r() * 3)
    const bw = W * 0.6
    const bh = H * 0.6
    const upgrading = built && r() > 0.72
    if (!built) continue

    const c = tiers[tier]
    buildings.push(
      <path key={`l${i}${j}`} d={`M${x - bw},${f1(y)}L${x},${f1(y + bh)}L${x},${f1(y + bh - h)}L${x - bw},${f1(y - h)}Z`} fill={c} opacity="0.42" />,
      <path key={`r${i}${j}`} d={`M${x},${f1(y + bh)}L${x + bw},${f1(y)}L${x + bw},${f1(y - h)}L${x},${f1(y + bh - h)}Z`} fill={c} opacity="0.26" />,
      <path key={`t${i}${j}`} d={`M${x},${f1(y - bh - h)}L${x + bw},${f1(y - h)}L${x},${f1(y + bh - h)}L${x - bw},${f1(y - h)}Z`} fill={c} opacity="0.72" />
    )
    if (upgrading) {
      track += pill(x - 12, y - h - bh - 13, 24, 4)
      progress[tier] += pill(x - 12, y - h - bh - 13, 6 + r() * 16, 4)
    } else if (r() > 0.6) {
      coins += ring(x + 3, y - h - bh - 8, 2.6)
    }
  }

  return (
    <>
      <path d={ground} fill={p.dim} opacity="0.5" stroke={p.line} strokeWidth="0.8" />
      {buildings}
      {track ? <path d={track} fill={p.line} /> : null}
      {progress.map((d, t) => (d ? <path key={t} d={d} fill={tiers[t]} /> : null))}
      {coins ? <path d={coins} fill={p.b} opacity="0.85" /> : null}

      {/* Currency and rebirth counters */}
      <rect x="12" y="12" width="88" height="20" rx="10" fill={p.dim} opacity="0.7" stroke={p.line} />
      <circle cx="24" cy="22" r="5" fill={p.b} opacity="0.9" />
      <path d={pill(34, 19, 34 + r() * 24, 6)} fill={p.line} />
      <circle cx="376" cy="22" r="11" fill="none" stroke={p.a} strokeWidth="2" strokeDasharray="44 26" strokeLinecap="round" />
      <path d={pill(371, 20, 10, 4)} fill={p.a} opacity="0.8" />

      {/* Upgrade cards — the middle one selected */}
      <path d={`${rrect(112, 218, 54, 22, 6)}${rrect(232, 218, 54, 22, 6)}`} fill={p.dim} opacity="0.55" stroke={p.line} strokeWidth="0.8" />
      <rect x="172" y="218" width="54" height="22" rx="6" fill={p.dim} opacity="0.55" stroke={p.a} strokeWidth="1.3" />
      {[0, 1, 2].map((i) => (
        <circle key={`icon${i}`} cx={124 + i * 60} cy="229" r="4.5" fill={tiers[i]} opacity="0.75" />
      ))}
      <path d={[0, 1, 2].map((i) => pill(133 + i * 60, 226, 16 + r() * 12, 5)).join('')} fill={p.line} />
    </>
  )
}

/** In-match HUD over a perspective arena — scores, timer, feed, vitals, hotbar. */
function HudArt(p: Palette, r: () => number) {
  const vx = 200
  const vy = 96
  const minimap = blob(r, 38, 44, 20, 13, 9, 0.35)
  const floor =
    [104, 113, 126, 145, 172, 208, 250].map((y) => `M0,${y}H400`).join('') +
    [-420, -250, -120, 0, 120, 250, 420].map((dx) => `M${vx},${vy}L${vx + dx},250`).join('')
  const pip = (x: number) => rrect(x, 16, 10, 10, 2.5)

  let feedA = ''
  let feedIcons = ''
  let feedB = ''
  for (let i = 0; i < 3; i++) {
    const y = 42 + i * 13
    feedA += pill(302, y, 22 + r() * 14, 5)
    feedIcons += box(344, y, 8, 5)
    feedB += pill(356, y, 18 + r() * 14, 5)
  }

  return (
    <>
      {/* Arena floor converging on the horizon */}
      <path d={floor} fill="none" stroke={p.line} strokeWidth="0.9" />

      {/* Build pieces — a wall and a ramp, panelled like the real thing */}
      <rect x="150" y="100" width="100" height="58" fill={p.dim} opacity="0.55" stroke={p.a} strokeOpacity="0.45" />
      <path d="M183,100V158M217,100V158M150,129H250" fill="none" stroke={p.line} />
      <path d="M262,158L318,104L352,104L312,170Z" fill={p.dim} opacity="0.4" stroke={p.line} />
      <path d="M52,170L96,106L128,106L100,176Z" fill={p.b} opacity="0.1" stroke={p.line} />

      {/* Crosshair */}
      <circle cx="200" cy="129" r="7" fill="none" stroke={p.a} strokeWidth="1.2" opacity="0.9" />
      <path d="M200,116V120M200,138V142M187,129H191M209,129H213" fill="none" stroke={p.a} strokeWidth="1.4" strokeLinecap="round" />

      {/* Score and round timer: two rounds to one */}
      <rect x="160" y="10" width="80" height="22" rx="11" fill={p.dim} opacity="0.8" stroke={p.line} />
      <path d={pill(182, 18, 36, 6)} fill={p.a} opacity="0.85" />
      <path d={pip(112) + pip(126)} fill={p.a} opacity="0.85" />
      <path d={pip(140)} fill={p.a} opacity="0.2" />
      <path d={pip(250)} fill={p.b} opacity="0.85" />
      <path d={pip(264) + pip(278)} fill={p.b} opacity="0.2" />

      {/* Minimap */}
      <rect x="10" y="22" width="56" height="44" rx="6" fill={p.dim} opacity="0.7" stroke={p.line} />
      <path d={minimap} fill={p.a} opacity="0.22" />
      <circle cx="40" cy="44" r="12" fill="none" stroke={p.c} strokeWidth="1" opacity="0.8" />

      {/* Elimination feed */}
      <path d={feedA} fill={p.a} opacity="0.7" />
      <path d={feedIcons} fill={p.line} />
      <path d={feedB} fill={p.b} opacity="0.7" />

      {/* Rating change toast */}
      <rect x="10" y="84" width="74" height="24" rx="7" fill={p.dim} opacity="0.75" stroke={p.a} strokeOpacity="0.5" />
      <path d="M20,101L26,92L32,101Z" fill={p.a} />
      <path d={pill(38, 93, 36, 6)} fill={p.a} opacity="0.55" />

      {/* Shield and health */}
      <path d={pill(14, 214, 112, 7) + pill(14, 226, 112, 9)} fill={p.line} />
      <path d={pill(14, 214, 52 + r() * 50, 7)} fill={p.a} opacity="0.85" />
      <path d={pill(14, 226, 70 + r() * 40, 9)} fill={p.b} opacity="0.8" />

      {/* Hotbar — second slot selected */}
      <path
        d={[0, 2, 3, 4].map((i) => rrect(272 + i * 23, 212, 19, 24, 4)).join('')}
        fill={p.dim}
        opacity="0.6"
        stroke={p.line}
        strokeWidth="0.8"
      />
      <rect x="295" y="212" width="19" height="24" rx="4" fill={p.a} opacity="0.3" stroke={p.a} strokeWidth="1.4" />
    </>
  )
}

/** A physics puzzle room — the launch, the arc as flown, a previous miss, and the hint ladder. */
function PuzzleArt(p: Palette, r: () => number) {
  const vx = 200
  const vy = 96
  // Same perspective floor as the HUD view, so the two read as one game.
  const floor =
    [104, 113, 126, 145, 172, 208, 250].map((y) => `M0,${y}H400`).join('') +
    [-420, -250, -120, 0, 120, 250, 420].map((dx) => `M${vx},${vy}L${vx + dx},250`).join('')
  const lx = 64
  const ly = 196
  const tx = 290 + r() * 40
  const ty = 172
  const apex = 55 + r() * 25
  // Quadratic arcs: the attempt in flight, and the shorter miss before it.
  const qx = (lx + tx) / 2
  const qy = ly - 2 * apex
  const at = (t: number) => [
    (1 - t) ** 2 * lx + 2 * (1 - t) * t * qx + t ** 2 * tx,
    (1 - t) ** 2 * ly + 2 * (1 - t) * t * qy + t ** 2 * ty,
  ]
  const [px, py] = at(0.62)
  const angle = ((40 + r() * 25) * Math.PI) / 180
  const pip = (x: number) => rrect(x, 16, 10, 10, 2.5)

  return (
    <>
      <path d={floor} fill="none" stroke={p.line} strokeWidth="0.9" />

      {/* Launch pad and target platform, with its landing tolerance */}
      <ellipse cx={lx} cy={ly + 5} rx="18" ry="5" fill={p.a} opacity="0.3" />
      <rect x={lx - 6} y={ly - 9} width="12" height="12" rx="2" fill={p.a} opacity="0.8" />
      <ellipse cx={f1(tx)} cy={ty + 5} rx="30" ry="8" fill={p.dim} opacity="0.8" stroke={p.line} />
      <ellipse cx={f1(tx)} cy={ty + 5} rx="12" ry="3.5" fill="none" stroke={p.b} strokeWidth="1.3" strokeDasharray="3 2" />

      {/* The previous miss, then the attempt in flight */}
      <path
        d={`M${lx},${ly}Q${f1(qx - 40)},${f1(ly - 1.6 * apex)} ${f1(tx - 78)},${ly + 3}`}
        fill="none"
        stroke={p.line}
        strokeWidth="1.4"
        strokeDasharray="3 4"
      />
      <path d={`M${lx},${ly}Q${f1(qx)},${f1(qy)} ${f1(tx)},${ty}`} fill="none" stroke={p.a} strokeWidth="1.8" strokeDasharray="5 4" />
      <circle cx={f1(px)} cy={f1(py)} r="4.5" fill={p.a} />

      {/* Hint card — second rung of the ladder */}
      <rect x="10" y="12" width="122" height="42" rx="7" fill={p.dim} opacity="0.8" stroke={p.b} strokeOpacity="0.5" />
      <path d={pill(20, 21, 22, 6)} fill={p.b} opacity="0.8" />
      <path d={pill(20, 33, 100, 4) + pill(20, 42, 72, 4)} fill={p.line} />

      {/* Attempts used, attempts left */}
      <path d={pip(174) + pip(188)} fill={p.c} opacity="0.85" />
      <path d={pip(202) + pip(216)} fill={p.c} opacity="0.2" />

      {/* Target distance readout */}
      <rect x="300" y="12" width="88" height="22" rx="11" fill={p.dim} opacity="0.8" stroke={p.line} />
      <path d={pill(312, 20, 22, 6)} fill={p.b} opacity="0.8" />
      <path d={pill(340, 20, 36, 6)} fill={p.line} />

      {/* Room progress */}
      <path d={pill(14, 216, 30, 5)} fill={p.line} />
      <path d={pill(14, 228, 112, 7)} fill={p.line} />
      <path d={pill(14, 228, 40 + r() * 50, 7)} fill={p.a} opacity="0.85" />

      {/* Launch-angle dial */}
      <path d="M334,234A26,26 0 0 1 386,234" fill="none" stroke={p.line} strokeWidth="4" strokeLinecap="round" />
      <path
        d={`M360,234L${f1(360 + Math.cos(angle) * 22)},${f1(234 - Math.sin(angle) * 22)}`}
        stroke={p.a}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="360" cy="234" r="3" fill={p.a} />
    </>
  )
}

/** A Verse file open in the editor — explorer, tabs, indented blocks, build output. */
function VerseArt(p: Palette, r: () => number) {
  // Indentation of a device class: fields, then methods with nested blocks.
  const indents = [0, 0, 1, 1, 1, 0, 1, 2, 2, 3, 3, 2, 3, 1, 2]

  // Explorer: files nest one level inside the folder; the third row is open.
  let tree = ''
  let open = ''
  let openName = ''
  for (let i = 0; i < 7; i++) {
    const inset = i > 0 && i < 5 ? 10 : 0
    const icon = rrect(10 + inset, 16 + i * 17, 7, 7, 1.5)
    const name = pill(22 + inset, 17.5 + i * 17, 28 + r() * 26, 4)
    if (i === 2) {
      open = icon
      openName = name
    } else {
      tree += icon + name
    }
  }

  // Code, one path per token colour.
  let gutter = ''
  let keywords = ''
  let decls = ''
  let rest = ''
  let strings = ''
  indents.forEach((lvl, i) => {
    const y = 31 + i * 12.5
    const x = 132 + lvl * 16
    const head = 12 + r() * 26
    const tail = 18 + r() * 60
    gutter += pill(100, y, i + 1 >= 10 ? 12 : 7, 4)
    if (i % 5 === 0) decls += pill(x, y, head, 4.5)
    else keywords += pill(x, y, head, 4.5)
    rest += pill(x + head + 5, y, tail, 4.5)
    if (i % 3 === 1) strings += pill(x + head + tail + 10, y, 14 + r() * 20, 4.5)
  })

  return (
    <>
      <rect x="0" y="0" width="92" height="250" fill={p.dim} opacity="0.3" />
      <path d={tree} fill={p.line} />
      <path d={open} fill={p.a} opacity="0.95" />
      <path d={openName} fill={p.a} opacity="0.6" />

      {/* Tabs — the open file's tab underlined */}
      <rect x="92" y="0" width="308" height="18" fill={p.dim} opacity="0.35" />
      <rect x="92" y="0" width="92" height="18" fill={p.dim} opacity="0.5" />
      <rect x="92" y="16.5" width="92" height="1.5" fill={p.a} opacity="0.85" />
      <path d={pill(104, 7, 58, 4)} fill={p.line} />
      <path d={pill(196, 7, 48, 4)} fill={p.line} opacity="0.6" />

      {/* Current line, gutter, code */}
      <rect x="92" y={28 + 7 * 12.5} width="308" height="12" fill={p.a} opacity="0.07" />
      <path d={gutter} fill={p.line} opacity="0.7" />
      <path d={keywords} fill={p.a} opacity="0.8" />
      <path d={decls} fill={p.c} opacity="0.8" />
      <path d={rest} fill={p.line} />
      <path d={strings} fill={p.b} opacity="0.7" />

      {/* Build output */}
      <rect x="92" y="220" width="308" height="30" fill={p.dim} opacity="0.35" />
      <circle cx="106" cy="235" r="4" fill={p.a} opacity="0.85" />
      <path d={pill(116, 233, 80 + r() * 50, 4)} fill={p.line} />
    </>
  )
}

/* -------------------------------------------------------------------------- */

type ArtFn = (p: Palette, r: () => number) => React.ReactNode

const ARTS: Record<ProjectArt, { draw: ArtFn; chrome: boolean }> = {
  kanban: { draw: KanbanArt, chrome: true },
  dashboard: { draw: DashboardArt, chrome: true },
  commerce: { draw: CommerceArt, chrome: true },
  ai: { draw: AIArt, chrome: true },
  pipeline: { draw: PipelineArt, chrome: true },
  mobile: { draw: MobileArt, chrome: true },
  system: { draw: SystemArt, chrome: true },
  editor: { draw: EditorArt, chrome: true },
  island: { draw: (p, r) => IslandArt(p, r, 'storm'), chrome: false },
  heatmap: { draw: (p, r) => IslandArt(p, r, 'heat'), chrome: false },
  trail: { draw: (p, r) => IslandArt(p, r, 'trail'), chrome: false },
  plots: { draw: PlotsArt, chrome: false },
  hud: { draw: HudArt, chrome: false },
  puzzle: { draw: PuzzleArt, chrome: false },
  verse: { draw: VerseArt, chrome: true },
}

const ART_BY_CATEGORY: Record<ProjectCategory, ProjectArt> = {
  'CRM & Platforms': 'kanban',
  'AI & Machine Learning': 'ai',
  'Data & BI': 'dashboard',
  'E-Commerce': 'commerce',
  'Web Applications': 'dashboard',
  Mobile: 'mobile',
  'DevOps & Cloud': 'pipeline',
  'Design Systems': 'system',
  'UEFN & Games': 'island',
}

/* -------------------------------------------------------------------------- */

type ProjectVisualProps = {
  slug: string
  category: ProjectCategory
  /** Real screenshot path. Renders instead of the generated art when present. */
  src?: string
  alt?: string
  className?: string
  /** Draws the browser chrome around the art. Defaults to whatever suits the art. */
  chrome?: boolean
  variant?: 'default' | 'editor'
  /** Explicit illustration, overriding both `variant` and the category default. */
  art?: ProjectArt
}

export function ProjectVisual({
  slug,
  category,
  src,
  alt,
  className,
  chrome: chromeProp,
  variant = 'default',
  art,
}: ProjectVisualProps) {
  const h = hash(slug)
  const p = palette(h % 360)
  const { draw, chrome: artChrome } =
    ARTS[art ?? (variant === 'editor' ? 'editor' : ART_BY_CATEGORY[category])]
  const chrome = chromeProp ?? artChrome

  return (
    <div
      className={cn(
        'bg-surface-2 relative aspect-[16/10] w-full overflow-hidden rounded-lg',
        className
      )}
    >
      {/* Tinted wash so each project's art sits on its own ground */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 20% 0%, hsl(${h % 360} 70% 50% / 0.14), transparent 60%), radial-gradient(100% 90% at 100% 100%, hsl(${(h + 45) % 360} 70% 50% / 0.1), transparent 55%)`,
        }}
      />

      {src ? (
        <img
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <>
          {chrome && (
            <div className="border-line/60 absolute inset-x-0 top-0 z-10 flex h-7 items-center gap-1.5 border-b px-3">
              <span className="h-2 w-2 rounded-full bg-red-400/50" />
              <span className="h-2 w-2 rounded-full bg-amber-400/50" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/50" />
              <span className="bg-line/60 ml-3 h-3 flex-1 rounded-sm" />
            </div>
          )}
          <svg
            viewBox="0 0 400 250"
            className={cn('absolute inset-x-0 bottom-0', chrome ? 'top-7' : 'top-0')}
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label={alt ?? `Illustration of the ${category} interface`}
          >
            {draw(p, rng(h))}
          </svg>
        </>
      )}
    </div>
  )
}
