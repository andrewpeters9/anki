#!/bin/bash
# Execute subcommand (eg 'yarn <cmd> ...') and update licenses.

set -e

PATH=$(realpath ../out/extracted/node/bin)

# @TODO: https://github.com/koalaman/shellcheck/wiki/SC2048
../out/extracted/node/bin/yarn $*

cd ..

./node_modules/.bin/license-checker-rseidelsohn --production --json \
    --excludePackages anki --relativeLicensePath \
    --relativeModulePath > ts/licenses.json
