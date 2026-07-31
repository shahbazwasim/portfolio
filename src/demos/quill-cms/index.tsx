import { useMemo, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Calendar,
  Eye,
  GripVertical,
  Heading2,
  Image as ImageIcon,
  List,
  Pencil,
  Plus,
  Quote,
  Trash2,
  Type,
} from 'lucide-react'
import { useLocalStorage } from '@/lib/storage'
import { DemoChrome } from '@/demos/shared/DemoChrome'
import { cn } from '@/lib/cn'

const STORAGE_KEY = 'demo:quill-cms:v1'

/* -------------------------------------------------------------------------- */

type BlockType = 'heading' | 'paragraph' | 'quote' | 'list' | 'image'

type Block = {
  id: string
  type: BlockType
  text: string
  /** Hue for the generated placeholder image. */
  hue?: number
}

type Status = 'draft' | 'scheduled' | 'published'

type Post = {
  id: string
  title: string
  slug: string
  status: Status
  category: string
  tags: string[]
  author: string
  date: string
  blocks: Block[]
}

const CATEGORIES = ['Design', 'Engineering', 'Culture', 'Product']

const SEED: Post[] = [
  {
    id: 'p1',
    title: 'Designing for the second glance',
    slug: 'designing-for-the-second-glance',
    status: 'published',
    category: 'Design',
    tags: ['craft', 'ux'],
    author: 'Editorial',
    date: '2026-06-18',
    blocks: [
      { id: 'b1', type: 'paragraph', text: 'Most interfaces are designed for the first impression. The ones people keep using are designed for the thousandth.' },
      { id: 'b2', type: 'heading', text: 'Familiarity beats novelty' },
      { id: 'b3', type: 'paragraph', text: 'A layout that surprises you is a layout you have to re-learn every visit. Delight belongs in the details, not the structure.' },
      { id: 'b4', type: 'quote', text: 'Good design is obvious. Great design is transparent.' },
      { id: 'b5', type: 'image', text: 'A quiet workspace, mid-afternoon', hue: 200 },
    ],
  },
  {
    id: 'p2',
    title: 'What we learned shipping weekly',
    slug: 'what-we-learned-shipping-weekly',
    status: 'scheduled',
    category: 'Engineering',
    tags: ['process', 'delivery'],
    author: 'Editorial',
    date: '2026-08-02',
    blocks: [
      { id: 'b1', type: 'paragraph', text: 'We moved from quarterly releases to weekly. Here is what actually changed — and what did not.' },
      { id: 'b2', type: 'list', text: 'Smaller changes are easier to review\nRollbacks stopped being frightening\nEstimates got worse, not better\nOn-call load went down, not up' },
    ],
  },
  {
    id: 'p3',
    title: 'The case against the redesign',
    slug: 'the-case-against-the-redesign',
    status: 'draft',
    category: 'Product',
    tags: ['strategy'],
    author: 'Editorial',
    date: '2026-07-28',
    blocks: [
      { id: 'b1', type: 'paragraph', text: 'Every redesign is a bet that the current thing is worse than the disruption of replacing it. That bet is usually wrong.' },
    ],
  },
]

const BLOCK_META: Record<BlockType, { label: string; icon: typeof Type }> = {
  heading: { label: 'Heading', icon: Heading2 },
  paragraph: { label: 'Paragraph', icon: Type },
  quote: { label: 'Quote', icon: Quote },
  list: { label: 'List', icon: List },
  image: { label: 'Image', icon: ImageIcon },
}

const STATUS_TONE: Record<Status, string> = {
  draft: 'border-line bg-surface-2 text-subtle',
  scheduled: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  published: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
}

/* -------------------------------------------------------------------------- */

function PlaceholderImage({ hue = 220, caption }: { hue?: number; caption: string }) {
  return (
    <div
      className="border-line relative grid aspect-[16/9] w-full place-items-center overflow-hidden rounded-lg border"
      style={{
        background: `linear-gradient(140deg, hsl(${hue} 45% 45% / 0.35), hsl(${(hue + 50) % 360} 45% 45% / 0.15))`,
      }}
    >
      <svg viewBox="0 0 200 112" className="absolute inset-0 h-full w-full opacity-40">
        <circle cx="150" cy="30" r="14" fill={`hsl(${hue} 70% 70% / 0.5)`} />
        <path d="M0 92 L52 52 L92 82 L134 46 L200 96 L200 112 L0 112 Z" fill={`hsl(${hue} 45% 30% / 0.6)`} />
        <path d="M0 104 L60 72 L110 96 L160 70 L200 104 L200 112 L0 112 Z" fill={`hsl(${hue} 50% 22% / 0.7)`} />
      </svg>
      <span className="text-subtle relative px-3 text-center text-[0.625rem]">{caption}</span>
    </div>
  )
}

function SortableBlock({
  block,
  onChange,
  onDelete,
}: {
  block: Block
  onChange: (text: string) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })
  const Meta = BLOCK_META[block.type]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'border-line bg-surface-2/40 group rounded-xl border p-3',
        isDragging && 'opacity-50 shadow-[var(--shadow-lift)]'
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          {...listeners}
          {...attributes}
          aria-label="Reorder block"
          className="text-subtle hover:text-ink cursor-grab touch-none transition-colors active:cursor-grabbing"
        >
          <GripVertical size={13} />
        </button>
        <span className="text-subtle inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-wide uppercase">
          <Meta.icon size={10} />
          {Meta.label}
        </span>
        <button
          onClick={onDelete}
          aria-label="Delete block"
          className="text-subtle ml-auto opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {block.type === 'image' ? (
        <div className="flex flex-col gap-2">
          <PlaceholderImage hue={block.hue} caption={block.text} />
          <input
            value={block.text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image caption"
            className="border-line bg-surface text-muted placeholder:text-subtle h-8 rounded-md border px-2.5 text-xs outline-none focus:ring-1 focus:ring-[var(--accent-violet)]"
          />
        </div>
      ) : (
        <textarea
          value={block.text}
          onChange={(e) => onChange(e.target.value)}
          rows={block.type === 'paragraph' || block.type === 'list' ? 3 : 1}
          placeholder={`Write your ${block.type}…`}
          className={cn(
            'bg-surface border-line text-ink placeholder:text-subtle w-full resize-y rounded-md border px-3 py-2 outline-none focus:ring-1 focus:ring-[var(--accent-violet)]',
            block.type === 'heading' && 'font-display text-lg font-semibold',
            block.type === 'quote' && 'text-muted italic',
            block.type !== 'heading' && 'text-sm'
          )}
        />
      )}
    </div>
  )
}

function Preview({ post }: { post: Post }) {
  return (
    <article className="mx-auto max-w-2xl px-5 py-8">
      <p className="text-subtle font-mono text-[0.625rem] tracking-widest uppercase">
        {post.category}
      </p>
      <h1 className="font-display text-ink mt-3 text-3xl leading-tight font-semibold">
        {post.title || 'Untitled post'}
      </h1>
      <p className="text-subtle mt-3 text-xs">
        {post.author} ·{' '}
        {new Date(`${post.date}T00:00:00Z`).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        })}
      </p>
      <div className="mt-8 flex flex-col gap-5">
        {post.blocks.map((b) => {
          if (b.type === 'heading')
            return (
              <h2 key={b.id} className="font-display text-ink mt-3 text-xl font-semibold">
                {b.text}
              </h2>
            )
          if (b.type === 'quote')
            return (
              <blockquote
                key={b.id}
                className="border-violet text-muted border-l-2 pl-4 text-lg leading-relaxed italic"
              >
                {b.text}
              </blockquote>
            )
          if (b.type === 'list')
            return (
              <ul key={b.id} className="text-muted flex flex-col gap-2 text-[0.9375rem]">
                {b.text.split('\n').filter(Boolean).map((li, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed">
                    <span className="from-cyan to-violet mt-[0.6em] h-px w-3 shrink-0 bg-gradient-to-r" />
                    {li}
                  </li>
                ))}
              </ul>
            )
          if (b.type === 'image')
            return (
              <figure key={b.id}>
                <PlaceholderImage hue={b.hue} caption={b.text} />
                <figcaption className="text-subtle mt-2 text-xs">{b.text}</figcaption>
              </figure>
            )
          return (
            <p key={b.id} className="text-muted text-[0.9375rem] leading-relaxed">
              {b.text}
            </p>
          )
        })}
      </div>
      <div className="border-line mt-10 flex flex-wrap gap-1.5 border-t pt-5">
        {post.tags.map((t) => (
          <span
            key={t}
            className="border-line text-subtle rounded-full border px-2.5 py-1 text-[0.625rem]"
          >
            #{t}
          </span>
        ))}
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */

export default function QuillDemo() {
  const { value: posts, setValue: setPosts, reset } = useLocalStorage<Post[]>(STORAGE_KEY, SEED)
  const [activeId, setActiveId] = useState(SEED[0].id)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const post = useMemo(() => posts.find((p) => p.id === activeId) ?? posts[0], [posts, activeId])

  function update(patch: Partial<Post>) {
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, ...patch } : p)))
  }

  function updateBlock(blockId: string, text: string) {
    update({ blocks: post.blocks.map((b) => (b.id === blockId ? { ...b, text } : b)) })
  }

  function addBlock(type: BlockType) {
    update({
      blocks: [
        ...post.blocks,
        {
          id: `b${Date.now()}`,
          type,
          text: type === 'image' ? 'New image caption' : '',
          hue: type === 'image' ? Math.floor(Math.random() * 360) : undefined,
        },
      ],
    })
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = post.blocks.findIndex((b) => b.id === active.id)
    const to = post.blocks.findIndex((b) => b.id === over.id)
    const next = [...post.blocks]
    next.splice(to, 0, next.splice(from, 1)[0])
    update({ blocks: next })
  }

  function newPost() {
    const id = `p${Date.now()}`
    setPosts((prev) => [
      {
        id,
        title: '',
        slug: 'untitled',
        status: 'draft',
        category: CATEGORIES[0],
        tags: [],
        author: 'Editorial',
        date: '2026-07-15',
        blocks: [{ id: 'b1', type: 'paragraph', text: '' }],
      },
      ...prev,
    ])
    setActiveId(id)
    setMode('edit')
  }

  return (
    <DemoChrome
      title="Quill"
      subtitle="content management"
      onReset={() => {
        reset()
        setActiveId(SEED[0].id)
      }}
    >
      <div className="grid min-h-[560px] lg:grid-cols-[220px_1fr]">
        {/* Posts list */}
        <aside className="border-line flex flex-col border-b lg:border-r lg:border-b-0">
          <div className="border-line flex items-center justify-between border-b px-3 py-2.5">
            <span className="text-subtle font-mono text-[0.625rem] tracking-widest uppercase">
              Posts ({posts.length})
            </span>
            <button
              onClick={newPost}
              aria-label="New post"
              className="text-subtle hover:text-ink hover:bg-surface-2 grid h-6 w-6 place-items-center rounded transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>
          <ul className="max-h-56 flex-1 overflow-y-auto lg:max-h-none">
            {posts.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setActiveId(p.id)}
                  className={cn(
                    'border-line/60 w-full border-b px-3 py-2.5 text-left transition-colors',
                    p.id === post.id ? 'bg-surface-2' : 'hover:bg-surface-2/50'
                  )}
                >
                  <p
                    className={cn(
                      'truncate text-xs',
                      p.id === post.id ? 'text-ink font-medium' : 'text-muted'
                    )}
                  >
                    {p.title || 'Untitled post'}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        'rounded-full border px-1.5 py-px text-[0.5625rem]',
                        STATUS_TONE[p.status]
                      )}
                    >
                      {p.status}
                    </span>
                    <span className="text-subtle text-[0.5625rem]">{p.category}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor */}
        <div className="flex flex-col">
          <div className="border-line flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
            <div className="bg-surface-2 flex gap-0.5 rounded-lg p-0.5">
              {(
                [
                  ['edit', 'Edit', Pencil],
                  ['preview', 'Preview', Eye],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                    mode === id ? 'bg-surface text-ink shadow-sm' : 'text-subtle hover:text-ink'
                  )}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            <select
              value={post.status}
              onChange={(e) => update({ status: e.target.value as Status })}
              className={cn(
                'rounded-md border px-2 py-1 text-[0.6875rem] outline-none',
                STATUS_TONE[post.status]
              )}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>

            <select
              value={post.category}
              onChange={(e) => update({ category: e.target.value })}
              className="border-line bg-surface-2 text-muted rounded-md border px-2 py-1 text-[0.6875rem] outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="text-subtle ml-auto inline-flex items-center gap-1.5 text-[0.6875rem]">
              <Calendar size={11} />
              <input
                type="date"
                value={post.date}
                onChange={(e) => update({ date: e.target.value })}
                className="border-line bg-surface-2 text-muted rounded-md border px-2 py-1 text-[0.6875rem] outline-none"
              />
            </label>
          </div>

          {mode === 'preview' ? (
            <div className="flex-1 overflow-y-auto">
              <Preview post={post} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <input
                value={post.title}
                onChange={(e) =>
                  update({
                    title: e.target.value,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-|-$/g, '') || 'untitled',
                  })
                }
                placeholder="Post title"
                className="font-display text-ink placeholder:text-subtle w-full bg-transparent text-2xl font-semibold outline-none"
              />
              <p className="text-subtle mt-1.5 font-mono text-[0.6875rem]">/blog/{post.slug}</p>

              <div className="mt-6 flex flex-col gap-3">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={post.blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {post.blocks.map((b) => (
                      <SortableBlock
                        key={b.id}
                        block={b}
                        onChange={(text) => updateBlock(b.id, text)}
                        onDelete={() =>
                          update({ blocks: post.blocks.filter((x) => x.id !== b.id) })
                        }
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <div className="border-line mt-5 flex flex-wrap gap-2 border-t pt-4">
                <span className="text-subtle mr-1 self-center font-mono text-[0.625rem] tracking-widest uppercase">
                  Add block
                </span>
                {(Object.keys(BLOCK_META) as BlockType[]).map((t) => {
                  const Meta = BLOCK_META[t]
                  return (
                    <button
                      key={t}
                      onClick={() => addBlock(t)}
                      className="border-line text-muted hover:text-ink hover:border-line-strong inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.6875rem] transition-colors"
                    >
                      <Meta.icon size={11} />
                      {Meta.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DemoChrome>
  )
}
