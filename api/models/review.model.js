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
const guide_model_1 = __importDefault(require("./guide.model"));
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    guide: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Guide',
    },
    rating: {
        type: Number,
        required: [true, 'Review must have a rating.'],
        min: [1, 'The minimum rating is 1.'],
        max: [5, 'The maximum rating is 5.'],
    },
    text: {
        type: String,
        required: [true, 'Review must have a text.'],
        trim: true,
        maxlength: [300, 'A text can not be longer than 300 characters.'],
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
reviewSchema.static('calcGuideReviewStats', function (guideId) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield Review.aggregate([
            {
                $match: {
                    guide: guideId,
                },
            },
            {
                $group: {
                    _id: '$guide',
                    quantity: { $sum: 1 },
                    avg: { $avg: '$rating' },
                },
            },
        ]);
        if (stats.length === 0) {
            yield guide_model_1.default.findByIdAndUpdate(guideId, { ratingsAvg: 0, ratingsQuantity: 0 });
        }
        else {
            yield guide_model_1.default.findByIdAndUpdate(guideId, { ratingsAvg: stats[0].avg, ratingsQuantity: stats[0].quantity });
        }
    });
});
reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user', select: 'name lastname email photo' });
    next();
});
reviewSchema.post('save', function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Review.calcGuideReviewStats(doc.guide);
        next();
    });
});
reviewSchema.post('findOneAndDelete', function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Review.calcGuideReviewStats(doc.guide);
        next();
    });
});
reviewSchema.post('findOneAndUpdate', function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Review.calcGuideReviewStats(doc.guide);
        next();
    });
});
const Review = (0, mongoose_1.model)('Review', reviewSchema);
exports.default = Review;
