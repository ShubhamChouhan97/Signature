// src/api/requestPageApi.ts
import { mainClient } from "../store"; // Assuming mainClient is exported from your store

interface RequestDataRow {
  [key: string]: unknown;
  signDate?: string;
  status?: string;
  Rejectreason?: string;
}

// Fetch table head data and request status
export const fetchTableHeadAndStatus = async (requestId: string): Promise<[string[], string | null]> => {
  try {
    const response = await mainClient.request("POST", "/api/request/tablehead", {
      data: { requestId },
    });
    const responseData = response.data;
    const header = Array.isArray(responseData) && Array.isArray(responseData[0]) ? responseData[0] : [];
    const requestStatus = responseData[1] || null;
    return [header, requestStatus];
  } catch (error) {
    console.error("Error fetching table head:", error);
    throw error;
  }
};

// Fetch table data and bulk data ID
export const fetchTableDataAndBulkId = async (requestId: string): Promise<[RequestDataRow[], string | null]> => {
  try {
    const response = await mainClient.request("POST", "/api/request/tabledata", {
      data: { requestId },
    });
    const [tableData, bulkdataId] = response.data;
    return [Array.isArray(tableData) ? tableData : [], bulkdataId || null];
  } catch (error) {
    console.error("Error fetching table data:", error);
    throw error;
  }
};

// Download Excel template
export const downloadExcelTemplate = async (requestId: string): Promise<Blob> => {
  try {
    const response = await mainClient.request("POST", "/api/request/templateExcelDownload", {
      responseType: "blob",
      data: { requestId },
    });
    if (response.status === 200) {
      return new Blob([response.data]);
    }
    throw new Error("Failed to download template.");
  } catch (error) {
    console.error("Error downloading template:", error);
    throw error;
  }
};

// Handle bulk upload of file
export const uploadBulkData = async (file: File, requestId: string) => {
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
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

// Preview a specific request document
export const previewRequestDocument = async (requestId: string, rowId: string, bulkdataId: string | null, myId: string | undefined): Promise<Blob> => {
  try {
    const response = await mainClient.request("POST", "/api/request/PreviewRequest", {
      responseType: "blob",
      data: { requestId, rowId, bulkdataId, myId },
    });
    if (response.status === 200) {
      return new Blob([response.data], { type: "application/pdf" });
    }
    throw new Error("Failed to preview document.");
  } catch (error) {
    console.error("Preview document error:", error);
    throw error;
  }
};

// Delete a specific request document (reader action)
export const deleteRequestDocument = async (requestId: string, rowId: string, bulkdataId: string | null, myId: string | undefined) => {
  try {
    const response = await mainClient.request("POST", "/api/request/DeleteRequestReader", {
      data: { requestId, rowId, bulkdataId, myId },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error deleting request document:", error);
    throw error;
  }
};

// Reject a specific request document (officer action)
export const rejectRequestDocumentByOfficer = async (requestId: string, rowId: string | null, bulkdataId: string | null, reason: string, myId: string | undefined) => {
  try {
    const response = await mainClient.request("POST", "/api/request/RejectRequestByOfficer", {
      data: {
        requestId,
        rowId,
        bulkdataId,
        reason,
        myId,
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error rejecting request document:", error);
    throw error;
  }
};

