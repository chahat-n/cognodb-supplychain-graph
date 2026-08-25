import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import graphRoutes from './routes/graphRoutes';
import { testConnection } from './config/database';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', graphRoutes);

// Root Status Page
app.get('/', (req, res) => {
  res.json({
    application: 'CognoDB Supply Chain & Blast Radius Navigator API',
    status: 'Running',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      fullGraph: 'GET /api/graph',
      blastRadius: 'GET /api/blast-radius/:id',
      singlePointsOfFailure: 'GET /api/spof',
      alternatives: 'GET /api/alternatives/:componentId',
      statistics: 'GET /api/stats',
      seedData: 'POST /api/seed'
    }
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 CognoDB Backend API running at http://localhost:${PORT}`);
  console.log(`====================================================`);
  
  // Test connection on boot
  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`🟢 CognoDB Status: Connected successfully.`);
  } else {
    console.warn(`🔴 CognoDB Status: ${dbStatus.message}`);
  }
});
