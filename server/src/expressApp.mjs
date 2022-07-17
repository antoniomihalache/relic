import errorHandler from './controllers/error.controller.mjs';
import express from 'express';

const app = express();

// eslint-disable-next-line
app.get('/', async (req, res, next) => {
    return res.status(200).send('ok');
});

app.all((req, res) => {
    return res.status(404).json({
        status: 'fail',
        message: `${req.originalURL} not found on this server`
    });
});

app.use(errorHandler);

export default app;
