export type AllowedRoles = 'user' | 'admin' | 'moderator';

export interface IUser {
	name: string;
	lastname: string;
	email: string;
	role: AllowedRoles;
	photo: string;
	isActive: boolean;
	password: string;
	passwordConfirm?: string;
	passwordChangedAt?: Date;
	createdAt: Date;
}

export interface IUserMethods {
	comparePasswords(plainPassword: string): Promise<boolean>;
}
