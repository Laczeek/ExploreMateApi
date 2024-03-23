import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';

import { IResError } from '../interfaces/error.interface';
import AppError from '../helpers/app-error';

config();

const resErrorDevelopment = (error: any, res: Response) => {
	res.status(error.statusCode).json({ status: error.status, error, stack: error.stack });
};

const resErrorProduction = (error: IResError, res: Response) => {
	res.status(error.statusCode).json({ status: error.status, message: error.message });
};

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		return resErrorDevelopment(err, res);
	} else {
		if (err.code === 11000) {
			err = new AppError(`Provided ${Object.keys(err.keyValue)[0]} value already exists.`, 409);
		}

		if (err.name === 'ValidationError') {
			const messages: string[] = [];
			Object.keys(err.errors).forEach(key => messages.push(err.errors[key].message));
			err = new AppError(messages.join(' '), 400);
		}

		if (err.code === 'LIMIT_UNEXPECTED_FILE') {
			err = new AppError('You have uploaded too many files.', 400);
		}

		if (err.name === 'CastError') {
			err = new AppError('Incorrect id.', 400);
		}

		if (err.isOperational) {
			return resErrorProduction(err, res);
		}

		res.status(500).json({ status: 'error', message: 'Something went wrong.' });
	}
};

export default errorMiddleware;
