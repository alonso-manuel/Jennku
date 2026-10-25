# Extraer el logo del PDF

`extraer-logo.py` saca una zona del PDF del logo como SVG vectorial, sin el fondo negro de la página. Requiere `pymupdf`.

```bash
python extraer-logo.py ENFIBRART.pdf 355 120 505 318 busto.svg   # busto (arriba a la derecha)
python extraer-logo.py ENFIBRART.pdf 25 700 570 800 marca.svg    # nombre grande (abajo)
```

Los números son la zona en puntos del PDF (x0 y0 x1 y1, página A4 de 595 × 842).
