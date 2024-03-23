export interface IGuide {
    name: string;
    lastname: string;
    localization: {
        type: "Point",
        coordinates: number[]
    },
    description: string;
    duration: number;
    price: number;
    photo:string;
    images: string[];
    ratingsAvg: number;
    ratingsQuantity: number;
    maxGroupSize: number;
    startDates: Date[];
    slug?: string;
    createdAt: Date
}