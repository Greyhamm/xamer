const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Routes
const authRoutes = require('./routes/auth'); // Ensure correct path
const submissionRoutes = require('./routes/submission');
const mediaRoutes = require('./routes/media');
const examRoutes = require('./routes/exam');
const codeExecutionRoutes = require('./routes/codeExecution');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Adjust as needed
}));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/code-execution', codeExecutionRoutes);

// Fallback Route
app.use((req, res) => {
  res.status(404).send('Route not found');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));