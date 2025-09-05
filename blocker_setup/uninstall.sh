#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME=app-blocker.service
SERVICE_PATH=/etc/systemd/system/$SERVICE_NAME
DAEMON_PATH=/usr/local/bin/app-blocker.js
SOCKET_PATH=/var/run/app-blocker.sock

echo "Stopping and disabling service (if exists)..."
sudo systemctl stop "$SERVICE_NAME" >/dev/null 2>&1 || true
sudo systemctl disable "$SERVICE_NAME" >/dev/null 2>&1 || true

echo "Removing service file..."
sudo rm -f "$SERVICE_PATH"
sudo systemctl daemon-reload

echo "Removing daemon file..."
sudo rm -f "$DAEMON_PATH"

echo "Removing socket (if any)..."
sudo rm -f "$SOCKET_PATH"

echo "Uninstall complete."
