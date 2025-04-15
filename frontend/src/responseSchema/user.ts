import Zod from "zod";

export const userSchema = Zod.object({
	_id: Zod.string(),
	id: Zod.string(),
	name: Zod.string(),
	email: Zod.string(),
	phoneNumber: Zod.string(),
	countryCode: Zod.string(),
	role: Zod.number().min(1).max(3),
	courtId: Zod.object({
		id: Zod.string(),
		name: Zod.string(),
	}),
});
