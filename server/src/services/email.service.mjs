import log from './logger.service.mjs';
import nodemailer from 'nodemailer';

const defaultAccountOptions = {
    service: 'gmail',
    auth: {
        user: process.env.MAIL_ACCOUNT_USERNAME,
        pass: process.env.MAIL_ACCOUNT_PASS
    }
};

/**
 * @description Constructor function for creating an email sending object
 * @params Must be called with at least one configuration object (for the message)
 * Defaults to a gmail account
 */
class EmailService {
    constructor({ from, recipients, subject, content }, accountOptions = defaultAccountOptions) {
        this.accountOptions = accountOptions;
        this.recipients = recipients;
        this.subject = subject;
        this.content = content;
        this.from = from;
    }

    /**
     * @returns an instance of nodemailer transport
     */
    newTransport() {
        return nodemailer.createTransport({
            service: this.accountOptions.service,
            auth: {
                user: this.accountOptions.auth.user,
                pass: this.accountOptions.auth.pass
            },
            tls: { rejectUnauthorized: false }
        });
    }

    /**
     * @description The function that actually sends the email
     * @returns a nodemailer info object
     */
    async send() {
        try {
            const transport = this.newTransport();
            const recipientsArray = this.recipients.split(',');
            const recipients = recipientsArray
                .map((recipient) => {
                    return recipient.toString().trim();
                })
                .join(',');

            const emailInfo = await transport.sendMail({
                from: this.from,
                to: recipients,
                subject: this.subject,
                text: this.content
                // attachments to be added if needed in the future
            });

            return {
                accepted: emailInfo.accepted,
                rejected: emailInfo.rejected,
                messageSize: emailInfo.messageSize,
                messageId: emailInfo.messageId,
                envelope: emailInfo.envelope
            };
        } catch (err) {
            log.error(`Could not send email because of error: ${err}.\nStack: ${err.stack}`);
            throw new Error(err);
        }
    }

    /**
     * @description helper function that checks the provided email account credentials
     * @returns <Promise>
     */
    verifyAccountConnection() {
        return new Promise((resolve, reject) => {
            const transporter = this.newTransport();
            transporter.verify((error) => {
                if (error) {
                    reject(false);
                }
                resolve(true);
            });
        });
    }
}

export default EmailService;
