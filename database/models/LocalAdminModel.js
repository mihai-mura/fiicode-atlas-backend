import mongoose from 'mongoose';

const localAdminSchema = new mongoose.Schema(
	{
		email: { type: String, required: true },
		first_name: { type: String, required: true },
		last_name: { type: String, required: true },
	},
	{
		versionKey: false,
		collection: 'local-admins',
	}
);

const LocalAdminModel = mongoose.model('LocalAdmin', localAdminSchema);

export default LocalAdminModel;
