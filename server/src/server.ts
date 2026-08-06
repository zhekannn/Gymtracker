import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { PORT } from './config/jwt.js';
import { AppDataSource } from './data-source.js';

AppDataSource.initialize()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", (error) => {
      console.error("Express server error:", error);
    });
  })
  .catch((err) => console.error("Error during Data Source initialization:", err));