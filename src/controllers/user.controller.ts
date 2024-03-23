import { NextFunction, Request, Response } from 'express';
import sharp from 'sharp';

import AppError from '../helpers/app-error';
import User from '../models/user.model';
import controllerFactories from '../helpers/controller-factories';
import { signJwtAsync } from '../helpers/jwt-async';
import { httpCookieOptions } from './auth.controller';

const resizeUserPhoto = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.file) {
			return next();
		}
		const filename = `user-${req.user.id}.jpeg`;

		await sharp(req.file.buffer).resize(100, 100).jpeg({ quality: 90 }).toFile(`public/images/avatars/${filename}`);
		req.body.photo = filename;
		next();
	} catch (err: any) {
		next(err);
	}
};

const getMe = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id, name, lastname, email, photo } = req.user;
		res.status(200).json({ status: 'success', user: { _id: id, name, lastname, email, photo } });
	} catch (err) {
		next(err);
	}
};

const updateMe = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.body.password || req.body.passwordConfirm) {
			throw new AppError('This endpoint is not used to change the password.', 400);
		}

		if (req.body.email) {
			throw new AppError('You can not change your email address.', 400);
		}

		const allowedKeys = ['name', 'lastname', 'photo'];

		Object.keys(req.body).forEach(key => !allowedKeys.includes(key) && delete req.body[key]);

		const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { runValidators: true, new: true });

		res.status(200).json({ status: 'success', data: { user: updatedUser } });
	} catch (err) {
		next(err);
	}
};

const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { currentPassword, newPassword, newPasswordConfirm } = req.body;
		if (!currentPassword || !newPassword || !newPasswordConfirm) {
			throw new AppError('Please provide all credentials.', 400);
		}

		const arePasswordsEqual = await req.user.comparePasswords(currentPassword);
		if (!arePasswordsEqual) {
			throw new AppError('Provided current password is incorrect.', 401);
		}

		if (newPassword === currentPassword) {
			throw new AppError('The new password must not be the same as the previous one.', 400);
		}

		req.user.password = newPassword;
		req.user.passwordConfirm = newPasswordConfirm;

		await req.user.save({ validateBeforeSave: true });

		// assign new token to http cookie and send it to client
		const jwt = await signJwtAsync(req.user.id);
		res.cookie('jwt', jwt, httpCookieOptions);

		res.status(200).json({ status: 'success', message: 'Your password has been changed.' });
	} catch (err) {
		next(err);
	}
};

const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await req.user.deleteOne();
		res.status(204).json();
	} catch (err) {
		next(err);
	}
};

const getAllUsers = controllerFactories.getAll(User);
const getUser = controllerFactories.getOne(User);
const updateUser = controllerFactories.updateOne(User);
const deleteUser = controllerFactories.deleteOne(User);

const createUser = (req: Request, res: Response, next: NextFunction) => {
	throw new AppError('This path is not defined. Instead, use the /signup route.', 500);
};

export default {
	resizeUserPhoto,
	getMe,
	updateMe,
	updatePassword,
	deleteMe,
	getAllUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
};
