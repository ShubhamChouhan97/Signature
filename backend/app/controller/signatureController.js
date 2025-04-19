import signatures from '../models/signatures.js'
import court from '../models/courts.js'
import Bulkdata from '../models/bulkdata.js';
import Request from '../models/request.js';
import { io } from '../config/socket.js';

export const uploadSignature = async (req, res) => {
  console.log("fesc");
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    try {
      const file = req.filePath; // Path to resized image
      const userId = req.session.userId;
      const signature = new signatures({
        userId: userId,
        url: file // Save the file path in the database
      });
      await signature.save();
      res.status(200).json('Signature Uploaded Successfully');
    } catch (error) {
      console.error('Error uploading signature:', error);
      res.status(500).json('Error Uploading Signature');
    }
  };
  

export const allSign = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const signatureList = await signatures.find({ userId });
        res.status(200).json(signatureList);
        
    } catch (error) {
        console.error("Error fetching signatures:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const SignRequestOtpVerify = async (req,res)=>{
  res.status(200).json('OTP Verified');
  }
  
  export const SignRequest = async (req, res) => {
    const courtId = req.session.courtId;
    const { requestId, signtureId } = req.body;
  
    try {
      // Fetch court data
      const courtdata = await court.findOne({ id: courtId }); // use findOne instead of find
      const courtName = courtdata.name;
  
      // Fetch request and related bulk data
      const request = await Request.findById(requestId);
      const bulkdataId = request.bulkdataId;
      const bulkdata = await Bulkdata.findById(bulkdataId);
  
      // Fetch signature
      const sign = await signatures.findById(signtureId);
      const Signature = sign.url;
  
      // Modify parsedData
      const updatedParsedData = bulkdata.parsedData.map((entry) => {
        // Convert Map to a plain object if needed
        const obj = Object.fromEntries(entry);
  
        // Add signature if not rejected and not deleted
        if (obj.status !== 'Rejected' && obj.deleteFlag !== 'true') {
          obj.Signature = Signature;
          obj.Court= courtName;
        }
        
        return obj;
      });
  
      // Save the updated data back to DB
      bulkdata.parsedData = updatedParsedData;
      await bulkdata.save();
       request.status= 'Ready for Dispatch';
       request.actions = 'Signed';
       const readerId = request.createdById
       await request.save();
  
       io.emit('request-reader', {
        readerId,
          });
      res.status(200).json({ message: "Signature added to eligible entries." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  