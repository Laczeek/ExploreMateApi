import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IGuide } from '../interfaces/guide.interface';

class ApiFeatures {
	query: mongoose.Query<
		(mongoose.Document<unknown, {}, IGuide> &
			IGuide & {
				_id: mongoose.Types.ObjectId;
			})[],
		mongoose.Document<unknown, {}, IGuide> &
			IGuide & {
				_id: mongoose.Types.ObjectId;
			},
		{},
		IGuide,
		'find'
	>;

	queryObj: any;

	constructor(Model: Model<any>, queryObj: any) {
		this.queryObj = queryObj;

        const notFilters = ['sort', 'page', 'limit', 'select'];
		let filter: any = { ...queryObj };
		Object.keys(filter).forEach(key => {
			if (notFilters.includes(key)) {
				delete filter[key];
			}
		});
		filter = JSON.stringify(filter);
		filter = JSON.parse(filter.replace(/\b(gt|gte|lt|lte|eq|ne)\b/g, (match: string) => `$${match}`));

		this.query = Model.find(filter);
	}

    pagination() {
			const maxDocumentsPerPage = +this.queryObj.limit || 8;
			const page = +this.queryObj.page || 1;

			this.query = this.query.skip((page - 1) * maxDocumentsPerPage).limit(maxDocumentsPerPage);
		
        return this;
    }

    projection() {
        if (this.queryObj.select) {
			const selectString = (this.queryObj.select as string).replace(/,/g, ' ');
			this.query = this.query.select(selectString);
		} else {
			this.query = this.query.select('-__v');
		}
        return this;
    }

    sort(){
        if (this.queryObj.sort) {
			const sortString = (this.queryObj.sort as string).replace(/,/g, ' ');
			this.query = this.query.sort(sortString);
		}
        return this
    }
}


export default ApiFeatures;