"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPlainToken = exports.createTokens = void 0;
const crypto_1 = __importDefault(require("crypto"));
const createTokens = () => {
    const timestamp = Date.now().toString();
    const plainToken = crypto_1.default.randomBytes(32).toString('hex') + timestamp;
    const hashedToken = crypto_1.default.createHash('sha256').update(plainToken).digest('hex');
    return [plainToken, hashedToken];
};
exports.createTokens = createTokens;
const hashPlainToken = (plainToken) => {
    const hashedToken = crypto_1.default.createHash('sha256').update(plainToken).digest('hex');
    return hashedToken;
};
exports.hashPlainToken = hashPlainToken;
