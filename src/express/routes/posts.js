import express from 'express';
import { verifyToken } from '../middleware.js';
import { createPost } from '../../database/mongoStuff.js';

const router = express.Router();

router.post('/create', verifyToken, async (req, res) => {
	const dbResponse = await createPost(req.body.title, req.body.description, req._id, req.body.city);
	if (dbResponse === 1) res.sendStatus(201);
	else res.sendStatus(500);
});

export default router;
