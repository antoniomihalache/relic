import EmailService from '../services/email.service.mjs';
import log from '../services/logger.service.mjs';
import { getDb } from './mongodb.service.mjs';
import config from '../config/config.mjs';
import jwt from 'jsonwebtoken';

const createActivationToken = async function (userId) {
    try {
        log.debug(`Generating account activation token for user $${userId}`);
        const token = jwt.sign({ id: userId }, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '24h' });
        const validUntil = Date.now() + 24 * 60 * 60 * 1000; // next 24 h
        const updateObj = { $set: { activateToken: token, activateAccountExpires: validUntil } };
        await getDb().collection(config.mongo.collections.users).updateOne({ id: userId }, updateObj);
        log.debug(`Successfully added token and expiration date for user ${userId}`);

        return token;
    } catch (err) {
        log.error(`Could not generate activation token for user ${userId}. Error: ${err}.\nStack: ${err.stack}`);
        throw err;
    }
};

export const sendActivationEmail = async function (req) {
    try {
        const token = await createActivationToken(req.body.id);
        const link = `${req.protocol}://${req.get('host')}/activate/${token}`;
        const message = `Please visit this ${link} in order to confirm your account.`;
        const email = new EmailService({
            recipients: req.body.email,
            subject: 'Relic App - Account activation',
            content: message
        });

        try {
            await email.send();
        } catch (err) {
            log.error(`Something went wrong during email sending. Err:${err}.\nStack: ${err.stack}`);
            return null;
        }
        return link;
    } catch (err) {
        log.error(`Could not send account activation email because of error: ${err}.\nStack: ${err.stack}`);
        throw err;
    }
};

export const isUserStillEligible = async function (user) {
    try {
        if (!user.isAccountActivated && Date.now() > user.activateAccountExpires) {
            log.debug(`User ${user.username} found but activation token has expired. Removing it from db`);
            await getDb().collection(config.mongo.collections.users).deleteOne({ id: user.id });
            return false;
        } else {
            log.info(`User ${user.username} is still in activation period. Nothing to do here.`);
            return true;
        }
    } catch (err) {
        log.error(`Could not remove user ${user.username} because of error: ${err}.\nStack: ${err.stack}`);
        throw err;
    }
};
