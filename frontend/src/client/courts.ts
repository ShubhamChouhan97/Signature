import Zod from "zod";
import {
	courtCreationSchema,
	courtOfficerSchema,
	courtSchema,
	CourtSchemaForUsers,
} from "../responseSchema/court";
import { Client } from "./abstract";

export class CourtClient extends Client {
	constructor(url: string) {
		super(url);
	}

	async createNewCourt(courtCreationData: {
		name: string;
		address: string;
		description: string;
	}) {
		const res = await this.request("POST", "/api/courts", {
			data: courtCreationData,
		});
		const unprocessedData = courtCreationSchema.safeParse(res?.data);
		if (!unprocessedData.data) {
			throw new Error("Invalid data from backend");
		}
		return unprocessedData.data;
	}

	async deleteCourt(courtId: string) {
		await this.request("DELETE", `/api/courts/${courtId}`);
		return;
	}

	async updateCourt(
		courtId: string,
		courtUpdateData: { name: string; address: string }
	) {
		const res = await this.request("PATCH", `/api/courts/${courtId}`, {
			data: courtUpdateData,
		});
		const unprocessedData = courtCreationSchema.safeParse(res?.data);
		if (!unprocessedData.data) {
			throw new Error("Invalid data from backend");
		}
		return unprocessedData.data;
	}

	async getCourts() {
		const res = await this.request("GET", "/api/courts");
		const body = Zod.array(Zod.any()).safeParse(res?.data);
		if (!body.success) {
			throw new Error("Invalid data for backend");
		}
		const array: Array<typeof courtSchema._type> = [];
		body.data.forEach((ele) => {
			try {
				const parsedData = courtSchema.parse(ele);
				array.push(parsedData);
			} catch (error) {
				console.error(error);
			}
		});
		return array;
	}

	async getCourt(id: string) {
		const res = await this.request("GET", `/api/courts/${id}`);
		const body = await CourtSchemaForUsers.safeParseAsync(res?.data);
		if (!body.success) {
			throw new Error("Invalid data for backend");
		}
		return body.data;
	}

	async getOfficers() {
		const res = await this.request(
			"GET",
			`/api/courts/officerForAssignment`
		);
		const body = await Zod.array(Zod.any()).safeParseAsync(res?.data);
		if (!body.success) {
			throw new Error("Invalid data from backend");
		}
		const officers: Array<typeof courtOfficerSchema._type> = [];
		body.data.forEach((ele) => {
			try {
				officers.push(courtOfficerSchema.parse(ele));
			} catch (error) {
				console.error(error);
			}
		});
		return officers;
	}
}
