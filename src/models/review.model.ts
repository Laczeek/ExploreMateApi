import { Model, Schema, model, Types, PopulatedDoc, Query } from 'mongoose';

import { IReview } from '../interfaces/review.interface';
import Guide from './guide.model';

interface ReviewModel extends Model<IReview> {
	calcGuideReviewStats(guideId: Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReview, ReviewModel>(
	{
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		guide: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Guide',
		},
		rating: {
			type: Number,
			required: [true, 'Review must have a rating.'],
			min: [1, 'The minimum rating is 1.'],
			max: [5, 'The maximum rating is 5.'],
		},
		text: {
			type: String,
			required: [true, 'Review must have a text.'],
			trim: true,
			maxlength: [300, 'A text can not be longer than 300 characters.'],
		},
		createdAt: {
			type: Date,
			default: new Date(),
		},
	},
	{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.static('calcGuideReviewStats', async function (guideId: Types.ObjectId) {
	const stats = await Review.aggregate([
		{
			$match: {
				guide: guideId,
			},
		},
		{
			$group: {
				_id: '$guide',
				quantity: { $sum: 1 },
				avg: { $avg: '$rating' },
			},
		},
	]);

	if (stats.length === 0) {
		await Guide.findByIdAndUpdate(guideId, { ratingsAvg: 0, ratingsQuantity: 0 });
	} else {
		await Guide.findByIdAndUpdate(guideId, { ratingsAvg: stats[0].avg, ratingsQuantity: stats[0].quantity});
	}
});

reviewSchema.pre(/^find/, function (this: Query<IReview[], IReview>, next) {
	this.populate({ path: 'user', select: 'name lastname email photo' });
	next();
});

reviewSchema.post('save', async function (doc, next) {
	await Review.calcGuideReviewStats(doc.guide);
	next();
});

reviewSchema.post('findOneAndDelete', async function (doc, next) {
	await Review.calcGuideReviewStats(doc.guide);
	next();
});

reviewSchema.post('findOneAndUpdate', async function (doc, next) {
	await Review.calcGuideReviewStats(doc.guide);
	next();
});

const Review = model<IReview, ReviewModel>('Review', reviewSchema);

export default Review;
