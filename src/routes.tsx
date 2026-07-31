import type { RouteRecord } from 'vite-react-ssg'
import App from './App'
import { PROJECTS } from './data/projects'
import { DEMOS } from './data/demos'
import { POSTS } from './data/posts'

/**
 * React Router's `lazy` expects the module to expose route properties, so each
 * page's default export is adapted here. That keeps the page files themselves
 * plain components with no routing boilerplate.
 */
const page = (loader: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await loader()).default,
})

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <App />,
    entry: 'src/App.tsx',
    children: [
      {
        index: true,
        lazy: page(() => import('./pages/Home')),
        entry: 'src/pages/Home.tsx',
      },
      {
        path: 'about',
        lazy: page(() => import('./pages/About')),
        entry: 'src/pages/About.tsx',
      },
      {
        path: 'work',
        lazy: page(() => import('./pages/Work')),
        entry: 'src/pages/Work.tsx',
      },
      {
        path: 'work/:slug',
        lazy: page(() => import('./pages/WorkDetail')),
        entry: 'src/pages/WorkDetail.tsx',
        getStaticPaths: () => PROJECTS.map((p) => `/work/${p.slug}`),
      },
      {
        path: 'ai',
        lazy: page(() => import('./pages/AI')),
        entry: 'src/pages/AI.tsx',
      },
      {
        path: 'services',
        lazy: page(() => import('./pages/Services')),
        entry: 'src/pages/Services.tsx',
      },
      {
        path: 'skills',
        lazy: page(() => import('./pages/Skills')),
        entry: 'src/pages/Skills.tsx',
      },
      {
        path: 'demos',
        lazy: page(() => import('./pages/Demos')),
        entry: 'src/pages/Demos.tsx',
      },
      {
        path: 'demos/:slug',
        lazy: page(() => import('./pages/DemoDetail')),
        entry: 'src/pages/DemoDetail.tsx',
        getStaticPaths: () => DEMOS.map((d) => `/demos/${d.slug}`),
      },
      {
        path: 'blog',
        lazy: page(() => import('./pages/Blog')),
        entry: 'src/pages/Blog.tsx',
      },
      {
        path: 'blog/:slug',
        lazy: page(() => import('./pages/BlogPost')),
        entry: 'src/pages/BlogPost.tsx',
        getStaticPaths: () => POSTS.map((p) => `/blog/${p.slug}`),
      },
      {
        path: 'resume',
        lazy: page(() => import('./pages/Resume')),
        entry: 'src/pages/Resume.tsx',
      },
      {
        path: 'contact',
        lazy: page(() => import('./pages/Contact')),
        entry: 'src/pages/Contact.tsx',
      },
      {
        path: 'privacy',
        lazy: page(() => import('./pages/Privacy')),
        entry: 'src/pages/Privacy.tsx',
      },
      {
        path: '404',
        lazy: page(() => import('./pages/NotFound')),
        entry: 'src/pages/NotFound.tsx',
      },
      {
        path: '*',
        lazy: page(() => import('./pages/NotFound')),
        entry: 'src/pages/NotFound.tsx',
      },
    ],
  },
]
