import UserModel from './models/UserModel.js';
import PostModel from './models/PostModel.js';
import createProfilePic from './fileStorage/createProfilePic.js';
import bcrypt from 'bcrypt';
import ROLE from '../express/roles.js';

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

export const getUserEmailFromPost = async (postId) => {
	const post = await PostModel.findById(postId);
	const user = await UserModel.findById(post.user);
	return user.email;
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

export const getUnverifiedUsers = async (city) => {
	const users = await UserModel.find({ 'address.verified': false, city }).select({
		email: 1,
		first_name: 1,
		last_name: 1,
		address: 1,
		profile_pic_url: 1,
		city: 1,
	});
	return users;
};

export const isVerified = async (_id) => {
	const user = await UserModel.findById(_id).select({ address: 1 });
	return user.address.verified;
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
			await UserModel.findByIdAndUpdate(_id, { 'address.name': data });
			return 1;
		case 'password':
			if (data.length < 8) {
				return 2; //password too short
			} else {
				const hashedPass = await bcrypt.hash(data, 10);
				await UserModel.findByIdAndUpdate(_id, { password: hashedPass });
				return 1;
			}
		case 'verified':
			await UserModel.findByIdAndUpdate(_id, { 'address.verified': true });
			await UserModel.findByIdAndUpdate(_id, { 'address.id_url': '' });
			return 1;
		default:
			return 0;
	}
};

export const deleteUser = async (_id) => {
	const user = await UserModel.findByIdAndDelete(_id);
	if (user) return 1;
	else return 0;
};

//----------------------------------------------------------------------------------------------

export const createGeneralAdmin = async (email, password, firstName, lastName) => {
	//find if general admin already exists
	const generalAdmin = await UserModel.findOne({ role: ROLE.GENERAL_ADMIN });
	if (generalAdmin) {
		return null;
	} else {
		const upperFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
		const upperLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
		const createdUser = await UserModel.create({
			email: email,
			password: password,
			first_name: upperFirstName,
			last_name: upperLastName,
			upvoted_posts: null,
			downvoted_posts: null,
			role: ROLE.GENERAL_ADMIN,
		});
		const profilePicURL = await createProfilePic(createdUser._id, createdUser.first_name, createdUser.last_name);
		await UserModel.findByIdAndUpdate(createdUser._id, { profile_pic_url: profilePicURL });
		return createdUser;
	}
};

export const getGeneralAdmin = async () => {
	const generalAdmin = await UserModel.findOne({ role: ROLE.GENERAL_ADMIN });
	return generalAdmin;
};

//----------------------------------------------------------------------------------------------

//returns 0 if admin exists on specified city | 1 if admin created | -1 if admin with same email already exists | null if error
export const createAdmin = async (email, password, firstName, lastName, city) => {
	//verify if admin  with that city already exists
	const localAdmin = await UserModel.findOne({ role: ROLE.LOCAL_ADMIN, city: city });
	if (localAdmin) {
		return 0;
	} else {
		const upperFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
		const upperLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
		try {
			const createdUser = await UserModel.create({
				email: email,
				password: password,
				first_name: upperFirstName,
				last_name: upperLastName,
				upvoted_posts: null,
				downvoted_posts: null,
				role: ROLE.LOCAL_ADMIN,
				city: city,
			});
			const profilePicURL = await createProfilePic(createdUser._id, createdUser.first_name, createdUser.last_name);
			await UserModel.findByIdAndUpdate(createdUser._id, { profile_pic_url: profilePicURL });
			return 1;
		} catch (error) {
			console.log(error);
			if (error.code === 11000) {
				return -1;
			} else {
				return null;
			}
		}
	}
};

export const getAllAdmins = async () => {
	const admins = await UserModel.find({ role: ROLE.LOCAL_ADMIN });
	return admins;
};
export const getUserCity = async (_id) => {
	const user = await UserModel.findById(_id).select({ _id: 0, city: 1 });
	return user.city;
};

export const deleteAdmin = async (_id) => {
	const res = await UserModel.deleteOne({ _id });
	return res;
};

//----------------------------------------------------------------------------------------------

//returns 0 if moderator with same email already exists | 1 if moderator created | null if error
export const createModerator = async (email, password, firstName, lastName, city) => {
	const upperFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
	const upperLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
	try {
		const createdUser = await UserModel.create({
			email: email,
			password: password,
			first_name: upperFirstName,
			last_name: upperLastName,
			upvoted_posts: null,
			downvoted_posts: null,
			role: ROLE.MODERATOR,
			city: city,
		});
		const profilePicURL = await createProfilePic(createdUser._id, createdUser.first_name, createdUser.last_name);
		await UserModel.findByIdAndUpdate(createdUser._id, { profile_pic_url: profilePicURL });
		return 1;
	} catch (error) {
		console.log(error);
		if (error.code === 11000) {
			return 0;
		} else {
			return null;
		}
	}
};

export const getAllModerators = async (city) => {
	const admins = await UserModel.find({ role: ROLE.MODERATOR, city });
	return admins;
};

export const deleteModerator = async (_id) => {
	const res = await UserModel.deleteOne({ _id });
	return res;
};

//----------------------------------------------------------------------------------------------

export const createPost = async (title, description, user, city) => {
	const createdPost = await PostModel.create({
		title: title,
		description: description,
		user: user,
		city: city,
	});
	return createdPost;
};

export const getAllPosts = async (limit = null, startIndex = 0, sort = 'date') => {
	if (limit === null) {
		const posts = await PostModel.find({ verified: true });
		return posts;
	}
	let posts;
	switch (sort) {
		case 'date':
			posts = await PostModel.find({ verified: true }).sort({ createdAt: -1 }).limit(limit).skip(startIndex);
			break;
		case 'upvotes':
			posts = await PostModel.aggregate([
				{ $match: { verified: true } },
				{
					$project: {
						_id: 1,
						title: 1,
						description: 1,
						user: 1,
						city: 1,
						status: 1,
						upvotes: 1,
						downvotes: 1,
						favourite_by: 1,
						file_urls: 1,
						verified: 1,
						createdAt: 1,
						updatedAt: 1,
						upvotesl: { $size: '$upvotes' },
					},
				},
				{ $sort: { upvotesl: -1 } },
				{ $skip: startIndex },
				{ $limit: limit },
			]);
			break;
		case 'downvotes':
			posts = await PostModel.aggregate([
				{ $match: { verified: true } },
				{
					$project: {
						_id: 1,
						title: 1,
						description: 1,
						user: 1,
						city: 1,
						status: 1,
						upvotes: 1,
						downvotes: 1,
						favourite_by: 1,
						file_urls: 1,
						verified: 1,
						createdAt: 1,
						updatedAt: 1,
						downvotesl: { $size: '$downvotes' },
					},
				},
				{ $sort: { downvotesl: -1 } },
				{ $skip: startIndex },
				{ $limit: limit },
			]);
			break;
		case 'sent':
			posts = await PostModel.find({ verified: true, status: 'sent' })
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(startIndex);
			break;
		case 'seen':
			posts = await PostModel.find({ verified: true, status: 'seen' })
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(startIndex);
			break;
		case 'in-progress':
			posts = await PostModel.find({ verified: true, status: 'in-progress' })
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(startIndex);
			break;
		case 'resolved':
			posts = await PostModel.find({ verified: true, status: 'resolved' })
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(startIndex);
			break;

		default:
			posts = await PostModel.find({ verified: true }).sort({ createdAt: -1 }).limit(limit).skip(startIndex);
			break;
	}
	return posts;
};

export const getUserPosts = async (_id) => {
	const posts = await PostModel.find({ user: _id }).sort({ createdAt: -1 });
	return posts;
};

export const getFavouritePosts = async (_id) => {
	const posts = await PostModel.find({ favourite_by: _id });
	return posts;
};

export const getUnverifiedPosts = async (city) => {
	const posts = await PostModel.find({ verified: false, city });
	return posts;
};

export const getCityPosts = async (city, sort = 'date') => {
	let posts;
	switch (sort) {
		case 'date':
			posts = await PostModel.find({ city }).sort({ createdAt: -1 });
			break;
		case 'upvotes':
			posts = await PostModel.find({ city }).sort({ upvotes: -1, createdAt: -1 });
			break;
		case 'downvotes':
			posts = await PostModel.find({ city }).sort({ downvotes: -1, createdAt: -1 });
			break;
		case 'sent':
			posts = await PostModel.find({ city, status: 'sent' }).sort({ createdAt: -1 });
			break;
		case 'seen':
			posts = await PostModel.find({ city, status: 'seen' }).sort({ createdAt: -1 });
			break;
		case 'in-progress':
			posts = await PostModel.find({ city, status: 'in-progress' }).sort({ createdAt: -1 });
			break;
		case 'resolved':
			posts = await PostModel.find({ city, status: 'resolved' }).sort({ createdAt: -1 });
			break;

		default:
			posts = await PostModel.find({ city }).sort({ createdAt: -1 });
			break;
	}
	return posts;
};

export const getPostByID = async (_id) => {
	const post = await PostModel.findById(_id);
	return post;
};

export const addPostFileUrls = async (_id, url) => {
	await PostModel.findByIdAndUpdate(_id, { $push: { file_urls: url } });
};

//* returns 0 if no post found | 1 if added upvote and removed downvote | -1 if already upvoted and has removed the upvote
export const upvotePost = async (postId, user) => {
	const post = await PostModel.findById(postId);
	if (!post) {
		return 0;
	}
	//find if user has already upvoted
	if (post.upvotes.includes(user)) {
		//remove upvote
		await PostModel.findByIdAndUpdate(postId, { $pull: { upvotes: user } });
		await UserModel.findByIdAndUpdate(user, { $pull: { upvoted_posts: postId } });
		return -1;
	}
	//add post id to user's upvoted posts and user id to post's upvotes
	await PostModel.findByIdAndUpdate(postId, { $push: { upvotes: user } });
	await UserModel.findByIdAndUpdate(user, { $push: { upvoted_posts: postId } });

	//find if user has downvoted post
	const downvotes = post.downvotes;
	const index = downvotes.indexOf(user);
	if (index > -1) {
		downvotes.splice(index, 1);
		await PostModel.findByIdAndUpdate(postId, { downvotes: downvotes });
		//remove post from user's downvoted posts
		await UserModel.findByIdAndUpdate(user, { $pull: { downvoted_posts: postId } });
		return 1;
	}
};

//* returns 0 if no post found | 1 if added upvote and removed downvote | -1 if already upvoted and has removed the upvote
export const downvotePost = async (postId, user) => {
	const post = await PostModel.findById(postId);
	if (!post) {
		return 0;
	}
	//find if user has already downvoted
	if (post.downvotes.includes(user)) {
		//remove downvote
		await PostModel.findByIdAndUpdate(postId, { $pull: { downvotes: user } });
		await UserModel.findByIdAndUpdate(user, { $pull: { downvoted_posts: postId } });
		return -1;
	}
	//add post id to user's downvoted posts
	await UserModel.findByIdAndUpdate(user, { $push: { downvoted_posts: postId } });
	await PostModel.findByIdAndUpdate(postId, { $push: { downvotes: user } });

	//find if user has upvoted post
	const upvotes = post.upvotes;
	const index = upvotes.indexOf(user);
	if (index > -1) {
		upvotes.splice(index, 1);
		await PostModel.findByIdAndUpdate(postId, { upvotes: upvotes });
		//remove post from user's upvoted posts
		await UserModel.findByIdAndUpdate(user, { $pull: { upvoted_posts: postId } });
		return 1;
	}
};

//* returns 0 if no post found | 1 if added to favourites | -1 if removed from favourites
export const favouritePost = async (postId, user) => {
	//post can be added to favourites by the creator if it isn't verified
	const post =
		(await PostModel.findOne({ _id: postId, verified: true })) || (await PostModel.findOne({ _id: postId, user: user }));
	if (!post) {
		return 0;
	}
	if (post.favourite_by.includes(user)) {
		//remove favourite
		await PostModel.findByIdAndUpdate(postId, { $pull: { favourite_by: user } });
		await UserModel.findByIdAndUpdate(user, { $pull: { favourite_posts: postId } });
		return -1;
	}
	await PostModel.findByIdAndUpdate(postId, { $push: { favourite_by: user } });
	await UserModel.findByIdAndUpdate(user, { $push: { favourite_posts: postId } });
	return 1;
};

export const changePostStatus = async (postId, status) => {
	const post = await PostModel.findByIdAndUpdate(postId, { status: status });
	if (!post) {
		return 0;
	}
	return 1;
};

export const editPost = async (postId, userId, title, description) => {
	//returns 1 if success | 0 if no post | -1 if access denied
	const post = await PostModel.findById(postId);
	if (!post) return 0;
	if (post?.user === userId) {
		await PostModel.findByIdAndUpdate(postId, { title, description });
		return 1;
	} else return -1;
};

export const verifyPost = async (id) => {
	await PostModel.findByIdAndUpdate(id, { verified: true });
};

export const deletePostFileUrls = async (_id) => {
	const post = await PostModel.findByIdAndUpdate(_id, { file_urls: [] });
	return post;
};

export const deletePost = async (postId, userId = null) => {
	//returns 1 if success | 0 if no post | -1 if access denied
	const post = await PostModel.findById(postId);
	if (!post) return 0;
	if (post?.user === userId || userId === null) {
		await PostModel.findByIdAndDelete(postId);
		return 1;
	} else return -1;
};
