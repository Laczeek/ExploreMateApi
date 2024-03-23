"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resetTokenSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    token: {
        type: String,
        required: true,
    },
    expires: {
        type: Date,
        default: Date.now() + 1000 * 60 * 10
    },
});
const ResetToken = (0, mongoose_1.model)('ResetToken', resetTokenSchema);
exports.default = ResetToken;