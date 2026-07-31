import { cn } from '@/lib/cn'
import type { ProjectCategory } from '@/data/projects'

/**
 * Generated preview art for a case study.
 *
 * Every project gets a deterministic abstract rendering of the *kind* of
 * interface it was — a kanban board, a dashboard, a product grid — derived
 * from its slug and category. When a real screenshot exists at `src`, that
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

const ART_BY_CATEGORY: Record<
  ProjectCategory,
  (p: Palette, r: () => number) => React.ReactNode
> = {
  'CRM & Platforms': KanbanArt,
  'AI & Machine Learning': AIArt,
  'Data & BI': DashboardArt,
  'E-Commerce': CommerceArt,
  'Web Applications': DashboardArt,
  Mobile: MobileArt,
  'DevOps & Cloud': PipelineArt,
  'Design Systems': SystemArt,
}

/* -------------------------------------------------------------------------- */

type ProjectVisualProps = {
  slug: string
  category: ProjectCategory
  /** Real screenshot path. Renders instead of the generated art when present. */
  src?: string
  alt?: string
  className?: string
  /** Draws the browser chrome around the art. */
  chrome?: boolean
  variant?: 'default' | 'editor'
}

export function ProjectVisual({
  slug,
  category,
  src,
  alt,
  className,
  chrome = true,
  variant = 'default',
}: ProjectVisualProps) {
  const h = hash(slug)
  const p = palette(h % 360)
  const draw = variant === 'editor' ? EditorArt : ART_BY_CATEGORY[category]

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
