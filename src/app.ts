import { config } from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';	
import mongoose from 'mongoose';
import morgan from 'morgan';

import AppError from './helpers/app-error';
import errorMiddleware from './controllers/error.controller';
import userRouter from './routers/user.router';
import guideRouter from './routers/guide.router';
import reviewRouter from './routers/review.router';
config();

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL as string;

const app = express();

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
app.use(cookieParser());
app.use(express.json());

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