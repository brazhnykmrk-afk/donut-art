/**
 * Local development database — embedded PostgreSQL.
 *
 * Runs a real PostgreSQL server from ./.pgdata without any system-wide
 * installation or admin rights. Used for local development only; production
 * uses a managed PostgreSQL (e.g. Neon) via DATABASE_URL.
 *
 * Usage: npm run db:local   (keep it running while you develop)
 */
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const DATA_DIR = new URL("../.pgdata", import.meta.url).pathname;
const PORT = 5432;

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

async function main() {
  const firstRun = !existsSync(DATA_DIR);

  if (firstRun) {
    console.log("[db] first run — initialising data directory…");
    await pg.initialise();
  }

  try {
    await pg.start();
  } catch (error) {
    // Most likely another instance is already running on the port — that is
    // fine, the app can use it.
    console.log("[db] could not start (already running?):", error.message ?? error);
    process.exit(0);
  }

  try {
    await pg.createDatabase("donut_art");
    console.log("[db] created database donut_art");
  } catch {
    // Database already exists — nothing to do.
  }

  console.log(`[db] PostgreSQL is running on port ${PORT} (Ctrl+C to stop)`);

  const stop = async () => {
    console.log("\n[db] stopping…");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((error) => {
  console.error("[db] fatal:", error);
  process.exit(1);
});
