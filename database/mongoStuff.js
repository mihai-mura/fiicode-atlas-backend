import UserModel from './models/UserModel.js';
import PostModel from './models/PostModel.js';

export const createUser = async (email, username, password, firstName, lastName, address, role) => {
	try {
		const createdUser = await UserModel.create({
			email: email,
			username: username,
			password: password,
			first_name: firstName,
			last_name: lastName,
			address: { name: address },
			role: role,
		});
		return 1;
	} catch (error) {
		console.log(error.message);
		//! diferent error for existent username and email
		return error.code;
	}
};

export const createPost = async (title, description, user) => {
	try {
		const createdPost = await PostModel.create({
			title: title,
			description: description,
			user: user,
			status: 'sent',
		});
	} catch (error) {
		console.log(error);
		return 0;
	}
};
