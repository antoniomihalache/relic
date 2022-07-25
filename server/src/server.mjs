import 'dotenv/config'; // load env variables

import { connectDb, createIndexes } from './services/mongodb.service.mjs';
import log from './services/logger.service.mjs';
import { initLoops } from './loops/index.mjs';
import config from './config/config.mjs';
import https from 'https';
import fs from 'fs';

const PORT = process.env.PORT || 3001;

process.on('uncaughtException', (err) => {
    log.error(`
    ------------------------------ uncaughtException ------------------------------
    ${err.name} | ${err.message} | ${process.env.NODE_ENV === 'development' ? err.stack : ''}
    -------------------------------------------------------------------------------
    `);
    process.exit(1);
});

import expressApp from './expressApp.mjs';

const server = https.createServer(
    {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem')
    },
    expressApp
);

connectDb().then(() => {
    log.info(`Successfully connected to MongoDB`);
    server.listen(PORT, () => {
        log.info(`
        ------------------------------------------------
        STARTING RELIC APP SERVER IN "${process.env.NODE_ENV.toUpperCase()}" ON PORT ${PORT}
        ------------------------------------------------`);
        initLoops();
        // create indexes in mongo
        for (const item of config.mongo.defaultIndexes) {
            createIndexes(item.collection, item.indexes);
        }
    });
});

process.on('unhandledRejection', (promise, reason) => {
    log.error(`Unhandled Rejection at: ${promise}, reason:  ${reason}, \nSHUTTING DOWN`);
    server.close(() => {
        process.exit(1);
    });
});
