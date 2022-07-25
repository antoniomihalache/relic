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

export const createIndexes = async function (collection, desiredIndexes) {
    log.debug(`Started indexes creation for collection "${collection}"`);
    if (!collection) {
        log.error('You must provide a collection name');
        return;
    }

    if (!Array.isArray(desiredIndexes) || !desiredIndexes.length) {
        log.error('"indexes" argument must be a non empty array of strings');
        return;
    }

    try {
        let existingCollections = await getDb().listCollections().toArray();
        existingCollections = existingCollections.map((coll) => coll.name);

        // if collection doesn't exist, create an empty one
        if (!existingCollections.includes(collection)) {
            log.info(`Collection ${collection} does not exist. Creating an empty one now.`);
            await getDb().createCollection(collection);
        } else {
            log.info(`Collection ${collection} already exists. No need to recreate it.`);
        }

        // get all indexes from that collection
        const existingIndexes = await getDb().collection(collection).indexes();
        existingIndexes.forEach((index, count) => {
            log.debug(`Index ${count}: ${JSON.stringify(index)}`);
        });

        // create new index/es
        for (const index of desiredIndexes) {
            const indexExists = existingIndexes.find((idx) => {
                return idx.name === `${index.name}_${index.order}`;
            });

            if (!indexExists) {
                log.warn(`Creating index: ${index.name} for collection: ${collection}`);
                const idx = {};
                idx[index.name] = index.order;
                await getDb().collection(collection).createIndex(idx);
            } else {
                log.info(`Index ${index.name} already exists. Won't recreate it`);
            }
        }
        log.debug(`Done with indexes on ${collection} collection.`);
    } catch (err) {
        log.error(`Could not create index/es for collection ${collection}. Err: ${err}.\nStack: ${err.stack}`);
        throw err;
    }
};
