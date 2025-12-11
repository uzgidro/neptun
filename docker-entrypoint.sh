#!/bin/sh
# Docker entrypoint for Neptun application
# Runs config injection before starting nginx

set -e

echo "==================================="
echo "Starting Neptun Application"
echo "==================================="

# Run config injection
/usr/local/bin/inject-config.sh

# Execute the main command (nginx)
echo "Starting nginx..."
exec "$@"
