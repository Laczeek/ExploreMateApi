"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const app_error_1 = __importDefault(require("../helpers/app-error"));
const guide_controller_1 = __importDefault(require("../controllers/guide.controller"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const review_controller_1 = __importDefault(require("../controllers/review.controller"));
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
router.get('/', guide_controller_1.default.getAllGuides);
router.get('/top-guides', guide_controller_1.default.getTopGuides, guide_controller_1.default.getAllGuides);
router.get('/:id', guide_controller_1.default.getGuide);
router.get('/get-near-guides/:locPoint/:maxDistance', guide_controller_1.default.getNearGuides);
router.use(auth_controller_1.default.authenticate);
router.post('/:id/reviews', auth_controller_1.default.restrictTo(['user']), review_controller_1.default.createReview);
router.use(auth_controller_1.default.restrictTo(['admin', 'moderator']));
router.get('/monthly-plan/:year', guide_controller_1.default.getMonthlyPlan);
router.post('/', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]), guide_controller_1.default.resizeGuideImages, guide_controller_1.default.createGuide);
router.patch('/:id', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]), guide_controller_1.default.resizeGuideImages, guide_controller_1.default.updateGuide);
router.delete('/:id', guide_controller_1.default.deleteGuide);
exports.default = router;
