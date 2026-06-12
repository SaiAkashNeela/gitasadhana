import { createApp } from "./app.js";
import { config } from "./config.js";
import { connectDb } from "./db.js";

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

