import Joi from 'joi';

const Schemas = {
    registerUserSchema: Joi.object({
        username: Joi.string().required().trim().lowercase(),
        email: Joi.string().email().required().trim().lowercase(),
        password: Joi.string().required().min(6).max(30),
        confirmPassword: Joi.string().required().min(6).max(30),
        roles: Joi.array().required(),
        isAccountActivated: Joi.boolean().default(false),
        activateAccountExpires: Joi.number().allow(null).default(null),
        activateToken: Joi.string().allow(null).default(null),
        creationTimestamp: Joi.date().iso().default(new Date().toISOString()),
        isLocked: Joi.boolean().default(false)
    })
};

export default Schemas;
