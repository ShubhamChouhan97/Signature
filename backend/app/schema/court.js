import zod from 'zod';

export const CourtCreationSchema = zod.object({
    'name': zod.string(),
    'address': zod.string(),
    'courtAbbreviation': zod.string(),
    'courtType': zod.array(zod.string()).default([]),
    'description': zod.string(),
});
