import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';

import { AllowedRoles } from '../interfaces/user.interface';

import User from '../models/user.model';
import Token from '../models/token.model';
import Email from '../helpers/email';
import AppError from '../helpers/app-error';
import { signJwtAsync, verifyJwtAsync } from '../helpers/jwt-async';
import { createTokens, hashPlainToken } from '../helpers/token-handlers';
import ResetToken from '../models/resetToken.model';

config();

export const httpCookieOptions = {
	expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 1000 * 60 * 60 * 60 * 24),
	httpOnly: true,
};

const resendVerificationToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email } = req.body;

		if (!email) {
			throw new AppError('Please provide your email address.', 400);
		}

		const user = await User.findOne({ email });
		if (!user) {
			throw new AppError('We were unable to find a user with provided email. Please signup.', 404);
		}

		if (user.isActive) {
			throw new AppError('You are already verified. Please login.', 400);
		}

		const verificationToken = await Token.findOne({ user: user._id });

		if (verificationToken) {
			throw new AppError('You can only receive 1 verification token per hour. Please try again later.', 403);
		}

		const [plainToken, hashedToken] = createTokens();
		await Token.create({ user: user._id, token: hashedToken });

		const verifyURL = `${req.protocol}://${req.get('host')}/api/users/verify-email/${plainToken}`;

		try {
			await new Email({ name: user.name, email: user.email }, verifyURL).sendEmail('verifyEmail', 'Verify your email.');
		} catch (err: any) {
			throw new AppError('Something went wrong when trying to send an email with a verification token.', 500);
		}

		return res.status(200).json({
			status: 'success',
			message: 'Your verification token has been sent to your mailbox (token is valid only for 1 hour).',
		});
	} catch (err: any) {
		next(err);
	}
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { token } = req.params;
		const hashedToken = hashPlainToken(token);

		const verificationToken = await Token.findOne({ token: hashedToken });

		if (!verificationToken) {
			throw new AppError('The transferred validation token is not correct or is no longer valid.', 401);
		}

		const user = await User.findById(verificationToken.user);
		if (!user) {
			throw new AppError('We were unable to find a user for this verification. Please Sign up.', 404);
		}

		if (user.isActive) {
			throw new AppError('You are already verified. Please login.', 400);
		}

		user.isActive = true;
		await user.save({ validateBeforeSave: false });

		res.status(200).json({ status: 'success', message: 'Your account has beed successfully verified.' });
	} catch (err: any) {
		next(err);
	}
};

const signUp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, lastname, email, password, passwordConfirm } = req.body;

		const newUser = await User.create({ name, lastname, email, password, passwordConfirm });

		const [plainToken, hashedToken] = createTokens();
		// Token is valid only for 1 hour, after this time token will be removed from database (TTL INDEX)
		await Token.create({ user: newUser._id, token: hashedToken });

		const verifyURL = `${req.protocol}://${req.get('host')}/api/users/verify-email/${plainToken}`;

		try {
			await new Email({ name, email }, verifyURL).sendEmail('verifyEmail', 'Verify your email.');
		} catch (err: any) {
			throw new AppError('Something went wrong when trying to send an email with a verification token.', 500);
		}

		res.status(201).json({
			status: 'success',
			message: `Hey ${newUser.name}, your verification token has been sent to your mailbox (token is valid only for 1 hour).`,
		});
	} catch (err) {
		next(err);
	}
};

const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new AppError('Please provide all credentials.', 400);
		}

		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			throw new AppError('User with provided email does not exist.', 404);
		}

		if (!user.isActive) {
			throw new AppError('Your account is not activated. Please check your mailbox.', 401);
		}

		const arePasswordsEqual = await user.comparePasswords(password);

		if (!arePasswordsEqual) {
			throw new AppError('Incorrect password.', 400);
		}

		const jwt = await signJwtAsync(user.id);

		res.cookie('jwt', jwt, httpCookieOptions);

		const resUserData = {
			_id: user.id,
			name: user.name,
			lastname: user.lastname,
			email: user.email,
			role: user.role,
			photo: user.photo,
		};

		res.status(200).json({ status: 'success', data: { user: resUserData } });
	} catch (err: any) {
		next(err);
	}
};

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email } = req.body;
		if (!email) {
			throw new AppError('Please provide your email address.', 400);
		}

		const user = await User.findOne({ email });
		if (!user) {
			throw new AppError('We were unable to find a user with provided email.', 404);
		}

		if (!user.isActive) {
			throw new AppError('You have not yet activated your account.', 400);
		}

		const resetToken = await ResetToken.findOne({ user: user._id });

		if (resetToken && resetToken.expires.getTime() > Date.now()) {
			throw new AppError(
				'You can only get 1 reset password token every 10 minutes. Remember that your current token is still valid.',
				403
			);
		}

		const [plainToken, hashedToken] = createTokens();

		if (!resetToken) {
			await ResetToken.create({ token: hashedToken, user: user._id });
		} else {
			resetToken.token = hashedToken;
			resetToken.expires = new Date(Date.now() + 1000 * 60 * 10);
			await resetToken.save();
		}

		const resetPasswordURL = `${req.protocol}://${req.get('host')}/api/users/reset-password/${plainToken}`;

		try {
			await new Email({ name: user.name, email: user.email }, resetPasswordURL).sendEmail(
				'forgotPassword',
				'Reset passsword'
			);
		} catch (err: any) {
			throw new AppError('Something went wrong when trying to send an email with a verification token.', 500);
		}

		res.status(200).json({
			status: 'success',
			message: `Hey ${user.name}, your reset password token has been sent to your mailbox (reset token is valid only for 10 minutes).`,
		});
	} catch (err: any) {
		next(err);
	}
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { newPassword, newPasswordConfirm } = req.body;
		if (!newPassword || !newPasswordConfirm) {
			throw new AppError('Please provide all credencials.', 400);
		}

		const plainToken = req.params.token;
		const hashedToken = hashPlainToken(plainToken);

		const resetToken = await ResetToken.findOne({ token: hashedToken, expires: { $gt: Date.now() } });
		if (!resetToken) {
			throw new AppError('Invalid reset token or token was expired.', 400);
		}

		const user = await User.findById(resetToken.user).select('+password');
		if (!user) {
			throw new AppError('Something went wrong when finding the user.', 500);
		}

		user.password = newPassword;
		user.passwordConfirm = newPasswordConfirm;
		await user.save({ validateBeforeSave: true });
		await resetToken.deleteOne();
		res.status(200).json({ status: 'success', message: 'Your password has been successfully changed.' });
	} catch (err: any) {
		next(err);
	}
};

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const jwt = req.cookies.jwt as string;
		if (!jwt) {
			throw new AppError('You are not authenticated.', 401);
		}

		const decodedJwt = await verifyJwtAsync(jwt);

		const user = await User.findById(decodedJwt.userId).select('+password');

		if (!user) {
			throw new AppError('You are not authenticated.', 401);
		}

		// if password was changed, the previous jwt token is no longer valid
		if (user.passwordChangedAt && user.passwordChangedAt.getTime() > decodedJwt.iat! * 1000) {
			throw new AppError('Your token is no longer valid. Please login again.', 401);
		}

		req.user = user;

		next();
	} catch (err) {
		next(err);
	}
};

const restrictTo = (roles: AllowedRoles[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!roles.includes(req.user.role)) {
			throw new AppError('You do not have the proper authority to perform this action.', 403);
		}

		next();
	};
};

export default {
	signUp,
	login,
	verifyEmail,
	resendVerificationToken,
	forgotPassword,
	resetPassword,
	authenticate,
	restrictTo,
};
