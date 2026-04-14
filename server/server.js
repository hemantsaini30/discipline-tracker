import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import logRoutes from './routes/logs.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import dayplanRoutes from './routes/dayplan.js';
import errorHandler from './middleware/errorHandler.js';


connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dayplan', dayplanRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
