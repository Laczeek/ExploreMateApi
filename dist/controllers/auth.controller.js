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
exports.httpCookieOptions = void 0;
const dotenv_1 = require("dotenv");
const user_model_1 = __importDefault(require("../models/user.model"));
const token_model_1 = __importDefault(require("../models/token.model"));
const email_1 = __importDefault(require("../helpers/email"));
const app_error_1 = __importDefault(require("../helpers/app-error"));
const jwt_async_1 = require("../helpers/jwt-async");
const token_handlers_1 = require("../helpers/token-handlers");
const resetToken_model_1 = __importDefault(require("../models/resetToken.model"));
(0, dotenv_1.config)();
exports.httpCookieOptions = {
    expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 1000 * 60 * 60 * 60 * 24),
    httpOnly: true,
};
const resendVerificationToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            throw new app_error_1.default('Please provide your email address.', 400);
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            throw new app_error_1.default('We were unable to find a user with provided email. Please signup.', 404);
        }
        if (user.isActive) {
            throw new app_error_1.default('You are already verified. Please login.', 400);
        }
        const verificationToken = yield token_model_1.default.findOne({ user: user._id });
        if (verificationToken) {
            throw new app_error_1.default('You can only receive 1 verification token per hour. Please try again later.', 403);
        }
        const [plainToken, hashedToken] = (0, token_handlers_1.createTokens)();
        yield token_model_1.default.create({ user: user._id, token: hashedToken });
        const verifyURL = `${req.protocol}://${req.get('host')}/api/users/verify-email/${plainToken}`;
        try {
            yield new email_1.default({ name: user.name, email: user.email }, verifyURL).sendEmail('verifyEmail', 'Verify your email.');
        }
        catch (err) {
            throw new app_error_1.default('Something went wrong when trying to send an email with a verification token.', 500);
        }
        return res.status(200).json({
            status: 'success',
            message: 'Your verification token has been sent to your mailbox (token is valid only for 1 hour).',
        });
    }
    catch (err) {
        next(err);
    }
});
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const hashedToken = (0, token_handlers_1.hashPlainToken)(token);
        const verificationToken = yield token_model_1.default.findOne({ token: hashedToken });
        if (!verificationToken) {
            throw new app_error_1.default('The transferred validation token is not correct or is no longer valid.', 401);
        }
        const user = yield user_model_1.default.findById(verificationToken.user);
        if (!user) {
            throw new app_error_1.default('We were unable to find a user for this verification. Please Sign up.', 404);
        }
        if (user.isActive) {
            throw new app_error_1.default('You are already verified. Please login.', 400);
        }
        user.isActive = true;
        yield user.save({ validateBeforeSave: false });
        res.status(200).json({ status: 'success', message: 'Your account has beed successfully verified.' });
    }
    catch (err) {
        next(err);
    }
});
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, lastname, email, password, passwordConfirm } = req.body;
        const newUser = yield user_model_1.default.create({ name, lastname, email, password, passwordConfirm });
        const [plainToken, hashedToken] = (0, token_handlers_1.createTokens)();
        yield token_model_1.default.create({ user: newUser._id, token: hashedToken });
        const verifyURL = `${req.protocol}://${req.get('host')}/api/users/verify-email/${plainToken}`;
        try {
            yield new email_1.default({ name, email }, verifyURL).sendEmail('verifyEmail', 'Verify your email.');
        }
        catch (err) {
            throw new app_error_1.default('Something went wrong when trying to send an email with a verification token.', 500);
        }
        res.status(201).json({
            status: 'success',
            message: `Hey ${newUser.name}, your verification token has been sent to your mailbox (token is valid only for 1 hour).`,
        });
    }
    catch (err) {
        next(err);
    }
});
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new app_error_1.default('Please provide all credentials.', 400);
        }
        const user = yield user_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            throw new app_error_1.default('User with provided email does not exist.', 404);
        }
        if (!user.isActive) {
            throw new app_error_1.default('Your account is not activated. Please check your mailbox.', 401);
        }
        const arePasswordsEqual = yield user.comparePasswords(password);
        if (!arePasswordsEqual) {
            throw new app_error_1.default('Incorrect password.', 400);
        }
        const jwt = yield (0, jwt_async_1.signJwtAsync)(user.id);
        res.cookie('jwt', jwt, exports.httpCookieOptions);
        const resUserData = {
            _id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            photo: user.photo,
        };
        res.status(200).json({ status: 'success', data: { user: resUserData } });
    }
    catch (err) {
        next(err);
    }
});
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            throw new app_error_1.default('Please provide your email address.', 400);
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            throw new app_error_1.default('We were unable to find a user with provided email.', 404);
        }
        if (!user.isActive) {
            throw new app_error_1.default('You have not yet activated your account.', 400);
        }
        const resetToken = yield resetToken_model_1.default.findOne({ user: user._id });
        if (resetToken && resetToken.expires.getTime() > Date.now()) {
            throw new app_error_1.default('You can only get 1 reset password token every 10 minutes. Remember that your current token is still valid.', 403);
        }
        const [plainToken, hashedToken] = (0, token_handlers_1.createTokens)();
        if (!resetToken) {
            yield resetToken_model_1.default.create({ token: hashedToken, user: user._id });
        }
        else {
            resetToken.token = hashedToken;
            resetToken.expires = new Date(Date.now() + 1000 * 60 * 10);
            yield resetToken.save();
        }
        const resetPasswordURL = `${req.protocol}://${req.get('host')}/api/users/reset-password/${plainToken}`;
        try {
            yield new email_1.default({ name: user.name, email: user.email }, resetPasswordURL).sendEmail('forgotPassword', 'Reset passsword');
        }
        catch (err) {
            throw new app_error_1.default('Something went wrong when trying to send an email with a verification token.', 500);
        }
        res.status(200).json({
            status: 'success',
            message: `Hey ${user.name}, your reset password token has been sent to your mailbox (reset token is valid only for 10 minutes).`,
        });
    }
    catch (err) {
        next(err);
    }
});
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newPassword, newPasswordConfirm } = req.body;
        if (!newPassword || !newPasswordConfirm) {
            throw new app_error_1.default('Please provide all credencials.', 400);
        }
        const plainToken = req.params.token;
        const hashedToken = (0, token_handlers_1.hashPlainToken)(plainToken);
        const resetToken = yield resetToken_model_1.default.findOne({ token: hashedToken, expires: { $gt: Date.now() } });
        if (!resetToken) {
            throw new app_error_1.default('Invalid reset token or token was expired.', 400);
        }
        const user = yield user_model_1.default.findById(resetToken.user).select('+password');
        if (!user) {
            throw new app_error_1.default('Something went wrong when finding the user.', 500);
        }
        user.password = newPassword;
        user.passwordConfirm = newPasswordConfirm;
        yield user.save({ validateBeforeSave: true });
        yield resetToken.deleteOne();
        res.status(200).json({ status: 'success', message: 'Your password has been successfully changed.' });
    }
    catch (err) {
        next(err);
    }
});
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jwt = req.cookies.jwt;
        if (!jwt) {
            throw new app_error_1.default('You are not authenticated.', 401);
        }
        const decodedJwt = yield (0, jwt_async_1.verifyJwtAsync)(jwt);
        const user = yield user_model_1.default.findById(decodedJwt.userId).select('+password');
        if (!user) {
            throw new app_error_1.default('You are not authenticated.', 401);
        }
        if (user.passwordChangedAt && user.passwordChangedAt.getTime() > decodedJwt.iat * 1000) {
            throw new app_error_1.default('Your token is no longer valid. Please login again.', 401);
        }
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
});
const restrictTo = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new app_error_1.default('You do not have the proper authority to perform this action.', 403);
        }
        next();
    };
};
exports.default = {
    signUp,
    login,
    verifyEmail,
    resendVerificationToken,
    forgotPassword,
    resetPassword,
    authenticate,
    restrictTo,
};
