import { sendActivationEmail, isUserStillEligible } from '../services/auth.service.mjs';
import { getDb } from '../services/mongodb.service.mjs';
import log from '../services/logger.service.mjs';
import config from '../config/config.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// controller for POST /register
export const register = async function (req, res, next) {
    try {
        // chef if password matches confirmPassword
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'Passwords do not match'
            });
        }

        // check if email and username are already in use
        const userExists = await getDb()
            .collection(config.mongo.collections.users)
            .findOne(
                { $or: [{ username: req.body.username }, { email: req.body.email }] },
                {
                    projection: {
                        _id: 0,
                        id: 1,
                        email: 1,
                        username: 1,
                        activateAccountExpires: 1,
                        isAccountActivated: 1
                    }
                }
            );

        if (userExists) {
            await isUserStillEligible(userExists);
            return res.status(400).json({
                status: 'fail',
                message: 'Username or email address already in use.'
            });
        }

        //remove confirmPassword, it has served its purpose at this level
        delete req.body.confirmPassword;

        req.body.password = await bcrypt.hash(req.body.password, 12);
        req.body.id = `${crypto.randomBytes(10).toString('hex')}${new Date().getTime()}::user::${crypto
            .randomBytes(6)
            .toString('hex')}`;

        const { acknowledged } = await getDb().collection(config.mongo.collections.users).insertOne(req.body);
        if (!acknowledged) {
            return res.status(500).json({
                status: 'error',
                message: 'Something went wrong during account setup. Please try the request again.'
            });
        }
        const link = await sendActivationEmail(req);

        res.setHeader('activationLink', link);

        return res.status(201).json({
            status: 'success',
            message: `In order to use your account, you must confirm your email address in the next 24 hours. Please check ${req.body.email} for instructions.`
        });
    } catch (err) {
        log.error(`Error while registering user: ${err}.Stack: ${err.stack}`);
        return next(err);
    }
};

// controller for GET /activate/:token
export const activateAccount = async function (req, res, next) {
    try {
        const { id } = jwt.verify(req.params.token, process.env.JWT_ACCOUNT_ACTIVATION_SECRET);
        if (!id) {
            return res.status(400).json({
                status: 'fail',
                message: 'Could not verify your token signature'
            });
        }

        const user = await getDb()
            .collection(config.mongo.collections.users)
            .findOne(
                { id },
                {
                    projection: {
                        id: 1,
                        username: 1,
                        _id: 0,
                        activateAccountExpires: 1,
                        isAccountActivated: 1,
                        activateToken: 1
                    }
                }
            );

        if (!user.activateToken) {
            return res.status(200).json({
                status: 'success',
                message: 'This account has already been activated.'
            });
        }

        const userIsValid = await isUserStillEligible(user);
        if (!userIsValid) {
            return res.status(400).json({
                status: 'fail',
                message: 'User not found or activation period expired.'
            });
        }

        const updateObj = {
            $set: {
                isAccountActivated: true,
                activateAccountExpires: null,
                activateToken: null,
                activationTimestamp: new Date().toISOString()
            }
        };

        await getDb().collection(config.mongo.collections.users).updateOne({ id }, updateObj);

        return res.status(200).json({
            status: 'success',
            message: `Welcome ${user.username}! Your account has been activated. You may now login with your credentials.`
        });
    } catch (err) {
        log.error(`Could not activate account for token ${req.params.token}. Err: ${err}.\nStack: ${err.stack}`);
        return next(err);
    }
};
