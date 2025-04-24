import path, { dirname } from 'path';
import express from 'express';
import session from 'express-session';
import { RedisStore } from "connect-redis";

import router from './router/index.js';
import redis from './config/redis.js';
import cors from 'cors';
import { generateMongooseDuplicateKeyMessage } from './libs/utils.js';
const app = express();

const __dirname = import.meta.dirname;
const redisStore = new RedisStore({
	client: redis.duplicate(),
	prefix: "document:",
});

export const sessionMiddleware = session({
	store: redisStore,
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET || "keyboard cat",
	cookie: {
		domain: process.env.BASE_DOMAIN
	}
});
app.use(cors({
	origin: (origin, cb) => {
		return cb(null, origin);
	},
	credentials: true,
}))
// make uplaod static
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use('/SignedData',express.static(path.join(__dirname,"../SignedData")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use('/', router);

app.use((error, req, res, next) => {
	try {
		console.error(error);
		if (error.code === 11000) {
			return res.status(500).json({
				error: generateMongooseDuplicateKeyMessage(error),
			});
		}
		return res.status(500).json({
			error: 'Internal server error',
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: 'Internal server error',
		});
	}
});

export default app;