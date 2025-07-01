// src/api/requestsApi.ts
import { mainClient } from "../store"; // Assuming mainClient is exported from your store

interface Request {
  rejectReason: string;
  _id: string;
  title: string;
  numberOfDocuments: number;
  rejectedDocuments: number;
  createdAt: string;
  status: 'Draft' | 'Delegated' | 'Ready for Dispatch' | 'Waited for Signature' | 'Rejected' | 'Pending';
  actions: 'Draft' | 'Pending' | 'Signed' | 'Submited' | 'Delegated' | 'Rejected' | 'Failed';
}

type Signature = {
  _id: string;
  url: string;
};

// Fetch all requests
export const fetchAllRequests = async (): Promise<Request[]> => {
  try {
    const response = await mainClient.request("GET", "/api/request/allrequest");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Fetch all signatures
export const fetchAllSignatures = async (): Promise<Signature[]> => {
  try {
    const response = await mainClient.request("GET", "/api/signatures/allSign");
    return response.data.map((item: { _id: string; url: string }) => ({
      _id: item._id,
      url: `http://localhost:3000/${item.url}`,
    }));
  } catch (error) {
    console.error("Error fetching signatures:", error);
    throw error;
  }
};

// Fetch officer data
export const fetchOfficerData = async (): Promise<{ label: string, value: string }[]> => {
  try {
    const response = await mainClient.request("GET", "api/users/officer");
    return response.data.map((officer: { name: string, id: string }) => ({
      label: officer.name,
      value: officer.id,
    }));
  } catch (error) {
    console.error("Error fetching officer data:", error);
    throw error;
  }
};

// Send request to officer
export const sendRequestToOfficer = async (requestId: string, officerId: string, officerName: string) => {
  try {
    const response = await mainClient.request("POST", "/api/request/send-to-officer", {
      data: {
        requestId,
        officerId,
        officerName,
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error sending request to officer:", error);
    throw error;
  }
};

// Clone a request
export const cloneRequest = async (requestId: string, newTitle: string) => {
  try {
    const response = await mainClient.request("POST", "/api/request/cloneRequest", {
      data: {
        requestId,
        newTitle
      },
    });
    return response.status === 201;
  } catch (error) {
    console.error("Error cloning request:", error);
    throw error;
  }
};

// Delete a request
export const deleteRequest = async (requestId: string, myId: string) => {
  try {
    const response = await mainClient.request("POST", "/api/request/deleteRequest", {
      data: {
        requestId,
        myId,
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error deleting request:", error);
    throw error;
  }
};

// Sign a request
export const signRequest = async (requestId: string, signatureId: string) => {
  try {
    const response = await mainClient.request("POST", "/api/signatures/SignRequest", {
      data: {
        requestId,
        signatureId,
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error signing request:", error);
    throw error;
  }
};

// Verify OTP for signature
export const verifySignRequestOtp = async (otp: string) => {
  try {
    const response = await mainClient.request("POST", "/api/signatures/SignRequestOtpVerify", {
      data: {
        otp,
      },
    });
    console.log("OTP verification response:", response);
    return response.status === 200;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

// Print a request
export const printRequest = async (requestId: string): Promise<Blob> => {
  try {
    const response = await mainClient.request("POST", "/api/request/printRequest", {
      data: { requestId },
      responseType: "blob",
    });
    if (response.status === 200) {
      return new Blob([response.data], { type: 'application/pdf' });
    }
    throw new Error('Failed to print.');
  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
};

// Download all documents as ZIP
export const downloadAllDocumentsZip = async (requestId: string): Promise<Blob> => {
  try {
    const response = await mainClient.request("POST", "/api/request/downloadzip", {
      data: { requestId },
      responseType: "blob",
    });
    if (response.status === 200) {
      return new Blob([response.data], { type: 'application/zip' });
    }
    throw new Error('Failed to generate ZIP.');
  } catch (error) {
    console.error("Download ZIP error:", error);
    throw error;
  }
};

// Reject a request
export const rejectRequest = async (requestId: string, reason: string, myId: string) => {
  try {
    const response = await mainClient.request("POST", "/api/request/RejectRequest", {
      data: {
        requestId,
        reason,
        myId,
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error rejecting request:", error);
    throw error;
  }
};

// Delegate a request
export const delegateRequest = async (requestId: string, myId: string) => {
  try {
    const response = await mainClient.request("POST", "/api/request/DelegateRequest", {
      data: {
        requestId,
        myId,
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error delegating request:", error);
    throw error;
  }
};

// Create a new request
export const createNewRequest = async (formData: FormData) => {
  try {
    const response = await mainClient.request("POST", "api/request/redersend", {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};

// Preview a request template
export const previewRequestTemplate = async (requestId: string): Promise<Blob> => {
  try {
    const response = await mainClient.request("POST", "/api/request/templateDownload", {
      responseType: "blob",
      data: { requestId },
    });
    if (response.status === 200) {
      return new Blob([response.data], { type: "application/pdf" });
    }
    throw new Error('Failed to download template.');
  } catch (error) {
    console.error("Error downloading template:", error);
    throw error;
  }
};

// Download sample template
export const downloadSampleTemplate = async (): Promise<Blob> => {
  try {
    const response = await mainClient.request("GET", "/api/templates/sampleTemplate", {
      responseType: "blob",
    });
    if (response.status === 200) {
      return new Blob([response.data]);
    }
    throw new Error('Failed to download sample template.');
  } catch (error) {
    console.error("Error downloading sample template:", error);
    throw error;
  }
};
// request for dispatch
export const DispatchRequest = async (requestId: string) => {
  try {
    const response = await mainClient.request("POST", "/api/request/dispatchrequest", {
      data: {
        requestId
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error rejecting request document:", error);
    throw error;
  }
};

export const dispatchNumberFind = async () => {
  try {
    const response = await mainClient.request("GET", "/api/request/dispatchnumberfind");
    return response.data;
  } catch (error) {
    console.error("Error fetching dispatch number:", error);
    throw error;
  }
}