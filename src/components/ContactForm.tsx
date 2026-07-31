import { useState } from 'react'
import { CircleCheck, LoaderCircle, Send, TriangleAlert } from 'lucide-react'
import { SITE } from '@/data/site'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const PROJECT_TYPES = [
  'AI / LLM integration',
  'Custom CRM or internal tool',
  'E-commerce (Shopify / Magento)',
  'Full stack web application',
  'Data engineering / BI',
  'Legacy modernisation',
  'Full-time role',
  'Something else',
]

const BUDGETS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000+',
  'Full-time salary',
  'Not sure yet',
]

const TIMELINES = ['ASAP', 'Within a month', '1–3 months', '3+ months', 'Just exploring']

type Fields = {
  name: string
  email: string
  company: string
  projectType: string
  budget: string
  timeline: string
  message: string
  'bot-field': string
}

const EMPTY: Fields = {
  name: '',
  email: '',
  company: '',
  projectType: '',
  budget: '',
  timeline: '',
  message: '',
  'bot-field': '',
}

type Errors = Partial<Record<keyof Fields, string>>

function validate(values: Fields): Errors {
  const errors: Errors = {}
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.'
  // Deliberately permissive — the goal is catching typos, not policing RFC 5322.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'Please enter a valid email address.'
  if (values.message.trim().length < 20)
    errors.message = 'A little more detail helps me give you a useful reply (20+ characters).'
  return errors
}

const inputBase =
  'w-full rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-[0.9375rem] text-ink placeholder:text-subtle transition-colors focus:border-transparent focus:ring-2 focus:ring-[var(--accent-violet)] focus:outline-none'

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-muted text-sm font-medium">
        {label}
        {required && <span className="text-magenta ml-1">*</span>}
        {!required && <span className="text-subtle ml-2 text-xs font-normal">optional</span>}
      </label>
      {children}
      {error ? (
        <p className="text-magenta flex items-center gap-1.5 text-xs" role="alert">
          <TriangleAlert size={12} />
          {error}
        </p>
      ) : hint ? (
        <p className="text-subtle text-xs">{hint}</p>
      ) : null}
    </div>
  )
}

export function ContactForm() {
  const [values, setValues] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  function set<K extends keyof Fields>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Honeypot: a real person never fills a hidden field. Pretend it worked so
    // bots don't learn anything from the response.
    if (values['bot-field']) {
      setStatus('success')
      return
    }

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    setStatus('submitting')
    try {
      const body = new URLSearchParams({ 'form-name': 'contact', ...values })
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) throw new Error(`Netlify returned ${res.status}`)
      setStatus('success')
      setValues(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border-line bg-surface-2/40 rounded-panel flex flex-col items-center gap-4 border px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CircleCheck size={26} />
        </span>
        <h3 className="text-2xl">Message sent</h3>
        <p className="text-muted max-w-md leading-relaxed">
          Thanks for reaching out — it landed in my inbox. {SITE.availability.responseTime}, usually
          sooner.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-muted hover:text-ink mt-2 text-sm underline underline-offset-4 transition-colors"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Netlify needs these in the submitted payload */}
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden" aria-hidden="true">
        <label>
          Leave this field empty
          <input
            name="bot-field"
            tabIndex={-1}
            autoComplete="off"
            value={values['bot-field']}
            onChange={(e) => set('bot-field', e.target.value)}
          />
        </label>
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={errors.name} required>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Jane Cooper"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!errors.name}
            className={cn(inputBase, errors.name && 'border-magenta/60')}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="jane@company.com"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            aria-invalid={!!errors.email}
            className={cn(inputBase, errors.email && 'border-magenta/60')}
          />
        </Field>
      </div>

      <Field label="Company" htmlFor="company">
        <input
          id="company"
          name="company"
          autoComplete="organization"
          placeholder="Acme Inc."
          value={values.company}
          onChange={(e) => set('company', e.target.value)}
          className={inputBase}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Project type" htmlFor="projectType">
          <select
            id="projectType"
            name="projectType"
            value={values.projectType}
            onChange={(e) => set('projectType', e.target.value)}
            className={cn(inputBase, 'appearance-none bg-none pr-9')}
          >
            <option value="">Select…</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Budget" htmlFor="budget">
          <select
            id="budget"
            name="budget"
            value={values.budget}
            onChange={(e) => set('budget', e.target.value)}
            className={cn(inputBase, 'appearance-none bg-none pr-9')}
          >
            <option value="">Select…</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Timeline" htmlFor="timeline">
          <select
            id="timeline"
            name="timeline"
            value={values.timeline}
            onChange={(e) => set('timeline', e.target.value)}
            className={cn(inputBase, 'appearance-none bg-none pr-9')}
          >
            <option value="">Select…</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="What are you building?"
        htmlFor="message"
        error={errors.message}
        hint="The more context you give me, the more useful my first reply will be."
        required
      >
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell me about the project, the problem you're trying to solve, and where things currently stand…"
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          aria-invalid={!!errors.message}
          className={cn(inputBase, 'resize-y', errors.message && 'border-magenta/60')}
        />
      </Field>

      {status === 'error' && (
        <div
          role="alert"
          className="border-magenta/30 bg-magenta/10 text-magenta flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
        >
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <p>
            Something went wrong sending that. Please email me directly at{' '}
            <a href={`mailto:${SITE.email}`} className="underline underline-offset-2">
              {SITE.email}
            </a>{' '}
            — I don't want to lose your message.
          </p>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          size="lg"
          disabled={status === 'submitting'}
          icon={
            status === 'submitting' ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Send size={16} />
            )
          }
        >
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </Button>
        <p className="text-subtle text-xs">{SITE.availability.responseTime}</p>
      </div>
    </form>
  )
}
