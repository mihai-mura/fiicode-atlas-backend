import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getProfilePictureUrl, getUserById, getUserByEmail, updateUserIdPicUrl } from '../../database/mongoStuff.js';
import { authorize, verifyToken } from '../middleware.js';
import { writeFileIdPicture } from '../../database/fileStorage/multerStuff.js';
import firebaseBucket from '../../database/fileStorage/firebase/firebaseStorage.js';
import { createPersistentDownloadUrl } from '../../database/fileStorage/firebase/firebaseStorage.js';

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const hashedPass = await bcrypt.hash(req.body.password, 10);
		const user = await createUser(
			req.body.email,
			hashedPass,
			req.body.firstName,
			req.body.lastName,
			req.body.city,
			req.body.address,
			'user'
		);
		if (user === 11000) {
			//* duplicate error
			res.status(409).send('email already in use');
		} else {
			//* dbResponse is the user _id
			const token = jwt.sign(
				{
					_id: user._id,
				},
				process.env.JWT_SECRET
			);
			res.status(201).send({
				token,
				user: {
					_id: user._id,
					email: user.email,
					firstName: user.first_name,
					lastName: user.last_name,
					city: user.city,
					address: user.address.name,
					role: user.role,
				},
			});
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.post('/register/id', verifyToken, writeFileIdPicture.single('idPic'), async (req, res) => {
	try {
		firebaseBucket.file(`user-IDs/${req._id}.jpg`).save(req.file.buffer);
		const downloadUrl = createPersistentDownloadUrl(`user-IDs/${req._id}.jpg`);
		await updateUserIdPicUrl(req._id, downloadUrl);
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.post('/login', async (req, res) => {
	try {
		const user = await getUserByEmail(req.body.email);
		if (user) {
			if (await bcrypt.compare(req.body.password, user.password)) {
				const token = jwt.sign(
					{
						_id: user._id,
					},
					process.env.JWT_SECRET
				);
				res.send({
					token,
					user: {
						_id: user._id,
						email: user.email,
						firstName: user.first_name,
						lastName: user.last_name,
						city: user.city,
						address: user.address.name,
						role: user.role,
					},
				});
			} else res.sendStatus(403);
		} else res.sendStatus(404);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/', verifyToken, async (req, res) => {
	try {
		const user = await getUserById(req._id);
		res.send({
			_id: user._id,
			email: user.email,
			firstName: user.first_name,
			lastName: user.last_name,
			city: user.city,
			address: user.address.name,
			role: user.role,
		});
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

//* for local storage
// router.get('/profile-pic/:id', (req, res) => {
// 	const _id = req.params.id;
// 	res.sendFile(`${process.env.PROFILE_PIC_PATH}/${_id}.jpg`);
// });
router.get('/profile-pic/:id', async (req, res) => {
	const url = await getProfilePictureUrl(req.params.id);
	if (url) {
		res.send(url);
	} else {
		res.sendStatus(204);
	}
});

export default router;
