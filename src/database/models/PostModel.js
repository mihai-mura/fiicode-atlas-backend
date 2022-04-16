import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		user: { type: String, required: true },
		city: { type: String, required: true },
		status: { type: String, default: 'sent' }, //sent | seen | in-progress | resolved
		upvotes: { type: Number, default: 0 },
		downvotes: { type: Number, default: 0 },
		file_urls: { type: Array, default: [] },
	},
	{
		collection: 'posts',
		versionKey: false,
		timestamps: true,
	}
);

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
