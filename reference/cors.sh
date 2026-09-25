#!/bin/bash
curl -s -D - -o /dev/null -H 'Origin: http://localhost:5173' http://localhost:1337/api/portfolios | head -20