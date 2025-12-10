#!/bin/sh
# Config injection script for Neptun application
# Converts YAML config to JSON and injects into index.html

set -e

CONFIG_FILE="/config/config.yaml"
INDEX_FILE="/usr/share/nginx/html/index.html"
TEMP_FILE="/tmp/config_temp.json"

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
yq eval -o=json "$CONFIG_FILE" > "$TEMP_FILE"

if [ $? -ne 0 ] || [ ! -f "$TEMP_FILE" ]; then
    echo "ERROR: Failed to convert YAML to JSON"
    exit 1
fi

# Minify JSON (remove newlines and extra spaces)
CONFIG_JSON=$(cat "$TEMP_FILE" | tr -d '\n' | sed 's/  */ /g')

if [ -z "$CONFIG_JSON" ]; then
    echo "ERROR: Config JSON is empty"
    rm -f "$TEMP_FILE"
    exit 1
fi

echo "Config JSON generated successfully"

# Check if index.html exists
if [ ! -f "$INDEX_FILE" ]; then
    echo "ERROR: index.html not found at $INDEX_FILE"
    rm -f "$TEMP_FILE"
    exit 1
fi

# Create backup
cp "$INDEX_FILE" "$INDEX_FILE.bak"

# Create the script tag content
# We inject the JSON object directly without JSON.parse()
SCRIPT_TAG="<script>window.__APP_CONFIG__ = $CONFIG_JSON;</script>"

# Inject config into index.html before </head>
sed -i "s|</head>|$SCRIPT_TAG</head>|" "$INDEX_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Config successfully injected into index.html"
    echo "==================================="
    rm -f "$TEMP_FILE"
else
    echo "ERROR: Failed to inject config"
    # Restore backup
    mv "$INDEX_FILE.bak" "$INDEX_FILE"
    rm -f "$TEMP_FILE"
    exit 1
fi
