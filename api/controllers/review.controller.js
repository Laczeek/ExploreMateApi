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
const review_model_1 = __importDefault(require("../models/review.model"));
const controller_factories_1 = __importDefault(require("../helpers/controller-factories"));
const app_error_1 = __importDefault(require("../helpers/app-error"));
const createReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.guide) {
            req.body.guide = req.params.id;
        }
        const newReview = yield review_model_1.default.create({
            guide: req.body.guide,
            user: req.user._id,
            rating: req.body.rating,
            text: req.body.text,
        });
        res.status(201).json({ status: 'success', review: newReview });
    }
    catch (err) {
        next(err);
    }
});
const getAllReviews = controller_factories_1.default.getAll(review_model_1.default);
const getReview = controller_factories_1.default.getOne(review_model_1.default);
const updateReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = req.params.id;
        const allowedKeys = ['rating', 'text'];
        Object.keys(req.body).forEach(key => !allowedKeys.includes(key) && delete req.body[key]);
        const review = yield review_model_1.default.findOneAndUpdate({ _id: reviewId, user: req.user._id }, req.body, {
            new: true,
            runValidators: true,
        });
        if (!review) {
            throw new app_error_1.default('Review with provided id does not exists or you do not have rights to perform this action.', 404);
        }
        res.status(200).json({ status: 'success', review });
    }
    catch (err) {
        next(err);
    }
});
const deleteReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = req.params.id;
        let query = {};
        if (req.user.role === 'admin') {
            query = { _id: reviewId };
        }
        else {
            query = { _id: reviewId, user: req.user._id };
        }
        const deletedReview = yield review_model_1.default.findOneAndDelete(query);
        if (!deletedReview) {
            throw new app_error_1.default('Review with provided id does not exists or you do not have rights to perform this action.', 404);
        }
        res.status(204).json();
    }
    catch (err) {
        next(err);
    }
});
exports.default = {
    getAllReviews,
    createReview,
    getReview,
    updateReview,
    deleteReview,
};
