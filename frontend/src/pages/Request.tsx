import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { mainClient, useAppStore } from "../store";
import { rolesMap } from '../libs/statusMap';
import { message, Spin } from "antd";


export default function RequestPage() {
    const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [bulkdataId, setBulkdataId] = useState(null);

  interface Request {
    [key: string]: any;
    signDate?: string;
  }

  const session = useAppStore().session;
  const userRole = session?.role === 2 ? rolesMap[2] : session?.role === 3 ? rolesMap[3] : null;

  const [tablehead, settablehead] = useState<Request[]>([]);
  const [tabledata, settabledata] = useState<Request[]>([]);

  const fetchData = async () => {
    const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];
    try {
      const response = await mainClient.request("POST", "/api/request/tablehead", {
        data: { requestId },
      });
      const data = Array.isArray(response.data) ? response.data : [];
      settablehead(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchtableData = async () => {
    const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];
    try {
      const response = await mainClient.request("POST", "/api/request/tabledata", {
        data: { requestId },
      });
      const [tableData, bulkdataId] = response.data;
      if (response.status === 200) {
        setLoading(false);
      }
      setBulkdataId(bulkdataId);
      settabledata(Array.isArray(tableData) ? tableData : []);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  useEffect(() => {
    fetchtableData();
  }, [loading]);

  const downloadExcelTemplate = async () => {
    const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];

    try {
      const response = await mainClient.request("POST", "/api/request/templateExcelDownload", {
        responseType: "blob",
        data: { requestId },
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading template:", err);
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

    const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("requestId", requestId);

    try {
      await mainClient.request("POST", "/api/request/bulkUpload", {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      fetchtableData();
      message.success("File uploaded successfully!");
      event.target.value = "";
    } catch (err) {
      console.error("File upload error:", err);
      message.error("Failed to upload file.");
    }
  };

  const PreviewReqData = async (rowId: string) => {
    const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];
  
    // Open a new blank tab immediately
    const newWindow = window.open("", "_blank");
  
    if (!newWindow) {
      message.error("Popup blocked! Please allow popups for this site.");
      return;
    }
  
    try {
      setLoading(true);
      const response = await mainClient.request("POST", "/api/request/PreviewRequest", {
        responseType: "blob",
        data: { requestId, rowId, bulkdataId },
      });
  
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        newWindow.location.href = url;
      } else {
        newWindow.close();
        message.error("Failed to generate preview.");
      }
    } catch (err) {
      newWindow.close();
      message.error("Something went wrong while generating the template.");
    } finally {
      setLoading(false);
    }
  };
  

  const ReqDelete = async (rowId: string) => {
    const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];
    try {
      const response = await mainClient.request("POST", "/api/request/DeleteRequestOfficer", {
        data: { requestId, rowId, bulkdataId },
      });
      if (response.status === 200) {
        setLoading(true);
        message.success("Request Deleted Successfully");
      }
    } catch {
      message.error("Error In Deleting request");
    }
  };

  const ReqReject = async (rowId: string) => {
    const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];
    try {
      const response = await mainClient.request("POST", "/api/request/RejectRequestOfficer", {
        data: { requestId, rowId, bulkdataId },
      });
      if (response.status === 200) {
        setLoading(true);
        message.success("Request Rejected Successfully");
      }
    } catch {
      message.error("Error rejecting request");
    }
  };

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
            {userRole === 'Reader' && (
              <>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={handleBulkUploadClick}
                >
                  Bulk Upload (xls, csv)
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={downloadExcelTemplate}
                >
                  Download Template
                </button>
              </>
            )}
          </div>
        </div>

        <Spin spinning={loading} tip="Processing...">
          <table className="table-auto w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                {tablehead.map((header, index) => (
                  <th key={index} className="p-3">{String(header)}</th>
                ))}
                <th className="p-3">Sign Date</th>
                <th className="p-3">Request Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {tabledata.map((doc, index) => (
                <tr key={index} className="border-t">
                  {tablehead.map((header, headerIndex) => (
                    <td key={headerIndex} className="p-3">{doc[header] || '—'}</td>
                  ))}
                  <td className="p-3">{doc.signDate || '—'}</td>
                  <td className="p-3">{doc.status || '—'}</td>
                  <td className="p-3">
                    {doc.status === "Signed" && (
                      <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600" onClick={() => PreviewReqData(doc._id)}>
                        Download
                      </button>
                    )}
                    {doc.status === "Delegated" && (
                      <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600" onClick={() => PreviewReqData(doc._id)}>
                        Preview
                      </button>
                    )}
                    {doc.status === "Rejected" && (
                      <button className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => alert("No action allowed. Request already rejected.")}>
                        No Action Allowed
                      </button>
                    )}
                    {["Unsigned"].includes(doc.status) && (
                      <>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600" onClick={() => PreviewReqData(doc._id)}>
                          Preview
                        </button>
                        {userRole === 'Reader' ? (
                          <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => ReqDelete(doc._id)}>
                            Delete
                          </button>
                        ) : (
                          <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => ReqReject(doc._id)}>
                            Reject
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Spin>
      </div>
    </div>
  );
}
