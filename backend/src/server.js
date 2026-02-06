import "dotenv/config";
import { config, validateEnv } from "./config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const PORT = config.port;
const NODE_ENV = config.env;
const URL = `http://localhost:${PORT}`;

async function startServer() {
  try {
    validateEnv();
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`URL: ${URL}`);
      console.log("Database is connecting...");
      await connectDatabase();
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

await startServer();
