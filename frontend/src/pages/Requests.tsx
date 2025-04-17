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
import { Session } from 'inspector/promises';

interface Request {
  _id: string;
  title: string;
  numberOfDocuments: number;
  rejectedDocuments: number;
  createdAt: string;
  status: 'Draft' | 'Delegated' | 'Ready for Dispatch' | 'Waited for Signature';
  actions:'Draft' | 'Pending'| 'Signed'| 'Submited' ;
}

const actionButtonColors: Record<string, string> = {
  Clone: 'bg-gray-500 hover:bg-gray-600 text-white',
  'Send for Signature': 'bg-blue-600 hover:bg-blue-700 text-white',
  Delete: 'bg-red-600 hover:bg-red-700 text-white',
  Sign: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  Print: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  'Download All (ZIP)': 'bg-purple-600 hover:bg-purple-700 text-white',
  Dispatch: 'bg-green-400 hover:bg-green-700 text-white',
  Delegate: 'bg-cyan-600 hover:bg-cyan-700 text-white',
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
  const [officerLoading, setOfficerLoading] = useState(false); // Loading state for officer data
  const [officerData, setOfficerData] = useState<{ label: string, value: string }[]>([]); // Officer data state
  

// send for signature 
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedOfficer, setselectedOfficer] = useState<string | undefined>();
  const [searchUser, setSearchUser] = useState('');

  // Request Clone 
  const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
  const [cloningRequest, setCloningRequest] = useState<Request | null>(null);
  const [clonedTitle, setClonedTitle] = useState('');


      const session = useAppStore().session;
  const userRole  = session?.role === 2 ?rolesMap[2] : session?.role === 3 ? rolesMap[3]:null;


  const fetchData = async () => {
    setLoading(true);
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


  // Function to get officer selection 
  const handleOfficerSelectClick = async () => {
    setOfficerLoading(true); // Start loading indicator
    try {
      const response = await mainClient.request("GET", "api/users/officer");
      const officerOptions = response.data.map((officer: { name: string, id: string }) => ({
        label: officer.name,
        value: officer.id,
      }));
  
   setOfficerData(officerOptions); // Set the fetched officer data
    } catch (error) {
      console.error("Error fetching officer data:", error);
    } finally {
      setOfficerLoading(false); // Stop loading indicator
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
  console.log('rew',req);
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
      default:
        return [];
    }
  } else {
    // Officer actions based on officeraction
    switch (req.actions) {
      case 'Draft':
        return ['Clone','Sign','Delegate'];
      case 'Submited':
        return['Clone','Print']
      case 'Pending':
        return ['Clone','Submit','Print All'];
      case 'Signed':
        return ['Clone','Print', 'Dispatch'];
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
          requestId: request._id, // Use request._id directly instead of selectedRequest
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
  

  const handleSign = (request: Request) => {
    alert(`Sign clicked for "${request.title}"`);
  };

  const handlePrint = (request: Request) => {
    alert(`Print clicked for "${request.title}"`);
  };

  const handleDownloadZip = (request: Request) => {
    alert(`Download All (ZIP) clicked for "${request.title}"`);
  };

  const handleDispatch = (request: Request) => {
    alert(`Dispatch clicked for "${request.title}"`);
  };

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
    try {
      const response = await mainClient.request("POST", "/api/request/templateDownload", {
        responseType: "blob",
        data: { requestId },
      });
  
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
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

    </div>
  );
};

export default Requests;
