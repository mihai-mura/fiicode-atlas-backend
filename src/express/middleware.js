import jwt from 'jsonwebtoken';
import { getUserRole } from '../database/mongoStuff.js';

export const verifyToken = async (req, res, next) => {
	if (!req.headers.authorization) return res.sendStatus(401);
	const token = req.headers.authorization.split(' ')[1];
	try {
		const user = jwt.verify(token, process.env.JWT_SECRET);
		req._id = user._id;
		next();
	} catch (error) {
		console.log(error);
		return res.sendStatus(401);
	}
};

export const authorize = (roles) => {
	return async (req, res, next) => {
		const role = await getUserRole(req._id);
		if (roles.includes(role)) {
			next();
		} else {
			return res.sendStatus(403);
		}
	};
};
