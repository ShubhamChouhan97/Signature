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
import convert from 'docx-pdf';
import ExcelJS from 'exceljs';
import mongoose from "mongoose";
import { promisify } from "util"; // Assuming this is your converter/ adjust this import as per your file
import pkg from "uuid";
const { v4: uuidv4 } = pkg;
import { io } from '../config/socket.js';
import os from "os";

const unlinkAsync = promisify(fs.unlink);


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
      // console.log('role',userId);
      let requests;
      // Find all requests where 'createdBy' equals the current user's ID
      if (userRole === 3) {
        // Creator role: fetch requests created by user and not marked as deleted
        requests = await Request.find({
          createdById: userId,
          deleteFlag: false,
        });
      } else if (userRole === 2) {
        // Officer role: fetch requests where the officer is involved and not marked as deleted
        requests = await Request.find({
          'checkofficer.officerId': userId,
          deleteFlag: false,
        });
      }
      res.status(200).json(requests);
    } catch (error) {
      console.error("Get All Request Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

export const templateDownload = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: "Request ID is required." });
  }

  try {
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    const fileRelativePath = request.tempaltefile;
    if (!fileRelativePath) {
      return res.status(400).json({ error: "No template file associated with this request" });
    }

    const inputPath = path.join(process.cwd(), fileRelativePath.replace(/\\/g, "/"));

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: "Template file not found" });
    }

    const tempOutputPath = path.join(os.tmpdir(), `${uuidv4()}.pdf`);

    convert(inputPath, tempOutputPath, async function (err, result) {
      if (err) {
        console.error("Conversion error:", err);
        return res.status(500).json({ error: "Conversion failed" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="template.pdf"');

      const stream = fs.createReadStream(tempOutputPath);
      stream.pipe(res);

      stream.on("close", async () => {
        try {
          await unlinkAsync(tempOutputPath); // delete after streaming
        } catch (err) {
          console.warn("Failed to delete temp file:", err);
        }
      });
    });
  } catch (err) {
    console.error("Error downloading template:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const templateExcelDownload = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: "Request ID is required." });
  }

  try {
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    const placeholders = request.placeholders;

    if (!placeholders || placeholders.length === 0) {
      return res.status(400).json({ error: "No placeholders found in this request." });
    }

    // Create a workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");

    // Add a header row using the placeholders
    worksheet.addRow(placeholders);

    // Optional: Add some style (bold headers)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    // Set file name and path
    const fileName = `template_${requestId}.xlsx`;
    const tempPath = path.join(process.cwd(), 'temp'); // create a temp folder if not exists
    if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
    const filePath = path.join(tempPath, fileName);

    // Save the workbook to a file
    await workbook.xlsx.writeFile(filePath);

    // Send the file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ error: "Failed to download the Excel file." });
      } else {
        // Optional: delete the file after download
        fs.unlinkSync(filePath);
      }
    });

  } catch (err) {
    console.error("Error downloading template:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const bulkUpload = async (req, res) => {
//   const requestId = req.body.requestId; 

//   // Check if file is uploaded
//   if (!req.file) {
//     return res.status(400).send("No file uploaded.");
//   }

//   try {
//     // Read the Excel file
//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
//     const sheet = workbook.Sheets[sheetName];
    
//     // Convert sheet to JSON (dynamic headers will be detected here)
//     const data = XLSX.utils.sheet_to_json(sheet);

//     // Example of logging dynamic headers for insight
//     const headers = Object.keys(data[0] || {});
//     console.log("Dynamic Headers:", headers);

//     // You can now handle the dynamic data accordingly
//     // For example, if your database model is flexible, you can map each row to a format dynamically:
//     const parsedData = data.map((row, index) => {
//       const dynamicRow = {};
      
//       // Dynamically map each field to the parsed data
//       headers.forEach(header => {
//         dynamicRow[header] = row[header];
//       });
//       dynamicRow['status'] = 'Unsigned';
//       return dynamicRow;
//     });
//      const bulk= new Bulkdata({requestId,parsedData})
//      await bulk.save()
//     const BulkDataId = bulk._id;
     
//     // Update the request with the parsed data
//     const request = await Request.findById(requestId);
//     const path = req.file.path;
//     request.exceldatafile = path;
//     request.bulkdataId = BulkDataId;
//     await request.save();

//     // Send success response
//     return res.status(200).send({
//       message: "File uploaded and data processed successfully.",
//       filename: req.file.filename,
//       bulkdataId: BulkDataId
//     });
//   } catch (err) {
//     console.error("Error processing file:", err);
//     return res.status(500).send("Error processing the uploaded file.");
//   }
// };

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

    if (data.length === 0) {
      return res.status(400).send("No data found in the Excel file.");
    }
    // Example of logging dynamic headers for insight
    const headers = Object.keys(data[0] || {});
   // console.log("Dynamic Headers:", headers);

    // handle the dynamic data accordingly
    const parsedData = data.map((row) => {
      const dynamicRow = { _id: new mongoose.Types.ObjectId() };
    
      // Dynamically map each field to the parsed data
      headers.forEach(header => {
        dynamicRow[header] = row[header];
      });
    
      dynamicRow['status'] = 'Unsigned';
      dynamicRow['deleteFlag'] = 'false';
      return dynamicRow;
    });

    // Save the parsed data to the Bulkdata model
    const bulk = new Bulkdata({ requestId, parsedData });
    await bulk.save();
    const BulkDataId = bulk._id;

    // Update the request with the parsed data
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).send("Request not found.");
    }
    const path = req.file.path;
    request.exceldatafile = path;
    request.bulkdataId = BulkDataId;
    request.numberOfDocuments=data.length;
    await request.save();

    // Send success response
    return res.status(200).send({
      message: "File uploaded and data processed successfully.",
      filename: req.file.filename,
      bulkdataId: BulkDataId,
      dataSize: data.length // Include size of the data in response
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
export const tabledata = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await Request.findById(requestId);

    const bulkdataId = request.bulkdataId;
    const bulk = await Bulkdata.findById(bulkdataId);
    const data = bulk.parsedData;
    // Filter only entries where deleteFlag is 'false'
    const filteredData = data.filter(entry => entry.get('deleteFlag') === 'false');
    // Send filtered data and bulk id
    const datavar = [];
    datavar.push(filteredData);
    datavar.push(bulk._id);

    res.status(200).json(datavar);
  } catch (error) {
    console.error("Error in tabledata:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

  export const sendtoofficer = async (req,res) =>{
    const { requestId,officerId,officerName } = req.body;
    const request = await Request.findById(requestId);
    //  console.log(request);
     request.checkofficer.officerId=officerId;
     request.checkofficer.officerName=officerName;
     request.status = 'Waited for Signature';
     request.actions= 'Draft';
     await request.save();

     io.emit('request-officer', {
      requestId,
      officerId,
      officerName,
      status: request.status,
    });
  
    res.status(200).json("Sended to Officer");
  }

  export const deleteRequest = async (req,res)=>{
    const { requestId } = req.body;
    const request = await Request.findById(requestId);
    request.deleteFlag = 'true';
    await request.save();
    res.status(200).json("deleted");
  }

  export const cloneRequest = async (req, res) => {
    const userId = req.session.userId;
      const userRole = req.session.role;
    try {
      const { requestId,newTitle } = req.body;
      //console.log("Request ID to clone:", requestId);
  
      // Use findById to get a single document
      const originalRequest = await Request.findById(requestId);
  
      if (!originalRequest) {
        return res.status(404).json({ message: "Original request not found" });
      }
      // Convert to plain object and remove unwanted fields
      const { _id,id,exceldatafile,createdById,createrRole,bulkdataId, createdAt, status, checkofficer, deleteFlag,numberOfDocuments,rejectedDocuments,actions, ...requestData } = originalRequest._doc;
      requestData.title = newTitle;
      requestData.createrRole=userRole;
      requestData.createdById=userId;
      // Create a new request with cloned data
      const clonedRequest = new Request(requestData);
      await clonedRequest.save();
  
      return res.status(201).json({
        message: "Request cloned successfully",
        clonedRequest,
      });
    } catch (error) {
      console.error("Clone request error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

export const PreviewRequest = async (req, res) => {
  const { requestId, rowId, bulkdataId } = req.body;

  if (!requestId || !rowId || !bulkdataId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found." });

    const fileRelativePath = request.tempaltefile;
    if (!fileRelativePath) return res.status(400).json({ error: "No template file associated with this request." });

    const inputPath = path.join(process.cwd(), fileRelativePath.replace(/\\/g, "/"));
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "Template file not found." });

    const bulk = await Bulkdata.findById(bulkdataId);
    if (!bulk || !Array.isArray(bulk.parsedData)) {
      return res.status(404).json({ error: "Bulk data not found or malformed." });
    }

    const mapArray = bulk.parsedData;
    const rowMap = mapArray.find((row) => row.get("_id").toString() === rowId);
    if (!rowMap) return res.status(404).json({ error: "Row data not found." });

    const rowData = Object.fromEntries(rowMap.entries());
    //console.log("Final data to be injected into doc:", rowData);

    // Load template
    const content = fs.readFileSync(inputPath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // ✅ New docxtemplater API usage
    doc.render(rowData);

    const buf = doc.getZip().generate({ type: "nodebuffer" });
    const tempDocxPath = path.join(process.cwd(), "temp", `filled_${Date.now()}.docx`);
    const outputPath = tempDocxPath.replace(".docx", ".pdf");

    fs.writeFileSync(tempDocxPath, buf);

    convert(tempDocxPath, outputPath, function (err) {
      fs.unlink(tempDocxPath, () => {});
      if (err) {
        console.error("Conversion error:", err);
        return res.status(500).json({ error: "Conversion failed" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="preview.pdf"');
      fs.createReadStream(outputPath)
        .on("end", () => fs.unlink(outputPath, () => {}))
        .pipe(res);
    });
  } catch (err) {
    console.error("Error in PreviewRequest:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const RejectRequestOfficer = async (req, res) => {
  const userRole = req.session.role;
  if (userRole === 2) {
    try {
      const {requestId, rowId, bulkdataId } = req.body;
      
      const request = await Request.findById(requestId);
      if (!request) return res.status(404).json({ error: "Request not found."
        });
        request.rejectedDocuments++;

      const bulk = await Bulkdata.findById(bulkdataId);
      if (!bulk || !Array.isArray(bulk.parsedData)) {
        return res.status(404).json({ error: "Bulk data not found or malformed." });
      }

      const mapArray = bulk.parsedData;
      // Convert Maps to plain objects (if needed) or access using Map methods
      const rowIndex = mapArray.findIndex(item => 
        item instanceof Map && item.get('_id')?.toString() === rowId
      );

      if (rowIndex === -1) {
        return res.status(404).json({ error: "Row not found." });
      }

      mapArray[rowIndex].set('status', 'Rejected');

      bulk.markModified('parsedData'); // Tell Mongoose that a nested field has changed
      await bulk.save(); // Save changes
      await request.save();
      return res.status(200).json({ message: "Status updated successfully." });

    } catch (err) {
      console.error("Error in RejectRequestOfficer:", err);
      return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  } else {
    return res.status(403).json({ error: "Unauthorized access" });
  }
};

export const DeleteRequestOfficer = async (req,res) =>{
  const userRole = req.session.role;
  if (userRole === 3) {
    try {
      const { requestId,rowId, bulkdataId } = req.body;

       
      const request = await Request.findById(requestId);
      if (!request) return res.status(404).json({ error: "Request not found."
        });
        request.numberOfDocuments--;
        
       
      const bulk = await Bulkdata.findById(bulkdataId);
      if (!bulk || !Array.isArray(bulk.parsedData)) {
        return res.status(404).json({ error: "Bulk data not found or malformed." });
      }

      const mapArray = bulk.parsedData;
      // console.log("array", mapArray);

      // Convert Maps to plain objects (if needed) or access using Map methods
      const rowIndex = mapArray.findIndex(item => 
        item instanceof Map && item.get('_id')?.toString() === rowId
      );

      if (rowIndex === -1) {
        return res.status(404).json({ error: "Row not found." });
      }

      mapArray[rowIndex].set('deleteFlag', 'true');

      bulk.markModified('parsedData'); // Tell Mongoose that a nested field has changed
      await bulk.save(); // Save changes
      await request.save();
      return res.status(200).json({ message: "Status updated successfully." });

    } catch (err) {
      console.error("Error in RejectRequestOfficer:", err);
      return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  } else {
    return res.status(403).json({ error: "Unauthorized access" });
  }
}

export const DelegateRequest = async(req,res)=>{
  const { requestId} = req.body;
  const userRole = req.session.role;
  if (userRole === 2) {
    try {

      const request = await Request.findById(requestId);

      if (!request) return res.status(404).json({ error: "Request not found."});
         request.status = 'Delegated';
         request.actions = 'Delegated';
    
        await request.save();
    const readerId = request.createdById
 io.emit('request-reader', {
  readerId,
    });
        return res.status(200).json({ message: "Request delegated successfully." });
        }catch (err) {
          console.error("Error in DelegateRequest:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
}else{
  return res.status(403).json({ error: "Unauthorized access" });
}
}

export const SignRequest = async()=>{
  
}