import { getDb } from './mongodb.service.mjs';
import config from '../config/config.mjs';
import log from './logger.service.mjs';
import crypto from 'crypto';

/**
 * @description Function that saves events to db
 * @param {*} event (Object)
 */
export const raiseEvent = async function (event) {
    try {
        // dummy validation of event object
        if (
            !event.label &&
            !event.message &&
            !event.title &&
            !Array.isArray(event.requiredRoles) &&
            !event.requiredRoles.length &&
            !event.type &&
            !event.severity
        ) {
            log.error(
                `Misusage of raiseEvent function. You must provide an event with both "message", "label", "title", "requiredRoles", "type" and "severity" properties.`
            );
            return;
        }

        const newEvent = {
            ...event,
            id: `${crypto.randomBytes(10).toString('hex')}${new Date().getTime()}::event::${crypto
                .randomBytes(6)
                .toString('hex')}`,
            creationTimestamp: new Date().toISOString()
        };
        log.debug(`Raising event ${JSON.stringify(newEvent, null, 2)}`);
        // do not await, just put it on the stack
        getDb().collection(config.mongo.collections.events).insertOne(newEvent);
    } catch (err) {
        log.error(`Could not raise event with label ${event.label}. Error: ${err}.\n Stack: ${err.stack}`);
        return;
    }
};
