"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = __importDefault(require("../controllers/review.controller"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const router = (0, express_1.Router)();
router.use(auth_controller_1.default.authenticate);
router.get('/', review_controller_1.default.getAllReviews);
router.get('/:id', review_controller_1.default.getReview);
router.post('/', auth_controller_1.default.restrictTo(['admin', 'user']), review_controller_1.default.createReview);
router.delete('/:id', auth_controller_1.default.restrictTo(['admin', 'user']), review_controller_1.default.deleteReview);
router.patch('/:id', auth_controller_1.default.restrictTo(['admin']), review_controller_1.default.updateReview);
exports.default = router;
