import signatures from "../models/signatures.js";
import court from "../models/courts.js";
import Bulkdata from "../models/bulkdata.js";
import Request from "../models/request.js";
import { io } from "../config/socket.js";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import ImageModule from "docxtemplater-image-module-free";
import libre from "libreoffice-convert";
import QRCode from "qrcode";
//import pdfQueue from '../queues/pdfQueue.js'; // BullMQ Queue

export const uploadSignature = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const file = req.filePath; // Path to resized image
    const userId = req.session.userId;
    const signature = new signatures({
      userId: userId,
      url: file, // Save the file path in the database
    });
    await signature.save();
    res.status(200).json("Signature Uploaded Successfully");
  } catch (error) {
    console.error("Error uploading signature:", error);
    res.status(500).json("Error Uploading Signature");
  }
};

export const allSign = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const signatureList = await signatures.find({ userId ,status:1});
    res.status(200).json(signatureList);
  } catch (error) {
    console.error("Error fetching signatures:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const SignRequestOtpVerify = async (req, res) => {
  res.status(200).json("OTP Verified");
};

export const DeleteSign = async (req,res)=>{
   const { id } = req.body;
   try{
    const sign = await signatures.findById(id);
    sign.status = 0;
    await sign.save();
    res.json({message: "Signature deleted successfully"});
   }catch(error){
    console.error(error);
    return res.status(500).json({ message: "Error deleting signature" ,error});
   }
}


export const SignRequest = async (req, res) => {
  const courtId = req.session.courtId;
  const userId = req.session.userId;
  const role = req.session.role;
  const { requestId, signatureId } = req.body;

  try {
    const courtdata = await court.findOne({ id: courtId });
    const courtName = courtdata.name;

    const request = await Request.findById(requestId);
    let flag = 1;

    if (
      role == 2 &&
      request.status === "Waited for Signature" &&
      request.actions === "Draft"
    ) {
      flag = 0;
    }
    if (
      role == 3 &&
      request.status === "Delegated" &&
      request.actions === "Delegated"
    ) {
      flag = 0;
    }

    if (flag) return res.status(401).json({ message: "Unauthorized Access" });

    const bulkdata = await Bulkdata.findById(request.bulkdataId);
    const sign = await signatures.findById(signatureId);
    const signature = sign.url;

    // Update to pending right away (as user signed)
    if (role == 2) {
      request.actions = "Pending";
    }
    if (role == 3) {
      request.status = "Pending";
    }
    await request.save();
const updatedParsedData = bulkdata.parsedData.map((entry) => {
      const obj = Object.fromEntries(entry);
      if (obj.status !== "Rejected" && obj.deleteFlag !== "true") {
        obj.Signature = signature;
        obj.court = courtName;
        obj.qrcode = null;
          obj.status = 'Pending for Signature';
      }
      return obj;
    });
    bulkdata.parsedData = updatedParsedData.map((obj) => Object.entries(obj));
    await bulkdata.save();

    io.emit("request-reader", { readerId: request.createdById });
    io.emit("request-officer", { officerId: userId });

    try {
      await generatePDFsAndSave(
        updatedParsedData,
        request,
        bulkdata,
        requestId,
        request.createdById,
        userId,
        role
      );

      // If generation succeeded, update parsedData + request status
      if (role == 2) {
        request.actions = "Signed";
        request.status = "Ready for Dispatch";
      } else if (role == 3) {
        request.status = "Ready for Dispatch";
      }
      await request.save();

      io.emit("request-reader", { readerId: request.createdById });
      io.emit("request-officer", { officerId: userId });

      res
        .status(200)
        .json({ message: "Signed and PDFs generated successfully." });
    } catch (pdfErr) {
      try {
        // Update request status
        request.actions = "Failed";
        request.status = "Failed";
        await request.save();

        // Sanitize parsedData by removing unwanted fields
        const updatedParsedData = bulkdata.parsedData.map((entry) => {
          const obj = Object.fromEntries(entry); // Convert [key, value] pairs to object

          // Delete specified fields
          delete obj.Signature;
          delete obj.court;
          delete obj.qrcode;
          delete obj.status;
          return Object.entries(obj); // Convert back to [key, value] pairs
        });

        // Update and save bulkdata
        bulkdata.parsedData = updatedParsedData;
        await bulkdata.save();

        res.status(500).json({ message: "Signature generation failed." });
      } catch (updateErr) {
        console.error(
          "Error while handling PDF generation failure:",
          updateErr
        );
        res
          .status(500)
          .json({ message: "PDF generation failed, and cleanup also failed." });
      }
    }
  } catch (err) {
    console.error("SignRequest Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const generateDocxFromTemplate = async (templatePath, data, bulkdataId) => {
  //console.log("data",data);
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const imageModule = new ImageModule({
    centered: false,
    getImage: (tagValue) => {
      //console.log("tag",tagValue);
      try {
        return fs.readFileSync(tagValue); // tagValue is path
      } catch (err) {
        console.error(`Error reading image at ${tagValue}:`, err);
        return fs.readFileSync(path.resolve("placeholder.jpg"));
      }
    },
    getSize: (imgPath) => {
      //console.log("ia",imgPath);
      if (imgPath && imgPath.includes("qrcode") && imgPath.endsWith(".png")) {
        return [250, 250]; // QR code size
      }
      return [150, 100]; // Signature or default image
    },
    fileType: "docx",
  });

  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true,
  });

  try {
    const transformedData = await prepareTemplateData(data, bulkdataId);
    doc.render(transformedData);
  } catch (error) {
    console.error("Docx templating error:", error);
    throw error;
  }

  return doc.getZip().generate({ type: "nodebuffer" });
};

const convertToPdfBuffer = async (docxBuffer) => {
  return new Promise((resolve, reject) => {
    libre.convert(docxBuffer, ".pdf", undefined, (err, done) => {
      if (err) return reject(err);
      resolve(done);
    });
  });
};

const prepareTemplateData = async (data, bulkdataId) => {
  const transformed = {};

  for (const [key, value] of Object.entries(data)) {
    let newValue = value ?? "";

    const transformedKey = key
      .replace(/(^\w)/, (m) => m.toUpperCase())
      .replace(/(_\w)/g, (m) => m[1].toUpperCase());
    //  console.log("key",key);
    // console.log("tkey",transformedKey);
    if (transformedKey === "Qrcode") {
      //   const qrId = data?.uniqueId || value || Math.random().toString(36).substring(2); // use any identifier
      // const qrId = data._id;
      const qrId = (
        data._id || Math.random().toString(36).substring(2)
      ).toString();

      const qrFilename = `qrcode-${qrId}.png`;
      const qrPath = path.resolve("temp", qrFilename);
      // console.log("qrpath",qrPath);
      // console.log("qrId",qrId);
      try {
        await QRCode.toFile(
          qrPath,
          `http://localhost:2001/qrverify/${bulkdataId}/${qrId}`
        );
        transformed[transformedKey] = qrPath;
        // console.log(`Generated QR: ${qrId} -> ${qrPath}`);
      } catch (err) {
        console.error("QR Code generation failed:", err);
        transformed[transformedKey] = path.resolve("placeholder.jpg");
      }
    } else if (
      transformedKey.toLowerCase().includes("signature") &&
      typeof newValue === "string"
    ) {
      const absoluteSigPath = path.resolve(newValue);
      newValue = fs.existsSync(absoluteSigPath)
        ? absoluteSigPath
        : path.resolve("placeholder.jpg");
      transformed[transformedKey] = newValue;
    } else {
      transformed[transformedKey] = newValue;
    }
  }

  return transformed;
};

 
const generatePDFsAndSave = async (
  parsedData,
  request,
  bulkdata,
  requestId,
  readerId,
  userId,
  role
) => {
  const folderName = path.join("../", "SignedData", `request-${requestId}`); // relative to 'uploads'
  const folderPath = path.resolve("uploads", folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  request.datafolderPath = path.join("uploads", folderName); // Store path from 'uploads'

  // Use map to process the parsed data and generate PDFs, but make it async
  const updatedParsedData = await Promise.all(
    bulkdata.parsedData.map(async (entry) => {
      const obj = Object.fromEntries(entry); // Convert entry to an object for easier handling

      // Only process entries that aren't rejected or flagged for deletion
      if (obj.status !== "Rejected" && obj.deleteFlag !== "true") {
        // Generate DOCX from template
        const filledDocxBuffer = await generateDocxFromTemplate(
          request.tempaltefile,
          obj,
          bulkdata._id
        );

        // Convert DOCX to PDF
        const pdfBuffer = await convertToPdfBuffer(filledDocxBuffer);

        // Define the filename and file path
        const filename = `${obj?.Name || "document"}_${Date.now()}.pdf`;
        const relativeFilePath = path.join("uploads", folderName, filename);
        const fullFilePath = path.resolve(relativeFilePath);

        // Write the PDF buffer to file
        fs.writeFileSync(fullFilePath, pdfBuffer);

        // Update object status and file path
        obj.status = "Signed";
        // add sign date and time
        obj.signDate = new Date().toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        obj.filepath = relativeFilePath; // Save the path (relative to 'uploads')
        delete obj.qrcode; // Remove unwanted fields like qrcode
      }

      return Object.entries(obj); // Convert the object back to key-value pairs
    })
  );

  // After processing all data, update the bulkdata.parsedData with the new data
  bulkdata.parsedData = updatedParsedData;

  // Save the updated data
  await bulkdata.save();

  // Clean up temporary directory if needed
  const tempDir = path.resolve("temp");
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true }); // Delete entire folder
    fs.mkdirSync(tempDir); // Recreate fresh temp folder
  }
};

