import {Types} from 'mongoose'

export interface IResetToken {
    user: Types.ObjectId;
    token: string;
    expires: Date;
}

