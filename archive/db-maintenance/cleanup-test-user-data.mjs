#!/usr/bin/env node

/**
 * Safe test-user-data cleanup script.
 *
 * Deletes transactional guest data while keeping website content/media/settings.
 *
 * Default cleanup targets:
 * - booking_addons
 * - cancellation_requests
 * - bookings
 * - otps
 *
 * Optional with flag:
 * - testimonials (use --include-testimonials)
 *
 * Usage examples:
 *   node archive/db-maintenance/cleanup-test-user-data.mjs --dry-run
 *   node archive/db-maintenance/cleanup-test-user-data.mjs --confirm
 *   node archive/db-maintenance/cleanup-test-user-data.mjs --confirm --include-testimonials
 */

import pg from "pg";

const { Pool } = pg;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const confirm = args.has("--confirm");
const includeTestimonials = args.has("--include-testimonials");

if (!dryRun && !confirm) {
  console.error(
    [
      "Refusing to run without explicit confirmation.",
      "Use one of:",
      "  --dry-run                  Show what would be deleted",
      "  --confirm                  Execute cleanup",
      "Optional:",
      "  --include-testimonials     Also delete testimonials/reviews",
    ].join("\n")
  );
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Export it before running this script.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const tables = [
  "booking_addons",
  "cancellation_requests",
  "bookings",
  "otps",
];

if (includeTestimonials) {
  tables.push("testimonials");
}

const countSql = (table) => `SELECT COUNT(*)::int AS count FROM ${table}`;

async function main() {
  const client = await pool.connect();
  try {
    console.log("Cleanup targets:");
    for (const table of tables) {
      const result = await client.query(countSql(table));
      console.log(`- ${table}: ${result.rows[0].count} rows`);
    }

    if (dryRun) {
      console.log("\nDry run only. No changes were made.");
      return;
    }

    await client.query("BEGIN");

    // Delete child tables first, then parent tables.
    for (const table of tables) {
      await client.query(`DELETE FROM ${table}`);
    }

    await client.query("COMMIT");
    console.log("\nCleanup completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
