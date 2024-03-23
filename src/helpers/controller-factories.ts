import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';

import ApiFeatures from './api-features';
import AppError from './app-error';

const getAll = (Model: Model<any>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const apiFeat = new ApiFeatures(Model, req.query).pagination().projection().sort();
			const documents = await apiFeat.query;

			const modelname = `${Model.modelName}s`;

			res.status(200).json({ status: 'success', length: documents.length, [modelname.toLowerCase()]: documents });
		} catch (err: any) {
			next(err);
		}
	};
};

const getOne = (Model: Model<any>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;

			const modelname = Model.modelName;

			let document;

			if (modelname === 'Guide') {
				document = await Model.findById(id).populate({ path: 'reviews', select: '-__v' });
			} else {
				document = await Model.findById(id);
			}

			if (!document) {
				throw new AppError(`${modelname} with provided id does not exists.`, 404);
			}

			res.status(200).json({ status: 'success', [modelname.toLowerCase()]: document });
		} catch (err: any) {
			next(err);
		}
	};
};

const updateOne = (Model: Model<any>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;

			if (req.body.localization) {
				req.body.localization = JSON.parse(req.body.localization);
			}

			let pushQuery = {};

			if (req.body.startDates) {
				const newDates = JSON.parse(req.body.startDates);
				delete req.body['startDates'];

				pushQuery = { $addToSet: { startDates: { $each: newDates } } };
			}

			const updatedDocument = await Model.findByIdAndUpdate(
				id,
				{ ...req.body, ...pushQuery },
				{ runValidators: true, new: true }
			);

			const modelname = Model.modelName;

			if (!updatedDocument) {
				throw new AppError(`${modelname} with provided id does not exists.`, 404);
			}

			res.status(200).json({ status: 'success', [modelname.toLowerCase()]: updatedDocument });
		} catch (err: any) {
			next(err);
		}
	};
};

const deleteOne = (Model: Model<any>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			const deletedDocument = await Model.findByIdAndDelete(id);

			const modelname = Model.modelName;

			if (!deletedDocument) {
				throw new AppError(`${modelname} with provided id does not exists.`, 404);
			}

			res.status(204).json();
		} catch (err: any) {
			next(err);
		}
	};
};

export default {
	getAll,
	getOne,
	updateOne,
	deleteOne,
};
