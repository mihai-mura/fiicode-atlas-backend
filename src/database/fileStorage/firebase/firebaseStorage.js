import { Storage } from '@google-cloud/storage';

const gcs = new Storage({
	keyFilename: process.env.FIREBASE_CREDENTIALS_PATH,
	projectId: process.env.FIREBASE_PROJECT_ID,
});

const firebaseBucket = gcs.bucket('fiicode-30e25.appspot.com');

export default firebaseBucket;
