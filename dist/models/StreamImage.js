"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamImage = void 0;
const mongoose_1 = require("mongoose");
const streamImageSchema = new mongoose_1.Schema({
    stream: { type: String, required: true },
    data: { type: String, required: true },
    timestamp: { type: String, required: true },
    streamId: { type: String, required: false }
}, { collection: 'stream_images' } // Explicitly set the collection name
);
exports.StreamImage = (0, mongoose_1.model)('StreamImage', streamImageSchema);
