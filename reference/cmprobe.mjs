const BASE = 'http://localhost:1337';
const login = await fetch(`${BASE}/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@ugridit.com', password: 'Admin@ugridit123!' }),
}).then((r) => r.json());
const token = login.data.token;
console.log('login ok');

for (const url of [
  '/content-manager/collection-types/api::portfolio.portfolio?page=1&pageSize=100',
  '/content-manager/collection-types/api::portfolio.portfolio?pagination[page]=1&pagination[pageSize]=100',
]) {
  const res = await fetch(`${BASE}${url}`, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  console.log('---', res.status, url);
  console.log(text.slice(0, 600));
}