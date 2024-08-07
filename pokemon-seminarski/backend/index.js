const express = require('express');
require('dotenv').config({ path: './../.env' });
require('./config/db');

const app = express();
const server = require('http').createServer(app);



// Routes

// Middleware

const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get('/', (_, res) => {
    res.send('Api is running...');
});

// Route registrations

// Middleware registrations


// socket.io setup
const { Server } = require('socket.io');
const io = new Server(server);

server.listen(PORT, () => {
    console.log(`Serve is running on port ${PORT}`);
});