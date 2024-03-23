"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const app_error_1 = __importDefault(require("../helpers/app-error"));
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        }
        else {
            cb(new app_error_1.default('The transferred file is not an image.', 400));
        }
    },
});
router.post('/signup', auth_controller_1.default.signUp);
router.post('/login', auth_controller_1.default.login);
router.get('/verify-email/:token', auth_controller_1.default.verifyEmail);
router.post('/resend-verification', auth_controller_1.default.resendVerificationToken);
router.post('/forgot-password', auth_controller_1.default.forgotPassword);
router.post('/reset-password/:token', auth_controller_1.default.resetPassword);
router.use(auth_controller_1.default.authenticate);
router.get('/me', user_controller_1.default.getMe);
router.patch('/update-me', upload.single('photo'), user_controller_1.default.resizeUserPhoto, user_controller_1.default.updateMe);
router.patch('/update-password', user_controller_1.default.updatePassword);
router.delete('/delete-me', user_controller_1.default.deleteMe);
router.use(auth_controller_1.default.restrictTo(['moderator', 'admin']));
router.get('/', user_controller_1.default.getAllUsers);
router.get('/:id', user_controller_1.default.getUser);
router.post('/', user_controller_1.default.createUser);
router.patch('/:id', user_controller_1.default.updateUser);
router.delete('/:id', user_controller_1.default.deleteUser);
exports.default = router;
