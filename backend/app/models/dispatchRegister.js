import mongoose from "mongoose";

const schema = new mongoose.Schema({
    index: {
        type: Number,
        required: true,
    },
    courtId: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    address: {
        type: String,
    },
    modeOfDispatch: {
        type: String,
    },
    postNumber: {
        type: String,
    },
    remarks: {
        type: String,
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    dataId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
}, { timestamps: true, });

schema.index({ index: 1 }, { background: true, unique: true });
schema.index({ templateId: 1, dataId: 1 }, { background: true, unique: true });
const model = mongoose.model("dispatch", schema);
export default model;
