#!/bin/bash
set -e
cd /home/danielsudenfield/ugridit_react/reference/team_photos
curl -s -o muralee.jpg -w "muralee %{http_code} %{size_download}\n" "https://www.geogli.com/sites/default/files/2025-01/muralee.jpg"
curl -s -o abd.jpg -w "abd %{http_code} %{size_download}\n" "https://www.geogli.com/sites/default/files/2025-01/abd.jpg"
curl -s -o devashree.jpg -w "devashree %{http_code} %{size_download}\n" "https://www.geogli.com/sites/default/files/2025-01/devashee-263x300.jpg"
curl -s -o ebenezer.png -w "ebenezer %{http_code} %{size_download}\n" "https://www.geogli.com/sites/default/files/2025-01/eb-unccd.png"
file muralee.jpg abd.jpg devashree.jpg ebenezer.png