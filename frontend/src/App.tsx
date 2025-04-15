import { useCallback, useEffect, useState } from "react";
import { Spin } from "antd";
import { useAppStore } from "./store";
import { Router } from "./Router";
import useMessage from "antd/es/message/useMessage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const App = () => {
	const init = useAppStore().init;
	const setMessageInstance = useAppStore().setMessageInstance;
	const appLoading = useAppStore().appLoading;
	const [message, messageContext] = useMessage({
		maxCount: 4,
	});
	setMessageInstance(message);

	const [queryClient] = useState(new QueryClient());

	const [initalSessionRequst, setInitalSessionRequest] =
		useState<boolean>(false);
	const intialGetRequest = useCallback(async () => {
		try {
			await init();
		} catch (error) {
			console.error(error);
		} finally {
			setInitalSessionRequest(true);
		}
	}, [setInitalSessionRequest]);

	useEffect(() => {
		intialGetRequest();
	}, [intialGetRequest]);

	if (!initalSessionRequst) {
		return (
			<div className="flex justify-center items-center h-full w-full">
				<Spin size="large"></Spin>
			</div>
		);
	}

	return (
		<Spin size="large" spinning={appLoading}>
			{messageContext}
			<QueryClientProvider client={queryClient}>
				<Router />
			</QueryClientProvider>
		</Spin>
	);
};

export default App;
