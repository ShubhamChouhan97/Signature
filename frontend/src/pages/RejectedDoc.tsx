
import React, { useEffect, useState } from "react";
import { message, Tooltip, Spin } from "antd";
import {
  fetchTableHeadAndStatus,
  fetchTableDataAndBulkId,
} from "../Api/requestPageApi"; // Adjust path as needed

// Interface for table row data
interface RequestDataRow {
  [key: string]: unknown;
  signDate?: string;
  status?: string;
  Rejectreason?: string;
}

const RejecedDoc: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tablehead, setTablehead] = useState<string[]>([]);
  const [tabledata, setTabledata] = useState<RequestDataRow[]>([]);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [bulkdataId, setBulkdataId] = useState<string | null>(null);

  const getRequestId = (): string => {
    const pathSegments = location.pathname.split("/");
    return pathSegments[pathSegments.length - 1];
  };

  const fetchData = async () => {
    const requestId = getRequestId();
    try {
      const [header, status] = await fetchTableHeadAndStatus(requestId);
      setTablehead(header);
      setRequestStatus(status);
    } catch {
      message.error("Failed to fetch request details.");
    }
  };

  const fetchTableContent = async () => {
    const requestId = getRequestId();
    try {
      const [tableData, bulkId] = await fetchTableDataAndBulkId(requestId);
      setBulkdataId(bulkId);
      setTabledata(tableData);
    } catch {
      message.error("Failed to fetch table data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTableContent();
  }, []);

  return (
    <div className="flex justify-center items-start min-h-screen p-6 bg-gray-50">
      <div className="overflow-x-auto w-full bg-white rounded-lg shadow-md">
        <Spin spinning={loading}>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                {tablehead.map((header, index) => (
                  <th
                    key={index}
                    className="p-3 whitespace-nowrap border-b border-gray-300 font-medium text-gray-700"
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
              {tabledata
                .filter((row) => row.status === "Rejected")
                .map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    {/* Dynamic Columns */}
                    {tablehead.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="p-3 whitespace-nowrap border-b border-gray-200"
                      >
                        {String(row[header] ?? "")}
                      </td>
                    ))}

                    {/* Sign Date */}
                    <td className="p-3 sticky right-[240px] bg-white border-b border-gray-200 whitespace-nowrap">
                      {row.signDate ?? "N/A"}
                    </td>

                    {/* Request Status */}
                    <td className="p-3 sticky right-[120px] bg-white border-b border-gray-200 whitespace-nowrap text-red-600 font-semibold">
                      {row.status}
                    </td>

                    {/* Action */}
                    <td className="p-3 sticky right-0 bg-white border-b border-gray-200 whitespace-nowrap">
                      {row.Rejectreason ? (
                        <Tooltip title={String(row.Rejectreason)}>
                          <span className="text-blue-600 cursor-pointer underline">
                            View Reason
                          </span>
                        </Tooltip>
                      ) : (
                        "N/A"
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
};

export default RejecedDoc;
