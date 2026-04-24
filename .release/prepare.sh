#!/bin/bash

# config with defaults
IMAGE_NAME=${IMAGE_NAME:-calmply-admin-frontend}
RELEASE_VERSION=${RELEASE_VERSION:-local}
RELEASE_BRANCH=${RELEASE_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}
RELEASE_COMMIT=${RELEASE_COMMIT:-$(git rev-parse --short HEAD)}

## (read only token for wmathes at github)
# TODO: rethrow exit code or set pipefail
bun --bun run build