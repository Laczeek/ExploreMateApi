import { config } from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import ExpressMongoSanitize from 'express-mongo-sanitize';
const { xss } = require('express-xss-sanitizer');
import hpp from 'hpp';
import compression from 'compression';

import AppError from './helpers/app-error';
import errorMiddleware from './controllers/error.controller';
import userRouter from './routers/user.router';
import guideRouter from './routers/guide.router';
import reviewRouter from './routers/review.router';
config();

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL as string;


const limiter = rateLimit({
	windowMs: 1000 * 60 * 60 * 2,
	limit: 100,
	handler: () => {
		throw new AppError('Too many requests.', 429);
	},
});

const app = express();

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
app.use(cors({credentials: true}))
app.use(helmet());
app.use(limiter);
app.use(cookieParser());
app.use(express.json({ limit: '20kb' }));
app.use(hpp());
app.use(xss());
app.use(ExpressMongoSanitize());

app.use(compression());
app.use('/api/users', userRouter);
app.use('/api/guides', guideRouter);
app.use('/api/reviews', reviewRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
	throw new AppError(`${req.path} endpoint, does not exist.`, 404);
});

app.use(errorMiddleware);

mongoose
	.connect(MONGO_URL)
	.then(() => {
		console.log('Connected with database.');
		app.listen(PORT, () => {
			console.log(`Server runs on ${PORT} port 🥳`);
		});
	})
	.catch(err => {
		console.log(`Error occures 💥`);
		console.log(err);
	});

export default app;
