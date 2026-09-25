import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type LightboxImage = {
  src: string
  srcSet?: string
  alt: string
  caption: string
}

type LightboxProps = {
  images: LightboxImage[]
  /** Index of the image on show; null keeps the viewer closed. */
  index: number | null
  onIndexChange: (index: number | null) => void
}

/**
 * Full-screen image viewer. Esc closes, the arrow keys page through, and focus
 * returns to whatever opened it. The page behind stops scrolling while it's up
 * (data-lenis-prevent keeps smooth scroll from moving it underneath).
 */
export function Lightbox({ images, index, onIndexChange }: LightboxProps) {
  const open = index !== null
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = overflow
      returnFocus.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onIndexChange(null)
      if (e.key === 'ArrowRight') onIndexChange(((index ?? 0) + 1) % images.length)
      if (e.key === 'ArrowLeft') onIndexChange(((index ?? 0) - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, images.length, onIndexChange])

  const image = index !== null ? images[index] : undefined
  const step = (delta: number) =>
    index !== null && onIndexChange((index + delta + images.length) % images.length)

  const control =
    'border-line-strong bg-surface/80 text-ink hover:bg-surface-2 grid h-11 w-11 place-items-center rounded-full border backdrop-blur transition-colors'

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          data-no-print
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <div className="bg-bg/85 absolute inset-0 backdrop-blur-md" onClick={() => onIndexChange(null)} />

          <motion.figure
            key={image.src}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-6xl"
          >
            <img
              src={image.src}
              srcSet={image.srcSet}
              sizes="(min-width: 1200px) 1152px, 94vw"
              alt={image.alt}
              width={1600}
              height={900}
              className="border-line-strong max-h-[78svh] w-full rounded-2xl border object-contain shadow-[var(--shadow-lift)]"
            />
            <figcaption className="text-muted mt-3 flex items-baseline justify-between gap-4 text-sm">
              <span>{image.caption}</span>
              <span className="text-subtle shrink-0 font-mono text-xs">
                {(index ?? 0) + 1} / {images.length}
              </span>
            </figcaption>
          </motion.figure>

          <div className="relative flex items-center gap-3">
            <button type="button" onClick={() => step(-1)} aria-label="Previous image" className={control}>
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button type="button" ref={closeRef} onClick={() => onIndexChange(null)} aria-label="Close viewer" className={control}>
              <X size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next image" className={control}>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
