"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const app_error_1 = __importDefault(require("../helpers/app-error"));
(0, dotenv_1.config)();
const resErrorDevelopment = (error, res) => {
    res.status(error.statusCode).json({ status: error.status, error, stack: error.stack });
};
const resErrorProduction = (error, res) => {
    res.status(error.statusCode).json({ status: error.status, message: error.message });
};
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        return resErrorDevelopment(err, res);
    }
    else {
        if (err.code === 11000) {
            err = new app_error_1.default(`Provided ${Object.keys(err.keyValue)[0]} value already exists.`, 409);
        }
        if (err.name === 'ValidationError') {
            const messages = [];
            Object.keys(err.errors).forEach(key => messages.push(err.errors[key].message));
            err = new app_error_1.default(messages.join(' '), 400);
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            err = new app_error_1.default('You have uploaded too many files.', 400);
        }
        if (err.name === 'CastError') {
            err = new app_error_1.default('Incorrect id.', 400);
        }
        if (err.isOperational) {
            return resErrorProduction(err, res);
        }
        res.status(500).json({ status: 'error', message: 'Something went wrong.' });
    }
};
exports.default = errorMiddleware;
