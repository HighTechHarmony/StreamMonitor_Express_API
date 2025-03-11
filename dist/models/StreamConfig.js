"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamConfig = void 0;
const mongoose_1 = require("mongoose");
const streamConfigSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    uri: { type: String, required: true },
    audio: { type: String, required: true },
    enabled: { type: String, required: true },
    streamId: { type: String, required: true }
}, { collection: 'stream_configs' } // Explicitly set the collection name
);
exports.StreamConfig = (0, mongoose_1.model)('StreamConfig', streamConfigSchema);
