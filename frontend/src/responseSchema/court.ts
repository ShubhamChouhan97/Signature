import Zod from "zod";

export const courtCreationSchema = Zod.object({
	id: Zod.string(),
});

export const courtSchema = Zod.object({
	_id: Zod.string(),
	id: Zod.string(),
	name: Zod.string(),
	address: Zod.string(),
	courtAbbreviation: Zod.string(),
	courtType: Zod.array(Zod.string()).default([]),
	description: Zod.string().default(""),
	userCount: Zod.number().default(0),
});

export const courtOfficerSchema = Zod.object({
	_id: Zod.string(),
	id: Zod.string(),
	name: Zod.string(),
});

export const CourtSchemaForUsers = courtSchema.omit({ userCount: true });
