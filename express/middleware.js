import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
	if (!req.headers.authorization) return res.sendStatus(401);
	const token = req.headers.authorization.split(' ')[1];
	try {
		const user = jwt.verify(token, process.env.JWT_SECRET);
		req._id = user._id;
		next();
	} catch (error) {
		console.log(`!ERROR!${error.message}`);
		return res.sendStatus(401);
	}
};
