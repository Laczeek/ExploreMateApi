import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { IGuide } from '../interfaces/guide.interface';
import Guide from '../models/guide.model';

config();

const guidesPath = path.join(__dirname, '..', '..', 'data', 'guides.json');

const guides = JSON.parse(fs.readFileSync(guidesPath, { encoding: 'utf-8' }));

mongoose
	.connect(process.env.MONGO_URL!)
	.then(() => {
		return Guide.deleteMany();
	})
	.then(() => {
		const promises = guides.map((guide:IGuide) => {
			return Guide.create(guide);
		})

		return Promise.all(promises);
	})
	.then(() => {
		console.log('GUIDES INSERTED!');
		return mongoose.disconnect();
	})
	.catch(err => console.log(err))
	.finally(() => {
		process.exit();
	});
