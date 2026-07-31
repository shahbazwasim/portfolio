import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, RotateCcw, X } from 'lucide-react'
import { seededRandom, currency, compactNumber } from '@/lib/storage'
import { DemoChrome, StatTile } from '@/demos/shared/DemoChrome'
import { cn } from '@/lib/cn'

/* -------------------------------------------------------------------------- */
/* Synthetic dataset — fixed seed so the numbers are identical for everyone    */
/* -------------------------------------------------------------------------- */

const REGIONS = ['North', 'South', 'East', 'West'] as const
const CATEGORIES = ['Lighting', 'Furniture', 'Textiles', 'Decor', 'Outdoor'] as const
const CHANNELS = ['Retail', 'Online', 'Wholesale'] as const

type Row = {
  date: string
  month: string
  region: (typeof REGIONS)[number]
  category: (typeof CATEGORIES)[number]
  channel: (typeof CHANNELS)[number]
  revenue: number
  units: number
  margin: number
}

const MONTHS = [
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
  '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12',
]

function buildDataset(): Row[] {
  const rand = seededRandom(31415926)
  const rows: Row[] = []
  for (const month of MONTHS) {
    const seasonal = 1 + 0.35 * Math.sin((MONTHS.indexOf(month) / 12) * Math.PI * 2 - 1)
    for (const region of REGIONS) {
      for (const category of CATEGORIES) {
        for (const channel of CHANNELS) {
          const base = 4_000 + rand() * 16_000
          const revenue = Math.round(base * seasonal * (channel === 'Online' ? 1.35 : 1))
          rows.push({
            date: `${month}-15`,
            month,
            region,
            category,
            channel,
            revenue,
            units: Math.round(revenue / (60 + rand() * 180)),
            margin: Math.round(revenue * (0.24 + rand() * 0.26)),
          })
        }
      }
    }
  }
  return rows
}

const DATASET = buildDataset()

const MONTH_LABEL = (m: string) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })

const PALETTE = ['#22d3ee', '#8b5cf6', '#f472b6', '#34d399', '#fbbf24']

/* -------------------------------------------------------------------------- */

type Filters = {
  region: string | null
  category: string | null
  channel: string | null
  from: string
  to: string
}

const INITIAL: Filters = {
  region: null,
  category: null,
  channel: null,
  from: MONTHS[0],
  to: MONTHS[MONTHS.length - 1],
}

const chartTooltip = {
  contentStyle: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: 12,
  },
  labelStyle: { color: 'var(--text-muted)' },
} as const

const axis = {
  tick: { fontSize: 10, fill: 'var(--text-subtle)' },
  axisLine: false,
  tickLine: false,
} as const

export default function PulseBiDemo() {
  const [filters, setFilters] = useState<Filters>(INITIAL)

  const rows = useMemo(
    () =>
      DATASET.filter(
        (r) =>
          r.month >= filters.from &&
          r.month <= filters.to &&
          (!filters.region || r.region === filters.region) &&
          (!filters.category || r.category === filters.category) &&
          (!filters.channel || r.channel === filters.channel)
      ),
    [filters]
  )

  const kpis = useMemo(() => {
    const revenue = rows.reduce((s, r) => s + r.revenue, 0)
    const units = rows.reduce((s, r) => s + r.units, 0)
    const margin = rows.reduce((s, r) => s + r.margin, 0)
    return {
      revenue,
      units,
      margin,
      marginPct: revenue ? (margin / revenue) * 100 : 0,
      aov: units ? revenue / units : 0,
    }
  }, [rows])

  const byMonth = useMemo(
    () =>
      MONTHS.filter((m) => m >= filters.from && m <= filters.to).map((m) => {
        const inMonth = rows.filter((r) => r.month === m)
        return {
          month: MONTH_LABEL(m),
          revenue: inMonth.reduce((s, r) => s + r.revenue, 0),
          margin: inMonth.reduce((s, r) => s + r.margin, 0),
        }
      }),
    [rows, filters.from, filters.to]
  )

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c,
        value: rows.filter((r) => r.category === c).reduce((s, r) => s + r.revenue, 0),
      })).filter((d) => d.value > 0),
    [rows]
  )

  const byRegion = useMemo(
    () =>
      REGIONS.map((r) => ({
        name: r,
        revenue: rows.filter((x) => x.region === r).reduce((s, x) => s + x.revenue, 0),
        units: rows.filter((x) => x.region === r).reduce((s, x) => s + x.units, 0),
      })),
    [rows]
  )

  const byChannel = useMemo(
    () =>
      CHANNELS.map((c) => ({
        name: c,
        value: rows.filter((r) => r.channel === c).reduce((s, r) => s + r.revenue, 0),
      })),
    [rows]
  )

  /** Region × category revenue, normalised for the heatmap. */
  const heatmap = useMemo(() => {
    const cells = REGIONS.map((region) =>
      CATEGORIES.map((category) =>
        DATASET.filter(
          (r) =>
            r.region === region &&
            r.category === category &&
            r.month >= filters.from &&
            r.month <= filters.to &&
            (!filters.channel || r.channel === filters.channel)
        ).reduce((s, r) => s + r.revenue, 0)
      )
    )
    const max = Math.max(...cells.flat(), 1)
    return { cells, max }
  }, [filters.from, filters.to, filters.channel])

  const activeFilters = [
    filters.region && { key: 'region' as const, label: `Region: ${filters.region}` },
    filters.category && { key: 'category' as const, label: `Category: ${filters.category}` },
    filters.channel && { key: 'channel' as const, label: `Channel: ${filters.channel}` },
  ].filter(Boolean) as { key: keyof Filters; label: string }[]

  function toggle(key: 'region' | 'category' | 'channel', value: string) {
    setFilters((f) => ({ ...f, [key]: f[key] === value ? null : value }))
  }

  function exportCsv() {
    const header = 'month,region,category,channel,revenue,units,margin'
    const body = rows
      .map((r) => [r.month, r.region, r.category, r.channel, r.revenue, r.units, r.margin].join(','))
      .join('\n')
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pulsebi-export-${rows.length}-rows.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DemoChrome title="PulseBI" subtitle="Vantage Retail" onReset={() => setFilters(INITIAL)}>
      {/* Slicer bar */}
      <div className="border-line flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <label className="text-subtle flex items-center gap-2 text-xs">
          From
          <select
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            className="border-line bg-surface-2 text-ink rounded-md border px-2 py-1 text-xs outline-none"
          >
            {MONTHS.filter((m) => m <= filters.to).map((m) => (
              <option key={m} value={m}>
                {MONTH_LABEL(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-subtle flex items-center gap-2 text-xs">
          To
          <select
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className="border-line bg-surface-2 text-ink rounded-md border px-2 py-1 text-xs outline-none"
          >
            {MONTHS.filter((m) => m >= filters.from).map((m) => (
              <option key={m} value={m}>
                {MONTH_LABEL(m)}
              </option>
            ))}
          </select>
        </label>

        {activeFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilters((prev) => ({ ...prev, [f.key]: null }))}
            className="border-cyan/40 bg-cyan/10 text-cyan inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] transition-colors hover:bg-cyan/20"
          >
            {f.label}
            <X size={10} />
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {activeFilters.length > 0 && (
            <button
              onClick={() => setFilters((f) => ({ ...f, region: null, category: null, channel: null }))}
              className="text-subtle hover:text-ink inline-flex items-center gap-1.5 text-[0.6875rem] transition-colors"
            >
              <RotateCcw size={11} /> Clear
            </button>
          )}
          <button
            onClick={exportCsv}
            className="border-line text-muted hover:text-ink hover:border-line-strong inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.6875rem] transition-colors"
          >
            <Download size={11} />
            Export {rows.length} rows
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Revenue"
            value={currency(kpis.revenue)}
            accent="text-cyan"
            delta={{ value: '8.2% YoY', positive: true }}
          />
          <StatTile label="Units sold" value={compactNumber(kpis.units)} />
          <StatTile
            label="Gross margin"
            value={`${kpis.marginPct.toFixed(1)}%`}
            accent="text-emerald-400"
            delta={{ value: '1.4 pts', positive: true }}
          />
          <StatTile label="Avg order value" value={currency(Math.round(kpis.aov))} />
        </div>

        {/* Trend */}
        <div className="border-line rounded-xl border p-4">
          <p className="text-muted mb-4 text-sm">Revenue &amp; margin over time</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byMonth} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} tickFormatter={(v) => compactNumber(Number(v))} />
                <Tooltip {...chartTooltip} formatter={(v) => currency(Number(v))} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
                <Area
                  type="monotone"
                  dataKey="margin"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#mar)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Category — click to cross-filter */}
          <div className="border-line rounded-xl border p-4">
            <p className="text-muted mb-1 text-sm">Revenue by category</p>
            <p className="text-subtle mb-3 text-[0.625rem]">Click a slice to cross-filter</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={38}
                    outerRadius={64}
                    paddingAngle={2}
                    onClick={(d) => toggle('category', String(d.name))}
                    className="cursor-pointer outline-none"
                  >
                    {byCategory.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PALETTE[i % PALETTE.length]}
                        opacity={!filters.category || filters.category === entry.name ? 1 : 0.25}
                      />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltip} formatter={(v) => currency(Number(v))} />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    wrapperStyle={{ fontSize: 10, color: 'var(--text-subtle)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region */}
          <div className="border-line rounded-xl border p-4">
            <p className="text-muted mb-1 text-sm">Revenue by region</p>
            <p className="text-subtle mb-3 text-[0.625rem]">Click a bar to drill in</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byRegion} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" {...axis} />
                  <YAxis {...axis} tickFormatter={(v) => compactNumber(Number(v))} />
                  <Tooltip
                    {...chartTooltip}
                    cursor={{ fill: 'var(--surface-2)' }}
                    formatter={(v) => currency(Number(v))}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[4, 4, 0, 0]}
                    onClick={(d) => toggle('region', String(d.name))}
                    className="cursor-pointer"
                  >
                    {byRegion.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PALETTE[i % PALETTE.length]}
                        opacity={!filters.region || filters.region === entry.name ? 1 : 0.25}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Channel */}
          <div className="border-line rounded-xl border p-4">
            <p className="text-muted mb-1 text-sm">Channel mix</p>
            <p className="text-subtle mb-3 text-[0.625rem]">Click a line point to filter</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                {/* Click is handled on the chart rather than the Line: recharts
                    gives the chart-level handler the active category label,
                    which is exactly what we need to cross-filter on. */}
                <LineChart
                  data={byChannel}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  onClick={(state) => {
                    const label = state?.activeLabel
                    if (typeof label === 'string') toggle('channel', label)
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" {...axis} />
                  <YAxis {...axis} tickFormatter={(v) => compactNumber(Number(v))} />
                  <Tooltip {...chartTooltip} formatter={(v) => currency(Number(v))} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f472b6"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#f472b6' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="border-line rounded-xl border p-4">
          <p className="text-muted mb-4 text-sm">Region × category revenue</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-xs">
              <thead>
                <tr>
                  <th className="text-subtle w-20 pb-2 text-left font-normal" />
                  {CATEGORIES.map((c) => (
                    <th key={c} className="text-subtle pb-2 text-center font-normal">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGIONS.map((region, ri) => (
                  <tr key={region}>
                    <td className="text-subtle pr-3 text-right">{region}</td>
                    {CATEGORIES.map((category, ci) => {
                      const v = heatmap.cells[ri][ci]
                      const intensity = v / heatmap.max
                      return (
                        <td key={category} className="p-0.5">
                          <button
                            onClick={() => {
                              toggle('region', region)
                              toggle('category', category)
                            }}
                            title={`${region} · ${category} — ${currency(v)}`}
                            className={cn(
                              'grid h-11 w-full place-items-center rounded-md font-mono text-[0.625rem] transition-transform hover:scale-[1.04]',
                              intensity > 0.6 ? 'text-white' : 'text-muted'
                            )}
                            style={{
                              background: `color-mix(in oklab, var(--accent-violet) ${Math.round(intensity * 85)}%, var(--surface-2))`,
                            }}
                          >
                            {compactNumber(v)}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DemoChrome>
  )
}
