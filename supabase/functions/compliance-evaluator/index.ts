// Supabase Edge Function: compliance-evaluator
// Deploy: supabase functions deploy compliance-evaluator --no-verify-jwt (or with auth if needed)
// This function evaluates text using the Postgres app.compliance_evaluator and returns result
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }
    const { text } = await req.json().catch(() => ({ text: '' }));
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) {
      return new Response(JSON.stringify({ error: 'Missing service credentials' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const resp = await fetch(`${url}/rest/v1/rpc/compliance_evaluator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ args: [String(text || '')] })
    });
    if (!resp.ok) {
      const err = await resp.text();
      return new Response(JSON.stringify({ error: 'RPC error', details: err }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    // PostgREST returns result directly for function returning jsonb when called without named params
    const result = await resp.json();
    return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unhandled', details: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
