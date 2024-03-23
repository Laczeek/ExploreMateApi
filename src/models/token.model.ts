import { Schema, model } from 'mongoose';

import { IToken } from '../interfaces/token.interface';


const tokenSchema = new Schema<IToken>({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: new Date(),
	},
});


const Token = model<IToken>('Token', tokenSchema);

export default Token;
