/* eslint-disable no-console */
import { Server } from "http";
import app from "./app";
import config from "./config";
import { seedSuperAdmin } from "./app/DB";

let server: Server;

async function main() {
  try {
    await seedSuperAdmin();
    server = app.listen(config.port, () => {
      console.log(`App is listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

process.on("unhandledRejection", () => {
  console.log("👿 Unhandled Rejection is detected, Shutting Down!");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log("👿 Uncaught Rejection is detected, Shutting Down!");
  process.exit(1);
});
