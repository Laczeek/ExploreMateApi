import mongoose from "mongoose";

export interface IReview {
    guide: mongoose.Types.ObjectId,
    user:  mongoose.Types.ObjectId,
    rating: number,
    text: string,
    createdAt: Date;
}