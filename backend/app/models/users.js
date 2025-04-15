import mongoose from "mongoose";
import { status } from "../constants/index.js";

const schema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    role: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    countryCode: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        default: status.active,
    },
    courtId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    profile: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
    },
    firstResetPasswordRequired:  {
        type: Boolean,
        default: true,
    },
    resetPasswordVerificationToken: {
        type: String,
    },
    validUpto: {
        type: Date,
    }
}, { timestamps: true, });

schema.index({ id: 1 }, { background: true, unique: true });
schema.index({ email: 1 }, { background: true, unique: true });
schema.index({ phoneNumber: 1 }, { background: true, unique: true });
const model = mongoose.model("user", schema);
export default model;
