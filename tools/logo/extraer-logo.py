"""Extrae una zona del PDF del logo como SVG vectorial (sin el fondo negro de la página)."""
import sys
import pymupdf

pdf, x0, y0, x1, y1, out = sys.argv[1], *map(float, sys.argv[2:6]), sys.argv[6]
region = pymupdf.Rect(x0, y0, x1, y1)
page = pymupdf.open(pdf)[0]

def hexc(c):
    return '#%02x%02x%02x' % tuple(round(v * 255) for v in c)

paths, bbox = [], pymupdf.Rect()
for d in page.get_drawings():
    r = d['rect']
    if r.width > 500:            # fondo negro de la página
        continue
    if not region.contains(r):   # solo trazos completamente dentro de la zona
        continue
    seg, cur = [], None
    for it in d['items']:
        op = it[0]
        if op == 'l':
            p1, p2 = it[1], it[2]
            if cur is None or (abs(cur.x - p1.x) > 1e-3 or abs(cur.y - p1.y) > 1e-3):
                seg.append(f'M{p1.x:.3f} {p1.y:.3f}')
            seg.append(f'L{p2.x:.3f} {p2.y:.3f}'); cur = p2
        elif op == 'c':
            p1, c1, c2, p2 = it[1], it[2], it[3], it[4]
            if cur is None or (abs(cur.x - p1.x) > 1e-3 or abs(cur.y - p1.y) > 1e-3):
                seg.append(f'M{p1.x:.3f} {p1.y:.3f}')
            seg.append(f'C{c1.x:.3f} {c1.y:.3f} {c2.x:.3f} {c2.y:.3f} {p2.x:.3f} {p2.y:.3f}'); cur = p2
        elif op == 're':
            q = it[1]
            seg.append(f'M{q.x0:.3f} {q.y0:.3f}H{q.x1:.3f}V{q.y1:.3f}H{q.x0:.3f}Z'); cur = None
        elif op == 'qu':
            q = it[1]
            seg.append(f'M{q.ul.x:.3f} {q.ul.y:.3f}L{q.ur.x:.3f} {q.ur.y:.3f}L{q.lr.x:.3f} {q.lr.y:.3f}L{q.ll.x:.3f} {q.ll.y:.3f}Z'); cur = None
    if d.get('closePath'):
        seg.append('Z')
    attrs = []
    if d.get('fill') is not None:
        attrs.append(f'fill="{hexc(d["fill"])}"')
        if d.get('even_odd'):
            attrs.append('fill-rule="evenodd"')
        if (d.get('fill_opacity') or 1) < 1:
            attrs.append(f'fill-opacity="{d["fill_opacity"]:.3f}"')
    else:
        attrs.append('fill="none"')
    if d.get('color') is not None and d.get('width'):
        attrs.append(f'stroke="{hexc(d["color"])}" stroke-width="{d["width"]:.3f}"')
        if d.get('lineCap'):
            attrs.append('stroke-linecap="round"')
    paths.append(f'<path {" ".join(attrs)} d="{"".join(seg)}"/>')
    bbox |= r

pad = 1
vb = f'{bbox.x0 - pad:.2f} {bbox.y0 - pad:.2f} {bbox.width + 2 * pad:.2f} {bbox.height + 2 * pad:.2f}'
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">\n' + '\n'.join(paths) + '\n</svg>\n'
open(out, 'w', encoding='utf-8').write(svg)
print(out, 'trazos', len(paths), 'caja', bbox)
