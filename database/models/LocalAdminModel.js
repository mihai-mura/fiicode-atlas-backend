import mongoose from 'mongoose';

const localAdminSchema = new mongoose.Schema(
	{
		email: { type: String, required: true },
	},
	{
		versionKey: false,
		collection: 'local-admins',
	}
);

const LocalAdminModel = mongoose.model('LocalAdmin', localAdminSchema);
