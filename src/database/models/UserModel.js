import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
	{
		name: String,
		id_url: { type: String, default: null },
		verified: { type: Boolean, default: false },
	},
	{
		versionKey: false,
		timestamps: false,
		_id: false,
	}
);

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		first_name: { type: String, required: true },
		last_name: { type: String, required: true },
		city: { type: String, required: true },
		address: { type: addressSchema, default: null },
		profile_pic_url: { type: String, default: null },
		role: { type: String, required: true }, //  user | moderator | local-admin
	},
	{
		versionKey: false,
		collection: 'users',
		timestamps: false,
	}
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
