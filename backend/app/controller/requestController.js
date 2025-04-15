import Request from "../models/request.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import XLSX from 'xlsx'
import Bulkdata from "../models/bulkdata.js";

const extractTags = (docxBuffer) => {
    const zip = new PizZip(docxBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  
    const tags = doc.getFullText()
      .match(/{[^}]+}/g) || [];
  
    // Remove duplicates and curly braces, and filter out 'signature', 'Court', 'orcode'
    return [...new Set(
      tags
        .map(tag => tag.replace(/[{}]/g, '').trim()) // Remove curly braces and trim
        .filter(tag => tag !== 'Signature' && tag !== 'Court' && tag !== 'QR Code') // Exclude specific tags
    )];
  };
  

export const createRequest = async (req, res) => {
  try {
    const createdById = req.session.userId;
    const createrRole =  req.session.role;
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Template file is required' });
    }
    const fileBuffer = fs.readFileSync(file.path);
    const placeholders = extractTags(fileBuffer);
    const request = new Request({ title, description, tempaltefile:file.path ,createdById,createrRole,placeholders});
    await request.save();

    res.status(200).json({
      message: 'Request created successfully',
      filePath: file.path
    });
  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const allrequest = async (req, res) => {
    try {
      const userId = req.session.userId;
      const userRole = req.session.role;
     // console.log('role',userRole);
      let requests;
      // Find all requests where 'createdBy' equals the current user's ID
     if(userRole == 3){
        console.log('rolecheck');
        requests = await Request.find({ createdById: userId });
     }
     if(userRole==2)
     {
        requests = await Request.find({ 'checkofficer.officerId': userId });
     }
      
      res.status(200).json(requests);
    } catch (error) {
      console.error("Get All Request Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const templateDownload = async (req, res) =>{
    const { requestId } = req.body;
    console.log(requestId);
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required." });
    }
  
    try {
      // Find the request in DB
      const request = await Request.findById(requestId);
      console.log(request);
      if (!request) {
        return res.status(404).json({ error: "Request not found." });
      }
  // Use correct key (check spelling of the field in your DB)
  const fileRelativePath = request.tempaltefile; // fallback if DB typo exists
  
  if (!fileRelativePath) {
    return res.status(400).json({ error: "No template file associated with this request" });
  }

//   Corrected path to point to /uploads/templates/
  const filePath = path.join(process.cwd(), fileRelativePath.replace(/\\/g, "/"));
   console.log('file path',filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Template file not found" });
  }
      // Send the file for download
  const fileName = path.basename(filePath);
  console.log(fileName);
  res.download(filePath, fileName);

    } catch (err) {
      console.error("Error downloading template:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

//   export const bulkUpload = async (req, res) => {
//      const id = req.body.requestId; 
//     // Check if file is uploaded
//     if (!req.file) {
//       return res.status(400).send("No file uploaded.");
//     }
//     // Proceed with further logic (like saving data to DB or processing the file)
//     try {
//     //   console.log(req.file);
  
//     // upadate path to request 
//     const request = await Request.findById(id);
//     const path = req.file.path;
//     request.exceldatafile = path;
//     await request.save();

//       // Send success response
//       return res.status(200).send({
//         message: "File uploaded successfully.",
//         filename: req.file.filename,
//       });
//     } catch (err) {
//       console.error("Error processing file:", err);
//       return res.status(500).send("Error processing the uploaded file.");
//     }
//   };
export const bulkUpload = async (req, res) => {
  const requestId = req.body.requestId; 

  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
    const sheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON (dynamic headers will be detected here)
    const data = XLSX.utils.sheet_to_json(sheet);

    // Example of logging dynamic headers for insight
    const headers = Object.keys(data[0] || {});
    console.log("Dynamic Headers:", headers);

    // You can now handle the dynamic data accordingly
    // For example, if your database model is flexible, you can map each row to a format dynamically:
    const parsedData = data.map((row, index) => {
      const dynamicRow = {};
      
      // Dynamically map each field to the parsed data
      headers.forEach(header => {
        dynamicRow[header] = row[header];
      });
      dynamicRow['status'] = 'Unsigned';
      return dynamicRow;
    });
     const bulk= new Bulkdata({requestId,parsedData})
     await bulk.save()
    const BulkDataId = bulk._id;
     
    // Update the request with the parsed data
    const request = await Request.findById(requestId);
    const path = req.file.path;
    request.exceldatafile = path;
    request.bulkdataId = BulkDataId;
    await request.save();

    // Send success response
    return res.status(200).send({
      message: "File uploaded and data processed successfully.",
      filename: req.file.filename,
      bulkdataId: BulkDataId
    });
  } catch (err) {
    console.error("Error processing file:", err);
    return res.status(500).send("Error processing the uploaded file.");
  }
};



  export const tablehead = async (req,res)=>{
    const { requestId } = req.body;
    const request = await Request.findById(requestId);
    // take placeholder
    const placeholder = request.placeholders;
  res.status(200).json(placeholder);
  }

  export const tabledata = async (req,res)=>{
    const { requestId } = req.body;
    console.log("req",requestId);
    const request = await Request.findById(requestId);

    const bulkdataId = request.bulkdataId;
    console.log("bul",bulkdataId);
    const bulk = await Bulkdata.findById(bulkdataId);
    const data = bulk.parsedData;
    res.status(200).json(data);
  }