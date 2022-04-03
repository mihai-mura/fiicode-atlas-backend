import multer from 'multer';

const idStorage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, process.env.ID_PATH);
	},
	filename: (req, file, callback) => {
		callback(null, `${req._id}.png`);
	},
});

export const writeFileIdPicture = multer({
	storage: idStorage,
	limits: {
		fileSize: 3000000, //! change for compresed id pic
	},
});
