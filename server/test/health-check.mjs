/**
 * Smoke test: GET /health (server must be running on PORT or 3001).
 * Usage: node test/health-check.mjs
 * Exit 0 if ok, 1 otherwise.
 */
const port = process.env.PORT || 3001
const url = `http://localhost:${port}/health`

try {
  const res = await fetch(url)
  const data = await res.json()
  if (res.ok && data.ok === true) {
    console.log('OK', data.service, data.version ?? '', data.ts ?? '')
    process.exit(0)
  }
  console.error('Health check failed:', res.status, data)
  process.exit(1)
} catch (e) {
  console.error('Health check error:', e.message)
  process.exit(1)
}
