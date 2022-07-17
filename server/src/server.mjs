import https from 'https';
import fs from 'fs';

const PORT = process.env.PORT || 3001;

process.on('uncaughtException', (err) => {
    console.error(`
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

server.listen(PORT, () => {
    console.log(`
    ------------------------------------------------
    STARTING RELIC SERVER IN "${process.env.NODE_ENV.toUpperCase()}" ON PORT ${PORT}
    ------------------------------------------------`);
});

process.on('unhandledRejection', (promise, reason) => {
    console.error(`Unhandled Rejection at: ${promise}, reason:  ${reason}, \nSHUTTING DOWN`);
    server.close(() => {
        process.exit(1);
    });
});
