import { check } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
import { SAMPLE_TEXTS } from './sample_texts.js';

const BASE_URL = 'http://host.docker.internal:80';

export const requestsCompleted = new Counter('requests_completed');
export const requestsFailed = new Counter('requests_failed');
export const requestSuccessRate = new Rate('request_success_rate');
export const responseTime = new Trend('response_time', true);

// will be read implicitly by k6
export const options = {
    vus: 50, // virtual users
    duration: '60s', // test duration
    thresholds: {
        request_success_rate: ['rate>0.95'], // at least 95% of requests should succeed
        response_time: ['p(95)<3000'], // 95% of requests should complete within 3 seconds
    },
};

// will be read implicitly by k6
export default function () {
    const text = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    const payload = JSON.stringify({ text });
    const params = {
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s',
    };

    const res = http.post(`${BASE_URL}/predict`, payload, params);

    const ok = check(res, {
        'status is 200': (r) => r.status === 200,
        'response contains result': (r) => {
            try {
                const result = r.json('translated_text');
                return result !== null && result !== undefined;
            } catch (_) {
                return false;
            }
        },
    });

    responseTime.add(res.timings.duration);
    requestSuccessRate.add(ok);

    if (ok) {
        requestsCompleted.add(1);
    } else {
        requestsFailed.add(1);
    }
}
