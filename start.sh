#!/usr/bin/env bash

# ==============================================================================
# NIK (Nepali in KIIT) — Clean Fresh Start Script
# Kills existing servers on ports 3000-3002, resets .next cache, and starts dev.
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Ensure Node & local binaries are in PATH
export PATH="$DIR/node_modules/.bin:$PATH:/Users/ranag/.node/node-v20.12.2-darwin-arm64/bin:/opt/homebrew/bin:/usr/local/bin"

echo "--------------------------------------------------------"
echo "  🇳🇵 NEPALI IN KIIT (NIK) — Fresh Server Start"
echo "--------------------------------------------------------"

# 1. Kill any existing processes on ports 3000, 3001, 3002
echo "🔍 Checking for running processes on ports 3000, 3001, 3002..."
PORT_PIDS=$(lsof -ti:3000,3001,3002 2>/dev/null || true)
if [ -n "$PORT_PIDS" ]; then
  echo "🛑 Terminating lingering processes: $PORT_PIDS"
  echo "$PORT_PIDS" | xargs kill -9 2>/dev/null || true
  sleep 1
else
  echo "✅ Ports are clear."
fi

# 2. Kill any lingering next-dev / turbopack processes for this project
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# 3. Clean .next cache to prevent external SSD persistence locks
echo "🧹 Cleaning .next build cache for a fresh start..."
rm -rf .next

# 4. Ensure dependencies are installed
if [ ! -f "node_modules/.bin/next" ]; then
  echo "📦 Installing project dependencies..."
  npm install
fi

# 5. Confirm environment file exists
if [ ! -f ".env.local" ]; then
  echo "⚠️  Warning: .env.local not found. Using defaults/SQLite fallback."
fi

echo "🚀 Starting Next.js Dev Server on http://localhost:3000 ..."
echo "--------------------------------------------------------"
exec ./node_modules/.bin/next dev
