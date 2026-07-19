#!/usr/bin/env bash
set -euo pipefail

PORT=3000
BASE="http://localhost:$PORT"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo ""
    echo "Stopping dev server (PID $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "╔══════════════════════════════════════════╗"
echo "║   Nescom E2E Test Runner                 ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check if server is already running
if curl -s -o /dev/null -w "%{http_code}" "$BASE" --max-time 3 | grep -q "200\|301\|302\|307"; then
  echo "Dev server already running on port $PORT"
else
  echo "Starting dev server on port $PORT..."
  npx next dev -p "$PORT" > /tmp/companyhub-dev.log 2>&1 &
  SERVER_PID=$!

  # Wait for server to be ready
  echo "Waiting for server to be ready..."
  for i in $(seq 1 60); do
    if curl -s -o /dev/null -w "%{http_code}" "$BASE" --max-time 2 | grep -q "200\|301\|302\|307"; then
      echo "Server ready after ${i}s"
      break
    fi
    if [ $i -eq 60 ]; then
      echo "ERROR: Server failed to start within 60s"
      cat /tmp/companyhub-dev.log | tail -20
      exit 1
    fi
    sleep 1
  done
fi

echo ""
echo "Resetting test database..."
npx prisma db push --force-reset 2>&1 | tail -3
echo "Waiting for server to reconnect..."
sleep 3

echo ""
echo "Running API tests..."
echo "────────────────────────────────────────────"

BASE_URL="$BASE" npx tsx tests/api.test.ts
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "All tests passed!"
else
  echo ""
  echo "Some tests failed."
fi

exit $EXIT_CODE
