import nodeCanvas from 'canvas';
import firebaseBucket from '../firebase/firebaseStorage.js';
import fs from 'fs';
import { createPersistentDownloadUrl } from '../firebase/firebaseStorage.js';

//default bgc for profile pictures
const colors = [
	'#2a9d8f',
	'#e9c46a',
	'#f4a261',
	'#e76f51',
	'#fca311',
	'#d62828',
	'#eae2b7',
	'#ef476f',
	'#ffd166',
	'#06d6a0',
	'#118ab2',
	'#00ffe1',
	'#f578b9',
	'#aaa5a5',
	'#ff4164',
	'#ebe673',
	'#9bb996',
];

const { createCanvas } = nodeCanvas;

const createProfilePic = async (_id, firstName, lastName) => {
	const canvas = createCanvas(360, 360);
	const context = canvas.getContext('2d');

	//bgc
	context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
	context.fillRect(0, 0, 360, 360);

	//initials
	context.fillStyle = '#000';
	context.font = '120px Arial';
	context.textAlign = 'center';
	context.fillText(`${firstName.charAt(0)}${lastName.charAt(0)}`, 180, 220);

	const buffer = canvas.toBuffer('image/png');
	// fs.writeFileSync(`${process.env.PROFILE_PIC_PATH}/${_id}.jpg`, buffer); //* for local storage
	firebaseBucket.file(`user-profilePics/${_id}.jpg`).save(buffer);
	const downloadUrl = createPersistentDownloadUrl(`user-profilePics/${_id}.jpg`);
	return downloadUrl;
};

export default createProfilePic;
