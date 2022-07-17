import log from '../services/logger.service.mjs';

/**
 *
 * @param {*} err
 * @param {*} res
 * @returns the error that occurred with details, including error stack
 */
const sendDevError = (err, res) => {
    log.error(`Error: ${err}.\n============================\nStack:\n============================\n ${err.stack}`);
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

/**
 *
 * @param {*} err
 * @param {*} res
 * @returns a friendly response with no stack trace if env is production
 */
const sendProdError = (err, res) => {
    log.error(`Error: ${err}.\n============================\nStack:\n============================\n ${err.stack}`);
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};

// eslint-disable-next-line
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || 'Oops! Something went wrong';

    if (process.env.NODE_ENV === 'production') {
        sendProdError(err, res);
    } else {
        sendDevError(err, res);
    }
};

export default errorHandler;
