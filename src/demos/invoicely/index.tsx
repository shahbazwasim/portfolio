import { useMemo, useState } from 'react'
import { Download, Plus, Trash2 } from 'lucide-react'
import { useLocalStorage } from '@/lib/storage'
import { DemoChrome } from '@/demos/shared/DemoChrome'
import { cn } from '@/lib/cn'

const STORAGE_KEY = 'demo:invoicely:v1'

/* -------------------------------------------------------------------------- */

type Line = { id: string; description: string; qty: number; rate: number }

type Invoice = {
  number: string
  issueDate: string
  dueDate: string
  currency: 'USD' | 'EUR' | 'GBP' | 'PKR' | 'AED'
  template: 'modern' | 'classic' | 'minimal'
  from: { name: string; email: string; address: string }
  to: { name: string; email: string; address: string }
  lines: Line[]
  taxRate: number
  discountPct: number
  notes: string
}

const CURRENCIES = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  PKR: { symbol: '₨', locale: 'en-PK' },
  AED: { symbol: 'AED', locale: 'en-AE' },
} as const

const TEMPLATES = {
  modern: { accent: '#8b5cf6', label: 'Modern' },
  classic: { accent: '#0f766e', label: 'Classic' },
  minimal: { accent: '#334155', label: 'Minimal' },
} as const

const SEED: Invoice = {
  number: 'INV-2026-014',
  issueDate: '2026-07-15',
  dueDate: '2026-08-14',
  currency: 'USD',
  template: 'modern',
  from: {
    name: 'Shahbaz Wasim',
    email: 'shahbaz.wasim01@gmail.com',
    address: 'Karachi, Pakistan',
  },
  to: {
    name: 'Helio Group Ltd',
    email: 'accounts@heliogroup.example',
    address: '18 Wharf Road\nManchester M1 4BT\nUnited Kingdom',
  },
  lines: [
    { id: 'l1', description: 'CRM platform — discovery & architecture', qty: 1, rate: 4800 },
    { id: 'l2', description: 'Pipeline module implementation', qty: 40, rate: 95 },
    { id: 'l3', description: 'Real-time collaboration layer', qty: 24, rate: 95 },
    { id: 'l4', description: 'Data migration from legacy CRM', qty: 1, rate: 2400 },
  ],
  taxRate: 8,
  discountPct: 5,
  notes: 'Payment due within 30 days. Bank details on request.',
}

function money(value: number, currency: Invoice['currency']) {
  const { locale } = CURRENCIES[currency]
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

function totals(inv: Invoice) {
  const subtotal = inv.lines.reduce((s, l) => s + l.qty * l.rate, 0)
  const discount = subtotal * (inv.discountPct / 100)
  const taxable = subtotal - discount
  const tax = taxable * (inv.taxRate / 100)
  return { subtotal, discount, taxable, tax, total: taxable + tax }
}

/* -------------------------------------------------------------------------- */

const field =
  'w-full rounded-md border border-line bg-surface-2/60 px-2.5 py-1.5 text-xs text-ink placeholder:text-subtle outline-none focus:ring-1 focus:ring-[var(--accent-violet)]'

export default function InvoicelyDemo() {
  const { value: inv, setValue: setInv, reset } = useLocalStorage<Invoice>(STORAGE_KEY, SEED)
  const [busy, setBusy] = useState(false)

  const t = useMemo(() => totals(inv), [inv])
  const accent = TEMPLATES[inv.template].accent

  function patch(p: Partial<Invoice>) {
    setInv((prev) => ({ ...prev, ...p }))
  }

  function patchLine(id: string, p: Partial<Line>) {
    setInv((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === id ? { ...l, ...p } : l)),
    }))
  }

  /**
   * Generates a genuine PDF in the browser. jsPDF and the autotable plugin are
   * dynamically imported so ~180KB of PDF machinery never touches the initial
   * bundle — it loads on the first click and not before.
   */
  async function downloadPdf() {
    setBusy(true)
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 48
      const [r, g, b] = [
        parseInt(accent.slice(1, 3), 16),
        parseInt(accent.slice(3, 5), 16),
        parseInt(accent.slice(5, 7), 16),
      ]

      // Header band
      if (inv.template !== 'minimal') {
        doc.setFillColor(r, g, b)
        doc.rect(0, 0, pageWidth, 8, 'F')
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(20, 22, 31)
      doc.text('INVOICE', margin, 74)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(110, 118, 132)
      doc.text(inv.number, margin, 92)

      // Meta, right aligned
      doc.setFontSize(9)
      const metaX = pageWidth - margin
      doc.text(`Issued: ${inv.issueDate}`, metaX, 74, { align: 'right' })
      doc.text(`Due: ${inv.dueDate}`, metaX, 88, { align: 'right' })
      doc.text(`Currency: ${inv.currency}`, metaX, 102, { align: 'right' })

      // Parties
      let y = 136
      doc.setFontSize(8)
      doc.setTextColor(150, 156, 168)
      doc.text('FROM', margin, y)
      doc.text('BILL TO', pageWidth / 2, y)

      doc.setFontSize(10)
      doc.setTextColor(20, 22, 31)
      doc.setFont('helvetica', 'bold')
      doc.text(inv.from.name, margin, y + 16)
      doc.text(inv.to.name, pageWidth / 2, y + 16)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(110, 118, 132)
      doc.text([inv.from.email, ...inv.from.address.split('\n')], margin, y + 32)
      doc.text([inv.to.email, ...inv.to.address.split('\n')], pageWidth / 2, y + 32)

      // Line items
      autoTable(doc, {
        startY: y + 96,
        margin: { left: margin, right: margin },
        head: [['Description', 'Qty', 'Rate', 'Amount']],
        body: inv.lines.map((l) => [
          l.description,
          String(l.qty),
          money(l.rate, inv.currency),
          money(l.qty * l.rate, inv.currency),
        ]),
        theme: inv.template === 'classic' ? 'grid' : 'striped',
        headStyles: {
          fillColor: inv.template === 'minimal' ? [240, 241, 245] : [r, g, b],
          textColor: inv.template === 'minimal' ? [40, 44, 56] : [255, 255, 255],
          fontSize: 9,
        },
        bodyStyles: { fontSize: 9, textColor: [60, 66, 78] },
        columnStyles: {
          1: { halign: 'right', cellWidth: 48 },
          2: { halign: 'right', cellWidth: 80 },
          3: { halign: 'right', cellWidth: 90 },
        },
      })

      // Totals
      const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY
      let ty = afterTable + 24
      const labelX = pageWidth - margin - 150
      const valueX = pageWidth - margin

      const rows: [string, string, boolean?][] = [
        ['Subtotal', money(t.subtotal, inv.currency)],
        ...(inv.discountPct > 0
          ? ([[`Discount (${inv.discountPct}%)`, `-${money(t.discount, inv.currency)}`]] as [
              string,
              string,
            ][])
          : []),
        [`Tax (${inv.taxRate}%)`, money(t.tax, inv.currency)],
        ['Total', money(t.total, inv.currency), true],
      ]

      for (const [label, value, bold] of rows) {
        if (bold) {
          doc.setDrawColor(220, 223, 230)
          doc.line(labelX, ty - 10, valueX, ty - 10)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(12)
          doc.setTextColor(r, g, b)
        } else {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          doc.setTextColor(110, 118, 132)
        }
        doc.text(label, labelX, ty)
        doc.text(value, valueX, ty, { align: 'right' })
        ty += bold ? 20 : 16
      }

      if (inv.notes.trim()) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(150, 156, 168)
        doc.text('NOTES', margin, ty + 14)
        doc.setFontSize(9)
        doc.setTextColor(110, 118, 132)
        doc.text(doc.splitTextToSize(inv.notes, pageWidth - margin * 2), margin, ty + 30)
      }

      doc.setFontSize(8)
      doc.setTextColor(180, 185, 195)
      doc.text(
        'Generated in-browser by Invoicely — a demo on shahbazwasim.com',
        margin,
        doc.internal.pageSize.getHeight() - 32
      )

      doc.save(`${inv.number}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <DemoChrome title="Invoicely" subtitle="invoice builder" onReset={reset}>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* ------------------------------------------------------- editor */}
        <div className="border-line flex flex-col gap-5 border-b p-4 lg:border-r lg:border-b-0">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-subtle text-[0.625rem] tracking-widest uppercase">Number</span>
              <input value={inv.number} onChange={(e) => patch({ number: e.target.value })} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtle text-[0.625rem] tracking-widest uppercase">Currency</span>
              <select
                value={inv.currency}
                onChange={(e) => patch({ currency: e.target.value as Invoice['currency'] })}
                className={field}
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtle text-[0.625rem] tracking-widest uppercase">Issued</span>
              <input type="date" value={inv.issueDate} onChange={(e) => patch({ issueDate: e.target.value })} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtle text-[0.625rem] tracking-widest uppercase">Due</span>
              <input type="date" value={inv.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} className={field} />
            </label>
          </div>

          {/* Client */}
          <div className="flex flex-col gap-2">
            <span className="text-subtle text-[0.625rem] tracking-widest uppercase">Bill to</span>
            <input
              value={inv.to.name}
              onChange={(e) => patch({ to: { ...inv.to, name: e.target.value } })}
              placeholder="Client name"
              className={field}
            />
            <input
              value={inv.to.email}
              onChange={(e) => patch({ to: { ...inv.to, email: e.target.value } })}
              placeholder="Client email"
              className={field}
            />
            <textarea
              value={inv.to.address}
              onChange={(e) => patch({ to: { ...inv.to, address: e.target.value } })}
              rows={3}
              placeholder="Client address"
              className={cn(field, 'resize-y')}
            />
          </div>

          {/* Lines */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-subtle text-[0.625rem] tracking-widest uppercase">
                Line items
              </span>
              <button
                onClick={() =>
                  patch({
                    lines: [
                      ...inv.lines,
                      { id: `l${Date.now()}`, description: '', qty: 1, rate: 0 },
                    ],
                  })
                }
                className="text-subtle hover:text-ink inline-flex items-center gap-1 text-[0.6875rem] transition-colors"
              >
                <Plus size={11} /> Add line
              </button>
            </div>

            {inv.lines.map((l) => (
              <div key={l.id} className="grid grid-cols-[1fr_52px_74px_auto] items-center gap-1.5">
                <input
                  value={l.description}
                  onChange={(e) => patchLine(l.id, { description: e.target.value })}
                  placeholder="Description"
                  className={field}
                />
                <input
                  type="number"
                  min={0}
                  value={l.qty}
                  onChange={(e) => patchLine(l.id, { qty: Math.max(0, Number(e.target.value)) })}
                  className={cn(field, 'text-right')}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={l.rate}
                  onChange={(e) => patchLine(l.id, { rate: Math.max(0, Number(e.target.value)) })}
                  className={cn(field, 'text-right')}
                />
                <button
                  onClick={() => patch({ lines: inv.lines.filter((x) => x.id !== l.id) })}
                  aria-label="Remove line"
                  className="text-subtle grid h-7 w-7 place-items-center rounded transition-colors hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Adjustments */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-subtle text-[0.625rem] tracking-widest uppercase">Tax %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={inv.taxRate}
                onChange={(e) => patch({ taxRate: Math.min(100, Math.max(0, Number(e.target.value))) })}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtle text-[0.625rem] tracking-widest uppercase">
                Discount %
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={inv.discountPct}
                onChange={(e) =>
                  patch({ discountPct: Math.min(100, Math.max(0, Number(e.target.value))) })
                }
                className={field}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-subtle text-[0.625rem] tracking-widest uppercase">Notes</span>
            <textarea
              value={inv.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={2}
              className={cn(field, 'resize-y')}
            />
          </label>

          {/* Template + export */}
          <div className="border-line flex flex-wrap items-center gap-2 border-t pt-4">
            {(Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]).map((k) => (
              <button
                key={k}
                onClick={() => patch({ template: k })}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.6875rem] transition-colors',
                  inv.template === k ? 'border-line-strong text-ink' : 'border-line text-subtle'
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: TEMPLATES[k].accent }}
                />
                {TEMPLATES[k].label}
              </button>
            ))}
            <button
              onClick={downloadPdf}
              disabled={busy}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Download size={13} />
              {busy ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------ preview */}
        <div className="bg-surface-2/40 overflow-auto p-4 lg:p-6">
          <div
            className="mx-auto max-w-[520px] rounded-lg bg-white p-7 text-[#14161f] shadow-[var(--shadow-lift)]"
            style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
          >
            {inv.template !== 'minimal' && (
              <div className="-mx-7 -mt-7 mb-6 h-2 rounded-t-lg" style={{ background: accent }} />
            )}

            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">INVOICE</h3>
                <p className="mt-1 text-xs text-[#6e7684]">{inv.number}</p>
              </div>
              <div className="text-right text-[0.6875rem] text-[#6e7684]">
                <p>Issued: {inv.issueDate}</p>
                <p>Due: {inv.dueDate}</p>
                <p>{inv.currency}</p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-6 text-[0.6875rem]">
              <div>
                <p className="tracking-widest text-[#969ca8] uppercase">From</p>
                <p className="mt-1.5 text-sm font-semibold">{inv.from.name}</p>
                <p className="text-[#6e7684]">{inv.from.email}</p>
                <p className="whitespace-pre-line text-[#6e7684]">{inv.from.address}</p>
              </div>
              <div>
                <p className="tracking-widest text-[#969ca8] uppercase">Bill to</p>
                <p className="mt-1.5 text-sm font-semibold">{inv.to.name || '—'}</p>
                <p className="text-[#6e7684]">{inv.to.email}</p>
                <p className="whitespace-pre-line text-[#6e7684]">{inv.to.address}</p>
              </div>
            </div>

            <table className="mt-7 w-full text-[0.6875rem]">
              <thead>
                <tr
                  style={{
                    background: inv.template === 'minimal' ? '#f0f1f5' : accent,
                    color: inv.template === 'minimal' ? '#282c38' : '#fff',
                  }}
                >
                  <th className="rounded-l px-2.5 py-2 text-left font-medium">Description</th>
                  <th className="px-2 py-2 text-right font-medium">Qty</th>
                  <th className="px-2 py-2 text-right font-medium">Rate</th>
                  <th className="rounded-r px-2.5 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.lines.map((l, i) => (
                  <tr
                    key={l.id}
                    className={cn(
                      'border-b border-[#e8eaef]',
                      // Matches the PDF: 'striped' autotable theme for modern/minimal,
                      // 'grid' (no banding) for classic.
                      inv.template !== 'classic' && i % 2 === 1 && 'bg-[#fafafc]'
                    )}
                  >
                    <td className="px-2.5 py-2 text-[#3c424e]">{l.description || '—'}</td>
                    <td className="px-2 py-2 text-right text-[#6e7684]">{l.qty}</td>
                    <td className="px-2 py-2 text-right text-[#6e7684]">
                      {money(l.rate, inv.currency)}
                    </td>
                    <td className="px-2.5 py-2 text-right font-medium">
                      {money(l.qty * l.rate, inv.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-5 ml-auto w-full max-w-[220px] text-[0.6875rem]">
              <div className="flex justify-between py-1 text-[#6e7684]">
                <span>Subtotal</span>
                <span>{money(t.subtotal, inv.currency)}</span>
              </div>
              {inv.discountPct > 0 && (
                <div className="flex justify-between py-1 text-[#6e7684]">
                  <span>Discount ({inv.discountPct}%)</span>
                  <span>-{money(t.discount, inv.currency)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 text-[#6e7684]">
                <span>Tax ({inv.taxRate}%)</span>
                <span>{money(t.tax, inv.currency)}</span>
              </div>
              <div
                className="mt-1.5 flex justify-between border-t pt-2 text-base font-bold"
                style={{ borderColor: '#dcdfe6', color: accent }}
              >
                <span>Total</span>
                <span>{money(t.total, inv.currency)}</span>
              </div>
            </div>

            {inv.notes.trim() && (
              <div className="mt-7 border-t border-[#e8eaef] pt-4">
                <p className="tracking-widest text-[#969ca8] uppercase text-[0.625rem]">Notes</p>
                <p className="mt-1.5 text-[0.6875rem] whitespace-pre-line text-[#6e7684]">
                  {inv.notes}
                </p>
              </div>
            )}
          </div>

          <p className="text-subtle mt-4 text-center text-[0.625rem]">
            The PDF is generated with jsPDF in your browser — nothing is uploaded.
          </p>
        </div>
      </div>
    </DemoChrome>
  )
}
