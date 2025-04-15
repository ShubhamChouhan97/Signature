import { io } from "socket.io-client";
import { AppConfig } from "../../config";
export const socket = io(AppConfig.backendURL, {
	withCredentials: true,
});
socket.connect();
export default socket;
