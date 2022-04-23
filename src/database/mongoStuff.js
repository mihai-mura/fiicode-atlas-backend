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

export const getPosts = async () => {
	const posts = await PostModel.find({});
	return posts;
};

export const addPostFileUrls = async (_id, url) => {
	await PostModel.findByIdAndUpdate(_id, { $push: { file_urls: url } });
};

export const upvotePost = async (postId, user) => {
	const res = await PostModel.findByIdAndUpdate(postId, { $push: { upvotes: user } });
	if (!res) {
		return 0; // post doesn't exist
	}
	//find if user has already upvoted
	if (res.upvotes.includes(user)) {
		//remove upvote
		await PostModel.findByIdAndUpdate(postId, { $pull: { upvotes: user } });
		await UserModel.findByIdAndUpdate(user, { $pull: { upvoted_posts: postId } });
		return -1; //already upvoted
	}
	//find if user has downvoted post
	const post = await PostModel.findById(postId);
	const downvotes = post.downvotes;
	const index = downvotes.indexOf(user);
	if (index > -1) {
		downvotes.splice(index, 1);
		await PostModel.findByIdAndUpdate(postId, { downvotes: downvotes });
		//remove post from user's downvoted posts
		await UserModel.findByIdAndUpdate(user, { $pull: { downvoted_posts: postId } });
	}
	//add post id to user's upvoted posts
	await UserModel.findByIdAndUpdate(user, { $push: { upvoted_posts: postId } });
};

export const downvotePost = async (postId, user) => {
	const res = await PostModel.findByIdAndUpdate(postId, { $push: { downvotes: user } });
	if (!res) {
		return 0; // post doesn't exist
	}
	//find if user has already downvoted
	if (res.downvotes.includes(user)) {
		//remove downvote
		await PostModel.findByIdAndUpdate(postId, { $pull: { downvotes: user } });
		await UserModel.findByIdAndUpdate(user, { $pull: { downvoted_posts: postId } });
		return -1; //already downvoted
	}
	//find if user has upvoted post
	const post = await PostModel.findById(postId);
	const upvotes = post.upvotes;
	const index = upvotes.indexOf(user);
	if (index > -1) {
		upvotes.splice(index, 1);
		await PostModel.findByIdAndUpdate(postId, { upvotes: upvotes });
		//remove post from user's upvoted posts
		await UserModel.findByIdAndUpdate(user, { $pull: { upvoted_posts: postId } });
	}
	//add post id to user's downvoted posts
	await UserModel.findByIdAndUpdate(user, { $push: { downvoted_posts: postId } });
};

export const deletePostFileUrls = async (_id) => {
	const post = await PostModel.findByIdAndUpdate(_id, { file_urls: [] });
	return post;
};
