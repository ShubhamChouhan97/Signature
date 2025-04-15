// version 2
import React, { useEffect, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { mainClient } from "../store";
import { useNavigate } from "react-router";

interface Request {
  _id: string;
  title: string;
  numberOfDocuments: number;
  rejectedDocuments: number;
  createdAt: string;
  status: 'Unsigned' | 'Delegated' | 'Ready for Dispatch' | 'Waited for Signature';
}

const mockRequests: Request[] = [
  {
    _id: '3s',
    title: 'NDA Agreement',
    numberOfDocuments: 3,
    rejectedDocuments: 1,
    createdAt: '2025-04-13 10:00',
    status: 'Unsigned',
  },
  {
    _id: "ss",
    title: 'Service Contract',
    numberOfDocuments: 2,
    rejectedDocuments: 0,
    createdAt: '2025-04-12 14:30',
    status: 'Delegated',
  },
  {
    _id: "3",
    title: 'Partnership Deal',
    numberOfDocuments: 5,
    rejectedDocuments: 2,
    createdAt: '2025-04-10 09:15',
    status: 'Ready for Dispatch',
  },
  {
    _id: "4",
    title: 'Employee Agreement',
    numberOfDocuments: 1,
    rejectedDocuments: 0,
    createdAt: '2025-04-09 17:20',
    status: 'Waited for Signature',
  },
];

const actionButtonColors: Record<string, string> = {
  Clone: 'bg-gray-500 hover:bg-gray-600 text-white',
  'Send for Signature': 'bg-blue-600 hover:bg-blue-700 text-white',
  Delete: 'bg-red-600 hover:bg-red-700 text-white',
  Sign: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  Print: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  'Download All (ZIP)': 'bg-purple-600 hover:bg-purple-700 text-white',
  Dispatch: 'bg-green-600 hover:bg-green-700 text-white',
};

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [requestdata, setRequest] = useState<Request[]>([]);


  // rasie a api request to get all request from server when page is laoded
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await mainClient.request("GET", "/api/request/allrequest");
      const data = Array.isArray(response.data) ? response.data : [];
      setRequest(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  

  const filteredRequests = requestdata.filter((req) =>
    req.title.toLowerCase().includes(search.toLowerCase())
  );

  const getActions = (status: Request['status']) => {
    switch (status) {
      case 'Unsigned':
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
  };

  const handleClick = (action: string, request: Request) => {
    alert(`${action} clicked for "${request.title}"`);
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
        alert('Please upload a .doc or .docx file.');
        setLoading(false);
        return;
      }
  
      const file = fileList[0].originFileObj;
  
      const formDataToSend = new FormData();
      formDataToSend.append('title', formDataValues.title);
      formDataToSend.append('description', formDataValues.description);
      formDataToSend.append('template', file); // Must match backend field name
  
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
  
      console.log('New request created:', formDataValues);
      fetchData();
      setIsDrawerOpen(false);
      form.resetFields();
    } catch (err) {
      console.error("Error creating request:", err);
      alert("Something went wrong while creating the request.");
    } finally {
      setLoading(false);
    }
  };
  
 const openrequest = async (id:string) =>{
   console.log(id);
   navigate(`/dashboard/request/${id}`);
 }
  return (
    <div className="p-4">
      {/* Navbar */}
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

      {/* Table */}
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
              <td className="p-2 text-blue-600 cursor-pointer" onClick={() => alert(`Previewing ${req.title}`)}>{req.title}</td>
              <td className="p-2 cursor-pointer" onClick={() => openrequest(req._id)}>{req.numberOfDocuments}</td>
              <td className="p-2 cursor-pointer text-red-500" onClick={() => alert(`Rejected Docs: ${req.rejectedDocuments}`)}>{req.rejectedDocuments}</td>
              <td className="p-2">{req.createdAt}</td>
              <td className="p-2">{req.status}</td>
              <td className="p-2 flex flex-wrap gap-2">
                {getActions(req.status).map((action) => (
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

      {/* Drawer Form */}
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
                return false; // prevent auto-upload
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
    </div>
  );
};

export default Requests;