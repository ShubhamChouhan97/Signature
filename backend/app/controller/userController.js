import { compareBcrypt } from "../libs/encryption.js";
import userModel from "../models/users.js";

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({
            error: 'Email is not valid',
        });
    }
    if (!await compareBcrypt(user.password, password)) {
        return res.status(400).json({
            error: 'Password is not valid',
        });
    }
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.name = user.name;
    req.session.courtId = user.courtId;
    req.session.phoneNumber = user.phoneNumber;
    req.session._internal = {};
    return res.json({ message: 'success' });
}

export const  officerlist = async (role, courtId) => {
    let findrole = role === 2 ? 1 : 2;

    const officer = await userModel.find(
        { role: findrole, courtId },
        'role name id' // Only select the fields you need
    );

    // Optionally map to rename _id to id if needed
    const formattedOfficers = officer.map(user => ({
        role: user.role,
        name: user.name,
        id: user.id.toString()
    }));

    return formattedOfficers;
};
