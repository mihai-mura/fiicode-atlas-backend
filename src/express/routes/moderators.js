import express from 'express';
import { getAdminCity, getAllModerators, createModerator, deleteModerator } from '../../database/mongoStuff.js';
import { verifyToken, authorize } from '../middleware.js';
import ROLE from '../roles.js';
import bcrypt from 'bcrypt';
import firebaseBucket from '../../database/fileStorage/firebase/firebaseStorage.js';

const router = express.Router();

router.post('/', verifyToken, authorize(ROLE.LOCAL_ADMIN), async (req, res) => {
	try {
		const hashedPass = await bcrypt.hash(req.body.password, 10);
		const city = await getAdminCity(req._id);
		const dbResponse = await createModerator(req.body.email, hashedPass, req.body.firstName, req.body.lastName, city);
		if (dbResponse === 1) {
			res.sendStatus(201);
		} else if (dbResponse === 0) {
			res.status(409).send('Email already in use');
		} else {
			res.sendStatus(500);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/all', verifyToken, authorize([ROLE.LOCAL_ADMIN, ROLE.GENERAL_ADMIN]), async (req, res) => {
	try {
		const city = await getAdminCity(req._id);
		const moderators = await getAllModerators(city);
		res.send(
			moderators.map((moderator) => ({
				_id: moderator._id,
				email: moderator.email,
				firstName: moderator.first_name,
				lastName: moderator.last_name,
				profileImg: moderator.profile_pic_url,
			}))
		);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.delete('/:id', verifyToken, authorize(ROLE.LOCAL_ADMIN), async (req, res) => {
	try {
		const dbResponse = await deleteModerator(req.params.id);
		await firebaseBucket.file(`user-profilePics/${req.params.id}.jpg`).delete();
		if (dbResponse.deletedCount !== 0) res.sendStatus(200);
		else res.sendStatus(404);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

export default router;
