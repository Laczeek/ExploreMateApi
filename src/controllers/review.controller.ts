import { NextFunction, Request, Response } from 'express';

import Review from '../models/review.model';
import controllerFactories from '../helpers/controller-factories';
import AppError from '../helpers/app-error';

const createReview = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.body.guide) {
			req.body.guide = req.params.id;
		}

		const newReview = await Review.create({
			guide: req.body.guide,
			user: req.user._id,
			rating: req.body.rating,
			text: req.body.text,
		});

		res.status(201).json({ status: 'success', review: newReview });
	} catch (err: any) {
		next(err);
	}
};
const getAllReviews = controllerFactories.getAll(Review);
const getReview = controllerFactories.getOne(Review);

const updateReview = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const reviewId = req.params.id;

		const allowedKeys = ['rating', 'text'];

		Object.keys(req.body).forEach(key => !allowedKeys.includes(key) && delete req.body[key]);

		const review = await Review.findOneAndUpdate({ _id: reviewId, user: req.user._id }, req.body, {
			new: true,
			runValidators: true,
		});

		if (!review) {
			throw new AppError(
				'Review with provided id does not exists or you do not have rights to perform this action.',
				404
			);
		}

		res.status(200).json({ status: 'success', review });
	} catch (err: any) {
		next(err);
	}
};

const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const reviewId = req.params.id;

        let query = {};

        if(req.user.role === 'admin') {
            query = {_id: reviewId}
        } else {
            query = {_id:reviewId, user: req.user._id};
        }

		const deletedReview = await Review.findOneAndDelete(query);

		if (!deletedReview) {
			throw new AppError(
				'Review with provided id does not exists or you do not have rights to perform this action.',
				404
			);
		}

		res.status(204).json();
	} catch (err: any) {
		next(err);
	}
};

export default {
	getAllReviews,
	createReview,
	getReview,
	updateReview,
	deleteReview,
};
