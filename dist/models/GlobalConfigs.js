"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalConfigs = void 0;
const mongoose_1 = require("mongoose");
const globalConfigsSchema = new mongoose_1.Schema({
    global_configs: { type: String, required: true },
    restart_due: { type: String, required: true },
}, { collection: 'global_configs' } // Explicitly set the collection name
);
exports.globalConfigs = (0, mongoose_1.model)('globalConfigs', globalConfigsSchema);
