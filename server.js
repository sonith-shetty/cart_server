const express = require('express');
const app = express();
require('dotenv').config();
const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');

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
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "DELETE", "POST"],
    allowedHeaders: ["Content-Type"],
    exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions))
app.use(cookieParser());
app.use(express.json());

app.use(userRouter);
app.use(billRouter);
app.use(adminRouter);

httpServer.listen(port, () => {
    console.log(`port ${port}`);
});
