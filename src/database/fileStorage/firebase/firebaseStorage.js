import { Storage } from '@google-cloud/storage';
import path from 'path';

// for __dirname 😑
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gcs = new Storage({
	keyFilename: path.join(__dirname, './fiicode-30e25-firebase-adminsdk-el3su-a1e57c6513.json'),
	projectId: process.env.FIREBASE_PROJECT_ID,
});

const firebaseBucket = gcs.bucket('fiicode-30e25.appspot.com');

export default firebaseBucket;
