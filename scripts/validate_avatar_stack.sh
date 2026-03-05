#!/bin/bash
set -euo pipefail

echo "🔍 Running TypeScript typecheck..."
npm run typecheck

echo "🔍 Running style gate smoke test..."
node ./scripts/style_smoke_test.js

echo "🔍 Running publish decision smoke test..."
node ./scripts/publishing_smoke_test.js

echo "✅ Validation complete."
