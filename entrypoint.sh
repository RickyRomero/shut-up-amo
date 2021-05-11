#!/bin/sh
set -eu

yarn prebuild
yarn build
yarn submit
