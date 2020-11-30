#!/usr/bin/env bash

cwd=$(pwd)
PLUGIN_NAME=$(cat package.json \
  | grep pluginname \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

COMPANY=$(cat package.json | grep companyname | sed 's/.*"companyname": "\(.*\)".*/\1/')
echo "Installing LSF plugin" $PLUGIN_NAME from $COMPANY "..."

INSTALLATION_PATH="../"
if [[ -f "../package.json" ]]
then
  INSTALLATION_PATH="../";
elif [[ -f "../../package.json" ]]
then
  INSTALLATION_PATH="../.."
elif [[ -f "../../../package.json" ]]
then
  INSTALLATION_PATH="../../.."
elif [[ -f "../../../../package.json" ]]
then
  INSTALLATION_PATH="../../../.."
else
  echo "Cannot install script. Invalid API structure"
  exit 1
fi;

mkdir -p "$cwd/$INSTALLATION_PATH/vendor/@$COMPANY"
cp -R src/* "./$INSTALLATION_PATH/vendor/@$COMPANY"
cp README.md "./$INSTALLATION_PATH/vendor/@$COMPANY/README.md"
