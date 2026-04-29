#!/bin/sh
set -e

echo "Running database migrations..."
node node_modules/prisma/build/index.js db push --skip-generate

echo "Checking if seed is needed..."
# Check if admin user exists; if not, seed
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  prisma.\$disconnect();
  process.exit(count === 0 ? 1 : 0);
}).catch(() => { prisma.\$disconnect(); process.exit(1); });
" || (echo "Seeding database..." && node -e "
require('tsx/cjs');
require('./prisma/seed.ts');
" 2>/dev/null || echo "Seed skipped (run manually if needed)")

echo "Starting Next.js..."
exec node server.js
