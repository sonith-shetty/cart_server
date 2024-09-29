const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { port, client_url } = require('./utils/secret.utils');
const { socket } = require('./controllers/bill.controller');

const userRouter = require('./routers/user.router');
const adminRouter = require('./routers/admin.router');
const billRouter = require('./routers/bill.router');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: client_url || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true, // Allow credentials to be sent
    },
});

// Socket.IO connection
socket(io);

// Middleware setup
app.use(cors({
    origin: client_url || 'http://localhost:3000',
    credentials: true, // Allow credentials to be sent
}));

app.use(cookieParser()); // Middleware to parse cookies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Middleware to parse JSON bodies

// Route handlers
app.use(userRouter);
app.use(billRouter);
app.use(adminRouter);

// Start the server
httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
