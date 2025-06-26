// import React, { useRef, useEffect, useState } from "react";
// import { useLocation } from "react-router";
// import { mainClient, useAppStore } from "../store";
// import { rolesMap } from '../libs/statusMap';
// import { Modal, Input,message, Spin } from "antd";


// export default function RequestPage() {
//     const location = useLocation();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [loading, setLoading] = useState(false);
//   const [bulkdataId, setBulkdataId] = useState(null);
//   const normalizedDoc: Record<string, any> = {};
//   const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");
//   const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  
//   interface Request {
//     [key: string]: any;
//     signDate?: string;
//   }

//   const session = useAppStore().session
//         const myId=useAppStore().session?.userId;
//   const userRole = session?.role === 2 ? rolesMap[2] : session?.role === 3 ? rolesMap[3] : null;

//   const [tablehead, settablehead] = useState<Request[]>([]);
//   const [tabledata, settabledata] = useState<Request[]>([]);
//   const [requestStatus,setrequestStatus] = useState<string | null>(null);

//   const fetchData = async () => {
//     const pathSegments = location.pathname.split("/");
//     const requestId = pathSegments[pathSegments.length - 1];
  
//     try {
//       const response = await mainClient.request("POST", "/api/request/tablehead", {
//         data: { requestId },
//       });
  
//       const responseData = response.data;
//       const header = Array.isArray(responseData) && Array.isArray(responseData[0]) ? responseData[0] : [];
  
//       settablehead(header);
//       setrequestStatus(responseData[1]);
      
     
//     } catch (error) {
//       console.error("Error fetching requests:", error);
//     }
//   };
  

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // useEffect(() => {
//   //   if (requestStatus !== null) {
//   //     console.log("Updated requestStatus:", requestStatus);
//   //   }
//   // }, [requestStatus]);

//   const fetchtableData = async () => {
//     const pathSegments = location.pathname.split("/");
//     const requestId = pathSegments[pathSegments.length - 1];
//     try {
//       const response = await mainClient.request("POST", "/api/request/tabledata", {
//         data: { requestId },
//       });
//       const [tableData, bulkdataId] = response.data;
//       if (response.status === 200) {
//         setLoading(false);
//       }
//       setBulkdataId(bulkdataId);
//       settabledata(Array.isArray(tableData) ? tableData : []);
//     } catch (error) {
//       console.error("Error fetching table data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchtableData();
//   }, [loading]);

//   const downloadExcelTemplate = async () => {
//     const pathSegments = location.pathname.split("/");
//     const requestId = pathSegments[pathSegments.length - 1];

//     try {
//       const response = await mainClient.request("POST", "/api/request/templateExcelDownload", {
//         responseType: "blob",
//         data: { requestId },
//       });

//       const blob = new Blob([response.data]);
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "template.xlsx";
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Error downloading template:", err);
//       message.error("Something went wrong while downloading the template.");
//     }
//   };

//   const handleBulkUploadClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const validExtensions = [".xls", ".xlsx", ".csv"];
//     const fileName = file.name.toLowerCase();
//     const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));

//     if (!isValidFile) {
//       message.error("Please upload a valid .xls, .xlsx, or .csv file.");
//       return;
//     }

//     const pathSegments = location.pathname.split("/");
//     const requestId = pathSegments[pathSegments.length - 1];
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("requestId", requestId);

//     try {
//       await mainClient.request("POST", "/api/request/bulkUpload", {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         data: formData,
//       });

//       fetchtableData();
//       message.success("File uploaded successfully!");
//       event.target.value = "";
//     } catch (err) {
//       console.error("File upload error:", err);
//       message.error("Failed to upload file.");
//     }
//   };
//   const PreviewReqData = async (rowId: string) => {
//     const pathSegments = location.pathname.split("/");
//     const requestId = pathSegments[pathSegments.length - 1];
  
//     try {
//       setLoading(true);
  
//       const response = await mainClient.request("POST", "/api/request/PreviewRequest", {
//         responseType: "blob", // Important: tell axios to treat it as binary data
//         data: { requestId, rowId, bulkdataId, myId},
//       });
  
//       const blob = new Blob([response.data], { type: "application/pdf" });
//       const fileURL = window.URL.createObjectURL(blob);
//       window.open(fileURL, "_blank");
//     } catch (err) {
//       console.error("Preview error:", err);
//       message.error("Failed to preview document.");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const ReqDelete = async (rowId: string) => {
//     const pathSegments = location.pathname.split("/");
//     const requestId = pathSegments[pathSegments.length - 1];
//     try {
//       const response = await mainClient.request("POST", "/api/request/DeleteRequestReader", {
//         data: { requestId, rowId, bulkdataId,myId },
//       });
//       if (response.status === 200) {
//         setLoading(true);
//         message.success("Request Deleted Successfully");
//       }
//     } catch {
//       message.error("Error In Deleting request");
//     }
//   };
//   const handleRejectConfirm = async () => {
//     if (!rejectReason.trim()) {
//       message.warning("Please enter a rejection reason.");
//       return;
//     }
  
//     const pathSegments = location.pathname.split("/");
//     const requestId = pathSegments[pathSegments.length - 1];
  
//     try {
//       const response = await mainClient.request("POST", "/api/request/RejectRequestByOfficer", {
//         data: {
//           requestId,
//           rowId: selectedRowId,
//           bulkdataId,
//           reason: rejectReason,
//           myId:myId,
//         },
//       });
  
//       if (response.status === 200) {
//         message.success("Request Rejected Successfully");
//         setLoading(true);
//         setIsRejectModalVisible(false);
//         setRejectReason("");
//         setSelectedRowId(null);
//       }
//     } catch (error) {
//       message.error("Error rejecting request.");
//     }
//   };
  

//   const ReqReject = async (rowId: string) => {
//     if(requestStatus === "Rejected")
//     {
//       message.error("Full Request is already Rejected");
//     }
//     else{
//       setSelectedRowId(rowId);
//     setIsRejectModalVisible(true);
//     }
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-semibold">{userRole === 'Reader' ? "Reader Document Management" : "Officer Document Management"}</h1>
//           <div className="space-x-3">
//             <input
//               type="file"
//               accept=".xls,.xlsx,.csv"
//               style={{ display: "none" }}
//               ref={fileInputRef}
//               onChange={handleFileChange}
//             />
//              {["Reader", "Officer"].includes(userRole ?? "") && requestStatus === "Draft"  && (
//     <>
//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
//         onClick={handleBulkUploadClick}
//       >
//         Bulk Upload (xls, csv)
//       </button>
//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
//         onClick={downloadExcelTemplate}
//       >
//         Download Template
//       </button>
//     </>
//   )}
//           </div>
//         </div>

//         <Spin spinning={loading} tip="Processing...">
//           <div className="overflow-x-auto w-full">
//        <table className="min-w-full table-auto border-collapse">
//        <thead>
//        <tr className="bg-gray-100 text-left">
//         {tablehead.map((header, index) => (
//           <th
//             key={index}
//             className="p-3 whitespace-nowrap border-b border-gray-300"
//           >
//             {String(header)}
//           </th>
//         ))}
//         {/* Sticky Headers */}
//         <th className="p-3 sticky right-[240px] bg-gray-100 border-b border-gray-300 whitespace-nowrap">
//           Sign Date
//         </th>
//         <th className="p-3 sticky right-[120px] bg-gray-100 border-b border-gray-300 whitespace-nowrap">
//           Request Status
//         </th>
//         <th className="p-3 sticky right-0 bg-gray-100 border-b border-gray-300 whitespace-nowrap">
//           Action
//         </th>
//       </tr>
//       </thead>
//        <tbody>
//       {tabledata.map((doc, index) => {
//         const normalizedDoc: Record<string, any> = {};
//         Object.entries(doc).forEach(([key, value]) => {
//           normalizedDoc[key.toLowerCase()] = value;
//         });

//         return (
//           <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
//             {tablehead.map((header, hIndex) => {
//               const key = header.toLowerCase();
//               return (
//                 <td
//                   key={hIndex}
//                   className="p-3 whitespace-nowrap border-b border-gray-100"
//                 >
//                   {normalizedDoc[key] || "—"}
//                 </td>
//               );
//             })}

//             {/* Sticky Right Columns */}
//             <td className="p-3 whitespace-nowrap sticky right-[240px] bg-white border-b border-gray-100">
//               {doc.signDate || "—"}
//             </td>
//             <td className="p-3 whitespace-nowrap sticky right-[120px] bg-white border-b border-gray-100">
//   {doc.status === "Rejected" && doc.Rejectreason ? (
//     <div className="relative group inline-flex items-center gap-1 cursor-pointer">
//       <span className="text-red-600">Rejected</span>
//       <span className="text-blue-500">ℹ️</span>

//       {/* Tooltip */}
//       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-gray-800 text-white text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-normal text-wrap">
//         {doc.Rejectreason}
//       </div>
//     </div>
//   ) : (
//     <span>{doc.status || "—"}</span>
//   )}
// </td>

//             <td className="p-3 whitespace-nowrap sticky right-0 bg-white border-b border-gray-100">
//               {/* Actions */}
//               {doc.status === "Signed" && (
//                 <button
//                   className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                   onClick={() => PreviewReqData(doc._id)}
//                 >
//                   Download
//                 </button>
//               )}
//               {doc.status === "Delegated" && (
//                 <button
//                   className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                   onClick={() => PreviewReqData(doc._id)}
//                 >
//                   Preview
//                 </button>
//               )}
//               {doc.status === "Rejected" && (
//                 <button
//                   className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-600"
//                   onClick={() =>
//                     alert("No action allowed. Request already rejected.")
//                   }
//                 >
//                   No Action
//                 </button>
//               )}
//               {doc.status === "Unsigned" && (
//                 <>
//                   <button
//                     className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
//                     onClick={() => PreviewReqData(doc._id)}
//                   >
//                     Preview
//                   </button>
//                   {userRole === "Reader" ? (
//                     <button
//                       className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                       onClick={() => ReqDelete(doc._id)}
//                     >
//                       Delete
//                     </button>
//                   ) : (
//                     <button
//                       className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                       onClick={() => ReqReject(doc._id)} >
//                       Reject
//                     </button>
//                   )}
//                 </>
//               )}
//             </td>
//           </tr>
//         );
//       })}
//        </tbody>
//       </table>
//        </div>
//         </Spin>
//        </div>
//        <Modal
//          title="Reject Request"
//          open={isRejectModalVisible}
//           onCancel={() => {
//           setIsRejectModalVisible(false);
//          setRejectReason("");
//             setSelectedRowId(null);
//          }}
//           onOk={handleRejectConfirm}
//        okText="Reject"
//           okButtonProps={{ danger: true }}>
//           <p>Please enter the reason for rejecting this request:</p>
//         <Input.TextArea
//            rows={4}
//            value={rejectReason}
//          onChange={(e) => setRejectReason(e.target.value)}
//           placeholder="Enter rejection reason..."
//       />
//        </Modal>

//     </div>
//   );
// }
import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useAppStore } from "../store"; // Keep useAppStore for session
import { rolesMap } from '../libs/statusMap';
import { Modal, Input, message, Spin } from "antd";

// Import your API functions
import {
  fetchTableHeadAndStatus,
  fetchTableDataAndBulkId,
  downloadExcelTemplate,
  uploadBulkData,
  previewRequestDocument,
  deleteRequestDocument,
  rejectRequestDocumentByOfficer,
} from '../Api/requestPageApi'; // Adjust path as needed


export default function RequestPage() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [bulkdataId, setBulkdataId] = useState<string | null>(null);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  interface RequestDataRow { // Renamed for clarity, was 'Request' in original but used for table rows
    [key: string]: unknown;
    signDate?: string;
    status?: string; // Add status to the interface
    Rejectreason?: string; // Add Rejectreason for tooltip
  }

  const session = useAppStore().session
  const myId = useAppStore().session?.userId;
  const userRole = session?.role === 2 ? rolesMap[2] : session?.role === 3 ? rolesMap[3] : null;

  const [tablehead, settablehead] = useState<string[]>([]); // Changed to string[] based on usage
  const [tabledata, settabledata] = useState<RequestDataRow[]>([]);
  const [requestStatus, setrequestStatus] = useState<string | null>(null);

  const getRequestId = (): string => {
    const pathSegments = location.pathname.split("/");
    return pathSegments[pathSegments.length - 1];
  };

  const fetchData = async () => {
    const requestId = getRequestId();
    try {
      const [header, status] = await fetchTableHeadAndStatus(requestId);
      settablehead(header);
      setrequestStatus(status);
    } catch  {
      message.error("Failed to fetch request details.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchTableContent = async () => { // Renamed to avoid confusion with initial fetchData
    const requestId = getRequestId();
    try {
      const [tableData, bulkId] = await fetchTableDataAndBulkId(requestId);
      setBulkdataId(bulkId);
      settabledata(tableData);
    } catch {
      message.error("Failed to fetch table data.");
    } finally {
      setLoading(false); // Ensure loading is turned off
    }
  };

  useEffect(() => {
    fetchTableContent();
  }, [loading]); // Trigger refresh when loading state changes (after upload/delete/reject)


  const handleDownloadExcelTemplate = async () => {
    const requestId = getRequestId();
    try {
      const blob = await downloadExcelTemplate(requestId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch  {
      message.error("Something went wrong while downloading the template.");
    }
  };

  const handleBulkUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = [".xls", ".xlsx", ".csv"];
    const fileName = file.name.toLowerCase();
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidFile) {
      message.error("Please upload a valid .xls, .xlsx, or .csv file.");
      return;
    }

    const requestId = getRequestId();
    setLoading(true); // Start loading before upload

    try {
      await uploadBulkData(file, requestId);
      message.success("File uploaded successfully!");
      event.target.value = ""; // Clear file input
    } catch  {
      message.error("Failed to upload file.");
    } finally {
      setLoading(false); // Stop loading after upload (success or failure)
    }
  };

  const PreviewReqData = async (rowId: string) => {
    const requestId = getRequestId();
    setLoading(true); // Start loading before preview

    try {
      const blob = await previewRequestDocument(requestId, rowId, bulkdataId, myId);
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch  {
      message.error("Failed to preview document.");
    } finally {
      setLoading(false); // Stop loading after preview (success or failure)
    }
  };

  const ReqDelete = async (rowId: string) => {
    const requestId = getRequestId();
    setLoading(true); // Start loading before delete

    try {
      const success = await deleteRequestDocument(requestId, rowId, bulkdataId, myId);
      if (success) {
        message.success("Request Deleted Successfully");
      } else {
        message.error("Failed to delete request.");
      }
    } catch {
      message.error("Error in Deleting request");
    } finally {
      setLoading(false); // Stop loading after delete (success or failure)
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      message.warning("Please enter a rejection reason.");
      return;
    }

    const requestId = getRequestId();
    setLoading(true); // Start loading before reject

    try {
      const success = await rejectRequestDocumentByOfficer(requestId, selectedRowId, bulkdataId, rejectReason, myId);

      if (success) {
        message.success("Request Rejected Successfully");
        setIsRejectModalVisible(false);
        setRejectReason("");
        setSelectedRowId(null);
      } else {
        message.error("Failed to reject request.");
      }
    } catch {
      message.error("Error rejecting request.");
    } finally {
      setLoading(false); // Stop loading after reject (success or failure)
    }
  };


  const ReqReject = async (rowId: string) => {
    if (requestStatus === "Rejected") {
      message.error("Full Request is already Rejected");
    } else {
      setSelectedRowId(rowId);
      setIsRejectModalVisible(true);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">{userRole === 'Reader' ? "Reader Document Management" : "Officer Document Management"}</h1>
          <div className="space-x-3">
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {["Reader", "Officer"].includes(userRole ?? "") && requestStatus === "Draft" && (
              <>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={handleBulkUploadClick}
                >
                  Bulk Upload (xls, csv)
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={handleDownloadExcelTemplate}
                >
                  Download Template
                </button>
              </>
            )}
          </div>
        </div>

        <Spin spinning={loading} tip="Processing...">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  {tablehead.map((header, index) => (
                    <th
                      key={index}
                      className="p-3 whitespace-nowrap border-b border-gray-300"
                    >
                      {String(header)}
                    </th>
                  ))}
                  {/* Sticky Headers */}
                  <th className="p-3 sticky right-[240px] bg-gray-100 border-b border-gray-300 whitespace-nowrap">
                    Sign Date
                  </th>
                  <th className="p-3 sticky right-[120px] bg-gray-100 border-b border-gray-300 whitespace-nowrap">
                    Request Status
                  </th>
                  <th className="p-3 sticky right-0 bg-gray-100 border-b border-gray-300 whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {tabledata.map((doc, index) => {
                  const normalizedDoc: Record<string, unknown> = {};
                  Object.entries(doc).forEach(([key, value]) => {
                    normalizedDoc[key.toLowerCase()] = value;
                  });

                  return (
                    <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                      {tablehead.map((header, hIndex) => {
                        const key = header.toLowerCase();
                        return (
                          <td
                            key={hIndex}
                            className="p-3 whitespace-nowrap border-b border-gray-100"
                          >
                            {normalizedDoc[key] || "—"}
                          </td>
                        );
                      })}

                      {/* Sticky Right Columns */}
                      <td className="p-3 whitespace-nowrap sticky right-[240px] bg-white border-b border-gray-100">
                        {doc.signDate || "—"}
                      </td>
                      <td className="p-3 whitespace-nowrap sticky right-[120px] bg-white border-b border-gray-100">
                        {doc.status === "Rejected" && doc.Rejectreason ? (
                          <div className="relative group inline-flex items-center gap-1 cursor-pointer">
                            <span className="text-red-600">Rejected</span>
                            <span className="text-blue-500">ℹ️</span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-gray-800 text-white text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-normal text-wrap">
                              {doc.Rejectreason}
                            </div>
                          </div>
                        ) : (
                          <span>{doc.status || "—"}</span>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap sticky right-0 bg-white border-b border-gray-100">
                        {/* Actions */}
                        {doc.status === "Signed" && (
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => PreviewReqData(doc._id as string)}
                          >
                            Download
                          </button>
                        )}
                        {doc.status === "Delegated" && (
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => PreviewReqData(doc._id as string)}
                          >
                            Preview
                          </button>
                        )}
                        {doc.status === "Rejected" && (
                          <button
                            className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={() =>
                              message.error("No action allowed. Request already rejected.") // Changed alert to Ant Design message
                            }
                          >
                            No Action
                          </button>
                        )}
                        {doc.status === "Unsigned" && (
                          <>
                            <button
                              className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                              onClick={() => PreviewReqData(doc._id as string)}
                            >
                              Preview
                            </button>
                            {userRole === "Reader" ? (
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                onClick={() => ReqDelete(doc._id as string)}
                              >
                                Delete
                              </button>
                            ) : (
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                onClick={() => ReqReject(doc._id as string)} >
                                Reject
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Spin>
      </div>
      <Modal
        title="Reject Request"
        open={isRejectModalVisible}
        onCancel={() => {
          setIsRejectModalVisible(false);
          setRejectReason("");
          setSelectedRowId(null);
        }}
        onOk={handleRejectConfirm}
        okText="Reject"
        okButtonProps={{ danger: true }}>
        <p>Please enter the reason for rejecting this request:</p>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter rejection reason..."
        />
      </Modal>

    </div>
  );
}