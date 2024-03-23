"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const app_error_1 = __importDefault(require("../helpers/app-error"));
const user_model_1 = __importDefault(require("../models/user.model"));
const controller_factories_1 = __importDefault(require("../helpers/controller-factories"));
const jwt_async_1 = require("../helpers/jwt-async");
const auth_controller_1 = require("./auth.controller");
const resizeUserPhoto = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return next();
        }
        const filename = `user-${req.user.id}.jpeg`;
        yield (0, sharp_1.default)(req.file.buffer).resize(100, 100).jpeg({ quality: 90 }).toFile(`public/images/avatars/${filename}`);
        req.body.photo = filename;
        next();
    }
    catch (err) {
        next(err);
    }
});
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, lastname, email, photo } = req.user;
        res.status(200).json({ status: 'success', user: { _id: id, name, lastname, email, photo } });
    }
    catch (err) {
        next(err);
    }
});
const updateMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.password || req.body.passwordConfirm) {
            throw new app_error_1.default('This endpoint is not used to change the password.', 400);
        }
        if (req.body.email) {
            throw new app_error_1.default('You can not change your email address.', 400);
        }
        const allowedKeys = ['name', 'lastname', 'photo'];
        Object.keys(req.body).forEach(key => !allowedKeys.includes(key) && delete req.body[key]);
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(req.user._id, req.body, { runValidators: true, new: true });
        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    }
    catch (err) {
        next(err);
    }
});
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword, newPasswordConfirm } = req.body;
        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            throw new app_error_1.default('Please provide all credentials.', 400);
        }
        const arePasswordsEqual = yield req.user.comparePasswords(currentPassword);
        if (!arePasswordsEqual) {
            throw new app_error_1.default('Provided current password is incorrect.', 401);
        }
        if (newPassword === currentPassword) {
            throw new app_error_1.default('The new password must not be the same as the previous one.', 400);
        }
        req.user.password = newPassword;
        req.user.passwordConfirm = newPasswordConfirm;
        yield req.user.save({ validateBeforeSave: true });
        const jwt = yield (0, jwt_async_1.signJwtAsync)(req.user.id);
        res.cookie('jwt', jwt, auth_controller_1.httpCookieOptions);
        res.status(200).json({ status: 'success', message: 'Your password has been changed.' });
    }
    catch (err) {
        next(err);
    }
});
const deleteMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield req.user.deleteOne();
        res.status(204).json();
    }
    catch (err) {
        next(err);
    }
});
const getAllUsers = controller_factories_1.default.getAll(user_model_1.default);
const getUser = controller_factories_1.default.getOne(user_model_1.default);
const updateUser = controller_factories_1.default.updateOne(user_model_1.default);
const deleteUser = controller_factories_1.default.deleteOne(user_model_1.default);
const createUser = (req, res, next) => {
    throw new app_error_1.default('This path is not defined. Instead, use the /signup route.', 500);
};
exports.default = {
    resizeUserPhoto,
    getMe,
    updateMe,
    updatePassword,
    deleteMe,
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
};
