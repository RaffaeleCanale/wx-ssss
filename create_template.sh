#!/usr/bin/env bash

template=$(cat split_combiner.html | base64 -w0)

sed -i "s|const template64 = \".*\";|const template64 = \"${template}\";|" split.html