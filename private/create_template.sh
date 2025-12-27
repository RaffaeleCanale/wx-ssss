#!/usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

template=$(cat "$SCRIPT_DIR/split_combiner.html" | base64 -w0)

sed -i "s|const template64 = \".*\";|const template64 = \"${template}\";|" "$SCRIPT_DIR/../public/index.html"