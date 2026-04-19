import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = 'http://host.docker.internal:8000';
const POLL_INTERVAL = 0.5;
const MAX_WAIT = 60;

export const requestsCompleted = new Counter('requests_completed');
export const requestsFailed = new Counter('requests_failed');
export const requestSuccessRate = new Rate('request_success_rate');
export const responseTime = new Trend('response_time', true);
export const enqueueLatency = new Trend('enqueue_latency_ms', true);

export const options = {
    vus: 50,
    duration: '60s',
};

export default function () {
    const payload = JSON.stringify({
        text: 'Das ist ein fantastischer Kurs!',
    });
    const params = {
        headers: { 'Content-Type': 'application/json' },
        timeout: '60s',
    };

    const startedAt = Date.now();

    const enqueueStart = Date.now();
    const enqueueRes = http.post(`${BASE_URL}/predict-async`, payload, params);
    enqueueLatency.add(Date.now() - enqueueStart);

    const enqueueOk = check(enqueueRes, {
        'enqueue status is 200': (r) => r.status === 200,
        'enqueue returns job_id': (r) => {
            try {
                return !!r.json('job_id');
            } catch (_) {
                return false;
            }
        },
    });

    if (!enqueueOk) {
        responseTime.add(Date.now() - startedAt);
        requestSuccessRate.add(false);
        requestsFailed.add(1);
        return;
    }

    const jobId = enqueueRes.json('job_id');

    let ok = false;
    while ((Date.now() - startedAt) / 1000 < MAX_WAIT) {
        const statusRes = http.get(`${BASE_URL}/status/${jobId}`, {
            timeout: '30s',
        });

        let body;
        try {
            body = statusRes.json();
        } catch (_) {
            sleep(POLL_INTERVAL);
            continue;
        }

        if (body.status === 'finished') {
            ok = true;
            break;
        }
        if (body.status === 'failed') {
            ok = false;
            break;
        }

        sleep(POLL_INTERVAL);
    }

    responseTime.add(Date.now() - startedAt);
    requestSuccessRate.add(ok);
    if (ok) requestsCompleted.add(1);
    else requestsFailed.add(1);
}
