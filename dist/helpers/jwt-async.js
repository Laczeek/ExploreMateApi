"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtAsync = exports.signJwtAsync = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_error_1 = __importDefault(require("./app-error"));
const signJwtAsync = (userId) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
            if (err) {
                reject(new app_error_1.default('Something went wrong when trying to assign your verification token.', 500));
            }
            else if (token) {
                resolve(token);
            }
        });
    });
};
exports.signJwtAsync = signJwtAsync;
const verifyJwtAsync = (userJwt) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(userJwt, process.env.SECRET_KEY, (err, decodedToken) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    reject(new app_error_1.default('Your token in no longer valid. Please login.', 401));
                }
                reject(new app_error_1.default('You are not authorized.', 401));
            }
            else if (decodedToken) {
                resolve(decodedToken);
            }
        });
    });
};
exports.verifyJwtAsync = verifyJwtAsync;
