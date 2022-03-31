import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import express from 'express';
import userRouter from './express/routes/users.js';
import postRouter from './express/routes/posts.js';

dotenv.config();

const app = express();

app.listen(process.env.EXPRESS_PORT, () => {
	console.log(`express listening on port ${process.env.EXPRESS_PORT}`);
});

mongoose.connect(process.env.MONGO_URI, (error) => {
	if (error) console.log(error.message);
	else console.log('connected to db');
});

app.use(cors({ origin: '*' }));
app.use(express.json());

//routes
app.use('/users', userRouter);
app.use('/posts', postRouter);
