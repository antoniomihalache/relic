import errorHandler from './controllers/error.controller.mjs';
import authRouter from './routes/auth.router.mjs';
import express from 'express';

const app = express();
app.use(express.json({ limit: '10kb' }));

app.use('/register', authRouter);

// eslint-disable-next-line
app.use((req, res, next) => {
    return res.status(404).json({
        status: 'fail',
        message: `Could not perform ${req.method} on ${req.originalUrl} on this server`
    });
});

app.use(errorHandler);

export default app;
