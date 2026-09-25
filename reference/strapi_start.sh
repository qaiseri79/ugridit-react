#!/bin/bash
# Start Strapi detached and wait until it responds
cd /home/danielsudenfield/ugridit_react/backend || exit 1
pkill -9 -f '[s]trapi develop' 2>/dev/null
pkill -9 -f 'backend/dist' 2>/dev/null
sleep 2
nohup npm run develop > /tmp/strapi.log 2>&1 &
echo "pid=$!"
for i in $(seq 1 45); do
  if curl -s -m 2 http://localhost:1337/_health > /dev/null 2>&1; then
    echo "READY after ${i}x2s"
    exit 0
  fi
  sleep 2
done
echo "NOT READY"
tail -30 /tmp/strapi.log
exit 1