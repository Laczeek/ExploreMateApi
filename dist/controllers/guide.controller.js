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
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const sharp_1 = __importDefault(require("sharp"));
const app_error_1 = __importDefault(require("../helpers/app-error"));
const controller_factories_1 = __importDefault(require("../helpers/controller-factories"));
const guide_model_1 = __importDefault(require("../models/guide.model"));
const resizeGuideImages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files) {
            return next();
        }
        let guideId;
        if (req.params.id) {
            guideId = req.params.id;
        }
        else {
            guideId = new mongoose_1.default.Types.ObjectId();
            req.body._id = guideId;
        }
        if ('photo' in req.files && req.files['photo']) {
            const filename = `guide-${guideId}.jpeg`;
            yield (0, sharp_1.default)(req.files['photo'][0].buffer)
                .resize(600, 400)
                .jpeg({ quality: 90 })
                .toFile(`public/images/guides/${filename}`);
            req.body.photo = filename;
        }
        if ('images' in req.files && req.files['images']) {
            const allPromises = req.files['images'].map((f, index) => __awaiter(void 0, void 0, void 0, function* () {
                const filename = `guide-${guideId}-img-${index + 1}.jpeg`;
                yield (0, sharp_1.default)(f.buffer).resize(1200, 800).jpeg({ quality: 90 }).toFile(`public/images/guides/${filename}`);
                return filename;
            }));
            const filenames = yield Promise.all(allPromises);
            req.body.images = filenames;
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
const removeGuideImages = (guideId) => __awaiter(void 0, void 0, void 0, function* () {
    const dirpath = path_1.default.join(__dirname, '..', '..', 'public', 'images', 'guides');
    const guidesImagesNames = yield promises_1.default.readdir(dirpath, { encoding: 'utf-8' });
    yield Promise.all(guidesImagesNames.map((filename) => __awaiter(void 0, void 0, void 0, function* () {
        if (filename.startsWith(`guide-${guideId}`)) {
            const filepath = path_1.default.join(dirpath, filename);
            yield promises_1.default.unlink(filepath);
        }
    })));
});
const createGuide = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.localization) {
            req.body.localization = JSON.parse(req.body.localization);
        }
        if (req.body.startDates) {
            req.body.startDates = JSON.parse(req.body.startDates);
        }
        const newGuide = yield guide_model_1.default.create(req.body);
        res.status(201).json({ status: 'success', guide: newGuide });
    }
    catch (err) {
        yield removeGuideImages(req.body._id);
        next(err);
    }
});
const getTopGuides = (req, res, next) => {
    req.query.sort = '-ratingsAvg,price';
    req.query.limit = '5';
    next();
};
const getMonthlyPlan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const year = req.params.year;
        console.log(year);
        const plan = yield guide_model_1.default.aggregate([
            { $unwind: '$startDates' },
            {
                $addFields: {
                    year: { $year: '$startDates' },
                    month: { $month: '$startDates' },
                    fullname: { $concat: ['$name', ' ', '$lastname'] },
                },
            },
            {
                $match: {
                    year: +year,
                },
            },
            {
                $group: {
                    _id: '$month',
                    month: { $first: '$month' },
                    total: { $sum: 1 },
                    guides: { $addToSet: '$fullname' },
                },
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    guides: 1,
                    month: 1,
                },
            },
            {
                $sort: {
                    month: 1,
                },
            },
        ]);
        res.status(200).json({ status: 'success', plan });
    }
    catch (err) {
        next(err);
    }
});
const getNearGuides = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { locPoint, maxDistance } = req.params;
        const maxDistanceKm = +maxDistance * 1000;
        const userLocalization = locPoint.split(',');
        const guides = yield guide_model_1.default.aggregate([
            {
                $geoNear: {
                    maxDistance: +maxDistanceKm,
                    near: {
                        type: 'Point',
                        coordinates: [+userLocalization[0], +userLocalization[1]],
                    },
                    distanceField: 'distance',
                    distanceMultiplier: 0.001,
                },
            },
            {
                $addFields: {
                    roundedDistance: { $round: ['$distance', 2] },
                },
            },
        ]);
        res.status(200).json({ status: 'success', length: guides.length, guides });
    }
    catch (err) {
        next(err);
    }
});
const getAllGuides = controller_factories_1.default.getAll(guide_model_1.default);
const getGuide = controller_factories_1.default.getOne(guide_model_1.default);
const updateGuide = controller_factories_1.default.updateOne(guide_model_1.default);
const deleteGuide = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guideId = req.params.id;
        const deletedGuide = yield guide_model_1.default.findByIdAndDelete(guideId);
        if (!deletedGuide) {
            throw new app_error_1.default('Guide with provided id does not exists.', 404);
        }
        yield removeGuideImages(guideId);
        res.status(204).json();
    }
    catch (err) {
        next(err);
    }
});
exports.default = {
    getAllGuides,
    createGuide,
    getGuide,
    updateGuide,
    deleteGuide,
    resizeGuideImages,
    getTopGuides,
    getMonthlyPlan,
    getNearGuides,
};
