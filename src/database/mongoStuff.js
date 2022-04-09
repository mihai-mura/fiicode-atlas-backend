import UserModel from './models/UserModel.js';
import PostModel from './models/PostModel.js';
import createProfilePic from './fileStorage/profilePictures/createProfilePic.js';

export const createUser = async (email, password, firstName, lastName, city, addressName, role) => {
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
			address: { name: addressName },
			role: role,
		});
		console.log(createdUser);
		const profilePicURL = await createProfilePic(createdUser._id, createdUser.first_name, createdUser.last_name);
		await UserModel.findByIdAndUpdate(createdUser._id, { profile_pic_url: profilePicURL });
		return createdUser;
	} catch (error) {
		console.log(error);
		return error.code;
	}
};

export const getUserById = async (_id) => {
	const user = await UserModel.findById(_id);
	console.log(user);
	return user;
};

export const getUserByEmail = async (email) => {
	const user = await UserModel.findOne({ email: email });
	return user;
};

export const getUserRole = async (_id) => {
	const role = await UserModel.findById(_id).select({ role: 1, _id: 0 });
	return role.role;
};

export const getProfilePictureUrl = async (_id) => {
	const url = await UserModel.findById(_id).select({ profile_pic_url: 1, _id: 0 });
	return url.profile_pic_url;
};

export const updateUserIdPicUrl = async (_id, idPicUrl) => {
	await UserModel.findByIdAndUpdate(_id, { 'address.id_url': idPicUrl });
};

export const createPost = async (title, description, user, city) => {
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
