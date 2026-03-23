// KEEP THIS AS FIRST IMPORT
// See comment in module for details
import "../threadsSignalFix.js";

import fs from "node:fs";
import path from "node:path";
import { connect } from "../data/db.js";
import { env } from "../env.js";
import { setIsAPI } from "../globals.js";
import { rootDir } from "../paths.js";

function debugLog(location: string, message: string, data: Record<string, unknown>) {
  try {
    const logPath = path.join(rootDir, ".cursor", "debug-492615.log");
    const line =
      JSON.stringify({
        sessionId: "492615",
        location,
        message,
        data,
        timestamp: Date.now(),
      }) + "\n";
    fs.appendFileSync(logPath, line);
  } catch (_) {}
}

if (!env.KEY) {
  // tslint:disable-next-line:no-console
  console.error("Project root .env with KEY is required!");
  process.exit(1);
}

function errorHandler(err) {
  console.error(err.stack || err); // tslint:disable-line:no-console
  process.exit(1);
}

process.on("unhandledRejection", errorHandler);

setIsAPI(true);

// Connect to the database before loading the rest of the code (that depend on the database connection)
console.log("Connecting to database..."); // tslint:disable-line
connect()
  .then(() => {
    // #region agent log
    debugLog("api/index.ts", "DB connected, importing start", { hypothesisId: "A" });
    // #endregion
    import("./start.js");
  })
  .catch((err) => {
    // #region agent log
    debugLog("api/index.ts", "DB connect failed", {
      hypothesisId: "E",
      error: String(err?.message || err),
    });
    // #endregion
    throw err;
  });
