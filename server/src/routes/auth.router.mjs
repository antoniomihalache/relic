import { register } from '../controllers/auth.controller.mjs';
import { validateUser } from '../middleware/validators/register.validator.mjs';
import express from 'express';

const router = express.Router();

router.post('/', validateUser, register);

export default router;
