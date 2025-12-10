#!/bin/sh
# Config injection script for Neptun application
# Converts YAML config to JSON and injects into index.html

set -e

CONFIG_FILE="/config/config.yaml"
INDEX_FILE="/usr/share/nginx/html/index.html"

echo "==================================="
echo "Config Injection Script"
echo "==================================="

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "WARNING: Config file not found at $CONFIG_FILE"
    echo "Application will use default configuration"
    exit 0
fi

echo "Found config file: $CONFIG_FILE"

# Convert YAML to JSON using yq
echo "Converting YAML to JSON..."
CONFIG_JSON=$(yq eval -o=json "$CONFIG_FILE" | tr -d '\n' | sed 's/"/\\"/g')

if [ -z "$CONFIG_JSON" ]; then
    echo "ERROR: Failed to convert YAML to JSON"
    exit 1
fi

echo "Config JSON generated successfully"

# Check if index.html exists
if [ ! -f "$INDEX_FILE" ]; then
    echo "ERROR: index.html not found at $INDEX_FILE"
    exit 1
fi

# Create backup
cp "$INDEX_FILE" "$INDEX_FILE.bak"

# Inject config into index.html before </head>
# Using sed to insert the script tag
sed -i "s|</head>|<script>window.__APP_CONFIG__ = JSON.parse(\"$CONFIG_JSON\");</script></head>|" "$INDEX_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Config successfully injected into index.html"
    echo "==================================="
else
    echo "ERROR: Failed to inject config"
    # Restore backup
    mv "$INDEX_FILE.bak" "$INDEX_FILE"
    exit 1
fi
