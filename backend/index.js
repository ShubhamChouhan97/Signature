import { createServer } from 'http';
import argvMap from './app/libs/argvMap.js';
import './app/config/env.js';
import mongoose from './app/config/mongoose.js';

import { createSocketServer } from './app/config/socket.js';
import app, { sessionMiddleware } from './app/index.js';

const server = createServer(app);

const io = createSocketServer(server);
app.set("io", io);
io.engine.use(sessionMiddleware);

const port = argvMap.get('port') ?? 3000;

server.listen(port, (err) => {
    if (!err) {
        console.info(`Server Started at port ${port}`);
        return;
    }
    console.error(err);
    process.exit();
});
