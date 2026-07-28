import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ═══════════════════════════════════════════════
// UPDATE FEED GATEWAY (Package 43)
// Contacts ONE hardcoded, integrity-bearing endpoint: the public
// npm registry. Nothing else is reachable from here.
//
// - No arbitrary URL: the host is a constant and the package name
//   must appear in the caller's manifest allowlist below.
// - Never reads entities, memories, or any user data.
// - Returns the registry's own published shasum so the client can
//   record a real integrity hash rather than inventing one.
//
// HONEST LIMIT: this reports that a newer version exists upstream.
// It cannot install anything — app code is deployed by the developer,
// never by Bison. See updateManager.js for the full boundary.
// ═══════════════════════════════════════════════

const REGISTRY = 'https://registry.npmjs.org';

const ALLOWED_PACKAGES = [
  'react', 'react-dom', 'react-router-dom', 'framer-motion', 'recharts',
  'three', 'date-fns', 'lodash', 'moment', 'zod', 'lucide-react',
  '@tanstack/react-query', 'react-hook-form', 'react-markdown',
];

async function fetchOne(name: string) {
  const res = await fetch(`${REGISTRY}/${encodeURIComponent(name)}/latest`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return { name, error: `Registry returned ${res.status}.` };
  const json = await res.json();
  return {
    name,
    version: json.version || null,
    integrityHash: json.dist?.integrity || json.dist?.shasum || null,
    publishedFrom: 'registry.npmjs.org',
    deprecated: !!json.deprecated,
  };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const requested = Array.isArray(body.packages) ? body.packages.map(String) : [];
    const names = requested.filter((n) => ALLOWED_PACKAGES.includes(n)).slice(0, 14);
    if (names.length === 0) {
      return Response.json({ error: 'No allowlisted packages requested.' }, { status: 400 });
    }

    const results = await Promise.all(names.map((n) => fetchOne(n).catch((e) => ({ name: n, error: e.message }))));

    return Response.json({
      results,
      source: REGISTRY,
      trust: 'SIGNED_REGISTRY_METADATA',
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}