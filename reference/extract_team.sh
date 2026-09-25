#!/bin/bash
set -e
cd /home/danielsudenfield/ugridit_react/reference
for id in 508 510 511 509 512; do
  curl -s "https://www.geogli.com/node/$id" -o "node_$id.html"
done

python3 << 'EOF'
import re, html, json

def grab(path):
    content = open(path, encoding='utf-8', errors='replace').read()
    return content

out = []
for nid in ['508', '510', '511', '509', '512']:
    c = grab(f'node_{nid}.html')
    title = re.search(r'<title>([^<]*) \|', c)
    name = html.unescape(title.group(1)).strip() if title else None
    desc = re.search(r'name="description" content="([^"]*)"', c)
    designation = re.search(r'field--name-field-designation[\s\S]*?label-hidden field__item">([^<]*)<', c)
    email = re.search(r'mailto:([^"]+)"', c)
    summary = re.search(r'class="summary-over-lay">\s*<p>(.*?)</p>', c)
    # body: all <p> inside field--name-body
    body = re.search(r'field--name-body[\s\S]*?field__item">(.*?)</div>\s*</div>', c, re.S)
    ps = re.findall(r'<p>(.*?)</p>', body.group(1) if body else '')
    img = re.search(r'profile-pic[\s\S]*?src="([^"]+)"', c)
    out.append({
        'id': nid,
        'name': name,
        'meta_description': html.unescape(desc.group(1)).strip() if desc else None,
        'designation': html.unescape(designation.group(1)).strip() if designation else None,
        'email': email.group(1) if email else None,
        'overlay_summary': html.unescape(summary.group(1)).strip() if summary else None,
        'body': [html.unescape(p).strip() for p in ps],
        'photo': img.group(1) if img else None,
    })

print(json.dumps(out, indent=2, ensure_ascii=False))
EOF