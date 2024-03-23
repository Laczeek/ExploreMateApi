export interface IResError {
    statusCode: number;
    status:'fail' | 'error';
    message:string;
    isOperational?:true
    stack?:string
}