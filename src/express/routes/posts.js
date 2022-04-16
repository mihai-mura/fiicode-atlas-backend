import express from 'express';
import { verifyToken } from '../middleware.js';
import { addPostFileUrls, createPost, deletePostFileUrls } from '../../database/mongoStuff.js';
import { writeFilesPostContent } from '../../database/fileStorage/multerStuff.js';
import firebaseBucket, { createPersistentDownloadUrl } from '../../database/fileStorage/firebase/firebaseStorage.js';

const router = express.Router();

router.post('/create', verifyToken, async (req, res) => {
	try {
		const dbResponse = await createPost(req.body.title, req.body.description, req._id, req.body.city);
		if (dbResponse) res.status(201).send(dbResponse._id);
		else res.sendStatus(500);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.post('/create/files/:id', verifyToken, writeFilesPostContent.any(), async (req, res) => {
	try {
		//deletes the previous url array and verifies if post exists
		const post = await deletePostFileUrls(req.params.id);
		if (post) {
			req.files.forEach(async (file, index) => {
				// post filename template: postId_order_originalFileName.jpg/mp4
				firebaseBucket.file(`post-files/${req.params.id}_${index}_${file.originalname}`).save(file.buffer);
				const downloadUrl = createPersistentDownloadUrl(`post-files/${req.params.id}_${index}_${file.originalname}`);
				await addPostFileUrls(req.params.id, downloadUrl);
			});
			res.sendStatus(200);
		} else {
			res.sendStatus(400);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

export default router;
