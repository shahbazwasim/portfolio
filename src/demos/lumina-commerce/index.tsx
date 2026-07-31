import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, CircleCheck, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react'
import { useLocalStorage, currency } from '@/lib/storage'
import { DemoChrome } from '@/demos/shared/DemoChrome'
import { cn } from '@/lib/cn'

const STORAGE_KEY = 'demo:lumina-cart:v1'

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

type Variant = { id: string; label: string; hue: number; stock: number }
type Product = {
  id: string
  name: string
  category: 'Pendant' | 'Floor' | 'Table' | 'Wall'
  price: number
  rating: number
  reviews: number
  blurb: string
  variants: Variant[]
}

const PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Halo Pendant', category: 'Pendant', price: 289, rating: 4.8, reviews: 214,
    blurb: 'Hand-spun brass shade with a warm 2700K diffuser. Designed for dining tables and kitchen islands.',
    variants: [
      { id: 'brass', label: 'Brushed brass', hue: 42, stock: 12 },
      { id: 'black', label: 'Matte black', hue: 220, stock: 4 },
      { id: 'white', label: 'Chalk white', hue: 200, stock: 0 },
    ],
  },
  {
    id: 'p2', name: 'Meridian Floor', category: 'Floor', price: 445, rating: 4.6, reviews: 98,
    blurb: 'Arc floor lamp with a weighted marble base and a dimmable head that pivots through 180°.',
    variants: [
      { id: 'brass', label: 'Brushed brass', hue: 42, stock: 7 },
      { id: 'chrome', label: 'Polished chrome', hue: 200, stock: 9 },
    ],
  },
  {
    id: 'p3', name: 'Ember Table', category: 'Table', price: 165, rating: 4.9, reviews: 341,
    blurb: 'Portable rechargeable table lamp. Three brightness steps, 20-hour runtime, USB-C.',
    variants: [
      { id: 'terracotta', label: 'Terracotta', hue: 18, stock: 24 },
      { id: 'sage', label: 'Sage', hue: 140, stock: 16 },
      { id: 'ink', label: 'Ink', hue: 240, stock: 11 },
    ],
  },
  {
    id: 'p4', name: 'Linea Wall', category: 'Wall', price: 132, rating: 4.4, reviews: 76,
    blurb: 'Minimal linear sconce with an integrated LED strip. Hardwired or plug-in.',
    variants: [
      { id: 'white', label: 'Chalk white', hue: 200, stock: 31 },
      { id: 'black', label: 'Matte black', hue: 220, stock: 18 },
    ],
  },
  {
    id: 'p5', name: 'Orbit Pendant', category: 'Pendant', price: 375, rating: 4.7, reviews: 156,
    blurb: 'Three-globe cluster in hand-blown smoked glass. Adjustable drop up to 1.8m.',
    variants: [
      { id: 'smoke', label: 'Smoked glass', hue: 260, stock: 6 },
      { id: 'clear', label: 'Clear glass', hue: 190, stock: 2 },
    ],
  },
  {
    id: 'p6', name: 'Cairn Table', category: 'Table', price: 218, rating: 4.5, reviews: 62,
    blurb: 'Stacked ceramic form with a linen shade. Warm dimmable bulb included.',
    variants: [
      { id: 'sand', label: 'Sand', hue: 38, stock: 14 },
      { id: 'slate', label: 'Slate', hue: 215, stock: 8 },
    ],
  },
  {
    id: 'p7', name: 'Tor Floor', category: 'Floor', price: 520, rating: 4.9, reviews: 44,
    blurb: 'Sculptural oak floor lamp with a pleated shade. Made to order in 4 weeks.',
    variants: [
      { id: 'oak', label: 'Natural oak', hue: 32, stock: 3 },
      { id: 'walnut', label: 'Walnut', hue: 20, stock: 5 },
    ],
  },
  {
    id: 'p8', name: 'Fold Wall', category: 'Wall', price: 96, rating: 4.2, reviews: 129,
    blurb: 'Folded-steel reading light with a magnetic swivel arm.',
    variants: [
      { id: 'black', label: 'Matte black', hue: 220, stock: 42 },
      { id: 'olive', label: 'Olive', hue: 90, stock: 20 },
    ],
  },
]

const CATEGORIES = ['All', 'Pendant', 'Floor', 'Table', 'Wall'] as const
const PRICE_BANDS = [
  { id: 'all', label: 'Any price', test: () => true },
  { id: 'under-200', label: 'Under $200', test: (p: Product) => p.price < 200 },
  { id: '200-400', label: '$200 – $400', test: (p: Product) => p.price >= 200 && p.price <= 400 },
  { id: 'over-400', label: 'Over $400', test: (p: Product) => p.price > 400 },
] as const

type CartLine = { productId: string; variantId: string; qty: number }

/* -------------------------------------------------------------------------- */
/* Product artwork — a generated lamp silhouette, tinted per variant          */
/* -------------------------------------------------------------------------- */

function ProductArt({ product, hue }: { product: Product; hue: number }) {
  const shade = `hsl(${hue} 45% 55%)`
  const dim = `hsl(${hue} 30% 40% / 0.4)`

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={product.name}>
      <defs>
        <radialGradient id={`glow-${product.id}-${hue}`} cx="50%" cy="42%" r="42%">
          <stop offset="0%" stopColor={`hsl(${hue} 80% 70% / 0.55)`} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`hsl(${hue} 25% 50% / 0.06)`} />
      <circle cx="100" cy="88" r="70" fill={`url(#glow-${product.id}-${hue})`} />

      {product.category === 'Pendant' && (
        <>
          <line x1="100" y1="18" x2="100" y2="62" stroke={dim} strokeWidth="2" />
          <path d="M62 108 Q100 56 138 108 Z" fill={shade} />
          <ellipse cx="100" cy="108" rx="38" ry="7" fill={`hsl(${hue} 60% 68%)`} />
        </>
      )}
      {product.category === 'Floor' && (
        <>
          <path d="M78 176 Q78 96 116 78" fill="none" stroke={dim} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="78" cy="178" rx="30" ry="7" fill={dim} />
          <path d="M100 62 Q124 46 142 78 L112 92 Z" fill={shade} />
        </>
      )}
      {product.category === 'Table' && (
        <>
          <path d="M70 96 L130 96 L120 62 L80 62 Z" fill={shade} />
          <rect x="96" y="96" width="8" height="52" fill={dim} />
          <ellipse cx="100" cy="152" rx="34" ry="9" fill={dim} />
        </>
      )}
      {product.category === 'Wall' && (
        <>
          <rect x="34" y="88" width="12" height="42" rx="3" fill={dim} />
          <rect x="46" y="100" width="112" height="14" rx="7" fill={shade} />
          <rect x="52" y="118" width="100" height="4" rx="2" fill={`hsl(${hue} 70% 72% / 0.6)`} />
        </>
      )}
    </svg>
  )
}

/* -------------------------------------------------------------------------- */

export default function LuminaDemo() {
  const { value: cart, setValue: setCart, reset } = useLocalStorage<CartLine[]>(STORAGE_KEY, [])
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All')
  const [band, setBand] = useState<(typeof PRICE_BANDS)[number]['id']>('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [detail, setDetail] = useState<{ product: Product; variantId: string } | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(0)

  const filtered = useMemo(() => {
    const bandTest = PRICE_BANDS.find((b) => b.id === band)!.test
    return PRODUCTS.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        bandTest(p) &&
        (!inStockOnly || p.variants.some((v) => v.stock > 0))
    )
  }, [category, band, inStockOnly])

  const lines = cart
    .map((line) => {
      const product = PRODUCTS.find((p) => p.id === line.productId)
      const variant = product?.variants.find((v) => v.id === line.variantId)
      return product && variant ? { line, product, variant } : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.line.qty, 0)
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 24
  const tax = Math.round(subtotal * 0.08)
  const itemCount = lines.reduce((s, l) => s + l.line.qty, 0)

  function addToCart(productId: string, variantId: string, qty = 1) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId && l.variantId === variantId)
      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...l, qty: Math.min(l.qty + qty, 10) } : l
        )
      }
      return [...prev, { productId, variantId, qty }]
    })
    setCartOpen(true)
  }

  function setQty(productId: string, variantId: string, qty: number) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.variantId === variantId))
        : prev.map((l) =>
            l.productId === productId && l.variantId === variantId ? { ...l, qty } : l
          )
    )
  }

  const STEPS = ['Cart', 'Shipping', 'Payment', 'Confirmed']

  return (
    <DemoChrome
      title="Lumina"
      subtitle="lumina.store"
      onReset={() => {
        reset()
        setCartOpen(false)
        setCheckoutStep(0)
        setDetail(null)
      }}
    >
      <div className="relative">
        {/* Store header */}
        <div className="border-line flex items-center justify-between gap-4 border-b px-4 py-3">
          <span className="font-display text-ink text-lg font-semibold tracking-tight">LUMINA</span>
          <nav className="text-subtle hidden gap-5 text-xs sm:flex">
            {['New in', 'Lighting', 'Collections', 'Journal'].map((n) => (
              <span key={n} className="hover:text-ink cursor-default transition-colors">
                {n}
              </span>
            ))}
          </nav>
          <button
            onClick={() => setCartOpen(true)}
            className="border-line text-muted hover:text-ink hover:border-line-strong relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors"
          >
            <ShoppingBag size={13} />
            Cart
            {itemCount > 0 && (
              <span className="bg-cyan text-bg grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.5625rem] font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Facets */}
        <div className="border-line flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[0.6875rem] transition-colors',
                category === c
                  ? 'border-cyan/50 bg-cyan/10 text-cyan'
                  : 'border-line text-subtle hover:text-ink'
              )}
            >
              {c}
            </button>
          ))}
          <span className="bg-line mx-1 h-4 w-px" />
          <select
            value={band}
            onChange={(e) => setBand(e.target.value as typeof band)}
            className="border-line bg-surface-2 text-muted rounded-md border px-2 py-1 text-[0.6875rem] outline-none"
          >
            {PRICE_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          <label className="text-subtle flex cursor-pointer items-center gap-1.5 text-[0.6875rem]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-[var(--accent-cyan)]"
            />
            In stock only
          </label>
          <span className="text-subtle ml-auto text-[0.6875rem]">{filtered.length} products</span>
        </div>

        {/* Grid */}
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => {
            const firstAvailable = p.variants.find((v) => v.stock > 0) ?? p.variants[0]
            return (
              <button
                key={p.id}
                onClick={() => setDetail({ product: p, variantId: firstAvailable.id })}
                className="border-line hover:border-line-strong group overflow-hidden rounded-xl border text-left transition-colors"
              >
                <div className="bg-surface-2 aspect-square overflow-hidden">
                  <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                    <ProductArt product={p} hue={firstAvailable.hue} />
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-ink truncate text-sm font-medium">{p.name}</p>
                    <p className="text-ink shrink-0 font-mono text-sm">{currency(p.price)}</p>
                  </div>
                  <div className="text-subtle mt-1.5 flex items-center gap-2 text-[0.625rem]">
                    <span className="inline-flex items-center gap-0.5 text-amber-400">
                      <Star size={9} className="fill-current" />
                      {p.rating}
                    </span>
                    <span>({p.reviews})</span>
                    <span className="ml-auto flex gap-1">
                      {p.variants.map((v) => (
                        <span
                          key={v.id}
                          className="border-line h-2.5 w-2.5 rounded-full border"
                          style={{ background: `hsl(${v.hue} 45% 55%)` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Product detail */}
        <AnimatePresence>
          {detail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center p-4"
            >
              <div className="bg-bg/70 absolute inset-0 backdrop-blur-sm" onClick={() => setDetail(null)} />
              <motion.div
                initial={{ scale: 0.96, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 12 }}
                className="border-line bg-surface relative grid max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl border sm:grid-cols-2"
              >
                <div className="bg-surface-2 aspect-square">
                  <ProductArt
                    product={detail.product}
                    hue={
                      detail.product.variants.find((v) => v.id === detail.variantId)?.hue ??
                      detail.product.variants[0].hue
                    }
                  />
                </div>
                <div className="flex flex-col p-5">
                  <button
                    onClick={() => setDetail(null)}
                    aria-label="Close"
                    className="text-subtle hover:text-ink absolute top-3 right-3 transition-colors"
                  >
                    <X size={17} />
                  </button>
                  <p className="text-subtle text-[0.625rem] tracking-widest uppercase">
                    {detail.product.category}
                  </p>
                  <h3 className="text-ink mt-1 text-xl">{detail.product.name}</h3>
                  <p className="text-ink mt-2 font-mono text-lg">{currency(detail.product.price)}</p>
                  <p className="text-muted mt-3 text-sm leading-relaxed">{detail.product.blurb}</p>

                  <p className="text-subtle mt-5 mb-2 text-[0.625rem] tracking-widest uppercase">
                    Finish
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detail.product.variants.map((v) => {
                      const active = v.id === detail.variantId
                      return (
                        <button
                          key={v.id}
                          disabled={v.stock === 0}
                          onClick={() => setDetail({ ...detail, variantId: v.id })}
                          className={cn(
                            'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                            v.stock === 0 && 'cursor-not-allowed opacity-40',
                            active ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-line text-muted'
                          )}
                        >
                          <span
                            className="border-line h-3 w-3 rounded-full border"
                            style={{ background: `hsl(${v.hue} 45% 55%)` }}
                          />
                          {v.label}
                          {v.stock === 0 && <span className="text-[0.5625rem]">sold out</span>}
                        </button>
                      )
                    })}
                  </div>

                  {(() => {
                    const v = detail.product.variants.find((x) => x.id === detail.variantId)!
                    return (
                      <>
                        <p
                          className={cn(
                            'mt-4 text-xs',
                            v.stock === 0
                              ? 'text-red-400'
                              : v.stock < 5
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                          )}
                        >
                          {v.stock === 0
                            ? 'Out of stock'
                            : v.stock < 5
                              ? `Only ${v.stock} left`
                              : `${v.stock} in stock`}
                        </p>
                        <button
                          disabled={v.stock === 0}
                          onClick={() => {
                            addToCart(detail.product.id, v.id)
                            setDetail(null)
                          }}
                          className={cn(
                            'mt-auto w-full rounded-full py-3 text-sm font-medium transition-opacity',
                            v.stock === 0
                              ? 'bg-surface-2 text-subtle cursor-not-allowed'
                              : 'bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] text-white hover:opacity-90'
                          )}
                        >
                          Add to cart · {currency(detail.product.price)}
                        </button>
                      </>
                    )
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart / checkout drawer */}
        <AnimatePresence>
          {cartOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex justify-end"
            >
              <div className="bg-bg/60 absolute inset-0 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
              <motion.aside
                initial={{ x: 40 }}
                animate={{ x: 0 }}
                exit={{ x: 40 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="border-line bg-surface relative flex w-full max-w-sm flex-col border-l"
              >
                <header className="border-line flex items-center justify-between border-b p-4">
                  <p className="text-ink font-medium">
                    {checkoutStep === 0 ? `Cart (${itemCount})` : STEPS[checkoutStep]}
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    aria-label="Close cart"
                    className="text-subtle hover:text-ink transition-colors"
                  >
                    <X size={17} />
                  </button>
                </header>

                {/* Stepper */}
                <div className="border-line flex items-center gap-1 border-b px-4 py-2.5">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center gap-1">
                      <span
                        className={cn(
                          'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.5625rem] font-bold',
                          i < checkoutStep
                            ? 'bg-emerald-500 text-white'
                            : i === checkoutStep
                              ? 'bg-cyan text-bg'
                              : 'bg-surface-2 text-subtle'
                        )}
                      >
                        {i < checkoutStep ? <Check size={10} /> : i + 1}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span
                          className={cn(
                            'h-px flex-1',
                            i < checkoutStep ? 'bg-emerald-500' : 'bg-line'
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {checkoutStep === 3 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <CircleCheck size={40} className="text-emerald-400" />
                      <p className="text-ink text-lg">Order confirmed</p>
                      <p className="text-muted text-sm">
                        Order <span className="font-mono">#LUM-48213</span> — a confirmation would
                        be on its way.
                      </p>
                      <button
                        onClick={() => {
                          reset()
                          setCheckoutStep(0)
                          setCartOpen(false)
                        }}
                        className="text-cyan mt-2 text-xs underline underline-offset-4"
                      >
                        Start over
                      </button>
                    </div>
                  ) : lines.length === 0 ? (
                    <p className="text-subtle py-16 text-center text-sm">Your cart is empty.</p>
                  ) : checkoutStep === 0 ? (
                    <ul className="flex flex-col gap-3">
                      {lines.map(({ line, product, variant }) => (
                        <li
                          key={`${line.productId}-${line.variantId}`}
                          className="border-line flex gap-3 rounded-xl border p-2.5"
                        >
                          <div className="bg-surface-2 h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                            <ProductArt product={product} hue={variant.hue} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-ink truncate text-sm">{product.name}</p>
                            <p className="text-subtle truncate text-[0.625rem]">{variant.label}</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="border-line flex items-center gap-1 rounded-md border">
                                <button
                                  onClick={() =>
                                    setQty(line.productId, line.variantId, line.qty - 1)
                                  }
                                  aria-label="Decrease quantity"
                                  className="text-subtle hover:text-ink grid h-6 w-6 place-items-center transition-colors"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="text-ink w-5 text-center font-mono text-xs">
                                  {line.qty}
                                </span>
                                <button
                                  onClick={() =>
                                    setQty(
                                      line.productId,
                                      line.variantId,
                                      Math.min(line.qty + 1, variant.stock || 10)
                                    )
                                  }
                                  disabled={line.qty >= (variant.stock || 10)}
                                  aria-label="Increase quantity"
                                  className="text-subtle hover:text-ink grid h-6 w-6 place-items-center transition-colors disabled:opacity-30"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                              <span className="text-ink font-mono text-xs">
                                {currency(product.price * line.qty)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-subtle text-xs">
                        {checkoutStep === 1
                          ? 'Where should it go?'
                          : 'Payment details — nothing is transmitted anywhere.'}
                      </p>
                      {(checkoutStep === 1
                        ? ['Full name', 'Address line 1', 'City', 'Postcode', 'Country']
                        : ['Card number', 'Name on card', 'Expiry', 'CVC']
                      ).map((f) => (
                        <input
                          key={f}
                          placeholder={f}
                          className="border-line bg-surface-2/60 text-ink placeholder:text-subtle h-10 rounded-lg border px-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--accent-violet)]"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {lines.length > 0 && checkoutStep < 3 && (
                  <footer className="border-line border-t p-4">
                    <dl className="mb-4 flex flex-col gap-1.5 text-xs">
                      <div className="text-muted flex justify-between">
                        <dt>Subtotal</dt>
                        <dd className="font-mono">{currency(subtotal)}</dd>
                      </div>
                      <div className="text-muted flex justify-between">
                        <dt>Shipping</dt>
                        <dd className="font-mono">
                          {shipping === 0 ? 'Free' : currency(shipping)}
                        </dd>
                      </div>
                      <div className="text-muted flex justify-between">
                        <dt>Tax (8%)</dt>
                        <dd className="font-mono">{currency(tax)}</dd>
                      </div>
                      <div className="border-line text-ink mt-1.5 flex justify-between border-t pt-2.5 text-sm font-medium">
                        <dt>Total</dt>
                        <dd className="font-mono">{currency(subtotal + shipping + tax)}</dd>
                      </div>
                    </dl>
                    {subtotal < 500 && subtotal > 0 && (
                      <p className="text-subtle mb-3 text-[0.625rem]">
                        {currency(500 - subtotal)} more for free shipping
                      </p>
                    )}
                    <div className="flex gap-2">
                      {checkoutStep > 0 && (
                        <button
                          onClick={() => setCheckoutStep((s) => s - 1)}
                          className="border-line text-muted hover:text-ink rounded-full border px-4 py-2.5 text-sm transition-colors"
                        >
                          Back
                        </button>
                      )}
                      <button
                        onClick={() => setCheckoutStep((s) => s + 1)}
                        className="flex-1 rounded-full bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      >
                        {checkoutStep === 0 ? 'Checkout' : checkoutStep === 2 ? 'Place order' : 'Continue'}
                      </button>
                    </div>
                  </footer>
                )}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoChrome>
  )
}
