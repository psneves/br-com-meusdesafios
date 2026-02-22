#!/bin/bash
set -eo pipefail

echo "=== Xcode Cloud post-clone: installing dependencies ==="

# Navigate to monorepo root
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Install Node.js (Xcode Cloud has Homebrew)
if ! command -v node &>/dev/null; then
  echo "Installing Node.js..."
  brew install node@22
fi

# Install pnpm
if ! command -v pnpm &>/dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

# Install JS dependencies
echo "Installing JS dependencies..."
pnpm install --frozen-lockfile

# Install CocoaPods dependencies
echo "Installing CocoaPods..."
cd apps/mobile/ios
pod install

echo "=== Post-clone complete ==="
