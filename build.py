#!/usr/bin/env python3
"""Genera index.html (archivo único) a partir de src/."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / "src"
html = (src / "index.src.html").read_text()
for marker, name in (("/*CORE*/", "core.js"), ("/*SAMPLE*/", "sample.js"), ("/*APP*/", "app.js")):
    html = html.replace(marker, (src / name).read_text().replace("</script>", "<\\/script>"))
(root / "index.html").write_text(html)
print("index.html generado,", len(html) // 1024, "KB")
