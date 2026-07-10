import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const env = process.env

const [repoOwner, repoName] = (env.GITHUB_REPOSITORY ?? '').split('/')
const onGitHubActions = env.GITHUB_ACTIONS === 'true' && Boolean(repoName)
const onNetlify = env.NETLIFY === 'true'

// Netlify deploy previews and branch deploys should not compete with production in search results.
const indexable = !onNetlify || env.CONTEXT === 'production'

function resolveBase(): string {
  const explicit = env.VITE_BASE
  if (explicit) return `/${explicit.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/')
  // GitHub project pages live under /<repo>/. User pages (<owner>.github.io) live at the root.
  if (onGitHubActions && !repoName.toLowerCase().endsWith('.github.io')) return `/${repoName}/`
  return '/'
}

// The public URL of the deployed site, without a trailing slash. Used for canonical
// links, social cards, the sitemap, and robots.txt, all of which need absolute URLs.
function resolveSiteUrl(base: string): string {
  const trimmed = (url: string) => url.replace(/\/+$/, '')
  if (env.VITE_SITE_URL) return trimmed(env.VITE_SITE_URL)
  if (onNetlify && env.URL) return trimmed(env.URL)
  if (onGitHubActions) return trimmed(`https://${repoOwner.toLowerCase()}.github.io${base}`)
  return 'http://localhost:5180'
}

const base = resolveBase()
const siteUrl = resolveSiteUrl(base)

function seoPlugin(): Plugin {
  const robotsMeta = indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'
  const verification = env.VITE_GOOGLE_SITE_VERIFICATION
  const verificationTag = verification
    ? `<meta name="google-site-verification" content="${verification}" />`
    : ''

  const robotsTxt = indexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n'

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`

  const notFoundHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Page not found | Transaction Cost Analysis Tool</title>
    <link rel="icon" type="image/svg+xml" href="${base}favicon.svg" />
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-content: center; gap: 12px; text-align: center;
        background: #000; color: #e8e8e0; font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
      h1 { margin: 0; color: #ff9900; letter-spacing: 0.05em; font-size: 20px; }
      p { margin: 0; color: #7a7a72; }
      a { color: #ff9900; }
    </style>
  </head>
  <body>
    <h1>404 PAGE NOT FOUND</h1>
    <p>That address does not exist.</p>
    <p><a href="${base}">Back to Transaction Cost Analysis Tool</a></p>
  </body>
</html>
`

  return {
    name: 'tca-seo',
    transformIndexHtml(html) {
      return html
        .replaceAll('__SITE_URL__', siteUrl)
        .replaceAll('__ROBOTS_CONTENT__', robotsMeta)
        .replace('<!--__GOOGLE_SITE_VERIFICATION__-->', verificationTag)
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml })
      this.emitFile({ type: 'asset', fileName: '404.html', source: notFoundHtml })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), seoPlugin()],
  server: {
    port: 5180,
  },
})
