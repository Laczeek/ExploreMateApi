"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const guideSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'The guide must have a name.'],
    },
    lastname: {
        type: String,
        required: [true, 'The guide must have a lastname.'],
    },
    localization: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        },
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'The guide must have a description.'],
    },
    duration: {
        type: Number,
        required: [true, 'The guide must be given the duration of his service.']
    },
    price: {
        type: Number,
        required: [true, 'The guide must have a price of his given service.']
    },
    photo: {
        type: String,
        required: [true, 'The guide must have a photo.']
    },
    images: {
        type: [String],
        required: [true, 'The guide must have pictures depicting the purpose of his services.']
    },
    ratingsAvg: {
        type: Number,
        default: 0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'The guide must be given the maximum number of the group.']
    },
    startDates: {
        type: [Date],
        required: [true, 'The guide must provide the start dates of his tours.']
    },
    slug: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
guideSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'guide',
});
guideSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next();
    }
    this.slug = `${this.name.toLowerCase()}-${this.lastname.toLowerCase()}`;
    next();
});
const Guide = (0, mongoose_1.model)('Guide', guideSchema);
exports.default = Guide;
