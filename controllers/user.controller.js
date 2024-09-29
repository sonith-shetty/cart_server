const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require("../models/user.model");
const { jwt_key, jwt_expire } = require('../utils/secret.utils');

const signIn = async (req, res) => {
    const { contact, password } = req.body;

    if (!contact || !password) {
        return res.status(400).json({ status: "error", data: "Invalid credentials" });
    }

    const user = new User(null, contact, null, null); // Create user instance with contact
    const final_user = await user.getUser();

    if (!final_user) {
        return res.status(401).json({ status: "error", data: "User not found" });
    }

    const { Customer_Name, Email, Password, Role } = final_user;

    const isPasswordValid = await bcrypt.compare(password, Password);
    if (!isPasswordValid) {
        return res.status(401).json({ status: "error", data: "Incorrect password or contact number" });
    }

    const token = jwt.sign(
        { username: Customer_Name, email: Email, contact, isAdmin: Role === 'admin' },
        jwt_key,
        { expiresIn: jwt_expire }
    );

    return res
        .status(200)
        .cookie("user_access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000
    })
        .json({
            status: "success",
            data: "Logged in successfully",
            userInfo: { username: Customer_Name, contact, email: Email, Role }
        });
}

const signUp = async (req, res) => {
    const { username, contact, password, email } = req.body;

    if (!username || !contact || !password || !email) {
        return res.status(400).json({ status: "error", data: "Invalid credentials" });
    }

    const user = new User(username, contact, password, email);
    const Role = await user.create();

    const token = jwt.sign(
        { username, email, contact, isAdmin: Role === 'admin' },
        jwt_key,
        { expiresIn: jwt_expire }
    );

    return res
        .status(201)
        .cookie("user_access_token", token, { httpOnly: true, secure: true }) // Consider secure for HTTPS
        .json({
            status: "success",
            data: "Registration successful",
            userInfo: { username, contact, email, Role }
        });
}

const signOut = (req, res) => {
    return res
        .status(200)
        .clearCookie("user_access_token")
        .json({ status: "success", data: "Logged out" });
}

module.exports = {
    signIn,
    signUp,
    signOut
}
