import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
export default mongoose;