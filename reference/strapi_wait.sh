#!/bin/bash
# Poll until Strapi health endpoint responds, then print API status.
for i in $(seq 1 60); do
  if curl -s -m 3 http://localhost:1337/_health 2>/dev/null | grep -q ok; then
    echo "READY after ${i} polls"
    exit 0
  fi
  if ! pgrep -f 'strapi' > /dev/null && [ "$i" -gt 5 ]; then
    echo "STRAPI PROCESS NOT RUNNING (poll $i)"
    tail -30 /tmp/strapi.log
    exit 1
  fi
  sleep 2
done
echo "TIMEOUT"
tail -30 /tmp/strapi.log