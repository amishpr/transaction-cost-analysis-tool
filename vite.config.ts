import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const env = process.env

const [, repoName] = (env.GITHUB_REPOSITORY ?? '').split('/')
const onGitHubActions = env.GITHUB_ACTIONS === 'true' && Boolean(repoName)

function resolveBase(): string {
  const explicit = env.VITE_BASE
  if (explicit) return `/${explicit.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/')
  // GitHub project pages live under /<repo>/. User pages (<owner>.github.io) live at the root.
  if (onGitHubActions && !repoName.toLowerCase().endsWith('.github.io')) return `/${repoName}/`
  return '/'
}

const base = resolveBase()

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5180,
  },
})
