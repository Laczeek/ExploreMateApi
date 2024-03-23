class AppError extends Error {
	statusCode: number;
	status: 'fail' | 'error';
    isOperational: true;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
	}
}


export default AppError;

