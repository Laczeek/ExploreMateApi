import { Router } from 'express';
import multer from 'multer';

import AppError from '../helpers/app-error';
import guideController from '../controllers/guide.controller';
import authController from '../controllers/auth.controller';
import reviewController from '../controllers/review.controller';

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image')) {
			cb(null, true);
		} else {
			cb(new AppError('The transferred file is not an image.', 400));
		}
	},
});

// user routes
router.get('/', guideController.getAllGuides);
router.get('/top-guides', guideController.getTopGuides, guideController.getAllGuides);
router.get('/:id', guideController.getGuide);
router.get('/get-near-guides/:locPoint/:maxDistance', guideController.getNearGuides);

router.use(authController.authenticate);
// guide / review
router.post('/:id/reviews', authController.restrictTo(['user']),reviewController.createReview);

// admin / moderators routes
router.use(authController.restrictTo(['admin', 'moderator']));

router.get('/monthly-plan/:year', guideController.getMonthlyPlan);

router.post(
	'/',
	upload.fields([
		{ name: 'photo', maxCount: 1 },
		{ name: 'images', maxCount: 3 },
	]),
	guideController.resizeGuideImages,
	guideController.createGuide
);
router.patch(
	'/:id',
	upload.fields([
		{ name: 'photo', maxCount: 1 },
		{ name: 'images', maxCount: 3 },
	]),
	guideController.resizeGuideImages,
	guideController.updateGuide
);
router.delete('/:id', guideController.deleteGuide);
export default router;
