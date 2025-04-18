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

const RequestSchema = new mongoose.Schema({
    id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tempaltefile: {
    type: String,
    required: true,
  },
  exceldatafile:{
    type: String,
    default:null,
  },
  placeholders:[String],
//    placeholder: [{
//         name: String,
//         required: Boolean,
//         showOnExcel: Boolean,
//     }],
  createdById: {
    type: String,
    required: true,
  },
  bulkdataId:{
    type:String,
    default:null,
  },
  createrRole: {
    type: Number,
    required: true,
  },
  checkofficer: {
    officerId: {
      type: String,
      default:null,
    },
    officerName: {
      type: String,
      default:null,
    }
  },
  numberOfDocuments: {
    type: Number,
    required: true,
    default: 0,
  },
  rejectedDocuments: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
    default: getCurrent12HourTime,
  },
  status: {
    type: String,
    enum: ['Draft','Delegated','Ready for Dispatch','Waited for Signature'],
    default: 'Draft',
  },
  deleteFlag:{
    type:Boolean,
    default:false
  },
  actions: {
        type: String,
        enum: ['Draft', 'Pending', 'Signed', 'Submited','Delegated'],
        default: 'Draft',
    },
});

const Request = mongoose.model('Request', RequestSchema);
export default Request;
