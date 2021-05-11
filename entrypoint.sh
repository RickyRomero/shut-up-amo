#!/bin/bash
set -eu

sudo mkdir -p /amo/build /amo/extension

yarn prebuild
yarn build
yarn submit
