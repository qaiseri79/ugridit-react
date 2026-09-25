#!/bin/bash
# Launch Strapi as a detached daemon in the WSL VM so it survives
# the wsl.exe session that spawned it.
pkill -9 -f '[s]trapi develop' 2>/dev/null
pkill -9 -f 'backend/dist' 2>/dev/null
sleep 2
setsid bash -c "cd /home/danielsudenfield/ugridit_react/backend && npm run develop" </dev/null >/tmp/strapi.log 2>&1 &
disown
echo "launched"