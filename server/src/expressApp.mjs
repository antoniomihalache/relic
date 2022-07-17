import errorHandler from './controllers/error.controller.mjs';
import express from 'express';
import { getDb } from './services/mongodb.service.mjs';

const app = express();

// eslint-disable-next-line
app.get('/', async (req, res, next) => {
    await getDb().collection('test').insertOne({ name: 'test' });
    return res.status(200).send('ok');
});

app.use(errorHandler);

export default app;
