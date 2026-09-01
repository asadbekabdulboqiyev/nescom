#!/usr/bin/env bash
set -euo pipefail

PORT=3000
BASE="http://localhost:$PORT"
SERVER_PID=""

cleanup() {
  echo ""
  echo "Cleaning up..."
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "Stopping dev server (PID $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  echo "Done."
}
trap cleanup EXIT INT TERM

echo "╔══════════════════════════════════════════╗"
echo "║   Nescom Full Test Runner                ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Step 1: Ensure dependencies ──────────────────────────────────────────────
echo "Installing dependencies..."
npm ci --silent 2>/dev/null || npm install --silent

# ── Step 2: Generate Prisma client ───────────────────────────────────────────
echo "Generating Prisma client..."
npx prisma generate 2>&1 | tail -1

# ── Step 3: Run unit tests ───────────────────────────────────────────────────
echo ""
echo "Running unit tests..."
echo "────────────────────────────────────────────"
npm run test:coverage
UNIT_EXIT=$?

if [ $UNIT_EXIT -ne 0 ]; then
  echo ""
  echo "Unit tests failed. Aborting."
  exit $UNIT_EXIT
fi

# ── Step 4: Check if server is already running ────────────────────────────────
if curl -s -o /dev/null -w "%{http_code}" "$BASE" --max-time 3 | grep -q "200\|301\|302\|307"; then
  echo ""
  echo "Dev server already running on port $PORT"
else
  echo ""
  echo "Starting dev server on port $PORT..."
  npx next dev -p "$PORT" > /tmp/nescom-dev.log 2>&1 &
  SERVER_PID=$!

  echo "Waiting for server to be ready..."
  for i in $(seq 1 60); do
    if curl -s -o /dev/null -w "%{http_code}" "$BASE" --max-time 2 | grep -q "200\|301\|302\|307"; then
      echo "Server ready after ${i}s"
      break
    fi
    if [ $i -eq 60 ]; then
      echo "ERROR: Server failed to start within 60s"
      tail -20 /tmp/nescom-dev.log
      exit 1
    fi
    sleep 1
  done
fi

# ── Step 5: Reset and seed database ───────────────────────────────────────────
echo ""
echo "Resetting test database..."
npx prisma db push --force-reset --skip-generate 2>&1 | tail -3

echo "Seeding database..."
npx prisma db seed 2>&1 | tail -3

echo "Waiting for server to reconnect..."
sleep 3

# ── Step 6: Run integration tests ─────────────────────────────────────────────
echo ""
echo "Running API integration tests..."
echo "────────────────────────────────────────────"

BASE_URL="$BASE" npx tsx tests/api.test.ts
API_EXIT=$?

# ── Step 7: Run E2E integration tests ─────────────────────────────────────────
if [ -f tests/integration.test.ts ]; then
  echo ""
  echo "Running integration tests..."
  echo "────────────────────────────────────────────"
  BASE_URL="$BASE" DATABASE_URL="${DATABASE_URL:-postgresql://asadbek@localhost:5432/companyhub}" npx tsx tests/integration.test.ts
  INT_EXIT=$?
else
  INT_EXIT=0
fi

# ── Step 8: Summary ──────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════"
echo "Test Results Summary"
echo "────────────────────────────────────────────"
echo "  Unit tests:    $([ $UNIT_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo "  API tests:     $([ $API_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo "  Integration:   $([ $INT_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo "════════════════════════════════════════════"

FINAL_EXIT=$((UNIT_EXIT + API_EXIT + INT_EXIT))
if [ $FINAL_EXIT -eq 0 ]; then
  echo ""
  echo "All tests passed!"
else
  echo ""
  echo "Some tests failed."
fi

exit $FINAL_EXIT
