#!/bin/sh
# Rebuilds index.html from the source parts in src/ (joined in this order).
cd "$(dirname "$0")"
cat src/a_head.html src/b_core.js src/i_worlds.js src/c_game.js src/d_render.js src/f_cutscene.js src/j_dance.js src/g_free.js src/h_powers.js src/e_ui.js | python3 -c '
import sys
body=sys.stdin.read()
i=body.index("</style>")+len("</style>")
head,rest=body[:i],body[i:]
reset="*{box-sizing:border-box}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);height:100%}body{margin:0;font-size:14px}img{max-width:100%}[hidden]{display:none!important}"
meta=("<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
 "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n<meta name=\"mobile-web-app-capable\" content=\"yes\">\n"
 "<meta name=\"apple-mobile-web-app-title\" content=\"Hoofbeat Hills\">\n<meta name=\"theme-color\" content=\"#241638\">\n")
doc="<!doctype html>\n<html lang=\"en\">\n<head>\n"+meta+head.replace("<style>","<style>\n"+reset+"\n",1)+"\n</head>\n<body>\n"+rest+"\n</body>\n</html>\n"
open("index.html","w").write(doc)
print("index.html rebuilt")
'
