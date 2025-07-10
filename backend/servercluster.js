import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';

const numCPUs = availableParallelism();

//console.log("number of cpu",numCPUs);
// server import 
import { createServer } from 'http';
import argvMap from './app/libs/argvMap.js';
import './app/config/env.js';
import mongoose from './app/config/mongoose.js';

import { createSocketServer } from './app/config/socket.js';
import app, { sessionMiddleware } from './app/index.js';

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
} else {
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
 // console.log(`Worker ${process.pid} started`);
}