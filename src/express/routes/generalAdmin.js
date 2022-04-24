import express from 'express';
import { createGeneralAdmin, getGeneralAdmin } from '../../database/mongoStuff.js';
import bcrypt from 'bcrypt';
import { authorize, verifyToken } from '../middleware.js';
import ROLE from '../roles.js';

const router = express.Router();

//to create general admin use the GENERAL_ADMIN_CREATION_TOKEN from the env file on  the create route

const verifyCreationToken = (req, res, next) => {
	if (req.headers.authorization.split(' ')[1] === process.env.GENERAL_ADMIN_CREATION_TOKEN) {
		next();
	} else {
		res.sendStatus(401);
		return;
	}
};

router.post('/create', verifyCreationToken, async (req, res) => {
	try {
		const hashedPass = await bcrypt.hash(req.body.password, 10);
		const user = await createGeneralAdmin(req.body.email, hashedPass, req.body.firstName, req.body.lastName);
		if (user) {
			res.sendStatus(201);
		} else {
			res.sendStatus(409);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

export default router;
