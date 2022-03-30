import express from 'express';
import bcrypt from 'bcrypt';
import { createUser } from '../../database/mongoStuff.js';

const router = express.Router();

router.post('/register', async (req, res) => {
	if (req.body.password) {
		//* checks if api call is right
		const hashedPass = await bcrypt.hash(req.body.password, 10);
		const dbResponse = await createUser(
			req.body.email,
			req.body.username,
			hashedPass,
			req.body.firstName,
			req.body.lastName,
			req.body.address,
			'user'
		);
		//!error handle if user exists
		switch (dbResponse) {
			case 1:
				res.sendStatus(201);
				break;
			//* duplicate error
			case 11000:
				res.sendStatus(409);
				break;
			default:
				res.sendStatus(500);
		}
	} else {
		res.sendStatus(400);
	}
});

export default router;
