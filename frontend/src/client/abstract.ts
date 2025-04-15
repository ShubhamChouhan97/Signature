import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

export class Client {
	protected url: string;
	protected mainApi: AxiosInstance;
	constructor(url: string) {
		this.url = url;
		this.mainApi = axios.create({
			withCredentials: true,
			headers: {
				"Content-Type": "application/json",
			},
			baseURL: url,
		});
	}

	async request(
		method: string,
		url: string,
		config?: Omit<AxiosRequestConfig, "url" | "method">
	) {
		let toLogout = false;
		try {
			const response = await this.mainApi({
				method: method,
				url: url,
				...config,
			});
			return response;
		} catch (error) {
			if (error instanceof AxiosError) {
				if (error.status === 401) {
					toLogout = true;
				} else {
					console.log(error);
					if (
						error.response?.data &&
						typeof error.response.data === "object" &&
						"error" in error.response.data
					) {
						throw new Error(error.response?.data.error);
					}
				}
				throw error;
			} else {
				throw error;
			}
		}
		if (toLogout) {
			window.location.reload();
		}
	}
}
