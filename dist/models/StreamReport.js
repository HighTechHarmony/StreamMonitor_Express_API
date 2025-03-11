"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamReport = void 0;
const mongoose_1 = require("mongoose");
const streamReportSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    status: { type: String, required: true },
    streamId: { type: String, required: true }
}, { collection: 'stream_reports' } // Explicitly set the collection name
);
exports.StreamReport = (0, mongoose_1.model)('StreamReport', streamReportSchema);
