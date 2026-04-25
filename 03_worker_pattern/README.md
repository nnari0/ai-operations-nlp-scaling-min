## Start

```bash
docker compose up --build
```

Mit skaliserung vom worker
```bash
docker compose up --build --scale worker=3
```
-> skalierung von api Container funktioniert nicht, weil der hört auf Port 8000 & man kann nicht 3 gleiche Container auf demselben Port hören lassen.



**Mac/Linux:**
```bash
docker run --rm -i \
  --add-host=host.docker.internal:host-gateway \
  -p 5665:5665 \
  -e K6_WEB_DASHBOARD=true \
  -e K6_WEB_DASHBOARD_HOST=0.0.0.0 \
  -e K6_WEB_DASHBOARD_PORT=5665 \
  -v "$PWD:/scripts" \
  -w /scripts \
  grafana/k6 run loadtest.js
```

Dashboard: http://localhost:5665
