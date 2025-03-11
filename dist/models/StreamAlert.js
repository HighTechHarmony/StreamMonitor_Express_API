"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamAlert = void 0;
const mongoose_1 = require("mongoose");
const streamAlertSchema = new mongoose_1.Schema({
    timestamp: { type: String, required: true },
    stream: { type: String, required: true },
    alert: { type: String, required: true },
    image: { type: Buffer, required: true },
    streamId: { type: String, required: false }
}, { collection: 'stream_alerts' } // Explicitly set the collection name
);
exports.StreamAlert = (0, mongoose_1.model)('StreamAlert', streamAlertSchema);
