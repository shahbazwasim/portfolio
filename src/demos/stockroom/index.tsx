import { useRef, useState, type ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Database } from 'lucide-react'
import data from './data.json'
import { DemoChrome, StatTile } from '@/demos/shared/DemoChrome'
import { cn } from '@/lib/cn'

/**
 * Stockroom: a dashboard over the real outputs of the open-source
 * commerce-analytics-dbt pipeline. Nothing here is simulated — every number is
 * read from data.json, which scripts/sync-stockroom-data.mjs copies from the
 * pipeline's exports.
 */

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
const gbpCompact = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  notation: 'compact',
  maximumFractionDigits: 2,
})
const count = new Intl.NumberFormat('en-GB')
const pct = (v: number, digits = 1) => `${(Math.abs(v) < 1e-9 ? 0 : v * 100).toFixed(digits)}%`
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const monthLabel = (iso: string) => monthFormat.format(new Date(`${iso}T00:00:00Z`))
const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const LAST_DAY = dayFormat.format(new Date(`${data.window.last_date}T00:00:00Z`))
/** Product names arrive in upper case; title case reads better in a list. */
const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())

const axis = {
  tick: { fontSize: 10, fill: 'var(--text-subtle)' },
  axisLine: false,
  tickLine: false,
} as const

/* ------------------------------------------------------------------ panel */

/** A dashboard card with an optional Chart/Table switch — every chart has a table view. */
function Panel({
  title,
  subtitle,
  table,
  shot,
  className,
  children,
}: {
  title: string
  subtitle?: string
  table?: ReactNode
  /** Marks the panel for the screenshot script (scripts/capture-screens.mjs). */
  shot?: string
  className?: string
  children: ReactNode
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')

  return (
    <section data-shot={shot} className={cn('border-line bg-surface min-w-0 rounded-xl border p-4 sm:p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-ink text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-subtle mt-0.5 text-xs leading-relaxed">{subtitle}</p>}
        </div>
        {table && (
          <div
            role="group"
            aria-label={`${title}: view`}
            className="border-line flex shrink-0 rounded-lg border p-0.5 text-[0.6875rem]"
          >
            {(['chart', 'table'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded-md px-2 py-1 transition-colors',
                  view === v ? 'bg-surface-3 text-ink' : 'text-subtle hover:text-ink'
                )}
              >
                {v === 'chart' ? 'Chart' : 'Table'}
              </button>
            ))}
          </div>
        )}
      </div>
      {view === 'table' && table ? table : children}
    </section>
  )
}

function DataTable({
  head,
  rows,
  scroll = true,
}: {
  head: string[]
  rows: (string | number)[][]
  /** Cap the height and scroll; off for short tables whose every row matters. */
  scroll?: boolean
}) {
  return (
    <div className={cn('overflow-auto', scroll && 'max-h-80')}>
      <table className="w-full text-left text-xs">
        <thead className="bg-surface text-subtle sticky top-0">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="border-line border-b px-2 py-2 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-muted tabular-nums">
          {rows.map((r, i) => (
            <tr key={i} className="border-line/60 border-b last:border-b-0">
              {r.map((cell, j) => (
                <td key={j} className={cn('px-2 py-1.5 whitespace-nowrap', j === 0 && 'text-ink')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Tooltip body: the value leads, the label follows. */
function TipCard({ children }: { children: ReactNode }) {
  return (
    <div className="border-line bg-surface rounded-lg border px-3 py-2 text-xs shadow-[var(--shadow-card)]">
      {children}
    </div>
  )
}

/* ------------------------------------------------------- monthly revenue */

type MonthRow = (typeof data.months)[number]

function RevenueChart() {
  const rows = data.months.map((m) => ({ ...m, label: monthLabel(m.month) }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" interval={2} {...axis} />
          <YAxis
            width={52}
            tickFormatter={(v: number) => gbpCompact.format(v)}
            domain={[0, 'auto']}
            {...axis}
          />
          <Tooltip
            cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              const row = active ? (payload?.[0]?.payload as (MonthRow & { label: string }) | undefined) : undefined
              if (!row) return null
              return (
                <TipCard>
                  <p className="text-ink text-sm font-semibold tabular-nums">{gbp.format(row.netRevenue)}</p>
                  <p className="text-muted mt-0.5">
                    {row.label} · {count.format(row.orders)} orders · AOV {gbp.format(row.averageOrderValue)}
                  </p>
                  {row.partial && <p className="text-subtle mt-1">Partial month — data ends {LAST_DAY}</p>}
                </TipCard>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="netRevenue"
            name="Net revenue"
            stroke="var(--viz-1)"
            strokeWidth={2}
            fill="var(--viz-1)"
            fillOpacity={0.1}
            activeDot={{ r: 4, fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ------------------------------------------------------ customer segments */

/** Direct labels on the story row only (Champions) — the legend and tooltip carry the rest. */
function StoryLabel(props: { x?: unknown; y?: unknown; width?: unknown; height?: unknown; value?: unknown; index?: number }) {
  if (props.index !== 0) return null
  const x = Number(props.x) + Number(props.width) + 6
  const y = Number(props.y) + Number(props.height) / 2
  return (
    <text x={x} y={y} dominantBaseline="central" fontSize={10} fill="var(--text-muted)">
      {pct(Number(props.value))}
    </text>
  )
}

function SegmentsChart() {
  return (
    <>
      <div className="text-subtle mb-3 flex flex-wrap gap-4 text-[0.6875rem]" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'var(--viz-1)' }} />
          Share of customers
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'var(--viz-2)' }} />
          Share of revenue
        </span>
      </div>
      <div className="h-[22rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.segments}
            layout="vertical"
            margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
            barGap={2}
            barCategoryGap="24%"
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" domain={[0, 0.6]} tickFormatter={(v: number) => pct(v, 0)} {...axis} />
            <YAxis type="category" dataKey="segment" width={118} {...axis} />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              content={({ active, payload }) => {
                const row = active
                  ? (payload?.[0]?.payload as (typeof data.segments)[number] | undefined)
                  : undefined
                if (!row) return null
                return (
                  <TipCard>
                    <p className="text-ink font-semibold">{row.segment}</p>
                    <p className="text-muted mt-1 flex items-center gap-1.5 tabular-nums">
                      <span className="h-0.5 w-3 rounded" style={{ background: 'var(--viz-1)' }} />
                      <span className="text-ink font-medium">{pct(row.shareOfCustomers)}</span> of customers
                      ({count.format(row.customers)})
                    </p>
                    <p className="text-muted flex items-center gap-1.5 tabular-nums">
                      <span className="h-0.5 w-3 rounded" style={{ background: 'var(--viz-2)' }} />
                      <span className="text-ink font-medium">{pct(row.shareOfRevenue)}</span> of revenue
                    </p>
                    <p className="text-subtle mt-1 max-w-56">{row.description}</p>
                  </TipCard>
                )
              }}
            />
            <Bar dataKey="shareOfCustomers" name="Share of customers" fill="var(--viz-1)" barSize={9} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="shareOfCustomers" content={StoryLabel} />
            </Bar>
            <Bar dataKey="shareOfRevenue" name="Share of revenue" fill="var(--viz-2)" barSize={9} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="shareOfRevenue" content={StoryLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

/* ---------------------------------------------------------- top products */

function TopProducts() {
  const max = Math.max(...data.products.map((p) => p.netRevenue))
  return (
    <ol className="flex flex-col gap-2.5">
      {data.products.map((p) => (
        <li
          key={p.rank}
          className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3"
          title={`${count.format(p.unitsSold)} units sold · ${pct(p.returnRate)} returned`}
        >
          <span className="text-subtle font-mono text-[0.6875rem] tabular-nums">{p.rank}</span>
          <div className="min-w-0">
            <p className="text-ink truncate text-xs">{titleCase(p.description)}</p>
            <div
              className="mt-1 h-2 rounded-r-[4px]"
              style={{ width: `${(p.netRevenue / max) * 100}%`, background: 'var(--viz-1)' }}
            />
          </div>
          <span className="text-ink text-xs tabular-nums">{gbpCompact.format(p.netRevenue)}</span>
        </li>
      ))}
    </ol>
  )
}

/* ------------------------------------------------------ cohort retention */

/** Upper bounds of the eight retention classes; the last class is open-ended. */
const BINS = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35]
const BIN_LABELS = ['<5%', '5–10%', '10–15%', '15–20%', '20–25%', '25–30%', '30–35%', '35%+']
const binOf = (v: number) => {
  let i = 0
  while (i < BINS.length && v >= BINS[i]) i++
  return i
}
const MONTHS = data.cohorts.length - 1 // months after acquisition shown as columns

function CohortHeatmap() {
  const ref = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<{ x: number; y: number; c: number; m: number } | null>(null)

  const onMove = (e: React.PointerEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-m]')
    const box = ref.current
    if (!cell || !box) return setTip(null)
    const outer = box.getBoundingClientRect()
    const r = cell.getBoundingClientRect()
    setTip({
      x: r.left - outer.left + box.scrollLeft + r.width / 2,
      y: r.top - outer.top,
      c: Number(cell.dataset.c),
      m: Number(cell.dataset.m),
    })
  }

  const tipCohort = tip ? data.cohorts[tip.c] : undefined
  // The data's last month is partial, so its column understates retention.
  const isPartial = (c: number, m: number) => c + m === data.cohorts.length - 1

  return (
    <>
      <div
        ref={ref}
        className="relative overflow-x-auto pb-1"
        onPointerMove={onMove}
        onPointerLeave={() => setTip(null)}
      >
        <div
          className="grid min-w-[40rem] gap-[2px] text-[0.625rem]"
          style={{ gridTemplateColumns: `4.25rem 2.75rem repeat(${MONTHS}, minmax(0, 1fr))` }}
        >
          <span className="text-subtle pb-1">Cohort</span>
          <span className="text-subtle pb-1 text-right">Size</span>
          {Array.from({ length: MONTHS }, (_, i) => (
            <span key={i} className="text-subtle pb-1 text-center tabular-nums">
              {(i + 1) % 3 === 0 ? i + 1 : ''}
            </span>
          ))}

          {data.cohorts.map((cohort, c) => (
            <div key={cohort.month} className="contents">
              <span className="text-muted truncate leading-5">{monthLabel(cohort.month)}</span>
              <span className="text-muted pr-1 text-right leading-5 tabular-nums">{count.format(cohort.size)}</span>
              {Array.from({ length: MONTHS }, (_, i) => {
                const m = i + 1
                const v = cohort.retention[m]
                if (v === undefined) return <span key={m} />
                return (
                  <span
                    key={m}
                    data-c={c}
                    data-m={m}
                    className={cn(
                      'h-5 rounded-[3px] transition-[filter] hover:brightness-110',
                      isPartial(c, m) && 'opacity-50'
                    )}
                    style={{ background: `var(--viz-seq-${binOf(v) + 1})` }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {tip && tipCohort && (
          <div
            className="pointer-events-none absolute z-10"
            style={{ left: tip.x, top: tip.y, transform: 'translate(-50%, calc(-100% - 6px))' }}
          >
            <TipCard>
              <p className="text-ink text-sm font-semibold tabular-nums">
                {pct(tipCohort.retention[tip.m] ?? 0)}
              </p>
              <p className="text-muted mt-0.5 whitespace-nowrap">
                {monthLabel(tipCohort.month)} cohort · month {tip.m} ·{' '}
                {count.format(Math.round((tipCohort.retention[tip.m] ?? 0) * tipCohort.size))} of{' '}
                {count.format(tipCohort.size)} active
              </p>
              {isPartial(tip.c, tip.m) && <p className="text-subtle mt-1">Partial month — understates retention</p>}
            </TipCard>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-subtle text-[0.6875rem]">Share of cohort active</span>
        {BIN_LABELS.map((label, i) => (
          <span key={label} className="text-subtle inline-flex items-center gap-1 text-[0.6875rem]">
            <span className="h-2.5 w-3.5 rounded-[2px]" style={{ background: `var(--viz-seq-${i + 1})` }} />
            {label}
          </span>
        ))}
        <span className="text-subtle inline-flex items-center gap-1 text-[0.6875rem]">
          <span className="h-2.5 w-3.5 rounded-[2px] opacity-50" style={{ background: 'var(--viz-seq-5)' }} />
          Partial month
        </span>
      </div>
      <ul className="text-subtle mt-3 flex flex-col gap-1 text-[0.6875rem] leading-relaxed">
        <li>
          The {monthLabel(data.cohorts[0].month)} cohort includes every existing customer active that month, so its
          retention runs high.
        </li>
        <li>The data ends on {LAST_DAY}, so the faded diagonal of that final month understates retention.</li>
      </ul>
    </>
  )
}

/* ------------------------------------------------------------------- app */

export default function Stockroom() {
  const k = data.kpis
  const source = data.source

  return (
    <DemoChrome title="Stockroom" subtitle="dbt warehouse over real retail data">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div data-shot="overview" className="flex flex-col gap-4">
          <p className="text-muted inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed">
            <Database size={13} className="text-cyan shrink-0" aria-hidden="true" />
            <span>
              Real data: {source.dataset}, {monthLabel(data.window.first_date)} – {LAST_DAY} ·{' '}
              {source.licence} ·{' '}
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink underline underline-offset-2">
                source
              </a>
              . Every figure is computed by the dbt pipeline — nothing here is simulated.
            </span>
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatTile label="Net revenue" value={gbpCompact.format(k.netRevenue)} />
            <StatTile label="Purchase orders" value={count.format(k.purchaseOrders)} />
            <StatTile label="Average order value" value={gbp.format(k.averageOrderValue)} />
            <StatTile label="Customers" value={count.format(k.customers)} />
            <StatTile label="Repeat customers" value={pct(k.repeatCustomerRate)} />
            <StatTile label="Returned, by value" value={pct(k.returnRateByValue, 2)} />
          </div>

          <Panel
            title="Net revenue by month"
            subtitle={`After returns · ${pct(k.topCountryShare)} from the ${k.topCountry}`}
            table={
              <DataTable
                head={['Month', 'Net revenue', 'Orders', 'Avg order value']}
                rows={data.months.map((m) => [
                  `${monthLabel(m.month)}${m.partial ? ' (partial)' : ''}`,
                  gbp.format(m.netRevenue),
                  count.format(m.orders),
                  gbp.format(m.averageOrderValue),
                ])}
              />
            }
          >
            <RevenueChart />
          </Panel>
        </div>

        <div data-shot="segments" className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <Panel
            title="Customer segments (RFM)"
            subtitle="Champions are a small group that brings in most of the revenue"
            table={
              <DataTable
                head={['Segment', 'Customers', 'Share of customers', 'Share of revenue']}
                rows={data.segments.map((s) => [
                  s.segment,
                  count.format(s.customers),
                  pct(s.shareOfCustomers),
                  pct(s.shareOfRevenue),
                ])}
              />
            }
          >
            <SegmentsChart />
          </Panel>

          <Panel title="Top products" subtitle="By net revenue, after returns">
            <TopProducts />
          </Panel>
        </div>

        <Panel
          title="Monthly cohort retention"
          shot="cohorts"
          subtitle="Rows are first-purchase months; columns are months since. Hover a cell for the exact share."
          table={
            <DataTable
              head={['Cohort', 'Size', ...Array.from({ length: MONTHS }, (_, i) => `M${i + 1}`)]}
              rows={data.cohorts.map((c) => [
                monthLabel(c.month),
                count.format(c.size),
                ...Array.from({ length: MONTHS }, (_, i) =>
                  c.retention[i + 1] === undefined ? '' : pct(c.retention[i + 1], 0)
                ),
              ])}
            />
          }
        >
          <CohortHeatmap />
        </Panel>

        <Panel title="Data quality" subtitle="What the staging model found in the raw source, and what it did about it">
          <DataTable
            head={['Check', 'Treatment', 'Rows', 'Share of source']}
            rows={data.quality.map((q) => [q.description, q.treatment, count.format(q.rows), pct(q.share, 2)])}
            scroll={false}
          />
        </Panel>
      </div>
    </DemoChrome>
  )
}
