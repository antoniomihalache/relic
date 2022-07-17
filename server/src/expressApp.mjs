import errorHandler from './controllers/error.controller.mjs';
import express from 'express';

const app = express();

// eslint-disable-next-line
app.get('/', (req, res, next) => {
    return res.status(200).send('ok');
});

app.use(errorHandler);

export default app;
