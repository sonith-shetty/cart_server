const express = require('express');
const app = express();
require('dotenv').config();
const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');
const { socket } = require('./controllers/bill.controller');

const cors = require('cors');
const cookieParser = require('cookie-parser');

const { port, client_url } = require('./utils/secret.utils');
const { auth_token_admin } = require('./utils/auth.util');

const userRouter = require('./routers/user.router');
const adminRouter = require('./routers/admin.router');
const billRouter = require('./routers/bill.router');

var whitelist = [
    client_url,
    "http://localhost:3000",
];
var corsOptions = {
    credentials: true,
    methods: ["GET", "DELETE", "POST"],
    allowedHeaders: ["Content-Type"],
    exposedHeaders: ["set-cookie"],
};
const io = new Server(httpServer, {
    cors: {
        origin: client_url || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true, // Allow credentials to be sent
    },
});

// Socket.IO connection
socket(io);

app.use(cors(corsOptions))
app.use(cookieParser());
app.use(express.json());
app.use(billRouter);

app.use(userRouter);
app.use(adminRouter);

httpServer.listen(port, () => {
    console.log(`port ${port}`);
});
