#!/usr/bin/env bash
# Simple filesystem smoke-check for carousel partials
BASE_DIR="/home/x1carbon/Projects/HTML/Lord"
partials=(
  "partials/carousel/1-title.html"
  "partials/carousel/2-controls.html"
  "partials/carousel/3-fontsize.html"
  "partials/carousel/4-align.html"
  "partials/carousel/5-fonts.html"
  "partials/carousel/6-colors.html"
  "partials/carousel/7-wordcount.html"
  "partials/carousel/8-mode.html"
)

all_ok=0
for p in "${partials[@]}"; do
  if [ -f "$BASE_DIR/$p" ]; then
    echo "OK: $p"
  else
    echo "MISSING: $p"
    all_ok=1
  fi
done

exit $all_ok
