#!/bin/sh

echo "Setting options to prevent cascading errors..."
set -eu

echo "Copying extension files..."
cd /usr/app
cp -R $GITHUB_WORKSPACE/* /amo/extension/

echo "Selecting Firefox manifest..."
rm /amo/extension/manifest.json
mv /amo/extension/manifest.ffx.json /amo/extension/manifest.json

echo "Building extension..."
yarn build

echo "Submitting extension..."
yarn submit
