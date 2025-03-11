"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Register route
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.User({ username, password: hashedPassword });
        yield newUser.save();
        res.status(201).send('User registered');
    }
    catch (error) {
        res.status(400).send('Error registering user');
    }
}));
// Login route
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Got a login request");
    const { username, password } = req.body;
    try {
        const user = yield User_1.User.findOne({ username });
        if (user) {
            if (user.enabled === "0") {
                console.log("User is disabled");
                res.status(403).send('User is disabled');
                return;
            }
            let passwordMatch = false;
            try {
                passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
            }
            catch (bcryptError) {
                console.error('Error comparing passwords with bcrypt', bcryptError);
            }
            if (passwordMatch) {
                req.session.userId = user._id.toString();
                res.send('Logged in');
            }
            else {
                console.error('Bcrypt comparison failed, falling back to plaintext comparison');
                passwordMatch = password === user.password;
                if (passwordMatch) {
                    req.session.userId = user._id.toString();
                    res.send('Logged in');
                }
                else {
                    console.log("Those passwords don't match");
                    res.status(401).send('Invalid credentials');
                }
            }
        }
        else {
            console.log("User ", username, " not found");
            res.status(401).send('Invalid credentials');
        }
    }
    catch (error) {
        console.error('Error logging in', error);
        res.status(400).send('Error logging in');
    }
}));
// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.send('Logged out');
    });
});
// Session check route
router.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.userId) {
        // console.log("/auth/me Session has userId, looking up user" + req.session.userId);
        const user = yield User_1.User.findById(req.session
            .userId);
        if (user) {
            console.log("/auth/me User found, returning username: " + user.username);
            res.send(user.username);
        }
        else {
            res.status(404).send('User not found');
        }
    }
    else {
        console.log("/auth/me Session has no userId, returning Not logged in");
        res.status(401).send('Not logged in');
    }
}));
exports.default = router;
