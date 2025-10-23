import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 5, duration: '30s' };
const BASE = __ENV.BASE_URL || 'http://localhost:3001/api';

export default function () {
  const res = http.get(`${BASE}/health`);
  check(res, { 'health ok': (r) => r.status === 200 && r.json('status') === 'ok' });

  const chat = http.post(`${BASE}/chat`, JSON.stringify({ message: 'hello' }), { headers: { 'Content-Type': 'application/json' } });
  check(chat, { 'chat ok': (r) => r.status === 200 });

  const reddit = http.get(`${BASE}/reddit/gettingbigger`);
  check(reddit, { 'reddit ok-ish': (r) => r.status === 200 || r.status === 502 });

  sleep(1);
}
