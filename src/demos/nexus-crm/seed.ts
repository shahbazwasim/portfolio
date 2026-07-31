import { seededRandom } from '@/lib/storage'

export type Stage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won'

export const STAGES: { id: Stage; label: string; probability: number; tone: string }[] = [
  { id: 'lead', label: 'Lead', probability: 0.1, tone: 'text-subtle' },
  { id: 'qualified', label: 'Qualified', probability: 0.3, tone: 'text-blue-400' },
  { id: 'proposal', label: 'Proposal', probability: 0.55, tone: 'text-violet' },
  { id: 'negotiation', label: 'Negotiation', probability: 0.78, tone: 'text-amber-400' },
  { id: 'won', label: 'Closed Won', probability: 1, tone: 'text-emerald-400' },
]

export type Activity = {
  id: string
  type: 'note' | 'call' | 'email' | 'meeting' | 'stage'
  text: string
  at: string
  who: string
}

export type Deal = {
  id: string
  company: string
  contact: string
  title: string
  value: number
  stage: Stage
  owner: string
  createdAt: string
  closeDate: string
  tags: string[]
  activities: Activity[]
}

export type Contact = {
  id: string
  name: string
  role: string
  company: string
  email: string
  phone: string
  status: 'active' | 'cold' | 'churned'
  lastTouch: string
  dealValue: number
}

export const OWNERS = ['Shahbaz W.', 'Ayesha K.', 'Daniel R.', 'Mei L.'] as const
export type Owner = (typeof OWNERS)[number]

export type Role = 'admin' | 'manager' | 'rep'

const COMPANIES = [
  'Northwind Freight', 'Cobalt Systems', 'Harbourline Group', 'Vertex Foods',
  'Ridgeway Manufacturing', 'Solace Health', 'Ironclad Legal', 'Bluepeak Media',
  'Fenwick Retail', 'Aurora Logistics', 'Kestrel Energy', 'Marlowe & Co',
  'Sandbourne Hotels', 'Tessellate Labs', 'Quarry Construction', 'Lumen Analytics',
]

const FIRST = ['Priya', 'Tomás', 'Ingrid', 'Kwame', 'Sarah', 'Yusuf', 'Elena', 'Marcus', 'Hana', 'Rafael', 'Nadia', 'Oliver', 'Chiara', 'Dmitri', 'Amara', 'Lukas']
const LAST = ['Raman', 'Ferreira', 'Halvorsen', 'Mensah', 'O’Neill', 'Demir', 'Petrova', 'Whitfield', 'Sato', 'Moreno', 'Haddad', 'Bennett', 'Rossi', 'Volkov', 'Okafor', 'Berger']
const ROLES = ['Head of Operations', 'CTO', 'Procurement Lead', 'VP Sales', 'Finance Director', 'IT Manager', 'COO', 'Founder']
const TITLES = [
  'Platform migration', 'Annual licence renewal', 'Warehouse integration', 'Analytics rollout',
  'CRM implementation', 'Security audit', 'Mobile app build', 'API integration',
  'Data warehouse project', 'Support retainer', 'E-commerce replatform', 'Automation pilot',
]
const TAG_POOL = ['enterprise', 'inbound', 'referral', 'renewal', 'expansion', 'competitive', 'urgent', 'pilot']

const STAGE_IDS: Stage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won']

/** Fixed seed so every visitor sees the same board — screenshots stay stable. */
function iso(daysFromNow: number) {
  const base = Date.UTC(2026, 6, 15) // 2026-07-15, deliberately fixed
  return new Date(base + daysFromNow * 86_400_000).toISOString()
}

export function seedDeals(): Deal[] {
  const rand = seededRandom(20260715)
  return Array.from({ length: 22 }, (_, i) => {
    const company = COMPANIES[i % COMPANIES.length]
    const contact = `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`
    const stage = STAGE_IDS[Math.floor(rand() * STAGE_IDS.length)]
    const value = Math.round((8_000 + rand() * 180_000) / 500) * 500
    const created = -Math.floor(rand() * 90) - 5
    const close = Math.floor(rand() * 60) + 3

    const activities: Activity[] = [
      {
        id: `${i}-a0`,
        type: 'stage',
        text: `Deal created in ${STAGES.find((s) => s.id === 'lead')!.label}`,
        at: iso(created),
        who: OWNERS[i % OWNERS.length],
      },
      {
        id: `${i}-a1`,
        type: (['call', 'email', 'meeting'] as const)[Math.floor(rand() * 3)],
        text: [
          'Discovery call — mapped current process and pain points.',
          'Sent over the integration scope and rough timeline.',
          'Walked the team through a demo environment.',
          'Follow-up on security questionnaire.',
        ][Math.floor(rand() * 4)],
        at: iso(created + 8),
        who: OWNERS[i % OWNERS.length],
      },
      {
        id: `${i}-a2`,
        type: 'note',
        text: [
          'Budget confirmed for this quarter. Legal review is the long pole.',
          'Champion is keen; procurement needs two more references.',
          'Competing against an incumbent — price is not the deciding factor.',
          'Wants a phased rollout starting with one region.',
        ][Math.floor(rand() * 4)],
        at: iso(created + 16),
        who: OWNERS[(i + 1) % OWNERS.length],
      },
    ]

    return {
      id: `d${i + 1}`,
      company,
      contact,
      title: TITLES[i % TITLES.length],
      value,
      stage,
      owner: OWNERS[i % OWNERS.length],
      createdAt: iso(created),
      closeDate: iso(close),
      tags: [TAG_POOL[Math.floor(rand() * TAG_POOL.length)], TAG_POOL[Math.floor(rand() * TAG_POOL.length)]].filter(
        (t, idx, arr) => arr.indexOf(t) === idx
      ),
      activities,
    }
  })
}

export function seedContacts(deals: Deal[]): Contact[] {
  const rand = seededRandom(884422)
  return deals.map((d, i) => ({
    id: `c${i + 1}`,
    name: d.contact,
    role: ROLES[i % ROLES.length],
    company: d.company,
    email: `${d.contact.toLowerCase().replace(/[^a-z]+/g, '.')}@${d.company.toLowerCase().replace(/[^a-z]+/g, '')}.com`,
    phone: `+1 ${200 + Math.floor(rand() * 700)} ${100 + Math.floor(rand() * 900)} ${1000 + Math.floor(rand() * 9000)}`,
    status: (['active', 'active', 'active', 'cold', 'churned'] as const)[Math.floor(rand() * 5)],
    lastTouch: iso(-Math.floor(rand() * 45)),
    dealValue: d.value,
  }))
}

export function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function relativeDate(isoString: string) {
  const days = Math.round((Date.UTC(2026, 6, 15) - new Date(isoString).getTime()) / 86_400_000)
  if (days <= 0) return `in ${Math.abs(days)}d`
  if (days === 0) return 'today'
  if (days < 30) return `${days}d ago`
  return `${Math.round(days / 30)}mo ago`
}
