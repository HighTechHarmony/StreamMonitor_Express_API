"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    userId: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pushover_id: { type: String },
    pushover_token: { type: String },
    enabled: { type: String, required: true },
    isAdmin: { type: Boolean, required: true }
});
exports.User = (0, mongoose_1.model)('users', userSchema);
// interface User {
//   _id?: ObjectId;
//   username: string;
//   password: string;
//   pushover_id?: string;
//   pushover_token?: string;
//   enabled: string;
//   isAdmin: boolean;
// }
