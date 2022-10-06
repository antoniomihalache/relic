import errorHandler from './controllers/error.controller.mjs';
import eventsRouter from './routes/events.router.mjs';
import mongoSanitize from 'express-mongo-sanitize';
import authRouter from './routes/auth.router.mjs';
import log from './services/logger.service.mjs';
import rateLimit from 'express-rate-limit';
import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';

const app = express();

app.use(helmet());

const limiter = rateLimit({
    max: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests, please try again in an hour!'
});

// limit to 50 requests/h for an IP
app.use(limiter);

app.use(express.json({ limit: '10kb' }));

// NoSQL query injection
app.use(mongoSanitize());
// XSS
app.use(xss());

//TODO: add username to this log
app.use((req, res, next) => {
    log.debug(
        `Doing ${req.method} request on ${req.url}, asked by ${
            req.socket.remoteAddress || req.connection.remoteAddress
        }`
    );
    next();
});

app.use('/api/v1/events', eventsRouter);
app.use('/', authRouter);

// eslint-disable-next-line
app.use((req, res, next) => {
    return res.status(404).json({
        status: 'fail',
        message: `Could not perform ${req.method} on ${req.originalUrl} on this server`
    });
});

app.use(errorHandler);

export default app;
