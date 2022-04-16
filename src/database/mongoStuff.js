import UserModel from './models/UserModel.js';
import PostModel from './models/PostModel.js';
import createProfilePic from './fileStorage/profilePictures/createProfilePic.js';
import bcrypt from 'bcrypt';

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

export const updateUser = async (_id, field, data) => {
	switch (field) {
		case 'first-name':
			await UserModel.findByIdAndUpdate(_id, { first_name: data.charAt(0).toUpperCase() + data.slice(1) });
			return 1;
		case 'last-name':
			await UserModel.findByIdAndUpdate(_id, { last_name: data.charAt(0).toUpperCase() + data.slice(1) });
			return 1;
		case 'address':
			await UserModel.findByIdAndUpdate(_id, { ['address.name']: data });
			return 1;
		case 'password':
			if (data.length < 8) {
				return 2; //password too short
			} else {
				const hashedPass = await bcrypt.hash(data, 10);
				await UserModel.findByIdAndUpdate(_id, { password: hashedPass });
				return 1;
			}
		default:
			return 0;
	}
};

export const createPost = async (title, description, user, city) => {
	const createdPost = await PostModel.create({
		title: title,
		description: description,
		user: user,
		city: city,
	});
	return createdPost;
};

export const addPostFileUrls = async (_id, url) => {
	await PostModel.findByIdAndUpdate(_id, { $push: { file_urls: url } });
};

export const deletePostFileUrls = async (_id) => {
	const post = await PostModel.findByIdAndUpdate(_id, { file_urls: [] });
	return post;
};
