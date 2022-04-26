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
		fileSize: 3145728, //3mb
	},
});
export const writeFileProfilePicture = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 1048576, //1mb
	},
});

export const writeFilesPostContent = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10485760, //10mb
	},
});
