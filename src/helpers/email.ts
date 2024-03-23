import { config } from 'dotenv';
import path from 'path';
import { readFile } from 'fs/promises';

import { convert } from 'html-to-text';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';
config();

interface IReceiverData {
	name: string;
	email: string;
}
type AllowedTempaltes = 'verifyEmail' | 'forgotPassword';

const mailerSend = new MailerSend({
	apiKey: process.env.MAILER_SEND_TOKEN!,
});

class Email {
	private readonly receiverData: IReceiverData;
	private readonly sender = new Sender('admin@trial-351ndgwqvxngzqx8.mlsender.net', 'Admin');
	private readonly url: string;

	constructor(receiverData: IReceiverData, url: string) {
		this.receiverData = receiverData;
		this.url = url;
	}

	private async send(template: AllowedTempaltes, subject: string) {
		const filepath = path.join(__dirname, '..', '..', 'templates', `${template}.html`);
		let htmlFile = await readFile(filepath, 'utf-8');

		htmlFile = htmlFile.replace(/{%URL%}/g, this.url);
		htmlFile = htmlFile.replace(/{%NAME%}/g, this.receiverData.name);

		const recipients = [new Recipient(this.receiverData.email)];

		const emailParams = new EmailParams()
			.setFrom(this.sender)
			.setTo(recipients)
			.setSubject(subject)
			.setHtml(htmlFile)
			.setText(convert(htmlFile));

		return mailerSend.email.send(emailParams);
	}

	sendEmail(template: AllowedTempaltes, subject: string) {
		return this.send(template, subject);
	}
}

export default Email;
