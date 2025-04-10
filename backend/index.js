#!/usr/bin/env node
'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');


const port = (() => {
    const args = process.argv;
  
    // Use provided port or fallback to 8080
    const num = args[2] ? parseInt(args[2], 10) : 8080;
  
    if (isNaN(num)) {
      console.error("error: argument must be an integer.");
      process.exit(1);
    }
  
    return num;
  })();
  


const app = express();
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));
app.use(cors({
    origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5173',
    credentials: true,
}));


// Import routes
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const eventRoutes = require('./src/routes/eventRoutes');

const promotionRoutes = require('./src/routes/promotionRoutes');


app.use(express.json());

// Add your routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/events', eventRoutes);

app.use('/promotions', promotionRoutes);


const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});
