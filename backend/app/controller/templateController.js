// Backend (Node.js + Express)
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sampletemplate = async (req, res) => {
    console.log("edsczx")
  try {
    const filePath = path.join(__dirname, "../../uploads/templates/Sampletemplate.docx");
    res.download(filePath, "SampleTemplate.docx"); // triggers download
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).send("Failed to download sample template.");
  }
};
