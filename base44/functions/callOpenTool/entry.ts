import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ═══════════════════════════════════════════════
// OPEN TOOL GATEWAY (Package 41)
// Sandboxed proxy for free external tools.
// - Hard allowlist: no arbitrary URL can ever be called.
// - Never reads entities, memories, or any user data.
// - Only the caller's explicit query parameters leave the app.
// - Results are returned as untrusted data for verification.
// ═══════════════════════════════════════════════

const HANDLERS = {
  wikipedia: async (params) => {
    const query = String(params.query || '').trim();
    if (!query) return { error: 'A search term is required.' };
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, '_'))}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.status === 404) return { notFound: true, query };
    if (!res.ok) return { error: `Wikipedia returned ${res.status}.` };
    const json = await res.json();
    return {
      title: json.title,
      summary: json.extract,
      pageUrl: json.content_urls?.desktop?.page || null,
    };
  },

  translate: async (params) => {
    const text = String(params.text || '').trim();
    if (!text) return { error: 'Text to translate is required.' };
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text.slice(0, 4000),
        source: params.source || 'auto',
        target: params.target || 'en',
        format: 'text',
      }),
    });
    if (!res.ok) return { error: `Translation service returned ${res.status}.` };
    const json = await res.json();
    return {
      translated: json.translatedText,
      detectedSource: json.detectedLanguage?.language || params.source || 'auto',
      target: params.target || 'en',
    };
  },

  weather: async (params) => {
    const lat = Number(params.lat);
    const lon = Number(params.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return { error: 'Valid coordinates are required.' };
    }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=3&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return { error: `Weather service returned ${res.status}.` };
    const json = await res.json();
    return { current: json.current, daily: json.daily, units: json.current_units };
  },
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const toolId = String(body.toolId || '');
    const params = body.params && typeof body.params === 'object' ? body.params : {};

    const handler = HANDLERS[toolId];
    if (!handler) {
      return Response.json({ error: 'Unknown or non-allowlisted tool.' }, { status: 400 });
    }

    // Consent is enforced against the user's own stored approvals — the
    // client cannot claim approval it does not have.
    const approved = Array.isArray(user.approved_open_tools) ? user.approved_open_tools : [];
    if (user.open_tools_enabled !== true || !approved.includes(toolId)) {
      return Response.json({ error: 'This tool has not been approved by the user.' }, { status: 403 });
    }

    const data = await handler(params);
    return Response.json({
      toolId,
      data,
      trust: 'UNTRUSTED_EXTERNAL',
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}