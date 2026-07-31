import {
  Bot,
  Brain,
  ChartColumn,
  ChartLine,
  ChartPie,
  Cloud,
  Code,
  Compass,
  Database,
  Gauge,
  LayoutGrid,
  Lightbulb,
  Network,
  Palette,
  PenTool,
  Receipt,
  RefreshCw,
  Rocket,
  Server,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  SquareKanban,
  Store,
  Target,
  Users,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react'

/**
 * Maps the string icon keys used across the data files to components.
 *
 * Data files stay serialisable (no JSX in `data/`), and lucide v1's noun-first
 * renames are absorbed here rather than scattered through the codebase.
 */
const ICONS = {
  sparkles: Sparkles,
  users: Users,
  'shopping-bag': ShoppingBag,
  code: Code,
  'bar-chart': ChartColumn,
  'chart-line': ChartLine,
  'chart-pie': ChartPie,
  refresh: RefreshCw,
  layout: LayoutGrid,
  server: Server,
  database: Database,
  cloud: Cloud,
  smartphone: Smartphone,
  shield: Shield,
  palette: Palette,
  compass: Compass,
  kanban: SquareKanban,
  chart: ChartColumn,
  store: Store,
  pen: PenTool,
  receipt: Receipt,
  brain: Brain,
  bot: Bot,
  network: Network,
  workflow: Workflow,
  zap: Zap,
  target: Target,
  gauge: Gauge,
  rocket: Rocket,
  lightbulb: Lightbulb,
  wrench: Wrench,
} as const

export type IconName = keyof typeof ICONS

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.75,
}: {
  name: string
  size?: number
  className?: string
  strokeWidth?: number
}) {
  const Cmp = ICONS[name as IconName] ?? Sparkles
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />
}
