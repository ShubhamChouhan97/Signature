import { useAppStore } from "../store";

export const useMessage = () => {
	const messageInstance = useAppStore().messageInstance;
	return messageInstance!;
};
