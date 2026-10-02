import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes'; // We will create/adjust this next

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/users', userRoutes);

export default app;