import UserModel from './models/UserModel.js';
import PostModel from './models/PostModel.js';
import createProfilePic from './fileStorage/profilePictures/createProfilePic.js';

export const createUser = async (email, password, firstName, lastName, city, address, role) => {
	try {
		//first letter capitalized
		const upperFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
		const upperLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
		const createdUser = await UserModel.create({
			email: email,
			password: password,
			first_name: upperFirstName,
			last_name: upperLastName,
			city: city,
			address: { name: address },
			role: role,
		});
		createProfilePic(createdUser._id, createdUser.first_name, createdUser.last_name);
		return createdUser._id;
	} catch (error) {
		console.log(error);
		return error.code;
	}
};

export const getUserByEmail = async (email) => {
	const user = await UserModel.findOne({ email: email });
	return user;
};

export const createPost = async (title, description, user, city) => {
	//!pictures and videos
	try {
		const createdPost = await PostModel.create({
			title: title,
			description: description,
			user: user,
			city: city,
			status: 'sent',
		});
		return 1;
	} catch (error) {
		console.log(error);
		return 0;
	}
};
