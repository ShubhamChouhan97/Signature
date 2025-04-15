import { Client } from "./abstract";

export class MainClient extends Client {
	constructor(url: string) {
		super(url);
	}

	async getSession() {
		const res = await this.mainApi("/session");
		const session = res?.data as Session;
		return session;
	}
}
