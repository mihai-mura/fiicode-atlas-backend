import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from '../../database/mongoStuff.js';

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
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
		if (dbResponse === 1) {
			res.sendStatus(201);

			//* duplicate error
		} else if (dbResponse.email) {
			res.status(409).send('email already in use');
		} else if (dbResponse.username) {
			res.status(409).send('username already in use');
		} else res.sendStatus(500);
	} catch (error) {
		console.log(`!ERROR!${error.message}`);
		res.sendStatus(500);
	}
});

router.post('/login', async (req, res) => {
	try {
		const user = await getUserByEmail(req.body.email);
		if (user) {
			if (await bcrypt.compare(req.body.password, user.password)) {
				const token = await jwt.sign(
					{
						_id: user._id,
					},
					process.env.JWT_SECRET
				);
				res.send(token);
			} else res.sendStatus(403);
		} else res.sendStatus(404);
	} catch (error) {
		console.log(`!ERROR!${error.message}`);
		res.sendStatus(500);
	}
});

export default router;
