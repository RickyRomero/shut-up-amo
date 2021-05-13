#!/bin/sh
set -eu

cd /usr/app
cp -R $GITHUB_WORKSPACE/* /amo/extension/

yarn prebuild
yarn build
yarn submit
