import express from 'express';
import { authorize, verifyToken } from '../middleware.js';
import {
	addPostFileUrls,
	changePostStatus,
	createPost,
	deletePost,
	deletePostFileUrls,
	downvotePost,
	editPost,
	getCityPosts,
	getPostByID,
	getPosts,
	getUserPosts,
	isVerified,
	upvotePost,
} from '../../database/mongoStuff.js';
import { writeFilesPostContent } from '../../database/fileStorage/multerStuff.js';
import firebaseBucket, { createPersistentDownloadUrl } from '../../database/fileStorage/firebase/firebaseStorage.js';
import ROLE from '../roles.js';

const router = express.Router();

router.post('/create', verifyToken, async (req, res) => {
	try {
		//check if user is verified
		const verified = await isVerified(req._id);
		if (!verified) res.sendStatus(401);
		else {
			const dbResponse = await createPost(req.body.title, req.body.description, req._id, req.body.city);
			if (dbResponse) res.status(201).send({ postId: dbResponse._id });
			else res.sendStatus(500);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.post('/create/files/:postId', verifyToken, writeFilesPostContent.any(), async (req, res) => {
	try {
		if (req.files.length > 4) {
			res.status(400).send('You can only upload up to 4 files');
			return;
		}

		//deletes the previous url array & firebase files and verifies if post exists
		const post = await deletePostFileUrls(req.params.postId);
		const files = await firebaseBucket.getFiles();
		const filesToDelete = files[0].filter((file) => file.name.includes(`post-files/${req.params.postId}`));
		filesToDelete.forEach(async (file) => {
			await file.delete();
		});

		if (post) {
			req.files.forEach(async (file, index) => {
				// post filename template: postId_order_originalFileName.jpg/mp4
				firebaseBucket.file(`post-files/${req.params.postId}_${index}_${file.originalname}`).save(file.buffer);
				const downloadUrl = createPersistentDownloadUrl(`post-files/${req.params.postId}_${index}_${file.originalname}`);
				await addPostFileUrls(req.params.postId, downloadUrl);
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

router.put('/edit/:id', verifyToken, async (req, res) => {
	try {
		const dbResponse = await editPost(req.params.id, req._id, req.body.title, req.body.description);
		switch (dbResponse) {
			case 1:
				res.sendStatus(200);
				break;
			case 0:
				res.sendStatus(404);
				break;
			case -1:
				res.sendStatus(403);
				break;
			default:
				res.sendStatus(500);
				break;
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.put('/status', verifyToken, authorize(ROLE.LOCAL_ADMIN), async (req, res) => {
	try {
		switch (req.body.status) {
			case 'sent':
				const dbResponse = await changePostStatus(req.body.id, 'sent');
				if (dbResponse) res.sendStatus(200);
				else if (!dbResponse) res.sendStatus(404);
				break;
			case 'seen':
				const dbResponse2 = await changePostStatus(req.body.id, 'seen');
				if (dbResponse2) res.sendStatus(200);
				else if (!dbResponse2) res.sendStatus(404);
				break;
			case 'in-progress':
				const dbResponse3 = await changePostStatus(req.body.id, 'in-progress');
				if (dbResponse3) res.sendStatus(200);
				else if (!dbResponse3) res.sendStatus(404);
				break;
			case 'resolved':
				const dbResponse4 = await changePostStatus(req.body.id, 'resolved');
				if (dbResponse4) res.sendStatus(200);
				else if (!dbResponse4) res.sendStatus(404);
				break;
			default:
				res.sendStatus(400);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

//this route can also be called to remove upvotes
router.put('/upvote/:postId', verifyToken, authorize(ROLE.USER), async (req, res) => {
	try {
		const dbResponse = await upvotePost(req.params.postId, req._id);
		switch (dbResponse) {
			case 0:
				res.sendStatus(404);
				break;
			case -1:
				res.send('removed upvote');
				break;
			case 1:
				res.send('added upvote and removed downvote');
				break;
			default:
				res.send('added upvote');
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

//this route can also be called to remove downvotes
router.put('/downvote/:postId', verifyToken, authorize(ROLE.USER), async (req, res) => {
	try {
		const dbResponse = await downvotePost(req.params.postId, req._id);
		switch (dbResponse) {
			case 0:
				res.sendStatus(404);
				break;
			case -1:
				res.send('removed downvote');
				break;
			case 1:
				res.send('added downvote and removed upvote');
				break;
			default:
				res.send('added downvote');
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/all', async (req, res) => {
	try {
		const posts = await getPosts();
		res.send(posts);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/user/all', verifyToken, async (req, res) => {
	try {
		const posts = await getUserPosts(req._id);
		if (!posts) res.sendStatus(404);
		else res.send(posts);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/city/:city', async (req, res) => {
	try {
		const posts = await getCityPosts(req.params.city);
		res.send(posts);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/:id', async (req, res) => {
	try {
		const post = await getPostByID(req.params.id);
		if (post) res.send(post);
		else res.sendStatus(404);
	} catch (error) {
		console.log(error);
		if (error.kind === 'ObjectId') res.sendStatus(404);
		else res.sendStatus(500);
	}
});

router.delete('/:id', verifyToken, async (req, res) => {
	try {
		const dbResponse = await deletePost(req.params.id, req._id);
		switch (dbResponse) {
			case 1:
				res.sendStatus(200);
				break;
			case 0:
				res.sendStatus(404);
				break;
			case -1:
				res.sendStatus(403);
				break;
			default:
				res.sendStatus(500);
				break;
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

export default router;
