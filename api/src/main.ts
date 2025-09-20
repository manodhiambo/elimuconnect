import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import { authMiddleware as authenticate } from "./middleware";

// Import your route files
import schoolRoutes from './routes/schools.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
// Import other routes as needed

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
    this.initializeRoutes(); // Add this line
  }

  private initializeMiddleware(): void {
    this.app.use(compression());
    this.app.use(morgan('combined'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  // Add this method to mount your routes
  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/schools', schoolRoutes);
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    // Add other routes as needed
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', message: 'ElimuConnect API is running' });
    });
    
    // 404 handler for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({ 
        success: false, 
        message: `Route ${req.originalUrl} not found` 
      });
    });
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
