// import signatures from '../models/signatures.js'
// import court from '../models/courts.js'
// import Bulkdata from '../models/bulkdata.js';
// import Request from '../models/request.js';
// import { io } from '../config/socket.js';
// import archiver from 'archiver';
// import path from 'path';
// import PizZip from 'pizzip';
// import Docxtemplater from 'docxtemplater';
// import fs from 'fs';
// import ImageModule from "docxtemplater-image-module-free";
// import  libre  from 'libreoffice-convert';
// import { PDFDocument } from 'pdf-lib';
// import ORCode from 'qrcode';


// async function generateQRCodeBase64(id) {
//   return await QRCode.toDataURL(id); // returns base64 PNG
// }


// export const uploadSignature = async (req, res) => {
//   console.log("fesc");
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }
  
//     try {
//       const file = req.filePath; // Path to resized image
//       const userId = req.session.userId;
//       const signature = new signatures({
//         userId: userId,
//         url: file // Save the file path in the database
//       });
//       await signature.save();
//       res.status(200).json('Signature Uploaded Successfully');
//     } catch (error) {
//       console.error('Error uploading signature:', error);
//       res.status(500).json('Error Uploading Signature');
//     }
//   };
  

// export const allSign = async (req, res) => {
//     try {
//         const userId = req.session.userId;
//         if (!userId) return res.status(401).json({ message: "Unauthorized" });

//         const signatureList = await signatures.find({ userId });
//         res.status(200).json(signatureList);
        
//     } catch (error) {
//         console.error("Error fetching signatures:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };


// export const SignRequestOtpVerify = async (req,res)=>{
//   res.status(200).json('OTP Verified');
//   }
  
//   // export const SignRequest = async (req, res) => {
//   //   const courtId = req.session.courtId;
//   //   const { requestId, signatureId } = req.body;
  
//   //   try {
//   //     // Fetch court data
//   //     const courtdata = await court.findOne({ id: courtId }); // use findOne instead of find
//   //     const courtName = courtdata.name;
  
//   //     // Fetch request and related bulk data
//   //     const request = await Request.findById(requestId);
//   //     const bulkdataId = request.bulkdataId;
//   //     const bulkdata = await Bulkdata.findById(bulkdataId);
  
//   //     // Fetch signature
//   //     const sign = await signatures.findById(signatureId);
//   //     const signature = sign.url;
  
//   //     // Modify parsedData
//   //     const updatedParsedData = bulkdata.parsedData.map((entry) => {
//   //       // Convert Map to a plain object if needed
//   //       const obj = Object.fromEntries(entry);
  
//   //       // Add signature if not rejected and not deleted
//   //       if (obj.status !== 'Rejected' && obj.deleteFlag !== 'true') {
//   //         obj.Signature = signature;
//   //         obj.court= courtName;
//   //       }
        
//   //       return obj;
//   //     });
  
//   //     // Save the updated data back to DB
//   //     bulkdata.parsedData = updatedParsedData;
//   //     await bulkdata.save();
//   //      request.status= 'Ready for Dispatch';
//   //      request.actions = 'Signed';
//   //      const readerId = request.createdById
//   //      await request.save();
  
//   //      io.emit('request-reader', {
//   //       readerId,
//   //         });
//   //     res.status(200).json({ message: "Signature added to eligible entries." });
//   //   } catch (error) {
//   //     console.error(error);
//   //     return res.status(500).json({ error: "Internal Server Error" });
//   //   }
//   // };
  
  
// const generateDocxFromTemplate = (templatePath, data) => {
//   const content = fs.readFileSync(templatePath, 'binary');
//   const zip = new PizZip(content);

//   const imageModule = new ImageModule({
//     centered: false,
//     getImage: (tagValue) => {
//       try {
//         return fs.readFileSync(tagValue); // tagValue is already a file path
//       } catch (err) {
//         console.error(`Error reading image at ${tagValue}:`, err);
//         return fs.readFileSync(path.resolve('placeholder.jpg'));
//       }
//     },
//     getSize: () => [150, 50],
//     fileType: 'docx',
//   });

//   const doc = new Docxtemplater(zip, {
//     modules: [imageModule],
//     paragraphLoop: true,
//     linebreaks: true,
//   });

//   try {
//     const transformedData = prepareTemplateData(data);
//     doc.render(transformedData);
//   } catch (error) {
//     console.error("Docx templating error:", error);
//     throw error;
//   }

//   return doc.getZip().generate({ type: 'nodebuffer' });
// };

// const convertToPdfBuffer = (docxBuffer) => {
//   return new Promise((resolve, reject) => {
//     libre.convert(docxBuffer, '.pdf', undefined, (err, done) => {
//       if (err) return reject(err);
//       resolve(done);
//     });
//   });
// };

// const prepareTemplateData = (data) => {
//   const transformed = {};

//   for (const [key, value] of Object.entries(data)) {
//     let newValue = value ?? '';

//     // Detect image tags like Signature
//     if (key.toLowerCase().includes("Signature") && typeof newValue === "string") {
//       const absoluteSigPath = path.resolve(newValue);
//       if (fs.existsSync(absoluteSigPath)) {
//         newValue = absoluteSigPath;
//       } else {
//         console.warn(`Signature image not found at ${absoluteSigPath}`);
//         newValue = path.resolve('placeholder.jpg');
//       }
//     }

//     // Transform 'caseid' => 'CaseId', 'signature' => 'Signature'
//     const transformedKey = key
//       .replace(/(^\w)/, (m) => m.toUpperCase()) // Capitalize first letter
//       .replace(/(_\w)/g, (m) => m[1].toUpperCase()); // Remove underscores and capitalize next letter

//     transformed[transformedKey] = newValue;
//   }

//   return transformed;
// };

// export const SignRequest = async (req, res) => {
//   const courtId = req.session.courtId;
//   const userId= req.session.userId;
//   const role = req.session.role;
//   const { requestId, signatureId } = req.body;
//   try {
//     // Fetch court data
//     const courtdata = await court.findOne({ id: courtId });
//     const courtName = courtdata.name;
//      let flag = 1;
//     // Fetch request and related bulk data
//     const request = await Request.findById(requestId);
//    if(role==2)
//    {
//   if(request.status==='Waited for Signature' && request.actions ==='Draft') 
//   { 
//     flag =0;
//   }
//    }
//    if(role==3)
//    {
//     if(request.status === 'Delegated' && request.actions === 'Delegated')
//     {
//       flag=0;
//     }
//    }

//    if(flag) 
//    {
//     res.status(401).json({ message: "Unauthorized  Access" });
//    }
//     const bulkdataId = request.bulkdataId;
//     const bulkdata = await Bulkdata.findById(bulkdataId);

//     // Fetch signature
//     const sign = await signatures.findById(signatureId);
//     const signature = sign.url;

//     // Modify parsedData
//     const updatedParsedData = bulkdata.parsedData.map((entry) => {
//       const obj = Object.fromEntries(entry);
//       if (obj.status !== 'Rejected' && obj.deleteFlag !== 'true') {
//         obj.Signature = signature;
//         obj.court = courtName;
//       }
//       return obj;
//     });

//     // Save the updated data
//     bulkdata.parsedData = updatedParsedData;
   
//      if(role == 2)
//      {
//       request.actions = 'Pending';
//      }
//      if(role == 3)
//      {
//       request.status ='Pending';
//      }
    
//     const readerId = request.createdById;
//     await request.save();
//     await bulkdata.save();
//     io.emit('request-reader', {
//       readerId,
//     });

//     // Generate individual PDFs
//     generatePDFsAndSave(updatedParsedData, request,bulkdata,requestId,readerId,userId,role);
    
//     res.status(200).json({ message: "Signature added to eligible entries and individual PDFs generated." });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }; 


// const generatePDFsAndSave = async (parsedData, request, bulkdata, requestId, readerId, userId,role) => {
//   const folderName = path.join('../','SignedData', `request-${requestId}`); // relative to 'uploads'
//   const folderPath = path.resolve('uploads', folderName);

//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }

//   request.datafolderPath = path.join('uploads', folderName); // Store path from 'uploads'

//   const updatedParsedData = [];

//   for (const entry of parsedData) {
//     const obj = { ...entry };
//     if (obj.status !== 'Rejected' && obj.deleteFlag !== 'true') {
//       const filledDocxBuffer = generateDocxFromTemplate(request.tempaltefile, obj);
//       const pdfBuffer = await convertToPdfBuffer(filledDocxBuffer);

//       const filename = `${obj?.Name || 'document'}_${Date.now()}.pdf`;
//       const relativeFilePath = path.join('uploads', folderName, filename); // uploads/data/request-xxx/filename.pdf
//       const fullFilePath = path.resolve(relativeFilePath);
//       fs.writeFileSync(fullFilePath, pdfBuffer);
//        obj.status = 'Signed';
//       obj.filepath = relativeFilePath; // Store only path from 'uploads'
//     }

//     updatedParsedData.push(Object.entries(obj));
//   }

//   bulkdata.parsedData = updatedParsedData;
//   await bulkdata.save();
// if(role == 2)
// {
//   request.status = 'Ready for Dispatch';
//   request.actions = 'Signed';
// }else{
//   request.status = 'Ready for Dispatch';
// }
 
//   await request.save();
//   io.emit('request-reader', { readerId });
//   io.emit('request-officer', { officerId:userId });
// };


// version 2
import signatures from '../models/signatures.js'
import court from '../models/courts.js'
import Bulkdata from '../models/bulkdata.js';
import Request from '../models/request.js';
import { io } from '../config/socket.js';
import archiver from 'archiver';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import ImageModule from "docxtemplater-image-module-free";
import  libre  from 'libreoffice-convert';
import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';


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

  
const generateDocxFromTemplate = async (templatePath, data,bulkdataId) => {
  //console.log("data",data);
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);

  const imageModule = new ImageModule({
    centered: false,
    getImage: (tagValue) => {
      console.log("tag",tagValue);
      try {
        return fs.readFileSync(tagValue); // tagValue is path
      } catch (err) {
        console.error(`Error reading image at ${tagValue}:`, err);
        return fs.readFileSync(path.resolve('placeholder.jpg'));
      }
    },
    getSize: (imgPath) => {
      console.log("ia",imgPath);
      if (imgPath && imgPath.includes('qrcode') && imgPath.endsWith('.png')) {
        return [250, 250]; // QR code size
      }
      return [150, 100]; // Signature or default image
    },
    fileType: 'docx',
  });

  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true,
  });

  try {
    const transformedData = await prepareTemplateData(data,bulkdataId);
    doc.render(transformedData);

  } catch (error) {
    console.error("Docx templating error:", error);
    throw error;
  }

  return doc.getZip().generate({ type: 'nodebuffer' });
};

const convertToPdfBuffer = async (docxBuffer) => {
  return new Promise((resolve, reject) => {
    libre.convert(docxBuffer, '.pdf', undefined, (err, done) => {
      if (err) return reject(err);
      resolve(done);
    });
  });
};

const prepareTemplateData = async (data,bulkdataId) => {
  const transformed = {};

  for (const [key, value] of Object.entries(data)) {
    let newValue = value ?? '';
   
    const transformedKey = key
      .replace(/(^\w)/, (m) => m.toUpperCase())
      .replace(/(_\w)/g, (m) => m[1].toUpperCase());
    //  console.log("key",key);
      console.log("tkey",transformedKey);
    if (transformedKey === 'Qrcode') {
   //   const qrId = data?.uniqueId || value || Math.random().toString(36).substring(2); // use any identifier
    // const qrId = data._id;
    const qrId = (data._id || Math.random().toString(36).substring(2)).toString();

   const qrFilename = `qrcode-${qrId}.png`;
      const qrPath = path.resolve('temp', qrFilename);
      // console.log("qrpath",qrPath);
      // console.log("qrId",qrId);
      try {
        await QRCode.toFile(qrPath, `http://localhost:2001/qrverify/${bulkdataId}/${qrId}`);
        transformed[transformedKey] = qrPath;
        // console.log(`Generated QR: ${qrId} -> ${qrPath}`);
      } catch (err) {
        console.error('QR Code generation failed:', err);
        transformed[transformedKey] = path.resolve('placeholder.jpg');
      }
    } else if (transformedKey.toLowerCase().includes('signature') && typeof newValue === 'string') {
      const absoluteSigPath = path.resolve(newValue);
      newValue = fs.existsSync(absoluteSigPath) ? absoluteSigPath : path.resolve('placeholder.jpg');
      transformed[transformedKey] = newValue;
    } else {
      transformed[transformedKey] = newValue;
    }
  }

  return transformed;
};

export const SignRequest = async (req, res) => {
  const courtId = req.session.courtId;
  const userId= req.session.userId;
  const role = req.session.role;
  const { requestId, signatureId } = req.body;
  try {
    // Fetch court data
    const courtdata = await court.findOne({ id: courtId });
    const courtName = courtdata.name;
     let flag = 1;
    // Fetch request and related bulk data
    const request = await Request.findById(requestId);
   if(role==2)
   {
  if(request.status==='Waited for Signature' && request.actions ==='Draft') 
  { 
    flag =0;
  }
   }
   if(role==3)
   {
    if(request.status === 'Delegated' && request.actions === 'Delegated')
    {
      flag=0;
    }
   }

   if(flag) 
   {
    res.status(401).json({ message: "Unauthorized  Access" });
   }
    const bulkdataId = request.bulkdataId;
    const bulkdata = await Bulkdata.findById(bulkdataId);

    // Fetch signature
    const sign = await signatures.findById(signatureId);
    const signature = sign.url;

    // Modify parsedData
    const updatedParsedData = bulkdata.parsedData.map((entry) => {
      const obj = Object.fromEntries(entry);
      if (obj.status !== 'Rejected' && obj.deleteFlag !== 'true') {
        obj.Signature = signature;
        obj.court = courtName;
        obj.qrcode = null;
      }
      return obj;
    });

    // Save the updated data
    bulkdata.parsedData = updatedParsedData;
   
     if(role == 2)
     {
      request.actions = 'Pending';
     }
     if(role == 3)
     {
      request.status ='Pending';
     }
    
    const readerId = request.createdById;
    await request.save();
   await bulkdata.save();
    io.emit('request-reader', {
      readerId,
    });

    // Generate individual PDFs
    generatePDFsAndSave(updatedParsedData, request,bulkdata,requestId,readerId,userId,role);
    
    res.status(200).json({ message: "Signature added to eligible entries and individual PDFs generated." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}; 


const generatePDFsAndSave = async (parsedData, request, bulkdata, requestId, readerId, userId,role) => {
  const folderName = path.join('../','SignedData', `request-${requestId}`); // relative to 'uploads'
  const folderPath = path.resolve('uploads', folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  request.datafolderPath = path.join('uploads', folderName); // Store path from 'uploads'

  const updatedParsedData = [];

  for (const entry of parsedData) {
    const obj = { ...entry };
    if (obj.status !== 'Rejected' && obj.deleteFlag !== 'true') {
      const filledDocxBuffer = await generateDocxFromTemplate(request.tempaltefile, obj,bulkdata._id);
      const pdfBuffer = await convertToPdfBuffer(filledDocxBuffer);

      const filename = `${obj?.Name || 'document'}_${Date.now()}.pdf`;
      const relativeFilePath = path.join('uploads', folderName, filename); // uploads/data/request-xxx/filename.pdf
      const fullFilePath = path.resolve(relativeFilePath);
      fs.writeFileSync(fullFilePath, pdfBuffer);
       obj.status = 'Signed';
      obj.filepath = relativeFilePath; // Store only path from 'uploads'
    }

    updatedParsedData.push(Object.entries(obj));
  }

  bulkdata.parsedData = updatedParsedData;
  await bulkdata.save();
if(role == 2)
{
  request.status = 'Ready for Dispatch';
  request.actions = 'Signed';
}else{
  request.status = 'Ready for Dispatch';
}
 
  await request.save();
  io.emit('request-reader', { readerId });
  io.emit('request-officer', { officerId:userId });
  const tempDir = path.resolve('temp');

fs.readdir(tempDir, (err, files) => {
  if (err) return console.error("Temp cleanup failed:", err);
  files.forEach(file => fs.unlink(path.join(tempDir, file), () => {}));
});
};

