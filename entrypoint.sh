#!/bin/bash
set -eu

mkdir -p /amo/build /amo/extension

yarn prebuild
yarn build
yarn submit
