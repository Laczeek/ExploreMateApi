import {Types} from 'mongoose'

export interface IToken {
    user: Types.ObjectId;
    token: string;
    createdAt: Date;
}

