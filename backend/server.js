const express = require('express');
const cors = require('cors');
require('dotenv').config();

const vastuRoutes = require('./routes/vastu');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', vastuRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vastu AI Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vastu AI Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});

