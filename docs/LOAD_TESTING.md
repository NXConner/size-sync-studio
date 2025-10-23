# Load Testing

A lightweight k6 smoke script is provided to exercise core API endpoints.

## Prereqs
- Install k6: https://k6.io/docs/get-started/installation/

## Run
```bash
BASE_URL=http://localhost:3001/api k6 run tests/load/k6-smoke.js
```

It validates the health endpoint and exercises `/chat` and `/reddit/gettingbigger`.
