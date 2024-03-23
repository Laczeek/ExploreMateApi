import { Router } from 'express';

import reviewController from '../controllers/review.controller';
import authController from '../controllers/auth.controller';

const router = Router();

router.use(authController.authenticate);

router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);

router.post('/', authController.restrictTo(['admin', 'user']), reviewController.createReview);
router.delete('/:id', authController.restrictTo(['admin', 'user']), reviewController.deleteReview);

router.patch('/:id', authController.restrictTo(['admin']), reviewController.updateReview);

export default router;
