import schemas from './schemas.mjs';

export const validateUser = (req, res, next) => {
    const { error, value } = schemas.registerUserSchema.validate(req.body);

    if (error) {
        const message = error.details[0].message;

        return res.status(400).json({
            status: 'failed',
            message
        });
    }

    // replace input data to trimmed version
    req.body = value;

    next();
};
