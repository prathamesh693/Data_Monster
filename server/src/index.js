import app from "./app.js";
import { config } from "./config/env.js";

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`DataGuard server running on http://localhost:${config.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});
