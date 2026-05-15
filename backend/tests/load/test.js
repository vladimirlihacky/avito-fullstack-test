import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 200 }, 
    { duration: '1m', target: 400 },
    { duration: '30s', target: 0 }, 
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = 'http://localhost:8080';
const ASSISTANT_ID = '00000000-0000-0000-0000-000000000004';

export function setup() {
  const loginUrl = `${BASE_URL}/dummyLogin`;
  const payload = JSON.stringify({ role: 'user' });

  const res = http.post(loginUrl, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const token = res.json().token; 
  
  if (!token) {
    throw new Error("Failed to get auth token!");
  }

  return { authToken: token };
}

export default function (data) {
  const url = `${BASE_URL}/assistants/${ASSISTANT_ID}/run`;
  const payload = JSON.stringify({
    userPrompt: 'Hello, this is a load test prompt',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.authToken}`, 
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
    'has request id': (r) => r.json().id !== undefined,
  });

  sleep(0.1);
}