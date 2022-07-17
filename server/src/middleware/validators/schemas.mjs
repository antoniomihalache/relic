import Joi from 'joi';

const Schemas = {
    registerUserSchema: Joi.object({
        username: Joi.string().required().trim().lowercase(),
        email: Joi.string().email().required().trim().lowercase(),
        password: Joi.string().required().min(6).max(30),
        confirmPassword: Joi.string().required().min(6).max(30),
        roles: Joi.array().required(),
        isAccountActivated: Joi.boolean().default(false),
        createdAt: Joi.date().iso().default(new Date().toISOString())
    })
};

export default Schemas;
