#!/bin/bash
curl -s -o /dev/null -w 'strapi:%{http_code}\n' http://localhost:1337/_health
curl -s -o /dev/null -w 'vite:%{http_code}\n' http://localhost:5173/
curl -s 'http://localhost:1337/api/portfolios?populate=*' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log('portfolios:',j.data.length, j.data.map(p=>p.slug).join(','))})"