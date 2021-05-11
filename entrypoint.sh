#!/bin/bash
set -eu

yarn prebuild
yarn build
yarn submit
