import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import { authMiddleware as authenticate } from "./middleware";

export class Main {
  public app: express.Application;
  public server: http.Server;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.initializeMiddleware();
  }

  private initializeMiddleware(): void {
    this.app.use(compression());
    this.app.use(morgan('combined'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  public listen(port: number): void {
    this.server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}

const main = new Main();
export const io = main.io;
export const authMiddleware = authenticate;

if (require.main === module) {
  const port = parseInt(process.env.PORT || '5000');
  main.listen(port);
}

export default main;
