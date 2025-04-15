import Zod from "zod";
import { courtCreationSchema } from "../responseSchema/court";
import { Client } from "./abstract";
import { userSchema } from "../responseSchema/user";
import { roles } from "../libs/constants";

export class UserClient extends Client {
	constructor(url: string) {
		super(url);
	}

	async createNew(
		courtId: string,
		data: {
			name: string;
			email: string;
			phoneNumber: string;
			countryCode: string;
			role: roles;
		}
	) {
		const res = await this.request("POST", `/api/users/${courtId}`, {
			data: data,
		});
		const unprocessedData = courtCreationSchema.safeParse(res?.data);
		if (!unprocessedData.data) {
			throw new Error("Invalid data from backend");
		}
		return unprocessedData.data;
	}

	async delete(courtId: string, id: string) {
		await this.request("DELETE", `/api/users/${courtId}/${id}`);
		return;
	}

	async updateUser(
		courtId: string,
		userId: string,
		userData: {
			name: string;
		}
	) {
		const res = await this.request(
			"PATCH",
			`/api/users/${courtId}/${userId}`,
			{
				data: userData,
			}
		);
		const unprocessedData = courtCreationSchema.safeParse(res?.data);
		if (!unprocessedData.data) {
			throw new Error("Invalid data from backend");
		}
		return unprocessedData.data;
	}

	async list(courtId?: string) {
		let requestUrl = `/api/users/`;
		if (courtId) {
			requestUrl = `/api/users/${courtId}`;
		}
		const res = await this.request("GET", requestUrl);
		const body = Zod.array(Zod.any()).safeParse(res?.data);
		if (!body.success) {
			throw new Error("Invalid data for backend");
		}
		const array: Array<typeof userSchema._type> = [];
		body.data.forEach((ele) => {
			try {
				const parsedData = userSchema.parse(ele);
				array.push(parsedData);
			} catch (error) {
				console.error(error);
			}
		});
		return array;
	}
}
