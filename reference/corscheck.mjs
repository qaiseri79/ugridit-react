const res = await fetch('http://localhost:1337/api/portfolios', {
  headers: { Origin: 'http://localhost:5173' },
});
console.log('status', res.status);
console.log('allow-origin:', res.headers.get('access-control-allow-origin'));
console.log('sample slug:', (await res.json()).data[0]?.slug);