#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="/opt/mywebsite/backend"
SERVICE_NAME="mywebsite-backend"
FRONTEND_DIR="${FRONTEND_DIR:-/opt/mywebsite/frontend}"

# ---- Build backend JAR ----
echo "==> Pulling latest code..."
cd "$PROJECT_DIR"
git pull

echo "==> Building backend JAR..."
if command -v mvn &>/dev/null; then
  cd "$PROJECT_DIR/server"
  mvn clean package -DskipTests -q
  JAR_FILE=$(ls target/*.jar | head -1)
  echo "     Built: $JAR_FILE"
else
  echo "     Maven not found. Build locally and upload to: $BACKEND_DIR/admin-server.jar"
  echo "     Local build: cd server && mvn clean package -DskipTests"
  echo "     Then: scp server/target/*.jar user@server:$BACKEND_DIR/admin-server.jar"
  exit 1
fi

# ---- Deploy backend ----
echo "==> Stopping service: $SERVICE_NAME..."
systemctl stop "$SERVICE_NAME" || true

echo "==> Deploying JAR..."
mkdir -p "$BACKEND_DIR"
cp "$JAR_FILE" "$BACKEND_DIR/admin-server.jar"

echo "==> Starting service: $SERVICE_NAME..."
systemctl start "$SERVICE_NAME"

echo "==> Service status:"
systemctl status "$SERVICE_NAME" --no-pager | head -5

# ---- Frontend reminder ----
echo ""
echo "==> Backend deployed. Next: update frontend static files:"
echo "    1. Run locally:  npm run build"
echo "    2. Upload: scp -r dist/* user@server:$FRONTEND_DIR/"
