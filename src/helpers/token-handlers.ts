import crypto from 'crypto';

export const createTokens = (): [string, string] => {
    const timestamp = Date.now().toString();
	const plainToken = crypto.randomBytes(32).toString('hex') + timestamp;
	const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
	return [plainToken, hashedToken];
}

export const hashPlainToken = (plainToken:string): string => {
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    return hashedToken;
}