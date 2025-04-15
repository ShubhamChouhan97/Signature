import './app/config/env.js';
import mongoose from './app/config/mongoose.js';
import { roles } from './app/constants/index.js';
import { bcryptPass } from './app/libs/encryption.js';
import userSchema from './app/models/admin.js';


async function genAdmin(email, countryCode, number, password, name) {
    const passwordHash = await bcryptPass(password);
    const user = await new userSchema({
        name,
        countryCode: countryCode,
        password: passwordHash,
        role: roles.admin,
        phoneNumber: number,
        email: email,
        courtId: null,
        createdBy: null,
        updatedBy: null,
    }).save();
    console.log(`New Admin Created with id ${user.id.toString()}`);
    process.exit(0);
}

genAdmin('test@gmail.com', '+91','9876543211', 'fasdfadsf', 'test');