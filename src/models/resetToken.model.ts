import { Schema, model } from 'mongoose';

import { IResetToken } from '../interfaces/resetToken.interface';


const resetTokenSchema = new Schema<IResetToken>({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	token: {
		type: String,
		required: true,
	},
	expires: {
		type: Date,
		default: Date.now() + 1000 * 60 * 10
	},
});


const ResetToken = model<IResetToken>('ResetToken', resetTokenSchema);

export default ResetToken;
