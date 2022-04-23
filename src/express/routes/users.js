import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
	createUser,
	getProfilePictureUrl,
	getUserById,
	getUserByEmail,
	updateUserIdPicUrl,
	updateUser,
} from '../../database/mongoStuff.js';
import { authorize, verifyToken } from '../middleware.js';
import { writeFileIdPicture, writeFileProfilePicture } from '../../database/fileStorage/multerStuff.js';
import firebaseBucket from '../../database/fileStorage/firebase/firebaseStorage.js';
import { createPersistentDownloadUrl } from '../../database/fileStorage/firebase/firebaseStorage.js';
import ROLE from '../roles.js';
import { sendPassRecoverMail } from '../../mail/mail.js';

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
			ROLE.USER
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
					upvotedPosts: user.upvoted_posts,
					downvotedPosts: user.downvoted_posts,
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
						upvotedPosts: user.upvoted_posts,
						downvotedPosts: user.downvoted_posts,
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
			upvotedPosts: user.upvoted_posts,
			downvotedPosts: user.downvoted_posts,
		});
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

//for post user
router.get('/:id/full-name', async (req, res) => {
	try {
		const user = await getUserById(req.params.id);
		res.send({ firstName: user.first_name, lastName: user.last_name });
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
	try {
		if (req.params.id === 'undefined') {
			res.sendStatus(400);
		} else {
			const url = await getProfilePictureUrl(req.params.id);
			res.send(url);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.put('/profile-pic', verifyToken, writeFileProfilePicture.single('profile-pic'), async (req, res) => {
	try {
		firebaseBucket.file(`user-profilePics/${req._id}.jpg`).save(req.file.buffer);
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.put('/:field', verifyToken, async (req, res) => {
	//* field types: first-name | last-name | address | password
	try {
		const dbResponse = await updateUser(req._id, req.params.field, req.body.value);
		switch (dbResponse) {
			case 1:
				res.sendStatus(200);
				break;
			case 0:
				res.sendStatus(404);
				break;
			case 2: //* password too short
				res.sendStatus(400);
				break;
			default:
				res.sendStatus(500);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.post('/restore-password-email', async (req, res) => {
	try {
		const user = await getUserByEmail(req.body.email);
		if (user) {
			const token = jwt.sign(
				{
					_id: user._id,
				},
				process.env.JWT_SECRET,
				{ expiresIn: '1d' }
			);
			await sendPassRecoverMail(user.email, token);
			res.sendStatus(200);
		} else res.sendStatus(404);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

//verifies if token expired
router.get('/restore-password-valid', verifyToken, async (req, res) => {
	res.sendStatus(200);
});

router.post('/restore-password', verifyToken, async (req, res) => {
	try {
		const dbResponse = await updateUser(req._id, 'password', req.body.password);
		switch (dbResponse) {
			case 1:
				res.sendStatus(200);
				break;
			case 0:
				res.sendStatus(404);
				break;
			case 2: //* password too short
				res.sendStatus(400);
				break;
			default:
				res.sendStatus(500);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

export default router;
