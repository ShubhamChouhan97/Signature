// import React, { useRef, useState, useEffect } from "react";
// import { Modal, Button, message } from "antd";
// import { DeleteOutlined } from "@ant-design/icons";
// import { fetchSignatures, uploadSignature } from "../Api/signatureApi"; // Adjust the import path as necessary

// const Signatures: React.FC = () => {
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [loadvar, setLoadvar] = useState(false);
//   const [signatures, setSignatures] = useState<string[]>([]);

//   const fetchData = async () => {
//     try {
//       const signatureUrls = await fetchSignatures();
//       setSignatures(signatureUrls);
//       setLoadvar(false);
//     } catch {
//       console.error("Error loading signatures");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [loadvar]);

//   const handleButtonClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setIsModalVisible(true);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!selectedFile) return;

//     try {
//       const response = await uploadSignature(selectedFile);
//       message.success("Signature uploaded successfully!");
//       console.log("Server response:", response.data);
//       setLoadvar(true);
//       setSelectedFile(null);
//       setPreviewUrl(null);
//       setIsModalVisible(false);
//     } catch (error) {
//       console.error("Upload failed:", error);
//       message.error("Failed to upload signature. Please try again.");
//     }
//   };

//   const handleDelete = async (index:string)=>{
//     console.log("index :",index);
//   }

//   return (
//     // <div className="p-6 bg-white rounded-lg shadow-md flex-1">
//     //   <h2 className="text-2xl font-semibold mb-4">Signature Management</h2>

//     //   <div className="p-6 bg-white rounded-lg shadow-md flex gap-6 items-start">
//     //     <button
//     //       onClick={handleButtonClick}
//     //       className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
//     //     >
//     //       Add New Signature
//     //     </button>

//     //     <div
//     //       onClick={handleButtonClick}
//     //       className="cursor-pointer border-dashed border-2 border-gray-300 rounded p-6 text-center text-gray-500 flex-1"
//     //     >
//     //       Upload file in jpg, jpeg, png, bmp
//     //     </div>

//     //     <input
//     //       type="file"
//     //       accept=".jpg,.jpeg,.png,.bmp"
//     //       ref={fileInputRef}
//     //       onChange={handleFileChange}
//     //       style={{ display: "none" }}
//     //     />
//     //   </div>

//     //   <div>
//     //     <h3 className="text-lg font-semibold mb-2">Signature Library</h3>
//     //     <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
//     //       {signatures.map((url, index) => (
//     //         <div
//     //           key={index}
//     //           className="border rounded p-1 flex items-center justify-center w-64 h-64"
//     //         >
//     //           <img
//     //             src={url}
//     //             alt={`Signature ${index + 1}`}
//     //             className="max-h-full max-w-full object-contain"
//     //           />
//     //           <button className="bg-red-500">
//     //             Delete <DeleteOutlined />
//     //           </button>
//     //         </div>
//     //       ))}
//     //     </div>
//     //   </div>

//     //   <Modal
//     //     title="Preview Signature"
//     //     open={isModalVisible}
//     //     onCancel={() => setIsModalVisible(false)}
//     //     footer={[
//     //       <Button key="cancel" onClick={() => setIsModalVisible(false)}>
//     //         Cancel
//     //       </Button>,
//     //       <Button key="submit" type="primary" onClick={handleSubmit}>
//     //         Submit
//     //       </Button>,
//     //     ]}
//     //   >
//     //     {previewUrl && (
//     //       <img
//     //         src={previewUrl}
//     //         alt="Selected Signature"
//     //         className="max-w-full max-h-96 mx-auto"
//     //       />
//     //     )}
//     //   </Modal>
//     // </div>
//     <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-6xl mx-auto">
//   <h2 className="text-2xl font-semibold mb-6">Signature Management</h2>

//   {/* Upload Section */}
//   <div className="flex flex-col md:flex-row gap-4 mb-6">
//     <button
//       onClick={handleButtonClick}
//       className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition duration-200"
//     >
//       Add New Signature
//     </button>

//     <div
//       onClick={handleButtonClick}
//       className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 hover:border-blue-400 transition duration-200"
//     >
//       Upload file (jpg, jpeg, png, bmp)
//     </div>

//     <input
//       type="file"
//       accept=".jpg,.jpeg,.png,.bmp"
//       ref={fileInputRef}
//       onChange={handleFileChange}
//       className="hidden"
//     />
//   </div>

//   {/* Signature Library */}
//   <div>
//     <h3 className="text-lg font-semibold mb-4">Signature Library</h3>
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//       {signatures.map((url, index) => (
//         <div
//           key={index}
//           className="relative border rounded-lg p-2 w-full h-64 flex items-center justify-center bg-gray-50"
//         >
//           <img
//             src={url}
//             alt={`Signature ${index + 1}`}
//             className="max-h-full max-w-full object-contain"
//           />
//           <button
//             onClick={() => handleDelete(url)}
//             className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md"
//           >
//             <DeleteOutlined />
//           </button>
//         </div>
//       ))}
//     </div>
//   </div>

//   {/* Preview Modal */}
//   <Modal
//     title="Preview Signature"
//     open={isModalVisible}
//     onCancel={() => setIsModalVisible(false)}
//     footer={[
//       <Button key="cancel" onClick={() => setIsModalVisible(false)}>
//         Cancel
//       </Button>,
//       <Button key="submit" type="primary" onClick={handleSubmit}>
//         Submit
//       </Button>,
//     ]}
//   >
//     {previewUrl && (
//       <img
//         src={previewUrl}
//         alt="Selected Signature"
//         className="max-w-full max-h-96 mx-auto"
//       />
//     )}
//   </Modal>
// </div>

//   );
// };

// export default Signatures;

// version 2 
import React, { useRef, useState, useEffect } from "react";
import { Modal, Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  fetchSignatures,
  uploadSignature,
  deleteSignature,
} from "../Api/signatureApi"; // Adjust the path accordingly

// Define the Signature interface
interface Signature {
  _id: string;
  url: string;
}

const Signatures: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const signatureData = await fetchSignatures();
      setSignatures(signatureData);
    } catch (error) {
      console.error("Error loading signatures:", error);
      message.error("Failed to load signatures.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

    try {
      await uploadSignature(selectedFile);
      message.success("Signature uploaded successfully!");
      setIsModalVisible(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchData();
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Failed to upload signature. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSignature(id);
      message.success("Signature deleted successfully!");
      setSignatures((prev) => prev.filter((sig) => sig._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Failed to delete signature. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Signature Management</h2>

      {/* Upload Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <button
          onClick={handleButtonClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition duration-200"
        >
          Add New Signature
        </button>

        <div
          onClick={handleButtonClick}
          className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 hover:border-blue-400 transition duration-200"
        >
          Upload file (jpg, jpeg, png, bmp)
        </div>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.bmp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Signature Library */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Signature Library</h3>
        {isLoading ? (
          <p>Loading signatures...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {signatures.map((signature, index) => (
              <div
                key={signature._id}
                className="relative border rounded-lg p-2 w-full h-64 flex items-center justify-center bg-gray-50"
              >
                <img
                  src={signature.url}
                  alt={`Signature ${index + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={() => handleDelete(signature._id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md"
                >
                  <DeleteOutlined />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
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
