import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { MainClient } from "../../client/quiz-client";
import { MessageInstance } from "antd/es/message/interface";
import { rolesMap } from "../../libs/statusMap";

interface TestStoreState {
	session: Session | null;
	appLoading: boolean;
	messageInstance: MessageInstance | null;
	init: () => Promise<void>;
	setAppLoading: (_state: boolean) => void;
	getRole: (_role: number) => string;
	setMessageInstance: (_message: MessageInstance) => void;
}

export const createAppStore = (client: MainClient) => {
	const initialValues: TestStoreState = {
		session: null,
		appLoading: false,
		messageInstance: null,
		init: async () => {},
		setAppLoading: () => {},
		setMessageInstance: () => {},
		getRole: (role: number) => rolesMap[role as keyof typeof rolesMap],
	};

	return create<TestStoreState>()(
		immer((set, get) => ({
			...initialValues,
			async init() {
				const session = await client.getSession();
				set({
					session: session,
				});
			},
			setAppLoading(state) {
				set((appState) => {
					appState.appLoading = state;
					return appState;
				});
			},
			setMessageInstance(instance) {
				if (get().messageInstance) {
					return;
				}
				set((appStore) => {
					appStore.messageInstance = instance;
					return appStore;
				});
			},
		}))
	);
};
