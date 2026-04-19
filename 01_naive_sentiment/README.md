## Start

```bash
docker compose up --build
```

## Manueller Test

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Das ist ein fantastischer Kurs!"}'
```

Oder mit Postman auf `http://localhost:8000/predict`, Body als JSON.

## Loadtest

**Windows PowerShell:**
```powershell
Get-Content .\loadtest.js -Raw | docker run --rm -i `
  -p 5665:5665 `
  -e K6_WEB_DASHBOARD=true `
  -e K6_WEB_DASHBOARD_HOST=0.0.0.0 `
  -e K6_WEB_DASHBOARD_PORT=5665 `
  grafana/k6 run -
```

**Mac/Linux:**
```bash
docker run --rm -i \
  -p 5665:5665 \
  -e K6_WEB_DASHBOARD=true \
  -e K6_WEB_DASHBOARD_HOST=0.0.0.0 \
  -e K6_WEB_DASHBOARD_PORT=5665 \
  grafana/k6 run - < ./loadtest.js
```

Dashboard: http://localhost:5665
