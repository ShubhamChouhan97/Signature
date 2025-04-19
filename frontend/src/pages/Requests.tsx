import React, { useEffect, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Upload,
  Modal,
  Select,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { mainClient, useAppStore } from "../store";
import { useNavigate } from "react-router";
import { rolesMap } from '../libs/statusMap';
import { io } from 'socket.io-client';
const socket = io("http://localhost:3000", {
  withCredentials: true
});

interface Request {
  _id: string;
  title: string;
  numberOfDocuments: number;
  rejectedDocuments: number;
  createdAt: string;
  status: 'Draft' | 'Delegated' | 'Ready for Dispatch' | 'Waited for Signature'|'Rejected';
  actions:'Draft' | 'Pending'| 'Signed'| 'Submited' | 'Delegated' | 'Rejected' ;
}

type Signature = {
  _id: string;
  url: string;
};
const actionButtonColors: Record<string, string> = {
  Clone: 'bg-gray-500 hover:bg-gray-600 text-white',
  'Send for Signature': 'bg-blue-600 hover:bg-blue-700 text-white',
  Delete: 'bg-red-600 hover:bg-red-700 text-white',
  Sign: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  Print: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  'Download All (ZIP)': 'bg-purple-600 hover:bg-purple-700 text-white',
  Dispatch: 'bg-green-400 hover:bg-green-700 text-white',
  Delegate: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  "No Action Allow" :'bg-red-400 text-white px-3 py-1 rounded hover:bg-red-600',
  Reject:'bg-red-600 hover:bg-red-700 text-white',
};

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [requestdata, setRequest] = useState<Request[]>([]);
  const [loadvar,setLoadvar] = useState(0);
  // officer data 
  const [officerData, setOfficerData] = useState<{ label: string, value: string }[]>([]); // Officer data state
  

// send for signature 
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedOfficer, setselectedOfficer] = useState<string | undefined>();
  const [searchUser, setSearchUser] = useState('');
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);

// Otp Modal 
const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
const [otp, setOtp] = useState("");

  // Request Clone 
  const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
  const [cloningRequest, setCloningRequest] = useState<Request | null>(null);
  const [clonedTitle, setClonedTitle] = useState('');

  // Signature
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [signRequest ,setSignRequest] =useState<Request | null>(null);
  const [issSignModalVisible, setIsSignModalVisible] = useState(false);
// user Deatils
      const session = useAppStore().session;
      const myId=useAppStore().session?.userId;
  const userRole  = session?.role === 2 ?rolesMap[2] : session?.role === 3 ? rolesMap[3]:null;

  // socket 
  useEffect(() => {
    socket.on('request-officer', (data) => {
      if(myId === data.officerId){
        setLoadvar((prev)=>prev+1);
     }
    });

    return () => {
      socket.off('request-officer');
    };
  }, []);

  useEffect(() => {
    socket.on('request-reader', (data) => {
      if(myId === data.readerId){
        setLoadvar((prev)=>prev+1);
     }
    });

    return () => {
      socket.off('request-reader');
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await mainClient.request("GET", "/api/request/allrequest");
      const data = Array.isArray(response.data) ? response.data : [];
      setRequest(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } 
  };

  useEffect(() => {
    fetchData();
  }, [loadvar]);

// const fetchSign = async () => {
//   try {
//     const response = await mainClient.request("GET", "/api/signatures/allSign");
//     const data = response.data;
//     setSignatures(data.map((item: any) => `http://localhost:3000/${item.url}`)); 
//   } catch (error) {
//     console.error("Error fetching signatures:", error);
//   }
// };
const fetchSign = async () => {
  try {
    const response = await mainClient.request("GET", "/api/signatures/allSign");
    const data = response.data;
    setSignatures(
      data.map((item: any) => ({
        _id: item._id,
        url: `http://localhost:3000/${item.url}`,
      }))
    );
  } catch (error) {
    console.error("Error fetching signatures:", error);
  }
};
  // Function to get officer selection 
  const handleOfficerSelectClick = async () => {
    try {
      const response = await mainClient.request("GET", "api/users/officer");
      const officerOptions = response.data.map((officer: { name: string, id: string }) => ({
        label: officer.name,
        value: officer.id,
      }));
  
   setOfficerData(officerOptions); // Set the fetched officer data
    } catch (error) {
      console.error("Error fetching officer data:", error);
    } 
  }
// function to send Request to officer
const requestSendtoOfficer = async () => {
  const officerName = officerData.find(officer => officer.value === selectedOfficer)?.label;
  try {
    const response = await mainClient.request("POST", "/api/request/send-to-officer", {
      data: {
        requestId: selectedRequest?._id,  // Include requestId in the request body
        officerId: selectedOfficer,
        officerName: officerName,
      },
    });

    if (response.status === 200) {
      message.success('Request sent to officer successfully!');
      setLoadvar((prev)=>prev+1);
    } else {
      message.error('Failed to send request to officer.');
    }
  } catch (error) {
    message.error('Failed to send request to officer.');
  }
};

  const filteredRequests = requestdata.filter((req) =>
    req.title.toLowerCase().includes(search.toLowerCase())
  );
const getActions = (req: Request) => {
  if (userRole === 'Reader') {
    switch (req.status) {
      case 'Draft':
        return ['Clone', 'Send for Signature', 'Delete'];
      case 'Delegated':
        return ['Clone', 'Sign'];
      case 'Ready for Dispatch':
        return ['Clone', 'Print', 'Download All (ZIP)', 'Dispatch'];
      case 'Waited for Signature':
        return ['Clone'];
        case 'Rejected':
        return ['Clone'];
      default:
        return [];
    }
  } else {
    // Officer actions based on officeraction
    switch (req.actions) {
      case 'Draft':
        return ['Clone','Sign','Delegate','Reject'];
      case 'Submited':
        return['Clone','Print']
      case 'Pending':
        return ['Clone','Submit','Print All'];
      case 'Signed':
        return ['Clone','Print', 'Dispatch'];
        case 'Delegated':
        return ['No Action Allow'];
        case 'Rejected':
          return ['No Action Allow'];
      default:
        return [];
    }
  }
};
  const handleCloneSubmit = async () => {
    if (!cloningRequest) return;
  
    try {
      const response = await mainClient.request("POST", "/api/request/cloneRequest", {
        data: {
          requestId: cloningRequest._id,
          newTitle: clonedTitle
        },
      });
  
      if (response.status === 201) {
        setIsCloneModalVisible(false);
        setCloningRequest(null);
        setLoadvar((prev) => prev + 1);
        message.success("Clone Successfully")
      } else {
        message.error("Failed to clone request.");
      }
    } catch (error) {
      message.error("Failed to clone request.");
    }
  };
  
  const handleClone = (request: Request) => {
    setCloningRequest(request);
    setClonedTitle(`${request.title}-clone`);
    setIsCloneModalVisible(true);
  };
  

  const handleSendForSignature = (request: Request) => {
    handleOfficerSelectClick();
    setSelectedRequest(request);

    if(request.numberOfDocuments === 0){
      message.error("Please Uplaod documents to For send to officer")
      return;
    }
    setIsSignatureModalVisible(true);
  };

  const handleSignatureSubmit = async () => {
    if (!selectedOfficer) {
      message.error("Please select a Officer.");
      return;
    }

    requestSendtoOfficer()
    setIsSignatureModalVisible(false);
    setselectedOfficer(undefined);
    setSearchUser('');
  };

  const handleDelete = async (request: Request) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${request.title}"?`);
    if (!confirmDelete) {
      return; // Exit if user clicks "Cancel"
    }
  
    try {
      const response = await mainClient.request("POST", "/api/request/deleteRequest", {
        data: {
          requestId: request._id, 
        },
      });
      if (response.status === 200) {
        setLoadvar((prev)=>prev+1);
      } else {
        message.error("Failed to delete request.");
      }
    } catch (error) {
      message.error("Failed to delete request.");
    }
  };
  
const signatureRequestSubmit = async () =>{
  if(!signRequest){
    return;
  }
  if(!selectedSignature){
    return;
  }
  try {
    const response = await mainClient.request("POST", "/api/signatures/SignRequest", {
      data: {
        requestId: signRequest._id, 
        signtureId:selectedSignature._id,
      },
    });
    if (response.status === 200) {
     message.success("All Document Sign ");
     setLoadvar((prev)=>prev+1);
      
    } else {
      message.error("Failed to Sign Documents.");
    }
  } catch (error) {
    message.error("Failed to Sign Document At server server.");
  }
}

   const handleSign = async (request: Request) => {
    await fetchSign();
    setSignRequest(request);
    setIsSignModalVisible(true);
  };

  const handleOtpVerified = async () => {
    try {
      const response = await mainClient.request("POST", "/api/signatures/SignRequestOtpVerify", {
        data: {
          otp: otp, 
        },
      });
      if (response.status === 200) {
       message.success("Otp Verified Sigin Started ");
        setIsOtpModalVisible(false);
        setIsSignModalVisible(false);
        signatureRequestSubmit();
      } else {
        message.error("Failed to Verify OTP.");
      }
    } catch (error) {
      message.error("Failed to Verify OTP at server.");
    }
    setOtp('');
  };

 const handleSubmitSignForOtp = async()=>{
  if (!selectedSignature) {
  message.warning("Please select a signature before submitting.");
  return;
}
if(!signRequest){
  return;
}
setIsOtpModalVisible(true);

 }


// const openPrintPreview = (parsedData: Record<string, any>[]) => {
//   const printWindow = window.open('', '_blank');

//   const content = parsedData.map((item: Record<string, any>, index: number) => {
//     const entries = Object.entries(item);

//     const entryHtml = entries.map(([key, value]) => {
//       if (
//         key.toLowerCase() === "signature" &&
//         typeof value === "string" &&
//         value.endsWith(".jpg")
//       ) {
//         return `<p><strong>${key}:</strong><br><img src="${window.location.origin}/${value}" height="50"/></p>`;
//       }
//       return `<p><strong>${key}:</strong> ${value}</p>`;
//     }).join("");

//     return `
//       <div class="print-page">
//         <h3>Record ${index + 1}</h3>
//         ${entryHtml}
//       </div>
//     `;
//   }).join("");

//   printWindow?.document.write(`
//     <html>
//       <head>
//         <title>Print Preview</title>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             padding: 20px;
//           }
//           h3 {
//             margin-top: 0;
//           }
//           .print-page {
//             page-break-after: always;
//             margin-bottom: 50px;
//           }
//           .print-page:last-child {
//             page-break-after: auto;
//           }
//         </style>
//       </head>
//       <body>
//         <h1>Bulk Print Data</h1>
//         ${content}
//         <script>
//           window.onload = function() {
//             window.print();
//           };
//         </script>
//       </body>
//     </html>
//   `);

//   printWindow?.document.close();
// };

const openPrintPreview = (parsedData: Record<string, any>[]) => {
  const printWindow = window.open('', '_blank');

  const SERVER_URL = "http://localhost:3000"; // your backend server's URL

  const content = parsedData.map((item: Record<string, any>, index: number) => {
    const entries = Object.entries(item);

    const entryHtml = entries.map(([key, value]) => {
      if (
        key.toLowerCase() === "signature" &&
        typeof value === "string" &&
        (value.endsWith(".jpg") || value.endsWith(".jpeg") || value.endsWith(".png"))
      ) {
        // Normalize backslashes and construct full image URL
        const normalizedPath = value.replace(/\\/g, "/");
        const imageUrl = `${SERVER_URL}/${normalizedPath}`;

        return `<p><strong>${key}:</strong><br><img src="${imageUrl}" height="50" alt="Signature Image"/></p>`;
      }

      return `<p><strong>${key}:</strong> ${value}</p>`;
    }).join("");

    return `
      <div class="print-page">
        <h3>Record ${index + 1}</h3>
        ${entryHtml}
      </div>
    `;
  }).join("");

  printWindow?.document.write(`
    <html>
      <head>
        <title>Print Preview</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h3 {
            margin-top: 0;
          }
          .print-page {
            page-break-after: always;
            margin-bottom: 50px;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          img {
            max-width: 100%;
            max-height: 100px;
          }
        </style>
      </head>
      <body>
        <h1>Bulk Print Data</h1>
        ${content}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow?.document.close();
};


//  const handlePrint = async (request: Request) => {
//   try {
//     message.loading({ content: `Printing "${request.title}"...`, key: 'print' });

//     const response = await mainClient.request("POST", "/api/request/printRequest", {
//       data: {
//         requestId: request._id,
//       },
//     });

//     if (response.status === 200) {
//       message.success({ content: 'Print started successfully.', key: 'print' });
//       const { parsedData } = response.data;
//       openPrintPreview(parsedData); // just send it to preview
//       message.success({ content: 'Print data loaded.', key: 'print' });
//     } else {
//       message.error({ content: 'Failed to initiate print.', key: 'print' });
//     }
//   } catch (error) {
//     console.error("Print error:", error);
//     message.error({ content: 'Server error while trying to print.', key: 'print' });
//   }
// };

const handlePrint = async (request: Request) => {
  try {
    message.loading({ content: `Printing "${request.title}"...`, key: 'print' });
    const response = await mainClient.request("POST", "/api/request/printRequest", {
            data: {
              requestId: request._id,
            },
      responseType: "blob",
          });
    if (response.status === 200) {
      const blob = new Blob([response.data]); // 👈 Access response.data, not .blob()
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `print-${request.title}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      message.success({ content: 'Download started.', key: 'print' });
    } else {
      message.error({ content: 'Failed to download.', key: 'print' });
    }
  } catch (error) {
    console.error("Print error:", error);
    message.error({ content: 'Server error while trying to print.', key: 'print' });
  }
};

  const handleDownloadZip = (request: Request) => {
    alert(`Download All (ZIP) clicked for "${request.title}"`);
  };

  const handleDispatch = (request: Request) => {
    alert(`Dispatch clicked for "${request.title}"`);
  };

  const handleRejected = async (request :Request)=>{
    try {
      const response = await mainClient.request("POST", "/api/request/RejectRequest", {
        data: {
          requestId: request._id, // Use request._id directly instead of selectedRequest
        },
      });
      if (response.status === 200) {
        setLoadvar((prev)=>prev+1);
        message.success('Request Rejected Successfully')
      } else {
        message.error("Failed to Reject request.");
      }
    } catch (error) {
      message.error("Failed to Reject request.");
    }
  }
  const handleDelegate =  async(request : Request)=>{
    try {
      const response = await mainClient.request("POST", "/api/request/DelegateRequest", {
        data: {
          requestId: request._id, // Use request._id directly instead of selectedRequest
        },
      });
      if (response.status === 200) {
        setLoadvar((prev)=>prev+1);
        message.success('Request Delegated Successfully')
      } else {
        message.error("Failed to Delegate request.");
      }
    } catch (error) {
      message.error("Failed to Delegate request.");
    }
  }

  const handleClick = (action: string, request: Request) => {
    switch (action) {
      case 'Clone':
        return handleClone(request);
      case 'Send for Signature':
        return handleSendForSignature(request);
      case 'Delete':
        return handleDelete(request);
      case 'Sign':
        return handleSign(request);
      case 'Print':
        return handlePrint(request);
      case 'Download All (ZIP)':
        return handleDownloadZip(request);
      case 'Dispatch':
        return handleDispatch(request);
        case 'Delegate':
        return handleDelegate(request);
        case 'Reject':
        return handleRejected(request);
      default:
        console.warn(`No handler for action: ${action}`);
    }
  };

  const handleAddRequest = () => {
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleCreateRequest = async () => {
    try {
      setLoading(true);
      const formDataValues = form.getFieldsValue();

      const fileList = formDataValues.upload;
      if (!fileList || fileList.length === 0) {
        message.error('Please upload a .doc or .docx file.');
        setLoading(false);
        return;
      }

      const file = fileList[0].originFileObj;

      const formDataToSend = new FormData();
      formDataToSend.append('title', formDataValues.title);
      formDataToSend.append('description', formDataValues.description);
      formDataToSend.append('template', file);

      await mainClient.request(
        "POST",
        "api/request/redersend",
        {
          data: formDataToSend,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchData();
      setIsDrawerOpen(false);
      form.resetFields();
    } catch (err) {
      console.error("Error creating request:", err);
     message.error("Something went wrong while creating the request.");
    } finally {
      setLoading(false);
    }
  };

  const openrequest = (id: string) => {
    navigate(`/dashboard/request/${id}`);
  };

  const PreviewReq = async (requestId: string): Promise<void> => {
      const newWindow = window.open("", "_blank");
      
        if (!newWindow) {
          message.error("Popup blocked! Please allow popups for this site.");
          return;
        }
      
    try {
      const response = await mainClient.request("POST", "/api/request/templateDownload", {
        responseType: "blob",
        data: { requestId },
      });
  
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      newWindow.location.href = url;
    } catch (err) {
      console.error("Error downloading template:", err);
      message.error("Something went wrong while opening the template.");
    }
  };
  
  
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">{userRole === 'Reader' ? "Reader Dashboard" :"Officer Dashboard"}</h2>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search requests..."
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          onClick={handleAddRequest}
        >
          New Request for Signature
        </button>
      </div>

      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Title</th>
            <th className="p-2">No. of Documents</th>
            <th className="p-2">Rejected Documents</th>
            <th className="p-2">Created At</th>
            <th className="p-2">Request Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((req) => (
            <tr key={req._id} className="border-t hover:bg-gray-100">
              <td className="p-2 text-blue-600 cursor-pointer" onClick={() => PreviewReq(req._id)}>{req.title}</td>
              <td className="p-2 cursor-pointer" onClick={() => openrequest(req._id)}>{req.numberOfDocuments}</td>
              <td className="p-2 cursor-pointer text-red-500" onClick={() => alert(`Rejected Docs: ${req.rejectedDocuments}`)}>{req.rejectedDocuments}</td>
              <td className="p-2">{req.createdAt}</td>
              <td className={"p-2" }>
               {userRole === 'Reader' ? req.status : req.actions}
              </td>
              <td className="p-2 flex flex-wrap gap-2">
                {getActions(req).map((action) => (
                 <button
                  key={action}
                  className={`px-3 py-1 rounded text-sm ${actionButtonColors[action] || 'bg-gray-300 hover:bg-gray-400 text-black'}`}
                  onClick={() => handleClick(action, req)}
                  >
                 {action}
                 </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer
        title="Create New Signature Request"
        placement="right"
        width={500}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateRequest}>
          <Form.Item
            label="Request Title"
            name="title"
            rules={[{ required: true, message: 'Please provide a title for the request' }]}
          >
            <Input placeholder="Enter the request title" />
          </Form.Item>

          <Form.Item
            label="Upload Template"
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
            rules={[{ required: true, message: 'Please upload document data' }]}
          >
            <Upload
              beforeUpload={(file) => {
                const isDocOrDocx = file.type === 'application/msword' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                if (!isDocOrDocx) {
                  alert('You can only upload .doc or .docx files!');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              accept=".doc,.docx"
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Request Description"
            name="description"
            rules={[{ required: true, message: 'Please provide a description' }]}
          >
            <Input.TextArea rows={3} placeholder="Describe the request purpose..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Create Request & Send for Signature
          </Button>
        </Form>
      </Drawer>

      {/* Signature Modal */}
      <Modal
        title={`Send "${selectedRequest?.title}" for Signature`}
        open={isSignatureModalVisible}
        onCancel={() => setIsSignatureModalVisible(false)}
        onOk={handleSignatureSubmit}
        okText="Send"
      >
<div className="mb-4">
  <Input
    placeholder="Search signer..."
    value={searchUser}
    onChange={(e) => setSearchUser(e.target.value)}
    className="mb-3 w-full rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
    allowClear
  />

  {searchUser && (
    <div className="mb-3 max-h-48 overflow-y-auto border rounded-md bg-white shadow-md">
      {officerData.filter((officer) =>
        officer.label.toLowerCase().includes(searchUser.toLowerCase())
      ).length > 0 ? (
        officerData
          .filter((officer) =>
            officer.label.toLowerCase().includes(searchUser.toLowerCase())
          )
          .map((officer) => (
            <div
              key={officer.value}
              className="cursor-pointer px-4 py-2 hover:bg-blue-100 border-b last:border-none transition-all"
              onClick={() => {
                setselectedOfficer(officer.value);
                setSearchUser('');
              }}
            >
              {officer.label}
            </div>
          ))
      ) : (
        <div className="text-gray-500 italic text-center py-2">No officer found</div>
      )}
    </div>
  )}

  <Select
    showSearch
    placeholder="Or manually select a signer"
    value={selectedOfficer}
    onChange={setselectedOfficer}
    style={{ width: '100%' }}
    className="custom-ant-select"
    options={officerData}
  />
</div>

      </Modal>
      <Modal
  title="Clone Request"
  open={isCloneModalVisible}
  onCancel={() => setIsCloneModalVisible(false)}
  onOk={handleCloneSubmit}
  okText="Clone"
>
  <div>
    <label className="block mb-2 font-medium">New Request Title</label>
    <Input
      value={clonedTitle}
      onChange={(e) => setClonedTitle(e.target.value)}
      className="w-full"
    />
  </div>
</Modal>
<Modal
  open={isOtpModalVisible}
  onCancel={() => setIsOtpModalVisible(false)}
  onOk={handleOtpVerified}
  okText="Verify OTP"
  cancelText="Cancel"
>
  <div className="space-y-3 text-center">
    <p className="text-lg font-medium">Enter the OTP sent to your email/phone:</p>
    <input
      type="text"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      placeholder="Enter OTP"
      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
</Modal>
{/* <Modal
  open={issSignModalVisible}
  onCancel={() => setIsSignModalVisible(false)}
  onOk={async () => { await handleSubmitSignForOtp() }}
  okText="Submit"
  cancelText="Cancel"
>
  {signatures.length > 0 ? (
    <div className="flex flex-wrap gap-4 justify-center">
      {signatures.map((url, index) => (
        <div
          key={index}
          onClick={() => setSelectedSignature(url)}
          className={`border rounded p-1 flex items-center justify-center w-40 h-40 cursor-pointer ${
            selectedSignature === url ? "ring-4 ring-blue-400 border-blue-500" : ""
          }`}
        >
          <img
            src={url}
            alt={`Signature ${index + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center text-gray-500">No signatures available</div>
  )}
</Modal> */}

<Modal
  open={issSignModalVisible}
  onCancel={() => setIsSignModalVisible(false)}
  onOk={async () => { await handleSubmitSignForOtp() }}
  okText="Submit"
  cancelText="Cancel"
>
  {signatures.length > 0 ? (
    <div className="flex flex-wrap gap-4 justify-center">
      {signatures.map((signature, index) => (
        <div
          key={signature._id || index}
          onClick={() => setSelectedSignature(signature)}
          className={`border rounded p-1 flex items-center justify-center w-40 h-40 cursor-pointer ${
            selectedSignature?._id === signature._id ? "ring-4 ring-blue-400 border-blue-500" : ""
          }`}
        >
          <img
            src={signature.url}
            alt={`Signature ${index + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center text-gray-500">No signatures available</div>
  )}
</Modal>


    </div>
  );
};

export default Requests;
