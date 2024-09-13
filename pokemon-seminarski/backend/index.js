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
const handleSocketConnections = require('./config/socket');
const { Server } = require('socket.io');
const io = new Server(server);

const startServer = async () => {
    try {
        await handleSocketConnections(io);

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
}
startServer();