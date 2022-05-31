import { Storage } from '@google-cloud/storage';
import path from 'path';

// for __dirname 😑
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gcs = new Storage({
	keyFilename: path.join(__dirname, './keys/fiicode-30e25-firebase-adminsdk-el3su-8505fda490.json'),
	projectId: process.env.FIREBASE_PROJECT_ID,
});

const firebaseBucket = gcs.bucket('fiicode-30e25.appspot.com');

export const createPersistentDownloadUrl = (pathToFile) => {
	return `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_BUCKET}/o/${encodeURIComponent(
		pathToFile
	)}?alt=media`;
};

export default firebaseBucket;
