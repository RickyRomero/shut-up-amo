#!/bin/sh
set -eu

cd /usr/app

yarn prebuild
yarn build
yarn submit
