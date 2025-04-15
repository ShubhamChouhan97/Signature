import mongoose from "mongoose";
import { status } from "../constants/index.js";

const schema = new mongoose.Schema({
  id: {
	type: mongoose.Schema.Types.ObjectId,
	default: () => new mongoose.Types.ObjectId(),
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  courtAbbreviation: {
    type: String,
    required: true,
  },
  courtType: {
    type: [String],
    required: true,
  },
  description: {
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
}, { timestamps: true });

schema.index({ id: 1}, { background: true, unique: true });
schema.index({ name: 1 }, { background: true, unique: true });
schema.index({ status: 1 }, { background: true, unique: false });
schema.index({ courtAbbreviation: 1 }, { background: true, unique: true });

const model = mongoose.model("court", schema);
export default model;
