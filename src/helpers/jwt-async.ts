import jwt, { JwtPayload } from 'jsonwebtoken';

import AppError from './app-error';

export const signJwtAsync = (userId: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		jwt.sign({ userId }, process.env.SECRET_KEY!, { expiresIn: '1d' }, (err, token) => {
			if (err) {
				reject(new AppError('Something went wrong when trying to assign your verification token.', 500));
			} else if (token) {
				resolve(token);
			}
		});
	});
};

export const verifyJwtAsync = (userJwt: string): Promise<JwtPayload> => {
	return new Promise((resolve, reject) => {
		jwt.verify(userJwt, process.env.SECRET_KEY!, (err, decodedToken) => {
			if (err) {
				if (err.name === 'TokenExpiredError') {
					reject(new AppError('Your token in no longer valid. Please login.', 401));
				}
				reject(new AppError('You are not authorized.', 401));
			} else if (decodedToken) {
				resolve(decodedToken as JwtPayload);
			}
		});
	});
};