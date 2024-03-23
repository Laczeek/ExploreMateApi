import { Schema, model } from 'mongoose';

import { IGuide } from '../interfaces/guide.interface';

const guideSchema = new Schema<IGuide>({
	name: {
		type: String,
		required: [true, 'The guide must have a name.'],
	},
	lastname: {
		type: String,
		required: [true, 'The guide must have a lastname.'],
	},
	localization: {
		type: {
			type: String,
			default: 'Point',
			enum: ['Point'],
		},
		coordinates: {
			type: [Number],
		},
     
	},
	description: {
		type: String,
		trim: true,
		required: [true, 'The guide must have a description.'],
	},
    duration: {
        type: Number,
        required: [true, 'The guide must be given the duration of his service.']
    },
    price: {
        type: Number,
        required: [true, 'The guide must have a price of his given service.']
    },
    photo: {
        type: String,
        required: [true, 'The guide must have a photo.']
    },
    images: {
        type: [String],
        required: [true, 'The guide must have pictures depicting the purpose of his services.']
    },
    ratingsAvg: {
        type: Number,
        default: 0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'The guide must be given the maximum number of the group.']
    },
    startDates: {
        type: [Date],

        required: [true, 'The guide must provide the start dates of his tours.']
    },
    slug: String,
    createdAt: {
        type: Date,
        default: new Date()
    },

},{ toJSON: { virtuals: true }, toObject: { virtuals: true }});

guideSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'guide',
})

guideSchema.pre('save', function(this,next) {
    if(!this.isNew) {
        return next();
    }

    this.slug = `${this.name.toLowerCase()}-${this.lastname.toLowerCase()}`;
    next();
})

const Guide = model<IGuide>('Guide', guideSchema);

export default Guide;
