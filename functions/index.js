import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import adminRoutes from './src/routes/admin.js';
import authRoutes from './src/routes/auth.js';
import todoRoutes from './src/routes/todos.js';
import dailySummaryRoutes from './src/routes/dailySummary.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const mongoUri = process.env.MONGODB_URI || functions.config().mongodb?.uri || "mongodb+srv://xx:shisei1221@clustertodolist.ezx6ch3.mongodb.net/?appName=ClusterTodolist";

let mongoConnected = false;

const connectMongo = async () => {
  if (!mongoConnected && mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      mongoConnected = true;
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }
};

app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);
app.use('/admin', adminRoutes);
app.use('/daily-summary', dailySummaryRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Dodo Todo API' });
});

app.get('/health', async (req, res) => {
  await connectMongo();
  res.json({ 
    status: 'ok', 
    mongodb: mongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

export const api = functions.https.onRequest(async (req, res) => {
  await connectMongo();
  return app(req, res);
});
