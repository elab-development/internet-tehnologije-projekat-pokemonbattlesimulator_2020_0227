const express = require('express');
require('dotenv').config({ path: './../.env' });
require('./config/db');

const app = express();
const server = require('http').createServer(app);
const cors = require('cors');


// Routes
const gameRoutes = require('./routes/gameRoutes');
const gifRoutes = require('./routes/gifRoutes');
const messagesRoutes = require('./routes/messageRoutes');
const usersRoutes = require('./routes/userRoutes');
const pokemonsRoutes = require('./routes/pokemonRoutes');

// Middleware

const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
app.get('/', (_, res) => {
    res.send('Api is running...');
});

// Route registrations
app.use('/api/games', gameRoutes);
app.use('/api/gifs', gifRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pokemons', pokemonsRoutes);

// Middleware registrations


// socket.io setup
const handleSocketConnections = require('./config/socket');
const { Server } = require('socket.io');
const io = require('socket.io')(server);

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