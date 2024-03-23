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
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name.'],
        minlength: [3, 'Name must be at least 3 characters long.'],
        maxlength: [30, 'Name must be less than 30 characters long'],
        trim: true,
    },
    lastname: {
        type: String,
        required: [true, 'Please provide your lastname.'],
        minlength: [3, 'Lastname must be at least 3 characters long.'],
        maxlength: [30, 'Lastname must be less than 30 characters long'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide your email.'],
        lowercase: true,
        trim: true,
        unique: true,
        validate: {
            validator: function (val) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(val);
            },
            message: props => `${props.value} is not a valid email address.`,
        },
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'user', 'moderator'],
            message: 'Invalid role.',
        },
        default: 'user',
    },
    photo: {
        type: String,
        default: 'default.jpeg',
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        minlength: [8, 'Password must be at least 8 characters long.'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please provide a confrim password.'],
        minlength: [8, 'Password confirm must be at least 8 characters long.'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'Passwords are not the same.',
        },
    },
    passwordChangedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
}, { writeConcern: { w: 1, journal: true } });
userSchema.methods.comparePasswords = function (plainPassword) {
    return bcrypt_1.default.compare(plainPassword, this.password);
};
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password')) {
            return next();
        }
        const cryptedPassword = yield bcrypt_1.default.hash(this.password, 12);
        this.password = cryptedPassword;
        this.passwordConfirm = undefined;
        next();
    });
});
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
