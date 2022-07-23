import { register, activateAccount } from '../controllers/auth.controller.mjs';
import { validateUser } from '../middleware/validators/register.validator.mjs';
import express from 'express';

const router = express.Router();

router.post('/register', validateUser, register);
router.get('/activate/:token', activateAccount);

export default router;
