import http from 'k6/http';
import { check } from 'k6';

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

export default function () {
  const url = 'http://localhost:8080/assistants/0eb488cd-d611-4ca0-9e36-a045869cd3be/run';
  const payload = JSON.stringify({
    userPrompt: 'USER PROMPT',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAyIiwicm9sZSI6InVzZXIiLCJleHAiOjE3Nzk0NTY3OTEsImlhdCI6MTc3ODg1MTk5MX0.21EccXYLVIGy48dvmnokOixg6HOOVS3HCIU9uvboCXc',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
  });
}