/**
 * Co-Ride Backend Entry Point
 *
 * Backward-compatible default export for `node src/index.js` / `npm start`.
 * Behaviour depends on the DEPLOYMENT_MODE env var:
 *   - 'serverless' (auto on Vercel): exports the bare Express app
 *   - 'long-running' (default for Render/Railway/local): wraps with Socket.IO
 *
 * To use Socket.IO on a long-running host, set:
 *   ENABLE_SOCKET=true
 */

import process from 'node:process'
import { app } from './app.js'

const DEPLOYMENT_MODE =
  process.env.DEPLOYMENT_MODE ||
  (process.env.VERCEL ? 'serverless' : 'long-running')

if (DEPLOYMENT_MODE !== 'serverless') {
  // Long-running: boot HTTP server with optional Socket.IO.
  // The import has the side effect of calling listen().
  await import('./server.js')
}

// Re-export the Express app — Vercel/Render/handlers can use this directly.
// On long-running hosts this is harmless because server.js already started listening.
export default app
export { app }
