import { HydratedDocument } from 'mongoose';
import { IUser, IUserMethods } from '../../src/interfaces/user.interface';

declare module 'express-serve-static-core' {
	interface Request {
		user: HydratedDocument<IUser> & IUserMethods
	}
}
