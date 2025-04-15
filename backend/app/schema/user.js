import zod from 'zod';
import { roles } from '../constants/index.js';

export const UserCreationSchema = zod.object({
    'name': zod.string().min(1).max(120),
    'role': zod.enum(Object.values(roles).map((ele) => ele.toString())).exclude([roles.admin].map(ele => ele.toString()), "Admin creation is not allowed"),
    'email': zod.string().email(),
    'phoneNumber': zod.string().min(10).max(10),
    'countryCode': zod.string().min(1).max(4).startsWith("+", "Country code should start with +"),
    'profile': zod.string().url().optional(),
});

export const UserUpdateSchema = UserCreationSchema.omit({
    role: true,
    email: true,
    phoneNumber: true,
    countryCode: true,
}).strict();
