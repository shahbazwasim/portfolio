import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Building2,
  CircleCheck,
  Mail,
  Phone,
  Search,
  SquareKanban,
  Table2,
  Users,
  X,
} from 'lucide-react'
import { useLocalStorage, currency, compactNumber } from '@/lib/storage'
import { DemoChrome, StatTile } from '@/demos/shared/DemoChrome'
import { cn } from '@/lib/cn'
import {
  OWNERS,
  STAGES,
  formatDate,
  relativeDate,
  seedContacts,
  seedDeals,
  type Deal,
  type Role,
  type Stage,
} from './seed'

const STORAGE_KEY = 'demo:nexus-crm:v1'

/* -------------------------------------------------------------------------- */
/* Deal card                                                                  */
/* -------------------------------------------------------------------------- */

function DealCard({
  deal,
  onOpen,
  dragging,
  canSeeValue,
}: {
  deal: Deal
  onOpen?: () => void
  dragging?: boolean
  canSeeValue: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={cn(
        'border-line bg-surface-2 group cursor-grab touch-none rounded-xl border p-3 transition-colors active:cursor-grabbing',
        'hover:border-line-strong',
        (isDragging || dragging) && 'opacity-40',
        dragging && 'rotate-2 opacity-100 shadow-[var(--shadow-lift)]'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-ink truncate text-sm font-medium">{deal.company}</p>
        {canSeeValue && (
          <span className="text-cyan shrink-0 font-mono text-xs">
            {compactNumber(deal.value)}
          </span>
        )}
      </div>
      <p className="text-subtle mt-1 truncate text-xs">{deal.title}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.5625rem] font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${(deal.owner.charCodeAt(0) * 37) % 360} 65% 50%), hsl(${(deal.owner.charCodeAt(1) * 53) % 360} 65% 45%))`,
          }}
          title={deal.owner}
        >
          {deal.owner.slice(0, 1)}
        </span>
        <div className="flex gap-1">
          {deal.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="border-line text-subtle rounded border px-1.5 py-0.5 text-[0.5625rem]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Column                                                                     */
/* -------------------------------------------------------------------------- */

function Column({
  stage,
  deals,
  onOpen,
  canSeeValue,
}: {
  stage: (typeof STAGES)[number]
  deals: Deal[]
  onOpen: (d: Deal) => void
  canSeeValue: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  const total = deals.reduce((sum, d) => sum + d.value, 0)

  return (
    // Sized so all five stages fit the 1200px content column without
    // horizontal scroll on desktop; narrower viewports scroll as normal.
    <div className="flex w-[216px] shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium', stage.tone)}>{stage.label}</span>
          <span className="border-line text-subtle rounded-full border px-1.5 text-[0.625rem]">
            {deals.length}
          </span>
        </div>
        {canSeeValue && (
          <span className="text-subtle font-mono text-[0.625rem]">{compactNumber(total)}</span>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[280px] flex-1 flex-col gap-2 rounded-xl border border-dashed p-2 transition-colors',
          isOver ? 'border-cyan/50 bg-cyan/5' : 'border-line/60'
        )}
      >
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} onOpen={() => onOpen(d)} canSeeValue={canSeeValue} />
        ))}
        {deals.length === 0 && (
          <p className="text-subtle grid flex-1 place-items-center text-xs">Drop a deal here</p>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Deal drawer                                                                */
/* -------------------------------------------------------------------------- */

const ACTIVITY_ICON = {
  note: '📝',
  call: '📞',
  email: '✉️',
  meeting: '👥',
  stage: '🔀',
} as const

function DealDrawer({
  deal,
  onClose,
  onStageChange,
  canSeeValue,
}: {
  deal: Deal
  onClose: () => void
  onStageChange: (stage: Stage) => void
  canSeeValue: boolean
}) {
  const stage = STAGES.find((s) => s.id === deal.stage)!

  return (
    <div className="absolute inset-0 z-20 flex justify-end">
      <div className="bg-bg/60 absolute inset-0 backdrop-blur-sm" onClick={onClose} />
      <aside className="border-line bg-surface relative flex w-full max-w-md flex-col overflow-y-auto border-l">
        <header className="border-line bg-surface sticky top-0 flex items-start justify-between gap-3 border-b p-5">
          <div className="min-w-0">
            <p className="text-ink truncate text-lg font-medium">{deal.company}</p>
            <p className="text-subtle truncate text-sm">{deal.title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close deal"
            className="text-subtle hover:text-ink hover:bg-surface-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex flex-col gap-6 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="border-line rounded-xl border p-3">
              <p className="text-subtle text-[0.625rem] tracking-wide uppercase">Value</p>
              <p className="text-ink mt-1 font-mono text-lg">
                {canSeeValue ? currency(deal.value) : '••••••'}
              </p>
            </div>
            <div className="border-line rounded-xl border p-3">
              <p className="text-subtle text-[0.625rem] tracking-wide uppercase">Weighted</p>
              <p className="text-cyan mt-1 font-mono text-lg">
                {canSeeValue ? currency(Math.round(deal.value * stage.probability)) : '••••••'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-subtle mb-2 text-[0.625rem] tracking-wide uppercase">Stage</p>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onStageChange(s.id)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                    s.id === deal.stage
                      ? 'border-cyan/50 bg-cyan/10 text-cyan'
                      : 'border-line text-muted hover:text-ink'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <dl className="flex flex-col gap-2.5 text-sm">
            {[
              { k: 'Contact', v: deal.contact },
              { k: 'Owner', v: deal.owner },
              { k: 'Created', v: formatDate(deal.createdAt) },
              { k: 'Expected close', v: formatDate(deal.closeDate) },
              { k: 'Probability', v: `${Math.round(stage.probability * 100)}%` },
            ].map((row) => (
              <div key={row.k} className="border-line/60 flex justify-between gap-4 border-b pb-2.5">
                <dt className="text-subtle">{row.k}</dt>
                <dd className="text-muted text-right">{row.v}</dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="text-subtle mb-3 text-[0.625rem] tracking-wide uppercase">
              Activity timeline
            </p>
            <ol className="relative flex flex-col gap-4 pl-5">
              <span className="bg-line absolute top-1 bottom-1 left-[5px] w-px" />
              {[...deal.activities].reverse().map((a) => (
                <li key={a.id} className="relative">
                  <span className="bg-surface-3 border-line absolute top-1 -left-5 grid h-[11px] w-[11px] place-items-center rounded-full border" />
                  <p className="text-muted text-sm leading-relaxed">
                    <span className="mr-1.5">{ACTIVITY_ICON[a.type]}</span>
                    {a.text}
                  </p>
                  <p className="text-subtle mt-1 text-[0.625rem]">
                    {a.who} · {relativeDate(a.at)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Contacts table                                                             */
/* -------------------------------------------------------------------------- */

function ContactsTable({ deals, canSeeValue }: { deals: Deal[]; canSeeValue: boolean }) {
  const contacts = useMemo(() => seedContacts(deals), [deals])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: 'name' | 'company' | 'dealValue'; dir: 1 | -1 }>({
    key: 'dealValue',
    dir: -1,
  })
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return contacts
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const av = a[sort.key]
        const bv = b[sort.key]
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir
        return String(av).localeCompare(String(bv)) * sort.dir
      })
  }, [contacts, query, sort])

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))

  function toggleSort(key: typeof sort.key) {
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }))
  }

  const STATUS_TONE = {
    active: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
    cold: 'text-amber-400 border-amber-500/25 bg-amber-500/10',
    churned: 'text-red-400 border-red-500/25 bg-red-500/10',
  }

  return (
    <div className="flex flex-col">
      <div className="border-line flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <div className="border-line bg-surface-2 flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border px-3">
          <Search size={14} className="text-subtle shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="text-ink placeholder:text-subtle h-8 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-cyan text-xs">{selected.size} selected</span>
            {[
              { icon: Mail, label: 'Email' },
              { icon: Phone, label: 'Call list' },
              { icon: CircleCheck, label: 'Mark active' },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => setSelected(new Set())}
                className="border-line text-muted hover:text-ink hover:border-line-strong inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              >
                <a.icon size={12} />
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2/80 text-subtle sticky top-0 backdrop-blur">
            <tr className="border-line border-b">
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
                  }
                  aria-label="Select all"
                  className="accent-[var(--accent-violet)]"
                />
              </th>
              {(
                [
                  ['name', 'Name'],
                  ['company', 'Company'],
                  ['dealValue', 'Deal value'],
                ] as const
              ).map(([key, label]) => (
                <th key={key} className="px-3 py-2.5 font-normal">
                  <button
                    onClick={() => toggleSort(key)}
                    className="hover:text-ink inline-flex items-center gap-1 text-xs transition-colors"
                  >
                    {label}
                    {sort.key === key && <span>{sort.dir === 1 ? '↑' : '↓'}</span>}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2.5 text-xs font-normal">Status</th>
              <th className="px-3 py-2.5 text-xs font-normal">Last touch</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr
                key={c.id}
                className={cn(
                  'border-line/50 hover:bg-surface-2/60 border-b transition-colors',
                  selected.has(c.id) && 'bg-violet/5'
                )}
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() =>
                      setSelected((s) => {
                        const next = new Set(s)
                        next.has(c.id) ? next.delete(c.id) : next.add(c.id)
                        return next
                      })
                    }
                    aria-label={`Select ${c.name}`}
                    className="accent-[var(--accent-violet)]"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <p className="text-ink">{c.name}</p>
                  <p className="text-subtle text-xs">{c.role}</p>
                </td>
                <td className="text-muted px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={12} className="text-subtle" />
                    {c.company}
                  </span>
                </td>
                <td className="text-muted px-3 py-2.5 font-mono text-xs">
                  {canSeeValue ? currency(c.dealValue) : '••••'}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[0.625rem]',
                      STATUS_TONE[c.status]
                    )}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="text-subtle px-3 py-2.5 text-xs">{relativeDate(c.lastTouch)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-subtle py-12 text-center text-sm">No contacts match “{query}”.</p>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Forecast                                                                   */
/* -------------------------------------------------------------------------- */

function Forecast({ deals }: { deals: Deal[] }) {
  const byStage = STAGES.map((s) => {
    const inStage = deals.filter((d) => d.stage === s.id)
    const raw = inStage.reduce((sum, d) => sum + d.value, 0)
    return {
      stage: s.label,
      raw,
      weighted: Math.round(raw * s.probability),
      count: inStage.length,
    }
  })

  const byOwner = OWNERS.map((o) => ({
    owner: o.split(' ')[0],
    value: deals.filter((d) => d.owner === o).reduce((sum, d) => sum + d.value, 0),
  }))

  const COLORS = ['#78808f', '#60a5fa', '#8b5cf6', '#fbbf24', '#34d399']

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatTile
          label="Pipeline value"
          value={compactNumber(byStage.reduce((s, r) => s + r.raw, 0))}
        />
        <StatTile
          label="Weighted forecast"
          value={compactNumber(byStage.reduce((s, r) => s + r.weighted, 0))}
          accent="text-cyan"
          delta={{ value: '12.4% vs last quarter', positive: true }}
        />
        <StatTile label="Open deals" value={String(deals.filter((d) => d.stage !== 'won').length)} />
        <StatTile
          label="Won this period"
          value={compactNumber(
            deals.filter((d) => d.stage === 'won').reduce((s, d) => s + d.value, 0)
          )}
          accent="text-emerald-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-line rounded-xl border p-4">
          <p className="text-muted mb-4 text-sm">Pipeline by stage — raw vs weighted</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStage} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => compactNumber(Number(v))}
                />
                <Tooltip
                  cursor={{ fill: 'var(--surface-2)' }}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(v) => currency(Number(v))}
                />
                <Bar dataKey="raw" fill="var(--surface-3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="weighted" radius={[4, 4, 0, 0]}>
                  {byStage.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border-line rounded-xl border p-4">
          <p className="text-muted mb-4 text-sm">Pipeline by owner</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byOwner}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => compactNumber(Number(v))}
                />
                <YAxis
                  type="category"
                  dataKey="owner"
                  tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  cursor={{ fill: 'var(--surface-2)' }}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(v) => currency(Number(v))}
                />
                <Bar dataKey="value" fill="var(--accent-violet)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

type Tab = 'board' | 'contacts' | 'forecast'

export default function NexusCrmDemo() {
  const { value: deals, setValue: setDeals, reset } = useLocalStorage<Deal[]>(
    STORAGE_KEY,
    seedDeals()
  )
  const [tab, setTab] = useState<Tab>('board')
  const [openDeal, setOpenDeal] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [role, setRole] = useState<Role>('admin')

  // Commission/value visibility is the classic field-level permission case.
  const canSeeValue = role !== 'rep'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  )

  function moveDeal(id: string, stage: Stage) {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id && d.stage !== stage
          ? {
              ...d,
              stage,
              activities: [
                ...d.activities,
                {
                  id: `${d.id}-${d.activities.length}`,
                  type: 'stage' as const,
                  text: `Moved to ${STAGES.find((s) => s.id === stage)!.label}`,
                  at: new Date().toISOString(),
                  who: 'You',
                },
              ],
            }
          : d
      )
    )
  }

  function onDragEnd(e: DragEndEvent) {
    setDragId(null)
    const stage = e.over?.id as Stage | undefined
    if (stage && STAGES.some((s) => s.id === stage)) moveDeal(String(e.active.id), stage)
  }

  const active = deals.find((d) => d.id === dragId)
  const drawerDeal = deals.find((d) => d.id === openDeal)

  const TABS: { id: Tab; label: string; icon: typeof SquareKanban }[] = [
    { id: 'board', label: 'Pipeline', icon: SquareKanban },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'forecast', label: 'Forecast', icon: Table2 },
  ]

  return (
    <DemoChrome
      title="NexusCRM"
      subtitle="Helio Group"
      onReset={() => {
        reset()
        setOpenDeal(null)
      }}
    >
      <div className="relative">
        {/* Toolbar */}
        <div className="border-line flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5">
          <div className="bg-surface-2 flex gap-0.5 rounded-lg p-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  tab === t.id ? 'bg-surface text-ink shadow-sm' : 'text-subtle hover:text-ink'
                )}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs">
            <span className="text-subtle">Viewing as</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="border-line bg-surface-2 text-ink rounded-md border px-2 py-1 text-xs outline-none"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="rep">Sales rep</option>
            </select>
          </label>
        </div>

        {role === 'rep' && (
          <p className="border-line bg-amber-500/5 text-subtle border-b px-4 py-2 text-[0.6875rem]">
            Deal values are hidden for the sales-rep role — field-level permissions, not just
            record-level.
          </p>
        )}

        {/* Panels */}
        {tab === 'board' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e: DragStartEvent) => setDragId(String(e.active.id))}
            onDragEnd={onDragEnd}
            onDragCancel={() => setDragId(null)}
          >
            <div className="flex gap-3 overflow-x-auto p-4">
              {STAGES.map((s) => (
                <Column
                  key={s.id}
                  stage={s}
                  deals={deals.filter((d) => d.stage === s.id)}
                  onOpen={(d) => setOpenDeal(d.id)}
                  canSeeValue={canSeeValue}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {active && <DealCard deal={active} dragging canSeeValue={canSeeValue} />}
            </DragOverlay>
          </DndContext>
        )}

        {tab === 'contacts' && <ContactsTable deals={deals} canSeeValue={canSeeValue} />}
        {tab === 'forecast' && <Forecast deals={deals} />}

        {drawerDeal && (
          <DealDrawer
            deal={drawerDeal}
            onClose={() => setOpenDeal(null)}
            onStageChange={(s) => moveDeal(drawerDeal.id, s)}
            canSeeValue={canSeeValue}
          />
        )}
      </div>
    </DemoChrome>
  )
}
