"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const html_to_text_1 = require("html-to-text");
const mailersend_1 = require("mailersend");
(0, dotenv_1.config)();
const mailerSend = new mailersend_1.MailerSend({
    apiKey: process.env.MAILER_SEND_TOKEN,
});
class Email {
    constructor(receiverData, url) {
        this.sender = new mailersend_1.Sender('admin@trial-351ndgwqvxngzqx8.mlsender.net', 'Admin');
        this.receiverData = receiverData;
        this.url = url;
    }
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            const filepath = path_1.default.join(__dirname, '..', '..', 'templates', `${template}.html`);
            let htmlFile = yield (0, promises_1.readFile)(filepath, 'utf-8');
            htmlFile = htmlFile.replace(/{%URL%}/g, this.url);
            htmlFile = htmlFile.replace(/{%NAME%}/g, this.receiverData.name);
            const recipients = [new mailersend_1.Recipient(this.receiverData.email)];
            const emailParams = new mailersend_1.EmailParams()
                .setFrom(this.sender)
                .setTo(recipients)
                .setSubject(subject)
                .setHtml(htmlFile)
                .setText((0, html_to_text_1.convert)(htmlFile));
            return mailerSend.email.send(emailParams);
        });
    }
    sendEmail(template, subject) {
        return this.send(template, subject);
    }
}
exports.default = Email;
