import mongoose from "mongoose";
import { status } from "../constants/index.js";

const schema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        default: status.active,
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
}, { timestamps: true, });

schema.index({ id: 1 }, { background: true, unique: true });
schema.index({ userId: 1 }, { background: true, unique: false });
const model = mongoose.model("signatures", schema);
export default model;
