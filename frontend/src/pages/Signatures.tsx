import React, { useRef, useState,useEffect } from "react";
import { Modal, Button, message } from "antd";
 import { mainClient} from "../store";
// import { MainClient } from "../client";
 
const Signatures: React.FC = () => {
    
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
const [loadvar,setLoadvar] = useState(false);
const [signatures, setSignatures] = useState<string[]>([]); // URLs of the signatures
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const fetchData = async () => {
  try {
    const response = await mainClient.request("GET", "/api/signatures/allSign");
    const data = response.data;
    setSignatures(data.map((item: any) => `http://localhost:3000/${item.url}`)); 
    setLoadvar(false);
  } catch (error) {
    console.error("Error fetching signatures:", error);
  }
};
  useEffect(() => {
    fetchData();
  }, [loadvar]);


  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsModalVisible(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("signature", selectedFile); // "signature" should match server's expected field name

    try {
      const response = await mainClient.request("POST", "/api/signatures/uploadSignature", {
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Signature uploaded successfully!");
      console.log("Server response:", response.data);
      setLoadvar(true);
      // Cleanup
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Failed to upload signature. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex-1">
      <h2 className="text-2xl font-semibold mb-4">Signature Management</h2>

      <div className="p-6 bg-white rounded-lg shadow-md flex gap-6 items-start">
        <button
          onClick={handleButtonClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
        >
          Add New Signature
        </button>

        <div
          onClick={handleButtonClick}
          className="cursor-pointer border-dashed border-2 border-gray-300 rounded p-6 text-center text-gray-500 flex-1"
        >
          Upload file in jpg, jpeg, png, bmp
        </div>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.bmp"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div>
  <h3 className="text-lg font-semibold mb-2">Signature Library</h3>
  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
    {signatures.map((url, index) => (
      <div
        key={index}
        className="border rounded p-1 flex items-center justify-center w-64 h-64" // Fixed width & height
      >
        <img
          src={url}
          alt={`Signature ${index + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    ))}
  </div>
</div>


      <Modal
        title="Preview Signature"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Submit
          </Button>,
        ]}
      >
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Selected Signature"
            className="max-w-full max-h-96 mx-auto"
          />
        )}
      </Modal>
    </div>
  );
};

export default Signatures;
