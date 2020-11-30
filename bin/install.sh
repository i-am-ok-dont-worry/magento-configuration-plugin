#!/usr/bin/env bash

cwd=$(pwd)
PLUGIN_NAME=$(cat package.json \
  | grep pluginname \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

COMPANY=$(cat package.json | grep name | sed 's/.*"name": "\(.*\)".*/\1/')
echo "Installing LSF plugin" $PLUGIN_NAME from $COMPANY "..."

mkdir -p "$cwd/../../vendor/@$COMPANY"
cp -R src/ ../../vendor/@$COMPANY
cp README.md ../../vendor/@$COMPANY/README.md
