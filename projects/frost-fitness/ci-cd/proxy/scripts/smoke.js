#!/usr/bin/env node
// smoke.js — post-deploy smoke test suite for the Frost Fitness CF Worker proxy
//
// Reads PROXY_URL and PROXY_TOKEN from env.
// Runs 5 checks. Exits non-zero if any fail.
// No request payloads are logged — only status codes, latency, and pass/fail.
//
// Owner: Cassian (SRE)

const PROXY_URL = process.env.PROXY_URL;
const PROXY_TOKEN = process.env.PROXY_TOKEN;
const ENV = process.env.SMOKE_ENV || 'unknown';

if (!PROXY_URL) {
  console.error('FAIL: PROXY_URL is not set');
  process.exit(1);
}

let passed = 0;
let failed = 0;

async function check(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const ms = Date.now() - start;
    console.log(`  PASS [${ms}ms]  ${name}`);
    passed++;
  } catch (err) {
    const ms = Date.now() - start;
    console.error(`  FAIL [${ms}ms]  ${name}: ${err.message}`);
    failed++;
  }
}

async function run() {
  console.log(`\nSmoke tests — env: ${ENV} — ${PROXY_URL}\n`);

  // 1. Unauthenticated request must return 401
  await check('Auth reject (no token → 401)', async () => {
    const res = await fetch(`${PROXY_URL}/v1/chat`, { method: 'POST' });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 2. Authenticated request must not 404 (route exists)
  await check('Auth accept (valid token → not 401/404)', async () => {
    const res = await fetch(`${PROXY_URL}/v1/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PROXY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // Minimal body — intentionally invalid payload to get a controlled 4xx, not a real call
      body: JSON.stringify({ __smoke: true }),
    });
    if (res.status === 401) throw new Error('Token rejected — check PROXY_TOKEN secret');
    if (res.status === 404) throw new Error('Route not found — Worker may not have deployed correctly');
  });

  // 3. Vision route reachable (auth only — no real image, just checking routing)
  await check('Vision route reachable (not 404)', async () => {
    const res = await fetch(`${PROXY_URL}/v1/vision`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PROXY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ __smoke: true }),
    });
    if (res.status === 404) throw new Error('Vision route not found');
    if (res.status === 401) throw new Error('Token rejected on vision route');
  });

  // 4. Streaming headers present on /v1/chat
  await check('Streaming headers on /v1/chat', async () => {
    const res = await fetch(`${PROXY_URL}/v1/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PROXY_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ __smoke: true, stream: true }),
    });
    if (res.status === 401) throw new Error('Token rejected');
    if (res.status === 404) throw new Error('Route not found');
    const ct = res.headers.get('content-type') || '';
    const te = res.headers.get('transfer-encoding') || '';
    if (!ct.includes('text/event-stream') && !te.includes('chunked')) {
      // Acceptable: upstream may return 4xx on smoke payload — just check headers weren't stripped
      // Only hard-fail if we got 200 without streaming headers
      if (res.status === 200) {
        throw new Error(`Expected streaming headers, got Content-Type: ${ct}, Transfer-Encoding: ${te}`);
      }
    }
  });

  // 5. Rate limit returns 429 with Retry-After (only test on staging to avoid burning prod quota)
  if (ENV === 'staging') {
    await check('Rate limit returns 429 + Retry-After (staging only)', async () => {
      // Fire enough requests to trigger the per-minute rate limit
      const requests = Array.from({ length: 35 }, () =>
        fetch(`${PROXY_URL}/v1/chat`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${PROXY_TOKEN}` },
        })
      );
      const responses = await Promise.all(requests);
      const hit429 = responses.some((r) => r.status === 429);
      if (!hit429) throw new Error('Rate limit not triggered after 35 rapid requests — check rate limit config');
      const rateLimited = responses.find((r) => r.status === 429);
      const retryAfter = rateLimited?.headers.get('retry-after');
      if (!retryAfter) throw new Error('429 response missing Retry-After header');
    });
  } else {
    console.log('  SKIP           Rate limit test (production — skipped to avoid burning quota)');
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Smoke test runner error:', err);
  process.exit(1);
});
