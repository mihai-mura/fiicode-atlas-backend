import multer from 'multer';

const idStorage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, process.env.ID_PATH);
	},
	filename: (req, file, callback) => {
		callback(null, `${req._id}.jpg`);
	},
});

//* for local storage
// export const writeFileIdPicture = multer({
// 	storage: idStorage,
// 	limits: {
// 		fileSize: 1000000,
// 	},
// });
export const writeFileIdPicture = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 1000000,
	},
});

export const writeFilesPostContent = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10000000,
	},
});
