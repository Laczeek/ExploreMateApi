import { Router } from 'express';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';

import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';
import AppError from '../helpers/app-error';
const router = Router();

const loginLimiter = rateLimit({
	windowMs: 1000 * 60 * 30,
	limit: 4,
	handler: () => {
		throw new AppError('Too many login attempts. Please try again in 30 minutes.', 429);
	},
});

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
	limits: {
		fileSize: 3145728, //max size of each file 3mb
	},
});

// authentication routes
router.post('/signup', authController.signUp);
router.post('/login', loginLimiter, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// user routes
router.use(authController.authenticate);
router.get('/me', userController.getMe);
router.patch('/update-me', upload.single('photo'), userController.resizeUserPhoto, userController.updateMe);
router.patch('/update-password', userController.updatePassword);
router.delete('/delete-me', userController.deleteMe);

// admin / moderator routes
router.use(authController.restrictTo(['moderator', 'admin']));
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
