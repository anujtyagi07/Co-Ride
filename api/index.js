/**
 * Vercel Serverless Function Entry Point
 *
 * Vercel invokes this file for every request. We delegate to the serverless-safe
 * Express app. The app handles MongoDB connection caching internally.
 *
 * Path: /api/[...slug] → this handler → app → routes
 *
 * `vercel.json` rewrites /api/* to this file.
 */

import '../backend/src/app.js'
import app from '../backend/src/app.js'

export default async function handler(req, res) {
  // Vercel passes the URL path unchanged, but the app expects /api/* routes.
  // The catch-all rewrite in vercel.json preserves /api/* in `req.url`.
  return app(req, res)
}
