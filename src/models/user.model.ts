import { Model, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

import { IUser, IUserMethods } from '../interfaces/user.interface';

export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
	{
		name: {
			type: String,
			required: [true, 'Please provide your name.'],
			minlength: [3, 'Name must be at least 3 characters long.'],
			maxlength: [30, 'Name must be less than 30 characters long'],
			trim: true,
		},
		lastname: {
			type: String,
			required: [true, 'Please provide your lastname.'],
			minlength: [3, 'Lastname must be at least 3 characters long.'],
			maxlength: [30, 'Lastname must be less than 30 characters long'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Please provide your email.'],
			lowercase: true,
			trim: true,
			unique: true,
			validate: {
				validator: function (val: string) {
					return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(val);
				},
				message: props => `${props.value} is not a valid email address.`,
			},
		},
		role: {
			type: String,
			enum: {
				values: ['admin', 'user', 'moderator'],
				message: 'Invalid role.',
			},
			default: 'user',
		},
		photo: {
			type: String,
			default: 'default.jpeg',
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		password: {
			type: String,
			required: [true, 'Please provide a password.'],
			minlength: [8, 'Password must be at least 8 characters long.'],
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [true, 'Please provide a confrim password.'],
			minlength: [8, 'Password confirm must be at least 8 characters long.'],

			validate: {
				validator: function (this: any, val: string) {
					return val === this.password;
				},
				message: 'Passwords are not the same.',
			},
		},

		passwordChangedAt: {
			type: Date,
		},
		createdAt: {
			type: Date,
			default: new Date(),
		},
	},
	{ writeConcern: { w: 1, journal: true } }
);

userSchema.methods.comparePasswords = function (this: IUser, plainPassword: string) {
	return bcrypt.compare(plainPassword, this.password);
};

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	const cryptedPassword = await bcrypt.hash(this.password, 12);
	this.password = cryptedPassword;
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) {
		return next();
	}
	
	this.passwordChangedAt = new Date(Date.now() - 1000);
	next();
});

const User = model<IUser, UserModel>('User', userSchema);

export default User;
