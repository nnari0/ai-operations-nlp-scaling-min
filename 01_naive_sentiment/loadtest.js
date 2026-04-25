import { check } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = 'http://host.docker.internal:8000';

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
    const payload = JSON.stringify({ text: 'Das ist ein fantastischer Kurs!' });
    const params = {
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s',
    };

    const res = http.post(`${BASE_URL}/predict`, payload, params);

    const ok = check(res, {
        'status is 200': (r) => r.status === 200,
        'response contains result': (r) => {
            try {
                const result = r.json('result');
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
