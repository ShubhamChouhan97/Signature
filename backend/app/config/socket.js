import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import redis from './redis.js';

const pubClient = redis.duplicate();
const subClient = pubClient.duplicate();

/**
 * @type {Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>}
 */
export let io = null;

export function createSocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
            preflightContinue: true,
        },
        adapter: createAdapter(pubClient, subClient)
    });

    io.on("connection", (socket) => {
        if (!socket.request.session.userId) {
            return socket.disconnect();
        }
        socket.join(socket.request.session.userId);
    });

    return io;
}


export default { io };
