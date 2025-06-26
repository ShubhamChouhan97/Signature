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
import { mainClient, useAppStore } from "../store"; // Keep mainClient if still used directly
import { useNavigate } from "react-router";
import { rolesMap } from '../libs/statusMap';
import { io } from 'socket.io-client';

// Import your API functions
import {
  fetchAllRequests,
  fetchAllSignatures,
  fetchOfficerData,
  sendRequestToOfficer,
  cloneRequest,
  deleteRequest,
  signRequest,
  verifySignRequestOtp,
  printRequest,
  downloadAllDocumentsZip,
  rejectRequest,
  delegateRequest,
  createNewRequest,
  previewRequestTemplate,
  downloadSampleTemplate
} from '../api/requestsApi'; // Adjust path as needed

const socket = io("http://localhost:3000", {
  withCredentials: true
});
// add
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
const actionButtonColors: Record<string, string> = {
  Clone: 'bg-gray-500 hover:bg-gray-600 text-white',
  'Send for Signature': 'bg-blue-600 hover:bg-blue-700 text-white',
  Delete: 'bg-red-600 hover:bg-red-700 text-white',
  Sign: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  'Print ALL': 'bg-yellow-500 hover:bg-yellow-600 text-black',
  'Download All (ZIP)': 'bg-purple-600 hover:bg-purple-700 text-white',
  Dispatch: 'bg-green-400 hover:bg-green-700 text-white',
  Delegate: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  "No Action Allow": 'bg-red-400 text-white px-3 py-1 rounded hover:bg-red-600',
  Reject: 'bg-red-600 hover:bg-red-700 text-white',
};

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [requestdata, setRequest] = useState<Request[]>([]);
  const [loadvar, setLoadvar] = useState(0);
  // officer data
  const [officerData, setOfficerData] = useState<{ label: string, value: string }[]>([]); // Officer data state

  // rejected modal
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);


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
  const [signRequestData, setSignRequestData] = useState<Request | null>(null);
  const [issSignModalVisible, setIsSignModalVisible] = useState(false);
  // user Deatils
  const session = useAppStore().session;
  const myId = useAppStore().session?.userId;
  const userRole = session?.role === 2 ? rolesMap[2] : session?.role === 3 ? rolesMap[3] : null;

  // socket
  useEffect(() => {
    socket.on('request-officer', (data) => {
      if (myId === data.officerId) {
        setLoadvar((prev) => prev + 1);
      }
    });

    return () => {
      socket.off('request-officer');
    };
  }, [myId]); // Added myId to dependency array

  useEffect(() => {
    socket.on('request-reader', (data) => {
      if (myId === data.readerId) {
        setLoadvar((prev) => prev + 1);
      }
    });

    return () => {
      socket.off('request-reader');
    };
  }, [myId]); // Added myId to dependency array

  const fetchData = async () => {
    try {
      const data = await fetchAllRequests();
      setRequest(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("Failed to fetch requests.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [loadvar]);

  const fetchSign = async () => {
    try {
      const data = await fetchAllSignatures();
      setSignatures(data);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      message.error("Failed to fetch signatures.");
    }
  };
  // Function to get officer selection
  const handleOfficerSelectClick = async () => {
    try {
      const options = await fetchOfficerData();
      setOfficerData(options); // Set the fetched officer data
    } catch (error) {
      console.error("Error fetching officer data:", error);
      message.error("Failed to load officer data.");
    }
  }
  // function to send Request to officer
  const requestSendtoOfficer = async () => {
    const officerName = officerData.find(officer => officer.value === selectedOfficer)?.label;
    if (!selectedRequest?._id || !selectedOfficer || !officerName) {
      message.error('Missing request or officer information.');
      return;
    }
    try {
      const success = await sendRequestToOfficer(selectedRequest._id, selectedOfficer, officerName);
      if (success) {
        message.success('Request sent to officer successfully!');
        setLoadvar((prev) => prev + 1);
      } else {
        message.error('Failed to send request to officer.');
      }
    } catch {
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
          return ['Clone', 'Print ALL', 'Download All (ZIP)', 'Dispatch'];
        case 'Waited for Signature':
          return ['Clone'];
        case 'Rejected':
          return ['Clone'];
        case 'Pending':
          return ['Clone'];
        default:
          return [];
      }
    } else {
      // Officer actions based on officeraction
      switch (req.actions) {
        case 'Draft':
          return ['Clone', 'Sign', 'Delegate', 'Reject'];
        case 'Submited':
          return ['Clone', 'Print']
        case 'Pending':
          return ['Clone'];
        case 'Signed':
          return ['Clone', 'Print ALL', 'Dispatch', 'Download All (ZIP)'];
        case 'Delegated':
          return ['No Action Allow'];
        case 'Rejected':
          return ['No Action Allow'];
        case 'Failed':
          return ['Clone', 'Sign'];
        default:
          return [];
      }
    }
  };
  const handleCloneSubmit = async () => {
    if (!cloningRequest) return;

    try {
      const success = await cloneRequest(cloningRequest._id, clonedTitle);

      if (success) {
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

    if (request.numberOfDocuments === 0) {
      message.error("Please Upload documents to send to officer")
      return;
    }
    setIsSignatureModalVisible(true);
  };

  const handleSignatureSubmit = async () => {
    if (!selectedOfficer) {
      message.error("Please select an Officer.");
      return;
    }

    await requestSendtoOfficer()
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
      if (!myId) {
        message.error("User ID not found.");
        return;
      }
      const success = await deleteRequest(request._id, myId);
      if (success) {
        setLoadvar((prev) => prev + 1);
      } else {
        message.error("Failed to delete request.");
      }
    } catch (error) {
      message.error("Failed to delete request.");
    }
  };

  const signatureRequestSubmit = async () => {
    if (!signRequestData) {
      message.error("No request selected for signature.");
      return;
    }
    if (!selectedSignature) {
      message.error("No signature selected.");
      return;
    }
    try {
      const success = await signRequest(signRequestData._id, selectedSignature._id);
      if (success) {
        message.success("All Documents Signed ");
        setLoadvar((prev) => prev + 1);
      } else {
        message.error("Failed to Sign Documents.");
      }
    } catch (error) {
      message.error("Failed to Sign Document at server.");
    }
  }

  const handleSign = async (request: Request) => {
    await fetchSign();
    setSignRequestData(request);
    setIsSignModalVisible(true);
  };

  const handleOtpVerified = async () => {
    try {
      const success = await verifySignRequestOtp(otp);
      if (success) {
        message.success("OTP Verified, Signing Started");
        setIsOtpModalVisible(false);
        setIsSignModalVisible(false); // Close signature selection modal too
        signatureRequestSubmit();
      } else {
        message.error("Failed to Verify OTP.");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to Verify OTP at server.";
      message.error(errorMessage);
    }
    setOtp('');
  };

  const handleSubmitSignForOtp = async () => {
    if (!selectedSignature) {
      message.warning("Please select a signature before submitting.");
      return;
    }
    if (!signRequestData) {
      message.error("No request selected for signing.");
      return;
    }
    setIsOtpModalVisible(true);
  }

  const handlePrint = async (request: Request) => {
    const key = 'print';
    message.loading({ content: `Printing "${request.title}"...`, key });

    try {
      const newWindow = window.open("", "_blank");

      if (!newWindow) {
        message.error({ content: "Popup blocked. Please allow popups for this site.", key });
        return;
      }

      const blob = await printRequest(request._id);
      const url = URL.createObjectURL(blob);

      newWindow.document.write(`
        <html>
          <head>
            <title>Print PDF</title>
          </head>
          <body style="margin:0">
            <iframe id="pdfIframe" src="${url}" frameborder="0" style="width:100%;height:100vh;"></iframe>
          </body>
        </html>
      `);

      newWindow.document.close();

      const iframe = newWindow.document.getElementById('pdfIframe') as HTMLIFrameElement;

      iframe.onload = () => {
        iframe.contentWindow?.print();
      };

      message.success({ content: 'Printing started.', key });
    } catch (error) {
      console.error("Print error:", error);
      message.error({ content: 'Server error while trying to print.', key });
    }
  };

  const handleDownloadZip = async (request: Request) => {
    try {
      message.loading({ content: `Preparing ZIP for "${request.title}"...`, key: 'zip' });

      const blob = await downloadAllDocumentsZip(request._id);

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `documents-${Date.now()}.zip`; // Set the file name
      document.body.appendChild(a);
      a.click();
      a.remove(); // Clean up the anchor element

      message.success({ content: 'ZIP download started.', key: 'zip' });
    } catch (error) {
      console.error("Download ZIP error:", error);
      message.error({ content: 'Server error while generating ZIP.', key: 'zip' });
    }
  };


  const handleDispatch = (request: Request) => {
    alert(`Dispatch clicked for "${request.title}"`);
  };

  const handleRejected = async (request: Request) => {
    setSelectedRowId(request._id);
    setIsRejectModalVisible(true);
  }
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      message.warning("Please enter a rejection reason.");
      return;
    }
    if (!selectedRowId || !myId) {
      message.error("Missing request ID or user ID.");
      return;
    }

    try {
      const success = await rejectRequest(selectedRowId, rejectReason, myId);

      if (success) {
        setLoadvar((prev) => prev + 1);
        message.success("Request Rejected Successfully");
        setLoading(true);
        setIsRejectModalVisible(false);
        setRejectReason("");
        setSelectedRowId(null);
      }
    } catch (error) {
      message.error("Error rejecting request.");
    }
  };

  const handleDelegate = async (request: Request) => {
    try {
      if (!myId) {
        message.error("User ID not found.");
        return;
      }
      const success = await delegateRequest(request._id, myId);
      if (success) {
        setLoadvar((prev) => prev + 1);
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
      case 'Print ALL':
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

      const success = await createNewRequest(formDataToSend);

      if (success) {
        message.success("Request created successfully");
        fetchData();
        setIsDrawerOpen(false);
        form.resetFields();
      } else {
        message.error("Failed to create request.");
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        message.error(serverMessage);
      } else {
        message.error(err.message || "Failed to create request.");
      }
      console.error("Error creating request:", err);
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
      const blob = await previewRequestTemplate(requestId);
      const url = window.URL.createObjectURL(blob);
      newWindow.location.href = url;
    } catch (err) {
      console.error("Error downloading template:", err);
      message.error("Something went wrong while opening the template.");
    }
  };

  const downloadsample = async () => {
    try {
      const blob = await downloadSampleTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SampleTemplate.docx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Failed to Download request.");
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">{userRole === 'Reader' ? "Reader Dashboard" : "Officer Dashboard"}</h2>
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
              <td className="p-2">
                {userRole === "Reader" ? (
                  req.status === "Pending" ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
                      Processing...
                    </div>
                  ) : req.status === "Rejected" ? (
                    <div className="flex items-center gap-2 group relative">
                      <span className="text-red-600">Rejected</span>
                      <span className="text-blue-500">ℹ️</span>
                      <div className="absolute bottom-full left-0 mb-1 hidden w-max max-w-xs rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block z-10">
                        {req.rejectReason || "No reason provided"}
                      </div>
                    </div>
                  ) : (
                    req.status
                  )
                ) : req.actions === "Pending" ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
                    Processing...
                  </div>
                ) : req.actions === "Rejected" ? (
                  <div className="flex items-center gap-2 group relative">
                    <span className="text-red-600">Rejected</span>
                    <span className="text-blue-500">ℹ️</span>
                    <div className="absolute bottom-full left-0 mb-1 hidden w-max max-w-xs rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block z-10">
                      {req.rejectReason || "No reason provided"}
                    </div>
                  </div>
                ) : (
                  req.actions
                )}
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
          <Form.Item label="Note:">
            <div>
              <p>1. Only Word files are allowed for upload.</p>
              <p>2. The file must have field names enclosed in curly brackets <code>{'{ }'}</code>.</p>
              <p>3. The file must include the fields <code>{'{court}'}</code>, <code>{'{qrCode}'}</code>, and <code>{'{%signature}'}</code>.</p>
              <p>4. The signature field must be written as <code>{'{%signature}'}</code>.</p>
              <p>5. Download Sample file a <button style={{ color: 'blue' }} onClick={downloadsample}>Click hear </button></p>
            </div>
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
                  message.error('You can only upload .doc or .docx files!');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              accept=".doc,.docx"
              maxCount={1}
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
            Create Request
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
        okButtonProps={{ danger: true }}
      >
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
};

export default Requests;