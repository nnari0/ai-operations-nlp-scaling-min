import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = 'http://host.docker.internal:8000';
const POLL_INTERVAL = 0.5;
const MAX_WAIT = 60;

export const jobsCompleted = new Counter('jobs_completed');
export const jobsStarted = new Counter('jobs_started');
export const jobSuccessRate = new Rate('job_success_rate');
export const jobEndToEnd = new Trend('job_end_to_end_ms', true);
export const enqueueLatency = new Trend('enqueue_ms', true);

export const options = {
    scenarios: {
        constant_arrival: {
            executor: 'constant-arrival-rate',
            rate: 2,                // Requests pro timeUnit – hier anpassen!
            timeUnit: '1s',
            duration: '60s',
            preAllocatedVUs: 50,
            maxVUs: 200,
        },
    },
};

export default function () {
    jobsStarted.add(1);

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
        'enqueue 200': (r) => r.status === 200,
        'has job_id': (r) => {
            try {
                return !!r.json('job_id');
            } catch (_) {
                return false;
            }
        },
    });

    if (!enqueueOk) {
        jobSuccessRate.add(false);
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

    jobEndToEnd.add(Date.now() - startedAt);
    jobSuccessRate.add(ok);
    if (ok) jobsCompleted.add(1);
}
