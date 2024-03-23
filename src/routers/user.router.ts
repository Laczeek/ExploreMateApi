import { Router } from 'express';
import multer from 'multer';

import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';
import AppError from '../helpers/app-error';
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

// authentication routes
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
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
