import { MongoClient } from 'mongodb';
import config from '../config/config.mjs';
import log from './logger.service.mjs';

const url = process.env.NODE_ENV === 'development' ? 'mongodb://localhost:27017' : process.env.MONGO_URL;
const client = new MongoClient(url);

let _db;

export const connectDb = async function () {
    try {
        const connection = await client.connect();
        _db = connection.db(config.mongo.defaultDb);
    } catch (err) {
        log.error(`Could not connect to mongo because of error: ${err}.\n Stack: ${err.stack}`);
        throw new Error(err);
    }
};

export const getDb = () => _db;
