import express from 'express';
import { authorize, verifyToken } from '../middleware.js';
import ROLE from '../roles.js';
import bcrypt from 'bcrypt';
import { createAdmin, getAllAdmins } from '../../database/mongoStuff.js';

const router = express.Router();

router.post('/create', verifyToken, authorize(ROLE.GENERAL_ADMIN), async (req, res) => {
	const hashedPass = await bcrypt.hash(req.body.password, 10);
	const dbResponse = await createAdmin(req.body.email, hashedPass, req.body.firstName, req.body.lastName, req.body.city);
	if (dbResponse === 1) {
		res.sendStatus(201);
	} else if (dbResponse === -1) {
		res.status(409).send('Email already in use');
	} else if (dbResponse === 0) {
		res.status(409).send('This city already has an admin');
	} else {
		res.sendStatus(500);
	}
});

router.get('/all', verifyToken, authorize(ROLE.GENERAL_ADMIN), async (req, res) => {
	try {
		const admins = await getAllAdmins();
		res.send(
			admins.map((admin) => ({
				email: admin.email,
				firstName: admin.first_name,
				lastName: admin.last_name,
				city: admin.city,
				profileImg: admin.profile_pic_url,
			}))
		);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

export default router;
