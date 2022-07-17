import log from '../services/logger.service.mjs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const register = async function (req, res, next) {
    try {
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'Passwords do not match'
            });
        }

        //remove confirmPassword, it has served its purpose at this level
        req.body.confirmPassword = undefined;

        req.body.password = await bcrypt.hash(req.body.password, 12);
        req.body.id = `${crypto.randomBytes(10).toString('hex')}${new Date().getTime()}::user::${crypto
            .randomBytes(6)
            .toString('hex')}`;

        console.log('what we save into mongo', req.body);
        return res.status(201).json({ message: 'user created' });
    } catch (err) {
        log.error(`Error while registering user: ${err}.Stack: ${err.stack}`);
        return next(err);
    }
};
