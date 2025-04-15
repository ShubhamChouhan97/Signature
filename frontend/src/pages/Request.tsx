import React, { useRef,useEffect,useState } from "react";
import { useLocation } from "react-router";
import { mainClient } from "../store";

const documents = [
  {
    name: "Document 1",
    type: "PDF",
    status: "Approved",
    owner: "John Doe",
    signDate: "04/15/2024",
    requestStatus: "Signed",
  },
  {
    name: "Document 2",
    type: "DOCX",
    status: "Pending",
    owner: "Jane Smith",
    signDate: "",
    requestStatus: "Delegated",
  },
  {
    name: "Document 3",
    type: "DOCX",
    status: "Pending",
    owner: "Jane Smith",
    signDate: "",
    requestStatus: "Unsigned",
  },
  {
    name: "Document 4",
    type: "DOCX",
    status: "Pending",
    owner: "Jarie Smith",
    signDate: "26/12/2021",
    requestStatus: "Unsigned",
  },
];

export default function RequestPage() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
 const [loading, setLoading] = useState(false);
 interface Request {
   [key: string]: any; // Add this to allow dynamic keys like 'signDate'
   signDate?: string;  // Explicitly define 'signDate' as an optional property
 }

 const [tablehead, settablehead] = useState<Request[]>([]);
 const [tabledata, settabledata] = useState<Request[]>([]);
  // raise a request when page is render for tabloe head

  const fetchData = async () => {
	const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];
	  setLoading(true);
	  try {
		const response = await mainClient.request("POST", "/api/request/tablehead",{
			data: { requestId },
		});
		const data = Array.isArray(response.data) ? response.data : [];
		settablehead(data);
	  } catch (error) {
		console.error("Error fetching requests:", error);
	  } finally {
		setLoading(false);
	  }
	};
	
	useEffect(() => {
	  fetchData();
	}, []);


	const fetchtableData = async () => {
		const pathSegments = location.pathname.split("/");
        const requestId = pathSegments[pathSegments.length - 1];
		  setLoading(true);
		  try {
			const response = await mainClient.request("POST", "/api/request/tabledata",{
				data: { requestId },
			});
			const data = Array.isArray(response.data) ? response.data : [];
			settabledata(data);
		  } catch (error) {
			console.error("Error fetching requests:", error);
		  } finally {
			setLoading(false);
		  }
		};
		
		useEffect(() => {
		  fetchtableData();
		}, []);
	

  const downloadTemplate = async () => {
    const pathSegments = location.pathname.split("/");
    const requestId = pathSegments[pathSegments.length - 1];

    try {
      const response = await mainClient.request("POST", "/api/request/templateDownload", {
        responseType: "blob",
        data: { requestId },
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading template:", err);
      alert("Something went wrong while downloading the template.");
    }
  };

  const handleBulkUploadClick = () => {
	if (fileInputRef.current) {
	  fileInputRef.current.click();
	}
  };
	
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
	console.log("hi");
	const file = event.target.files?.[0];
	if (!file) return;
  
	const pathSegments = location.pathname.split("/");
	const requestId = pathSegments[pathSegments.length - 1];
  
	const formData = new FormData();
	formData.append("file", file);
	formData.append("requestId", requestId);
  
	try {
		const res =  await mainClient.request(
			"POST",
			"/api/request/bulkUpload",
			{
			  headers: {
				"Content-Type": "multipart/form-data",
			  },
			  data: formData,
			}
		  );
		    fetchtableData();
	  alert("File uploaded successfully!");
	  event.target.value = ""; // Reset input so same file can be re-uploaded
	  // Optionally: Refresh document list or state update here
	} catch (err) {
	  console.error("File upload error:", err);
	  alert("Failed to upload file.");
	}
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Request Name</h1>
          <div className="space-x-3">
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
              onClick={handleBulkUploadClick}
            >
              Bulk Upload (xls, csv)
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
              onClick={downloadTemplate}
            >
              Download Template
            </button>
          </div>
        </div>

        {/* <table className="w-full table-auto border-collapse">
		<thead>
         <tr className="bg-gray-100 text-left">
         {tablehead.map((req) => (
         <th key={req.toString()} className="p-3">{req.toString()}</th>
         ))}
         <th className="p-3">Sign Date</th>
        <th className="p-3">Request Status</th>
        <th className="p-3">Action</th>
        </tr>
        </thead>

          <tbody>

            {documents.map((doc, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">{doc.name}</td>
                <td className="p-3">{doc.type}</td>
                <td className="p-3">{doc.status}</td>
                <td className="p-3">{doc.owner}</td>
                <td className="p-3">{doc.signDate || "—"}</td>
                <td className="p-3 text-blue-600">
                  {doc.requestStatus === "Signed" && <a href="#">Download</a>}
                  {["Delegated", "Unsigned"].includes(doc.requestStatus) && (
                    <a href="#">Preview</a>
                  )}
                </td>
                <td className="p-3 text-blue-600">
                  {doc.requestStatus === "Unsigned" && <a href="#">Delete</a>}
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}

<table className="table-auto w-full">
  <thead>
    <tr className="bg-gray-100 text-left">
      {/* Dynamically render table headers */}
      {tablehead.map((header, index) => (
        <th key={index} className="p-3">{String(header)}</th>
      ))}
      <th className="p-3">Sign Date</th>
      <th className="p-3">Request Status</th>
      <th className="p-3">Action</th>
    </tr>
  </thead>

  <tbody>
    {/* Dynamically render table body */}
    {tabledata.map((doc, index) => (
      <tr key={index} className="border-t">
        {/* Dynamically render each cell based on the object keys */}
        {tablehead.map((header, headerIndex) => (
          <td key={headerIndex} className="p-3">{doc[header] || '—'}</td>
        ))}
        <td className="p-3">{doc.signDate || '—'}</td>
        <td className="p-3">{doc.status || '—'}</td>
        <td className="p-3 text-blue-600">
          {doc.status === "Signed" && <a href="#">Download</a>}
          {["Delegated", "Unsigned"].includes(doc.status) && (
            <a href="#">Preview Delete</a>
          )}
        </td>
        <td className="p-3 text-blue-600">
          {doc.requestStatus === "Unsigned" && <a href="#">Delete</a>}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      </div>
    </div>
  );
}

