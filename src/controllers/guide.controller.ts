import { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import sharp from 'sharp';

import AppError from '../helpers/app-error';
import controllerFactories from '../helpers/controller-factories';
import Guide from '../models/guide.model';

const resizeGuideImages = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.files) {
			return next();
		}

		let guideId: any;
		if (req.params.id) {
			guideId = req.params.id;
		} else {
			guideId = new mongoose.Types.ObjectId();
			req.body._id = guideId;
		}

		if ('photo' in req.files && req.files['photo']) {
			const filename = `guide-${guideId}.jpeg`;
			await sharp(req.files['photo'][0].buffer)
				.resize(600, 400)
				.jpeg({ quality: 90 })
				.toFile(`public/images/guides/${filename}`);
			req.body.photo = filename;
		}

		if ('images' in req.files && req.files['images']) {
			const allPromises = req.files['images'].map(async (f, index) => {
				const filename = `guide-${guideId}-img-${index + 1}.jpeg`;
				await sharp(f.buffer).resize(1200, 800).jpeg({ quality: 90 }).toFile(`public/images/guides/${filename}`);
				return filename;
			});

			const filenames = await Promise.all(allPromises);
			req.body.images = filenames;
		}
		next();
	} catch (err: any) {
		next(err);
	}
};

const removeGuideImages = async (guideId: string) => {
	const dirpath = path.join(__dirname, '..', '..', 'public', 'images', 'guides');
	const guidesImagesNames = await fs.readdir(dirpath, { encoding: 'utf-8' });

	await Promise.all(
		guidesImagesNames.map(async filename => {
			if (filename.startsWith(`guide-${guideId}`)) {
				const filepath = path.join(dirpath, filename);
				await fs.unlink(filepath);
			}
		})
	);
};

const createGuide = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.body.localization) {
			req.body.localization = JSON.parse(req.body.localization);
		}

		if (req.body.startDates) {
			req.body.startDates = JSON.parse(req.body.startDates);
		}

		const newGuide = await Guide.create(req.body);

		res.status(201).json({ status: 'success', guide: newGuide });
	} catch (err: any) {
		await removeGuideImages(req.body._id);

		next(err);
	}
};

const getTopGuides = (req: Request, res: Response, next: NextFunction) => {
	req.query.sort = '-ratingsAvg,price';
	req.query.limit = '5';
	next();
};

const getMonthlyPlan = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const year = req.params.year;
		console.log(year);

		const plan = await Guide.aggregate([
			{ $unwind: '$startDates' },
			{
				$addFields: {
					year: { $year: '$startDates' },
					month: { $month: '$startDates' },
					fullname: { $concat: ['$name', ' ', '$lastname'] },
				},
			},
			{
				$match: {
					year: +year,
				},
			},
			{
				$group: {
					_id: '$month',
					month: { $first: '$month' },
					total: { $sum: 1 },
					guides: { $addToSet: '$fullname' },
				},
			},
			{
				$project: {
					_id: 0,
					total: 1,
					guides: 1,
					month: 1,
				},
			},
			{
				$sort: {
					month: 1,
				},
			},
		]);

		res.status(200).json({ status: 'success', plan });
	} catch (err: any) {
		next(err);
	}
};

const getNearGuides = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { locPoint, maxDistance } = req.params;
		const maxDistanceKm = +maxDistance * 1000;
		const userLocalization = locPoint.split(',');

		const guides = await Guide.aggregate([
			{
				$geoNear: {
					maxDistance: +maxDistanceKm,
					near: {
						type: 'Point',
						coordinates: [+userLocalization[0], +userLocalization[1]],
					},
					distanceField: 'distance',
					distanceMultiplier: 0.001,
				},
			},
			{
				$addFields: {
					roundedDistance: { $round: ['$distance', 2] },
				},
			},
		]);

		res.status(200).json({ status: 'success', length: guides.length, guides });
	} catch (err: any) {
		next(err);
	}
};

const getAllGuides = controllerFactories.getAll(Guide);

const getGuide = controllerFactories.getOne(Guide);

const updateGuide = controllerFactories.updateOne(Guide);

const deleteGuide = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const guideId = req.params.id;
		const deletedGuide = await Guide.findByIdAndDelete(guideId);
		if (!deletedGuide) {
			throw new AppError('Guide with provided id does not exists.', 404);
		}
		await removeGuideImages(guideId);

		res.status(204).json();
	} catch (err: any) {
		next(err);
	}
};

export default {
	getAllGuides,
	createGuide,
	getGuide,
	updateGuide,
	deleteGuide,
	resizeGuideImages,
	getTopGuides,
	getMonthlyPlan,
	getNearGuides,
};
