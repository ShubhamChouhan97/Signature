import mongoose from "mongoose";
function getCurrent12HourTime() {
    return new Date().toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
const BulkdataSchema = new mongoose.Schema({
    requestId:{
        type:String,
        required:true,
    },
    parsedData: [{
       _id: mongoose.Schema.Types.ObjectId,
        type: Map,
        of: String,  // Use Map with dynamic keys and string values
    }],
     createdAt: {
    type: String,
    default: getCurrent12HourTime,
  },
})

const Bulkdata = mongoose.model('Bulkdata',BulkdataSchema);
export default Bulkdata;