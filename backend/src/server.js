// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const matchesRouter = require('./routes/matches');
const squadRouter = require('./routes/squads'); // This will now work
const teamsRouter = require('./routes/teams'); // Add teams router
const playerRouter = require('./routes/players'); // Update route

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000; // Update port

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with updated configuration
mongoose.connect('mongodb://127.0.0.1:27017/cricket-predictor')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server only after successful database connection
    startServer();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if database connection fails
  });

// Routes
app.use('/api/matches', matchesRouter);
app.use('/api/squads', squadRouter);  // Add this route
app.use('/api/teams', teamsRouter); // Add teams route
app.use('/api/players', playerRouter); // Update route

// Health check endpoint
app.get('/api/health', (req, res) => {
    // Include MongoDB connection status in health check
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({ 
        status: isDbConnected ? 'ok' : 'error',
        database: isDbConnected ? 'connected' : 'disconnected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server function
function startServer() {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

module.exports = app;