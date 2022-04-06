import multer from 'multer';
import multerGoogleStorage from 'multer-google-storage';

const idStorage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, process.env.ID_PATH);
	},
	filename: (req, file, callback) => {
		callback(null, `${req._id}.png`);
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
