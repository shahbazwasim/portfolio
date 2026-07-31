import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
// Upright weight axis only — skips the italic face, which nothing here uses.
// The package has no per-subset entrypoint, but the non-latin subsets are
// separate @font-face rules with unicode-range, so browsers never fetch them.
import '@fontsource-variable/jetbrains-mono/wght.css'
import './styles/globals.css'

export const createRoot = ViteReactSSG({ routes })
