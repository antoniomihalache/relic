import { getEvents, deleteEvent } from '../controllers/events.controller.mjs';
import express from 'express';

const router = express.Router();

router.delete('/:id', deleteEvent);
router.get('/', getEvents);

export default router;
