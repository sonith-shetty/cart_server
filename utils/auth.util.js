const jwt = require('jsonwebtoken');
const { jwt_key } = require('./secret.utils');

const auth_token_user = (req, res, next) => {
    const user_access_token = req.cookies?.user_access_token;

    if (!user_access_token) {
        return res.status(401).json({ status: "error", data: "Invalid user" });
    }

    try {
        const decodedToken = jwt.verify(user_access_token, jwt_key);
        const { contact, username } = decodedToken;

        req.user = {
            contact,
            username,
        };

        next();
    } catch (err) {
        return res.status(401).json({ status: "error", data: "Invalid user", error: err.message });
    }
}

const auth_token_admin = (req, res, next) => {
    const user_access_token = req.cookies?.user_access_token;

    if (!user_access_token) {
        return res.status(401).json({ status: "error", data: "Invalid user" });
    }

    try {
        const decodedToken = jwt.verify(user_access_token, jwt_key);
        const { contact, username, isAdmin } = decodedToken;

        req.user = {
            contact,
            username,
            isAdmin
        };

        if (!isAdmin) {
            return res.status(403).json({ status: "error", data: "Access denied" });
        }

        next();
    } catch (err) {
        return res.status(401).json({ status: "error", data: "Invalid user", error: err.message });
    }
}

module.exports = { auth_token_admin, auth_token_user };
