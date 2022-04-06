import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		user: { type: String, required: true },
		city: { type: String, required: true },
		upvotes: { type: Number, default: 0 },
		downvotes: { type: Number, default: 0 },
		status: { type: String, required: true }, //sent | seen | in-progress | resolved
	},
	{
		collection: 'posts',
		versionKey: false,
		timestamps: true,
	}
);

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
