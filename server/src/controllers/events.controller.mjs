import { getDb } from '../services/mongodb.service.mjs';
import log from '../services/logger.service.mjs';
import config from '../config/config.mjs';

// controller for GET /api/v1/events
//TODO : user role based filters
export const getEvents = async function (req, res, next) {
    try {
        const collection = getDb().collection(config.mongo.collections.events);
        let events, total;

        Promise.all([collection.find().toArray(), collection.countDocuments()]).then((response) => {
            events = response[0];
            total = response[1];
            return res.status(200).json({
                total,
                data: events
            });
        });
    } catch (err) {
        log.error(`Could not perform GET on /api/v1/events. Error: ${err}.\nStack: ${err.stack}`);
        return next(err);
    }
};

// controller for DELETE /api/v1/events/:id
//TODO: user role based access
export const deleteEvent = async function (req, res, next) {
    try {
        await getDb().collection(config.mongo.collections.events).deleteOne({ id: req.params.id });
        return res.status(204).send('');
    } catch (err) {
        log.error(`Could not remove event with id: ${req.params.id}. Error: ${err}.\nStack: ${err.stack}`);
        return next(err);
    }
};

// controller for DELETE /api/v1/events
//TODO: user role based access
export const deleteEvents = async function (req, res, next) {
    try {
        await getDb().collection(config.mongo.collections.events).deleteMany({});
        return res.status(204).send('');
    } catch (err) {
        log.error(`Could not perform DELETE on /api/v1/events!. Err:${err}.\nStack: ${err.stack}`);
        return next(err);
    }
};
