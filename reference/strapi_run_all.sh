#!/bin/bash
# Full backend bring-up + seed + verify in ONE wsl session.
# Kills strapi at the end so the invocation returns cleanly.
set -e
echo "== stage: cleanup =="
pkill -9 -f '[s]trapi develop' 2>/dev/null || true
pkill -9 -f '[b]ackend/dist' 2>/dev/null || true
sleep 2

echo "== stage: launch =="
cd /home/danielsudenfield/ugridit_react/backend
npm run develop > /tmp/strapi.log 2>&1 &
SERVER_PID=$!
export SERVER_PID
echo "server pid ${SERVER_PID}"

echo "== stage: wait =="
READY=0
for i in $(seq 1 60); do
  code=$(curl -s -m 3 -o /dev/null -w '%{http_code}' http://localhost:1337/_health 2>/dev/null || true)
  if [ "$code" = "204" ] || [ "$code" = "200" ]; then
    READY=1
    echo "Strapi READY (poll ${i}, http ${code})"
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "server process died during wait"
    break
  fi
  sleep 2
done

if [ "$READY" = "0" ]; then
  echo "Strapi failed to start"
  tail -40 /tmp/strapi.log
  kill -9 "$SERVER_PID" 2>/dev/null || true
  exit 1
fi

echo "== stage: seed =="
node /home/danielsudenfield/ugridit_react/backend/scripts/seed.mjs

echo "== stage: verify public api =="
node /home/danielsudenfield/ugridit_react/reference/strapi_check.mjs || true

echo "== stage: shutdown =="
kill -9 "$SERVER_PID" 2>/dev/null || true
pkill -9 -f '[b]ackend/dist' 2>/dev/null || true
echo "done"